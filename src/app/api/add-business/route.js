import { NextResponse } from 'next/server';
import logger from '@/lib/logger'

import { getSourceDb } from '@/lib/source-db';

import { validateEmail, validatePhone, formatPhoneForDb, isValidUSState } from '@/lib/validation';
import { sendEmail } from '@/lib/sendEmail';
import BusinessAddedEmail from '@/emails/businessAdded';
import { render } from '@react-email/render';
import { getServerUser } from '@/utils/auth/server';
import { query } from '@/lib/db';
import { fetchSiteConfigByDomain } from '@/lib/site-config';


export async function POST(request) {
    try {
        const body = await request.json();
        
        // Validation
        if (body.email && !validateEmail(body.email)) {
             return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }
        if (body.phone && !validatePhone(body.phone)) {
             return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 });
        }

        // Required fields validation
        const requiredFields = ['address', 'city', 'state', 'zip', 'lat', 'long'];
        const missingFields = requiredFields.filter(field => !body[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json({ 
                error: `Missing required fields: ${missingFields.join(', ')}` 
            }, { status: 400 });
        }

        // State validation (Must be US)
        if (body.state && !isValidUSState(body.state)) {
             return NextResponse.json({ error: 'Invalid location. Only businesses in the USA are accepted.' }, { status: 400 });
        }

        // Format phone
        if (body.phone) {
            body.phone = formatPhoneForDb(body.phone);
        }

        // Use Better Auth session verification via proxy to auth server
        const user = await getServerUser(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Determine source database from request host
        const host = request.headers.get('host') || 'unknown';
        const sourceDb = await getSourceDb(host);

        // Insert into AUTH DB (business_submissions table) using DIRECT SQL (Bypasses Service Key requirement)
        logger.log('Inserting submission to AUTH DB via SQL for user:', user.id);
        
        try {
            const subRes = await query(`
                INSERT INTO business_submissions (user_id, status, submission_data, source_db, source_state, live_site_id, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING id
            `, [user.id, 'pending', JSON.stringify(body), sourceDb, host, body.live_site_id || null]);
            
            const newSubId = subRes.rows[0]?.id;
            
            // Create Relation in sibilings table immediately (business_id is null initially)
            if (newSubId) {
                await query(`
                    INSERT INTO sibilings (business_id, submission_id) 
                    VALUES (NULL, $1)
                    ON CONFLICT (submission_id) DO NOTHING
                `, [newSubId]);
            }
        } catch (sqlError) {
            console.error('Auth DB SQL insertion error:', sqlError);
            return NextResponse.json({ error: 'Failed to submit business to database: ' + sqlError.message }, { status: 500 });
        }

        // Notify admin via email
        try {
            const bodyHtml = await render(
                <BusinessAddedEmail
                    businessData={body}
                    userEmail={user.email}
                    siteUrl={""}
                />
            );
            
            await sendEmail({
                to: process.env.NOTIFY_EMAIL,
                subject: `New Business Submission: ${body.title}`,
                body: bodyHtml,
            });
        } catch (emailError) {
            console.error('Error sending notification email:', emailError);
            // Don't fail the request if email fails
        }

        // HubSpot integration
        try {
            const { fetchSiteConfigByDomain } = await import('@/lib/site-config')
            const { getSiteName } = await import('@/lib/helper')
            const siteConfig = await fetchSiteConfigByDomain(host);
            const siteName = siteConfig ? getSiteName(siteConfig) : 'Realty Directions';
            const { pushBusinessSubmissionLead } = await import('@/lib/actions')
            
            const hubspotResult = await pushBusinessSubmissionLead({
                email: user.email,
                full_name: user.full_name || user.name || '',
                phone: user.phone || body.phone || '',
                site_name: siteName,
                business_title: body.title,
                business_address: `${body.address}, ${body.city}, ${body.state} ${body.zip}`,
                submission_data: body
            })
            
            if (hubspotResult.status !== 200) {
                console.error('[HubSpot] Business submission lead push failed:', hubspotResult.data);
            } else {
                logger.log('[HubSpot] Business submission lead pushed successfully:', hubspotResult.id);
            }
        } catch (hsError) {
            console.error('[HubSpot] Business submission integration error:', hsError);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
    }
}
