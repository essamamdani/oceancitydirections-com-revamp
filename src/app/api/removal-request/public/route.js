import { NextResponse } from 'next/server';
import { getSourceDb } from '@/lib/source-db';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/db';
import { getLiveSiteId } from '@/lib/getLiveSiteId';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { fetchSiteConfigByDomain } from '@/lib/site-config';


export async function POST(request) {
  try {
    const { businessId, name, email, phone, reason, source_state, user_id, cf_token } = await request.json();

    // --- SECURITY: Turnstile Verification ---
    const hostHeader = request.headers.get('host') || 'unknown';
    const siteConfig = await fetchSiteConfigByDomain(hostHeader);

    const isHuman = await verifyTurnstileToken(cf_token, siteConfig?.turnstile_secret_key);
    if (!isHuman) {
        return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    }

    let finalUserId = user_id;
    if (!finalUserId) {
      try {
        const { getServerUser } = await import('@/utils/auth/server');
        const user = await getServerUser(request);
        if (user && user.id) finalUserId = user.id;
      } catch (e) {}
    }

    if (!businessId || !name || !email || !phone || !reason) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const bid = parseInt(businessId);
    if (isNaN(bid)) {
         return NextResponse.json({ error: 'Invalid Business ID' }, { status: 400 });
    }

    // Local fetch to get business details for email
    const { data: business, error: fetchError } = await supabaseAdmin
      .from('businesses')
      .select('title, city, state')
      .eq('id', bid)
      .single();

    if (fetchError || !business) {
      console.error('Business fetch error:', fetchError);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    
        const sourceDb = await getSourceDb(request.headers.get('host'));


    // Insert into Central Auth DB business_request_info table
    try {
        const host = request.headers.get('host') || source_state || null;
        const liveSiteId = await getLiveSiteId(host);
        
        await query(`
            INSERT INTO business_request_info (
                business_id, name, email, phone, remarks, status, type, source_db, source_state, user_id, live_site_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        `, [
            bid, 
            name, 
            email, 
            phone, 
            reason, 
            'pending', 
            'removal',
            sourceDb,
            host,
            finalUserId || null,
            liveSiteId || request.headers.get('x-live-site-id') || null
        ]);
    } catch (insertError) {
      console.error('Insert removal request error in Auth DB:', insertError);
    }

    const adminEmail = process.env.NOTIFY_EMAIL || 'info@baltimoredirections.com';
    const subject = `Removal Request: ${business.title}`;
    const body = `
      <h1>Removal Request</h1>
      <p><strong>Business:</strong> ${business.title}</p>
      <p><strong>Location:</strong> ${business.city}, ${business.state}</p>
      <hr />
      <p><strong>Requester Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Reason:</strong></p>
      <p>${reason}</p>
      <hr />
      <p>This email serves as notification that a user has requested to REMOVE this business from the directory.</p>
      <p><a href="/admin/removal-requests">View in Admin</a></p>
    `;

    try {
        await sendEmail({ to: adminEmail, subject, body });
    } catch (e) {
        console.error("Failed to send email", e);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Removal request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
