import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    
    try {
        let sql = 'SELECT id, name, slug, parent_id FROM user_categories';
        let params = [];
        
        if (parentId) {
            sql += ' WHERE parent_id = $1';
            params.push(parentId);
        } else {
            sql += ' WHERE parent_id IS NULL';
        }
        
        sql += ' ORDER BY priority ASC, name ASC';
        
        const { rows } = await query(sql, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching user categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
