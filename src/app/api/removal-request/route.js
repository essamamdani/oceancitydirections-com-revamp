import { NextResponse } from 'next/server';
import { getSourceDb } from '@/lib/source-db';
import { query } from '@/lib/db';


export async function POST(request) {
  try {
    const { businessId, name, email, phone, reason, source_state, user_id } = await request.json();

    if (!businessId || !name || !email || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    
        const sourceDb = await getSourceDb(request.headers.get('host'));


    // Insert into Central Auth DB business_request_info table
    try {
        await query(`
            INSERT INTO business_request_info (
                business_id, name, email, phone, remarks, status, type, source_db, source_state, user_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        `, [
            businessId, 
            name, 
            email, 
            phone, 
            reason, 
            'pending', 
            'removal',
            sourceDb,
            source_state || null,
            user_id || null
        ]);
    } catch (insertError) {
      console.error('Error inserting removal request to Auth DB:', insertError);
      return NextResponse.json({ error: 'Failed to submit removal request' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Removal request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
