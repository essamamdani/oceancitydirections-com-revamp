import { NextResponse } from 'next/server'
import { getServerUser } from '@/utils/auth/server'
import { query } from '@/lib/db'


export async function GET(request) {
  try {
    // Use Better Auth session verification
    const user = await getServerUser(request);
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch submissions from AUTH DB using direct SQL (More reliable than Supabase client here)
    const subRes = await query(`
        SELECT * FROM business_submissions 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `, [user.id]);

    return NextResponse.json({ data: subRes.rows || [] })
  } catch (e) {
    console.error('submissions/list error:', e)
    return NextResponse.json({ error: 'Internal Server Error: ' + e.message }, { status: 500 })
  }
}
