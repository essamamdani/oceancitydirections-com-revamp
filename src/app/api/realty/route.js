import { fetchListing4Related } from "@/lib/actions";
import { fetchSiteData } from "@/lib/site-config";
import { NextResponse } from "next/server";

// export const runtime = 'edge'

export async function GET(request, { params }) {
    const searchParams = request.nextUrl.searchParams;
    const site = await fetchSiteData()
    const property = await fetchListing4Related(site,{
        city: searchParams.get('city'),
        zip: searchParams.get('zip'),
    })
    return NextResponse.json(property)
}