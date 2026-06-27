import { NextResponse } from 'next/server';
import logger from '@/lib/logger'

import { getSourceDb } from '@/lib/source-db';

import { getServerUser } from '@/utils/auth/server';
import { sendEmail } from '@/lib/sendEmail';
import ClaimedBusinessEmail from '@/emails/claimedBusiness';
import { render } from '@react-email/render';
import { query } from '@/lib/db';
import { getSupabaseAdmin } from '@/utils/supabase/admin';


export async function POST(request) {
    try {
        const { businessId } = await request.json();

        const user = await getServerUser(request);
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = user.id;
        

        if (!businessId || !userId) {
            return NextResponse.json({ error: 'Missing businessId or userId' }, { status: 400 });
        }

        // Check if business is already claimed
        logger.log('Claiming businessId:', businessId, 'userId:', user);
        const dynamicAdmin = await getSupabaseAdmin();
        const { data: business, error: fetchError } = await dynamicAdmin
            .from('businesses')
            .select('title, claimed_by')
            .eq('id', businessId)
            .single();

        if (fetchError) {
            console.error('Error fetching business:', fetchError);
            return NextResponse.json({ error: 'Business not found: ' + fetchError.message }, { status: 404 });
        }

        if (business.claimed_by) {
            return NextResponse.json({ error: 'Business is already claimed' }, { status: 400 });
        }

        // Determine source database from env or URL
        const sourceDb = await getSourceDb();

        // Insert into Central Auth DB
        logger.log('Inserting claim to Auth DB for user:', userId);
        try {
            await query(`
                INSERT INTO claim_businesses (business_id, claimer_user_id, status, source_db, created_at, updated_at)
                VALUES ($1, $2, 'pending', $3, NOW(), NOW())
            `, [businessId, userId, sourceDb]);
        } catch (sqlError) {
            console.error('Auth DB SQL insertion error:', sqlError);
            return NextResponse.json({ error: 'Failed to submit claim to central database: ' + sqlError.message }, { status: 500 });
        }

        // Fetch user email for notification
        const userEmail = user?.email || 'Unknown Email';

        const body = await render(
            <ClaimedBusinessEmail
                businessName={business.title}
                businessId={businessId}
                userEmail={userEmail}
                siteUrl={"" /* dynamic via site config later if needed */}
            />
        );
        await sendEmail({
            to: process.env.NOTIFY_EMAIL,
            subject: `New Business Claim: ${business.title}`,
            body,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Claim error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
