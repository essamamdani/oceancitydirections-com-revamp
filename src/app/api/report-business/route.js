import { NextResponse } from 'next/server';
import { getSourceDb } from '@/lib/source-db';
import { validateEmail } from '@/lib/validation';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/db';
import { getLiveSiteId } from '@/lib/getLiveSiteId';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { fetchSiteConfigByDomain } from '@/lib/site-config';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, message, businessId, businessTitle, cf_token } = body;

    // --- SECURITY: Turnstile Verification ---
    const hostHeader = request.headers.get('host') || 'unknown';
    const siteConfig = await fetchSiteConfigByDomain(hostHeader);

    const isHuman = await verifyTurnstileToken(cf_token, siteConfig?.turnstile_secret_key);
    if (!isHuman) {
        return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const adminEmail = process.env.NOTIFY_EMAIL || process.env.NOTIFY_EMAIL;
    if (!adminEmail) {
        console.error("Admin email not configured");
        return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Attempt to get user ID if logged in
    let finalUserId = null;
    try {
      const { getServerUser } = await import('@/utils/auth/server');
      const user = await getServerUser(request);
      if (user && user.id) finalUserId = user.id;
    } catch (e) {}

    // Save report to Central Auth DB
    if (businessId) {
         
        const sourceDb = await getSourceDb(request.headers.get('host'));

         
         try {
            const host = request.headers.get('host') || null;
            const liveSiteId = await getLiveSiteId(host);
            await query(`
                INSERT INTO business_request_info (
                    business_id, name, email, remarks, status, type, source_db, source_state, user_id, live_site_id, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
            `, [
                businessId, 
                name, 
                email, 
                message, 
                'pending', 
                'report',
                sourceDb,
                host,
                finalUserId,
                liveSiteId || request.headers.get('x-live-site-id') || null
            ]);
         } catch (sqlError) {
             console.error("Error saving report to business_request_info (Auth DB):", sqlError);
         }
    }

    const emailBody = `
      <h1>Business Report</h1>
      <p><strong>Business:</strong> ${businessTitle} (ID: ${businessId})</p>
      <p><strong>Reporter Name:</strong> ${name}</p>
      <p><strong>Reporter Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `[Report] Business: ${businessTitle}`,
      body: emailBody,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

