import { fetchSingleListing, fetchSingleListingId } from '@/lib/actions';
import { realtySlug } from '@/lib/helper';
import { fetchSiteData } from '@/lib/site-config';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { mls_id } = (await params) || {};
        
        if (!mls_id) {
            return NextResponse.json({ error: 'Missing mls_id in URL' }, { status: 400 });
        }
        const site = await fetchSiteData();
        const data = await fetchSingleListingId(site, mls_id,'ListingKey,UnparsedAddress,ListingId')


        return NextResponse.json({link:realtySlug(data)}, { status: 200 });
    } catch (error) {
        console.error('Error in POST /api/mls-finder/[mls_id]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}