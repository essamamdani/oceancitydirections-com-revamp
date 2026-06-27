import { NextResponse } from 'next/server';
import { getServerUser } from '@/utils/auth/server';
import { getSupabaseAdmin } from '@/utils/supabase/admin';
import slug from 'slug';

export async function POST(request) {
    try {
        const user = await getServerUser(request);
        if (!user || user.user_metadata?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const data = await request.json();
        const { id, ...updates } = data;

        if (!id) {
            return NextResponse.json({ error: 'Missing business ID' }, { status: 400 });
        }

        const dynamicAdmin = await getSupabaseAdmin();
        // Fetch current business data to check for changes
        const { data: currentBusiness, error: fetchError } = await dynamicAdmin
            .from('businesses')
            .select('title, address, slug')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Check if title or address has changed
        const newTitle = updates.title || currentBusiness.title;
        const newAddress = updates.address || currentBusiness.address;

        const titleChanged = updates.title && updates.title !== currentBusiness.title;
        const addressChanged = updates.address && updates.address !== currentBusiness.address;

        if (titleChanged || addressChanged) {
            // Generate new slug for update_slug column
            // Format: slug(title) + "--" + slug(address)
            const titleSlug = slug(newTitle);
            const addressSlug = slug(newAddress);
            const newSlug = `${titleSlug}--${addressSlug}`;

            updates.update_slug = newSlug;

            // Ensure we DO NOT update the main slug column
            delete updates.slug;
        }

        const { error } = await dynamicAdmin
            .from('businesses')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Update error:', error);
            return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
