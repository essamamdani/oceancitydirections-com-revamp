import { NextResponse } from 'next/server';
import { getSourceDb } from '@/lib/source-db';
import { sendEmail } from '@/lib/sendEmail';
import { query } from '@/lib/db';
import { getLiveSiteId } from '@/lib/getLiveSiteId';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { fetchSiteConfigByDomain } from '@/lib/site-config';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, remarks, businessTitle, businessUrl, type, businessId, source_state, user_id, cf_token } = body;

    // --- SECURITY: Turnstile Verification ---
    const hostHeader = req.headers.get('host') || 'unknown';
    const siteConfig = await fetchSiteConfigByDomain(hostHeader);

    const isHuman = await verifyTurnstileToken(cf_token, siteConfig?.turnstile_secret_key);
    if (!isHuman) {
        return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    }

    let finalUserId = user_id;
    if (!finalUserId) {
      try {
        const { getServerUser } = await import('@/utils/auth/server');
        const user = await getServerUser(req);
        if (user && user.id) finalUserId = user.id;
      } catch (e) {}
    }

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required.' },
        { status: 400 }
      );
    }

    const adminEmail = process.env.NOTIFY_EMAIL || process.env.NOTIFY_EMAIL;
    const requestTypeLabel = type === 'removal' ? 'Removal Request' : 'Information Request';
    
    // Save to Database (Central Auth DB)
    if (businessId) {
         
        const sourceDb = await getSourceDb(req.headers.get('host'));

         
         try {
            const host = req.headers.get('host') || source_state || null;
            const liveSiteId = await getLiveSiteId(host);
            
            await query(`
                INSERT INTO business_request_info (
                    business_id, name, email, phone, remarks, status, type, source_db, source_state, user_id, live_site_id, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            `, [
                businessId, 
                name, 
                email, 
                phone, 
                remarks || (type === 'removal' ? 'Removal Request' : ''), 
                'pending', 
                type || 'information',
                sourceDb,
                host,
                finalUserId || null,
                liveSiteId || req.headers.get('x-live-site-id') || null
            ]);
         } catch (sqlError) {
             console.error("Error saving request to business_request_info (Auth DB):", sqlError);
         }
    }

    const emailContent = `
      <h2>New ${requestTypeLabel}</h2>
      <p><strong>Business:</strong> ${businessTitle}</p>
      <p><strong>Business URL:</strong> <a href="${businessUrl}">${businessUrl}</a></p>
      <hr />
      <p><strong>Type:</strong> ${requestTypeLabel}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Remarks:</strong> ${remarks || 'N/A'}</p>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `${requestTypeLabel}: ${businessTitle}`,
      body: emailContent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
