import { NextResponse } from 'next/server'
import logger from '@/lib/logger'

import { getSourceDb } from '@/lib/source-db';

import { validateEmail, validatePhone, formatPhoneForDb } from '@/lib/validation'
import { getServerUser } from '@/utils/auth/server'
import { query } from '@/lib/db'
import { getLiveSiteId } from '@/lib/getLiveSiteId'
import { fetchSiteConfigByDomain } from '@/lib/site-config';

export async function POST(request) {
  try {
    const body = await request.json()
    const { business_id, proposed_data = {}, proposed_update_slug = null } = body || {}

    // Validation
    if (proposed_data.email && !validateEmail(proposed_data.email)) {
        return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (proposed_data.phone && !validatePhone(proposed_data.phone)) {
        return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 })
    }

    // Required fields validation
    const requiredFields = ['address', 'city', 'state', 'zip', 'lat', 'long'];
    const missingFields = requiredFields.filter(field => !proposed_data[field]);

    if (missingFields.length > 0) {
        return NextResponse.json({ 
            error: `Missing required fields: ${missingFields.join(', ')}` 
        }, { status: 400 });
    }

    // Format phone
    if (proposed_data.phone) {
        proposed_data.phone = formatPhoneForDb(proposed_data.phone);
    }

    // Use Better Auth session verification
    const user = await getServerUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!business_id) {
      return NextResponse.json({ error: 'Missing business_id' }, { status: 400 })
    }

    const claimer_user_id = user.id

    logger.log('[Claims] Handling claim for business:', business_id, 'User:', claimer_user_id);

    // Get business details from local DB (Maryland/Florida)
    // This now uses dynamic lookup via POSTGRES_URL!
    const { getSupabaseAdmin } = await import('@/utils/supabase/admin');
    const dynamicAdmin = await getSupabaseAdmin(); 
    
    if (!dynamicAdmin) {
        console.error('[Claims] Could not initialize dynamic Supabase client');
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: businessCheck, error: businessCheckError } = await dynamicAdmin
        .from('businesses')
        .select('*')
        .eq('id', business_id)
        .single();

    if (businessCheckError) {
        console.error('[Claims] Business verify error:', businessCheckError);
        return NextResponse.json({ error: 'Failed to verify business status: ' + businessCheckError.message }, { status: 500 });
    }

    logger.log('[Claims] Business found:', businessCheck.title);

    // Check if already claimed by someone else
    try {
        const approvedClaimRes = await query(`
            SELECT id, claimer_user_id FROM claim_businesses 
            WHERE business_id = $1 AND status = 'approved'
            LIMIT 1
        `, [business_id]);
        
        if (approvedClaimRes.rows.length > 0) {
            const approvedClaim = approvedClaimRes.rows[0];
            if (approvedClaim.claimer_user_id !== claimer_user_id) {
                return NextResponse.json({ error: 'This business is already claimed and approved by another user.' }, { status: 403 });
            }
        }
    } catch (sqlErr) {
        console.error('Auth DB SQL approved check error:', sqlErr);
        return NextResponse.json({ error: 'Failed to verify business claim status' }, { status: 500 });
    }

    // Save claim to AUTH DB (claim_businesses table) using DIRECT SQL
    let existingClaim;
    try {
        const checkRes = await query(`
            SELECT id, status FROM claim_businesses 
            WHERE business_id = $1 AND claimer_user_id = $2 
            AND status IN ('pending', 'under_review')
            LIMIT 1
        `, [business_id, claimer_user_id]);
        existingClaim = checkRes.rows[0];
    } catch (sqlErr) {
        console.error('Auth DB SQL check error:', sqlErr);
        return NextResponse.json({ error: 'Failed to check existing claim' }, { status: 500 });
    }

    try {
        if (existingClaim?.id) {
          // Update existing claim
          await query(`
            UPDATE claim_businesses 
            SET proposed_data = $1, updated_at = NOW()
            WHERE id = $2
          `, [JSON.stringify(proposed_data), existingClaim.id]);
        } else {
          // Determine source database
          const host = request.headers.get('host') || 'unknown';
          const sourceDb = await getSourceDb(host);
          
          const liveSiteId = await getLiveSiteId(host);
          
          // Insert new claim
          await query(`
            INSERT INTO claim_businesses (business_id, claimer_user_id, proposed_data, status, source_db, source_state, live_site_id, created_at, updated_at)
            VALUES ($1, $2, $3, 'pending', $4, $5, $6, NOW(), NOW())
          `, [business_id, claimer_user_id, JSON.stringify(proposed_data), sourceDb, host, liveSiteId || proposed_data.live_site_id || null]);
        }
    } catch (saveErr) {
        console.error('Auth DB SQL save error:', saveErr);
        return NextResponse.json({ error: 'Failed to save claim to auth database' }, { status: 500 });
    }

    // HubSpot integration
    try {
      const host = request.headers.get('host') || 'unknown';
      const { fetchSiteConfigByDomain } = await import('@/lib/site-config')
      const { getSiteName } = await import('@/lib/helper')
      const siteConfig = await fetchSiteConfigByDomain(host);
      const siteName = siteConfig ? getSiteName(siteConfig) : 'Realty Directions';
      const { pushClaimLead } = await import('@/lib/actions')
      const hubspotResult = await pushClaimLead({
        email: user.email,
        full_name: user.full_name || '',
        phone: user.phone || '',
        site_name: siteName,
        business_title: businessCheck.title,
        business_address: businessCheck.address
      })
      if (hubspotResult.status !== 200) {
        console.error('[HubSpot] Claim lead push failed:', hubspotResult.data);
      } else {
        logger.log('[HubSpot] Claim lead pushed successfully:', hubspotResult.id);
      }
    } catch (hsError) {
      console.error('[HubSpot] Claim integration error:', hsError);
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('claims/save error:', e)
    return NextResponse.json({ error: 'Internal Server Error: ' + e.message }, { status: 500 })
  }
}
