import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/auth/server';
import { query } from '@/lib/db';


export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const user = await getServerUser(request);

        if (!user) {
            console.error('[Submission GET] Unauthorized: No Better Auth user found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await query(`
            SELECT * FROM business_submissions 
            WHERE id = $1 AND user_id = $2
        `, [id, user.id]);

        if (res.rows.length === 0) {
            console.error('[Submission GET] Submission not found');
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json(res.rows[0]);
    } catch (error) {
        console.error('[Submission GET] API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const user = await getServerUser(request);

        if (!user) {
            console.error('[Submission PUT] Unauthorized: No Better Auth user found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership and status
        const res = await query(`
            SELECT * FROM business_submissions 
            WHERE id = $1 AND user_id = $2
        `, [id, user.id]);

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        const existing = res.rows[0];

        if (existing.status !== 'pending') {
            return NextResponse.json({ error: 'Cannot edit non-pending submission' }, { status: 400 });
        }

        try {
            await query(`
                UPDATE business_submissions 
                SET submission_data = $1, updated_at = NOW()
                WHERE id = $2
            `, [JSON.stringify(body), id]);
        } catch (updateError) {
            console.error('[Submission PUT] Error updating submission SQL:', updateError);
            return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Submission PUT] API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
