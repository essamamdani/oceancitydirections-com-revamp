import { getBusinessesNew } from "@/lib/actions";
import { fetchSiteConfigByDomain } from "@/lib/site-config";
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const domain = searchParams.get('domain');
        
        const site = await fetchSiteConfigByDomain(domain);
        if (!site) return NextResponse.json({ error: "Site not found" });

        const businesses = await getBusinessesNew(site, {});
        
        return NextResponse.json({
            site_counties: site.DefaultCounties,
            businesses
        });
    } catch (e) {
        return NextResponse.json({ error: e.message, stack: e.stack });
    }
}