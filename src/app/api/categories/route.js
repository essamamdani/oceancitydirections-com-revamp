import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase/admin';


export async function GET() {
  try {
    const supabase = await getSupabaseAdmin();
    
    if (!supabase) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

