import NavbarTwo from "@/components/Layouts/NavbarTwo";
import logger from '@/lib/logger'


import SingleListingsContent from "@/components/SingleListings/SingleListingsContent";
import StructuredData from "@/components/SEO/StructuredData";

import { getBusiness, getSubcategoriesByIDs } from "@/lib/actions";
import { getVideo } from "@/lib/actions";
import NotFound from "@/components/NotFound";
import { ucwords } from "@/lib/helper";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";
import { redirect } from 'next/navigation';

// export const revalidate = 86400; // 1 day in seconds
// export const dynamic = 'force-static'; // Force static generation
// export async function generateStaticParams() {
//     // const urls = [];
//     const limit = 300;
//     let currentPage = 1;
//     // let rowsFetched = 0;

//     // do {
//     const { data, error } = await supabase.rpc('business_location_sitemap', {
//         p_state: defaultState,
//         p_counties: defaultCounties,
//         p_items_per_page: limit,
//         p_page: currentPage,
//     });
    
//     // if (error || !data.length) break;

//     return data.map((item) => {
//         return {
//             slug: item.slug,
//         };
//     }
//     );
// }

export async function generateMetadata(props) {
    try {
        const params = await props.params;
        const site = await fetchSiteData();

        if (!site || getSiteStatus(site) === 'offline' || getSiteStatus(site) === 'parked') {
            return { title: 'Site Offline' };
        }

        const data = await getBusiness(site, params.slug);
        if (!data) return { title: 'Not Found' };

        let { title, description, city, county, state, snippet } = data;
        title += " - " + city + ", " + county + ", " + state;
        description = "Address: " + snippet + ", " + (description ? description.substring(0, 120) : title);

        return {
            title: ucwords(title) + " - " + getSiteName(site),
            description,
            openGraph: {
                images: `${site.URL || 'https://oceancitydirections.com'}/api/og?title=${encodeURIComponent(title)}`,
            },
            alternates: {
                canonical: `${site.URL || 'https://oceancitydirections.com'}/s/${params.slug}`,
            },
        };
    } catch {
        return { title: 'Ocean City Directions' };
    }
}

export default async function Page(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const slug = params.slug;
    // const headerList = headers();
    // const userAgent = headerList.get("user-agent") || "";
    logger.log({slug});
    // const isBot = /bot|crawl|slurp|spider/i.test(userAgent);
    const site = await fetchSiteData();
    const siteStatus = getSiteStatus(site);
    if (siteStatus === 'parked') {
        redirect('/parked');
    }
    if (siteStatus === 'offline') {
        redirect('/offline');
    }
    const data = await getBusiness(site,slug);
    logger.log({data})
    if (!data) return NotFound();

    // --- Cross-Site Redirection Logic ---
    let crossSiteRedirectUrl = null;
    if (data.county) {
        try {
            const { query } = await import('@/lib/db');
            
            // Determine state code (e.g. 'MD' from 'maryland')
            const stateLower = (data.state || site.StateLowerCase || '').toLowerCase();
            const stateMap = {
                'maryland': 'MD', 'florida': 'FL', 'pennsylvania': 'PA', 'virginia': 'VA',
                'delaware': 'DE', 'new york': 'NY', 'new jersey': 'NJ', 'north carolina': 'NC',
                'south carolina': 'SC', 'georgia': 'GA', 'texas': 'TX', 'california': 'CA'
            };
            const stateCode = stateMap[stateLower] || data.state_code || site.ShortState || '';

            let countyQuery = `SELECT url as site_slug FROM live_sites WHERE counties ILIKE $1 AND status != 'offline'`;
            let queryParams = [`%${data.county}%`];
            
            if (stateCode) {
                countyQuery += ' AND short_state ILIKE $2';
                queryParams.push(`%${stateCode}%`);
            }
            
            countyQuery += ' LIMIT 1';
            const { rows } = await query(countyQuery, queryParams);
            const countyMatch = rows[0];
            
            if (countyMatch && countyMatch.site_slug) {
                const realDomain = countyMatch.site_slug.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                const currentDomain = (site.domain || site.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]) || '';
                
                if (realDomain && currentDomain && realDomain !== currentDomain) {
                    const targetSlug = data.slug;
                    crossSiteRedirectUrl = `https://${realDomain}/s/${targetSlug}`;
                    logger.log(`[Cross-Site Redirect] Business ${data.slug} belongs to ${realDomain} (County: ${data.county}), redirecting from ${currentDomain}...`);
                }
            }
        } catch (err) {
            console.error('[Cross-Site Redirect] Error verifying county:', err);
        }
    }
    
    if (crossSiteRedirectUrl) {
        redirect(crossSiteRedirectUrl);
        return;
    }
    // --- End Cross-Site Logic ---

    // Handle redirection if slug has been updated
    // If URL slug is old (matches update_slug), redirect to current slug
    if (data.slug && data.slug !== slug) {
        logger.log('Redirecting to current slug:', data.slug);
        redirect(`/s/${data.slug}`);
        return;
    }
    logger.log('Rendering old slug:', slug);
    const [subcategories, video] = await Promise.all([
        getSubcategoriesByIDs(data?.subcategoriesId),
        getVideo(slug, 'business')
    ]);
    let business = { ...data, categories: data?.categories, subcategories };

    // Check if business is featured in admin's featured_listings table
    let isFeatured = false;
    try {
        const { query } = await import('@/lib/db');
        const featuredRes = await query(
            `SELECT id FROM featured_listings
             WHERE business_id = $1 AND featured_business_listing = true
             AND (featured_until IS NULL OR featured_until > NOW()) LIMIT 1`,
            [data.id]
        );
        isFeatured = featuredRes.rows.length > 0;
    } catch (_) {}

    const domain = site?.domain || site?.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '') || 'oceancitydirections.com';
    const businessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: data.title,
        url: `https://${domain}/s/${data.slug || slug}`,
        image: data.main_image || `${site.URL || `https://${domain}`}/api/og?title=${encodeURIComponent(data.title || 'Business')}`,
        description: data.description || data.snippet || `${data.title} in ${data.city}, ${data.state}`,
        telephone: data.phone || undefined,
        address: {
            '@type': 'PostalAddress',
            streetAddress: data.address,
            addressLocality: data.city,
            addressRegion: data.state,
            postalCode: data.zip,
            addressCountry: 'US',
        },
        geo: data.latitude && data.longitude ? {
            '@type': 'GeoCoordinates',
            latitude: data.latitude,
            longitude: data.longitude,
        } : undefined,
        areaServed: data.county || site.State || undefined,
    };

    return (
        <div className="rd-detail-page rd-business-detail-page">
            <NavbarTwo />
            <StructuredData data={businessSchema} />
            <SingleListingsContent
                // isBot={isBot}
                business={business}
                video={video}
                isFeatured={isFeatured}
                // property={property}
                breadcrumbs={[
                    { name: "Businesses", link: "/business" },
                    { name: ucwords(data.county), link: `/business/location/${data.county.toLowerCase()}` },
                    { name: ucwords(data.city), link: `/business/location/${data.county.toLowerCase()}/${data.city.toLowerCase()}` },
                    { name: ucwords(data.zip), link: `/business/location/${data.county.toLowerCase()}/${data.city.toLowerCase()}/${data.zip}` },
                    { name: ucwords(data.title) },
                ]}
            />
        </div>
    );
}
