
import { ucwords, getSiteName } from "@/lib/helper";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import { redirect } from "next/navigation";

import NotFound from "@/components/NotFound";
import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";
import NoRecordFound from "@/components/NoRecordFound";

import { getLocationNew, fetchListings } from "@/lib/actions";
import Link from "next/link";
import RealtySidebar from "@/components/Listings/RealtySidebar";
import MapPanel from "@/components/Revamp/MapPanel";



export async function generateMetadata(props) {
    const params = await props.params;
    const [county, city, zip] = params.location || [];
    
    const site = await fetchSiteData();
    const siteName = getSiteName(site);
    
    let title, description;
    if (zip) {
        title = `Real Estate in ${ucwords(city)}, ${site?.state || ''} ${zip} - ${siteName}`;
        description = `Browse real estate listings in ${ucwords(city)}, ${site?.state || ''} ${zip} on ${siteName}. Find homes for sale and rent.`;
    } else if (city) {
        title = `Real Estate in ${ucwords(city)}, ${ucwords(county)} - ${siteName}`;
        description = `Browse real estate listings in ${ucwords(city)}, ${ucwords(county)} County on ${siteName}. Find homes for sale and rent.`;
    } else if (county) {
        title = `Real Estate in ${ucwords(county)} County - ${siteName}`;
        description = `Browse real estate listings in ${ucwords(county)} County on ${siteName}. Find homes for sale and rent.`;
    } else {
        title = siteName;
        description = `${siteName} - ${siteName} is a platform that helps you find your way around the city`;
    }
    
    return {
        title,
        description,
    };
}

export default async function Page(props) {
    // const { q } = searchParams;
    const searchParams = await props.searchParams;
    const params = await props.params;
    const [county, city, zip, not_found] = params.location;

if (not_found !== undefined) {
    return NotFound();
}

// Create a minimal site object for the API calls
const site = await fetchSiteData();
const siteStatus = getSiteStatus(site);
if (siteStatus === 'parked') {
    redirect('/parked');
}
if (siteStatus === 'offline') {
    redirect('/offline');
}

const [data, location] = await Promise.all([fetchListings(site,{ ...searchParams, county, city, zip }), zip ? [] : getLocationNew(site,{ county, city, zip })]);

const totalRecords = data?.['@odata.count'] || 0;
const geoJson = data.geoJson || null;
const properties = data.value || [];
const locationTitle = [zip, city && ucwords(city, true), county && `${ucwords(county, true)} County`].filter(Boolean).join(", ");
return (
    <>
        <NavbarTwo />
        <div className="rd-search-layout rd-property-layout">
            <MapPanel
                geoJson={geoJson}
                eyebrow="Real estate map"
                title={`${totalRecords || 0} homes`}
            />
            <section className="rd-results-pane">
                <div className="rd-results-hero">
                    <span className="rd-kicker">Location real estate</span>
                    <h1>Homes for sale in {locationTitle || getSiteName(site)}</h1>
                    <p>
                        Explore active homes, rentals, and neighborhood context for {locationTitle || site?.State || 'this market'}.
                    </p>
                    <div className="rd-filter-chips">
                        <Link href="/realty">All Homes</Link>
                        <Link href="/realty?category=sale">For Sale</Link>
                        <Link href="/realty?category=rent">For Rent</Link>
                        <Link href="/sell">Sell Your Home</Link>
                    </div>
                </div>

                <div className="rd-search-results-grid">
                    <RealtySidebar
                        link="realty"
                        location={location}
                        categories={[]}
                        params={params}
                    />
                    <div className="rd-results-column">
                        {totalRecords > 0 ? (
                            <MainPropertiesGridPage
                                searchParams={searchParams}
                                properties={properties}
                                params={params}
                                totalRecords={totalRecords}
                            />
                        ) : (
                            <NoRecordFound params={params} site={site} />
                        )}
                    </div>
                </div>
            </section>
        </div>
    </>
);
}
