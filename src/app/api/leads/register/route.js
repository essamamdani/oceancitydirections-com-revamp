import { NextResponse } from 'next/server'
import { pushRegisteredLead } from '@/lib/actions'
import { getSourceDb } from '@/lib/source-db'


export async function POST(request) {
  try {
    const body = await request.json()
    const { email, full_name, phone, site_name, full_url } = body || {}

    if (!email || !full_name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Also push to Central Auth DB
    try {
        const { query } = await import('@/lib/db');
        
        const sourceDb = await getSourceDb(request.headers.get('host'));

        await query(`
            INSERT INTO property_leads (
                name, email, phone, site_name, source_db, source_state, live_site_id, created_at, full_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
        `, [full_name, email, phone, site_name || 'Property Lead', sourceDb, request.headers.get('host') || 'unknown', request.headers.get('x-live-site-id') || null, full_url || null]);
    } catch(err) {
        console.error('Failed to save lead to Auth DB:', err);
    }

    const result = await pushRegisteredLead({ email, full_name, phone, site_name })
    if (result.status !== 200) {
      return NextResponse.json({ error: result.data || 'Failed to push HubSpot lead' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
