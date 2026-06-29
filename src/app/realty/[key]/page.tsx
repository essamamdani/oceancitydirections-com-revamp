import { realtySlug, ucwords, getSiteName, getDisplayAddress } from "@/lib/helper";
import logger from '@/lib/logger'

import { fetchSiteData, getSiteStatus } from "@/lib/site-config";

import Navbar from "@/components/Layouts/Navbar";
import SinglePropertyListingsContent from "@/components/SinglePropertyListings/SinglePropertyListingsContent";
import StructuredData from "@/components/SEO/StructuredData";
import { notFound, redirect } from "next/navigation";

import NotFound from "@/components/NotFound";
import { fetchSingleListing as fetchSingleListing,fetchSingleListingId,getVideo, getNearbyProperties, getNearbyRestaurants } from "@/lib/actions";


// export const revalidate = 86400; // 1 day in seconds
export async function generateMetadata(props) {
    const params = await props.params;
    const site = await fetchSiteData();
    const RealtyPage = (site as any).IncludeRealty;
    if(!RealtyPage) return null;
    const [key, slug] = params.key.split("--");
    if(!slug){
        const data = await fetchSingleListingId(site, key,'ListingKey,UnparsedAddress,FullStreetAddress,City,StateOrProvince,PostalCode,County,ListingId')
        if(!data){
            return notFound();
        }
        redirect(realtySlug(data));
        return;
    }
    const property = await fetchSingleListing(site,key);
    if (!property) return notFound();
    const { ListPicture3URL, ListingId, ListPrice,PropertyType,StandardStatus } = property;
    const displayAddress = getDisplayAddress(property);
    let title = `$${ListPrice}, ${displayAddress} MLS: ${ListingId} - ${getSiteName(site)}`;
    const url = `${(site as any).URL || 'https://oceancitydirections.com'}/realty/${params.key}`;
    // logger.log(property)
    title = (StandardStatus === 'Active' ? `For ${PropertyType.includes('lease') ? 'Rent' : 'Sale'}` : StandardStatus) + ": " + title;
    const video = await getVideo(ListingId);
    const images = video?.thumbnail ? video.thumbnail : ListPicture3URL;
    return {
        title,
        description: title,
        openGraph: {
            images
        },
        alternates:{
            canonical:url
        },
    };
}
export default async function Page(props) {
    const params = await props.params;
    const site = await fetchSiteData();
    const siteStatus = getSiteStatus(site);
    if (siteStatus === 'parked') {
        redirect('/parked');
    }
    if (siteStatus === 'offline') {
        redirect('/offline');
    }
    const RealtyPage = (site as any).IncludeRealty;
    if(!RealtyPage) return null;
    const [key, slug] = params.key.split("--");
    const data = await fetchSingleListing(site,key);
    if (!data || !data?.County) return NotFound();
    // logger.log({data})
    const video = await getVideo(data.ListingId);
    const county = data.County.split("-")[0].trim();

    // --- Cross-Site Redirection Logic ---
    let crossSiteRedirectUrl = null;
    if (county) {
        try {
            const { query } = await import('@/lib/db');
            
            const stateLower = (data.StateOrProvince || (site as any).StateLowerCase || '').toLowerCase();
            const stateMap = {
                'maryland': 'MD', 'florida': 'FL', 'pennsylvania': 'PA', 'virginia': 'VA',
                'delaware': 'DE', 'new york': 'NY', 'new jersey': 'NJ', 'north carolina': 'NC',
                'south carolina': 'SC', 'georgia': 'GA', 'texas': 'TX', 'california': 'CA'
            };
            const stateCode = stateMap[stateLower] || data.StateOrProvince || (site as any).ShortState || '';

            let countyQuery = `SELECT url as site_slug FROM live_sites WHERE counties ILIKE $1 AND status != 'offline'`;
            let queryParams = [`%${county}%`];
            
            if (stateCode) {
                countyQuery += ' AND short_state ILIKE $2';
                queryParams.push(`%${stateCode}%`);
            }
            
            countyQuery += ' LIMIT 1';
            const { rows } = await query(countyQuery, queryParams);
            const countyMatch = rows[0];
            
            if (countyMatch && countyMatch.site_slug) {
                const realDomain = countyMatch.site_slug.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
                const currentDomain = (((site as any).domain || (site as any).URL?.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]) || '') as string;
                
                if (realDomain && currentDomain && realDomain !== currentDomain) {
                    if (process.env.LOCAL === 'true' && (site as any).local_test === 'yes') {
                        logger.log(`[Local Test Mode] Bypassing Cross-Site Redirect for Realty ${params.key} (belongs to ${realDomain}, current ${currentDomain})`);
                    } else {
                        crossSiteRedirectUrl = `https://${realDomain}/realty/${params.key}`;
                        logger.log(`[Cross-Site Redirect] Realty ${params.key} belongs to ${realDomain} (County: ${county}), redirecting from ${currentDomain}...`);
                    }
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

    const nearbyProperties = await getNearbyProperties(site, { 
        lat: data.Latitude, 
        long: data.Longitude, 
        price: data.ListPrice,
        listingId: data.ListingId
    })
    // only grab first 6 
    const nearbyRestaurants = await getNearbyRestaurants(site, {
        lat: data.Latitude,
        long: data.Longitude
    })

    const displayAddress = getDisplayAddress(data);
    const domain = (site as any)?.domain || (site as any)?.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '') || 'oceancitydirections.com';
    const listingSchema = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: `${displayAddress} - MLS ${data.ListingId}`,
        url: `https://${domain}/realty/${params.key}`,
        image: [data.ListPictureURL, data.ListPicture2URL, data.ListPicture3URL].filter(Boolean),
        description: data.PublicRemarks || `${displayAddress} listed by ${data.ListOfficeName || 'Bright MLS'}`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: data.FullStreetAddress,
            addressLocality: data.City,
            addressRegion: data.StateOrProvince || (site as any).ShortState?.toUpperCase(),
            postalCode: data.PostalCode,
            addressCountry: 'US',
        },
        offers: {
            '@type': 'Offer',
            price: data.ListPrice,
            priceCurrency: 'USD',
            availability: data.StandardStatus === 'Active' ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability',
        },
    };

    return (
        <div className="rd-detail-page rd-property-detail-page">
            <Navbar />
            <StructuredData data={listingSchema} />
            
            <SinglePropertyListingsContent 
                video={video} 
                property={data} 
                nearbyProperties={nearbyProperties}
                nearbyRestaurants={nearbyRestaurants}
                breadcrumbs={[
                                { name: "Real Estate", link: "/realty" },
                                { name: ucwords(county), link: `/realty/location/${county.toLowerCase()}` },
                                { name: ucwords(data.City), link: `/realty/location/${county.toLowerCase()}/${data.City.toLowerCase()}` },
                                { name: data.PostalCode, link: `/realty/location/${county.toLowerCase()}/${data.City.toLowerCase()}/${data.PostalCode}` },
                                { name: getDisplayAddress(data).toUpperCase().split(",").join(", ") },
                            ]}/>
            
        </div>
    );
}
