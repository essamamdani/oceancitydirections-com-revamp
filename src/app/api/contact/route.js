import { NextResponse } from 'next/server';
import { getSourceDb } from '@/lib/source-db';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/sendEmail';
import { getLiveSiteId } from '@/lib/getLiveSiteId';
import { fetchSiteConfigByDomain } from '@/lib/site-config';
import { getSiteName } from '@/lib/helper';
import { verifyTurnstileToken } from '@/lib/turnstile';


export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone_number, select, message, cf_token } = body;

    // --- SECURITY: Turnstile Verification ---
    const host = req.headers.get('host') || 'unknown';
    const siteConfig = await fetchSiteConfigByDomain(host);
    
    const isHuman = await verifyTurnstileToken(cf_token, siteConfig?.turnstile_secret_key);
    if (!isHuman) {
        return NextResponse.json({ error: "Security verification failed. Please try again." }, { status: 403 });
    }

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 });
    }

    
        const sourceDb = await getSourceDb(req.headers.get('host'));
        const siteName = siteConfig ? getSiteName(siteConfig) : 'Realty Directions';
    let subject = 'General Inquiry';
    if (select === '1') subject = 'Add My Business';
    if (select === '2') subject = 'Edit My Business';
    if (select === '3') subject = 'Remove My Business';

    try {
        const host = req.headers.get('host') || 'unknown';
        const liveSiteId = await getLiveSiteId(host);
        
        await query(`
            INSERT INTO contact_messages (
                name, email, phone, subject, message, source_db, site_name, created_at, live_site_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        `, [name, email, phone_number || null, subject, message, sourceDb, host, liveSiteId || req.headers.get('x-live-site-id') || null]);
    } catch (dbError) {
        console.error('Error inserting contact message into Auth DB:', dbError);
    }

    // Send email notification
    const adminEmail = process.env.NOTIFY_EMAIL || 'info@realtydirections.com';
    const emailContent = `
      <h2>New Contact Us Message</h2>
      <p><strong>Site:</strong> ${siteName}</p>
      <hr />
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone_number || 'N/A'}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    try {
        await sendEmail({
            to: adminEmail,
            subject: `Contact Form Submission - ${siteName}`,
            body: emailContent,
        });
    } catch (emailErr) {
        console.error('Failed to send contact email:', emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
