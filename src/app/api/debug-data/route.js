import { fetchSiteConfigByDomain } from "@/lib/site-config";
import { getSupabaseAdmin } from "@/utils/supabase/admin";
import { NextResponse } from 'next/server';


export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');
        const expectedToken = '19a1d1819855f96fcd721cab5d8dfb0970586825e6f226fa67bd06f5b089feaf';

        if (token !== expectedToken) {
            return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }

        const domain = searchParams.get('domain') || request.headers.get('host') || '';
        
        const site = await fetchSiteConfigByDomain(domain);
        if (!site) {
            return NextResponse.json({ error: "Site not found in live_sites", domain });
        }

        const adminClient = await getSupabaseAdmin();
        const defaultState = site.StateLowerCase;
        const defaultCounties = site.DefaultCounties;

        // Fetch 10 businesses based on the site's counties
        const { data: businesses, error: busError } = await adminClient.rpc("get_businesses_extra", {
            p_state: defaultState,
            p_county: defaultCounties,
            p_category_name: null,
            p_subcategory_name: null,
            p_city: null,
            p_zip: null,
            p_page: 1,
            p_limit: 10
        });

        // Fetch categories & subcategories based on the site's counties
        const { data: categories, error: catError } = await adminClient.rpc("get_businesses_extra_type", {
            p_state: defaultState,
            p_county: defaultCounties,
            p_type: 'category',
            p_category_name: null,
            p_subcategory_name: null,
            p_city: null,
            p_zip: null,
            p_minimum: 1
        });

        return NextResponse.json({
            status: "success",
            domain: domain,
            site: {
                id: site.id,
                slug: site.Slug,
                url: site.URL,
                status: site.Status,
                state: site.State,
                counties: site.Counties,
                default_counties: defaultCounties
            },
            businesses: {
                count: businesses ? businesses.length : 0,
                error: busError,
                data: businesses || []
            },
            categories: {
                count: categories ? categories.length : 0,
                error: catError,
                data: categories || []
            }
        });
    } catch (e) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
