import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getServerUser } from '@/utils/auth/server';
import { getSupabaseAdmin } from '@/utils/supabase/admin';


export async function GET(request) {
  try {
    const user = await getServerUser(request);
    
    if (!user?.id) {
      console.error('[Claims List] Unauthorized: No Better Auth user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let claims;
    try {
        const res = await query(`
            WITH ranked_claims AS (
                SELECT *, 
                       ROW_NUMBER() OVER (PARTITION BY COALESCE(business_id::text, id::text) ORDER BY created_at DESC) as rn
                FROM claim_businesses 
                WHERE claimer_user_id = $1
            )
            SELECT * FROM ranked_claims WHERE rn = 1
            ORDER BY created_at DESC
        `, [user.id]);
        claims = res.rows;
    } catch (sqlErr) {
        console.error('Auth DB claims fetch SQL error:', sqlErr);
        return NextResponse.json({ error: 'Failed to fetch claims from database' }, { status: 500 });
    }

    // Get business details from local DB for each claim
    const businessIds = claims?.map(c => c.business_id).filter(Boolean) || []
    let businessesMap = {}
    
    if (businessIds.length > 0) {
      try {
        const dynamicAdmin = await getSupabaseAdmin();
        if (dynamicAdmin) {
          const { data: businesses } = await dynamicAdmin
            .from('businesses')
            .select('id, title, address, city, state, slug')
            .in('id', businessIds)
          
          businesses?.forEach(b => {
            businessesMap[b.id] = b
          })
        }
      } catch (err) {
        console.error('Error fetching business details from dynamic DB:', err);
      }
    }

    // Combine claims with business data
    const enrichedClaims = claims?.map(claim => ({
      ...claim,
      business: businessesMap[claim.business_id] || null
    })) || []

    return NextResponse.json({ data: enrichedClaims })
  } catch (e) {
    console.error('claims/list error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}



