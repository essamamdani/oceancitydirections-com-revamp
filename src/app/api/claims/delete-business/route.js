import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/auth/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request) {
  try {
    const { business_id } = await request.json();
    
    if (!business_id) {
        return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    const user = await getServerUser(request);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('claimed_by, claimed_approval')
        .eq('id', business_id)
        .single();

    if (!business) {
        return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Check if user is the claimer (owner)
    // Also allow if they have an approved claim in claim_businesses?
    // The previous logic checked businesses.claimed_by directly.
    // If business.claimed_by matches user, they are the owner.
    
    // We should also verify they have an approved claim if that logic is used.
    // But claimed_by on businesses table is the source of truth for current owner.
    
    if (business.claimed_by !== user.id) {
        return NextResponse.json({ error: 'You do not have permission to delete this business' }, { status: 403 });
    }

    // Perform permanent delete
    // First delete any related claims to avoid FK issues if cascade isn't set
    // But wait, if we delete business, we should let cascade handle it or do it manually.
    // Let's try deleting business.
    
    const { error: deleteError } = await supabaseAdmin
        .from('businesses')
        .delete()
        .eq('id', business_id);

    if (deleteError) {
        console.error("Delete error:", deleteError);
        return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 });
    }

    // Also delete related claims manually if needed (though usually cascade takes care of it)
    // Just in case:
    await supabaseAdmin.from('claim_businesses').delete().eq('business_id', business_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete business error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
