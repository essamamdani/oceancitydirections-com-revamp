import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/auth/server';
import { query } from '@/lib/db';


export async function GET(request) {
    try {
        const user = await getServerUser(request);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await query(`
            SELECT * FROM business_submissions
            WHERE user_id = $1 AND status = 'pending'
            ORDER BY created_at DESC
        `, [user.id]);

        return NextResponse.json({ submissions: res.rows || [] });
    } catch (error) {
        console.error('API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
