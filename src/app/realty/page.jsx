import NavbarTwo from "@/components/Layouts/NavbarTwo";
import logger from '@/lib/logger'

import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";
import NoRecordFound from "../no-records";
import NotFound from "../not-found";
import { fetchListings, getLocationNew } from "@/lib/actions";
import Link from "next/link";
import RealtySidebar from "@/components/Listings/RealtySidebar";
import MapPanel from "@/components/Revamp/MapPanel";

import { headers } from "next/headers";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";
import { redirect } from "next/navigation";



export async function generateMetadata() {
  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  const state = site?.state || '';
  const title = `Real Estate Listings - ${siteName}`;
  const description = `Browse real estate listings in ${state} on ${siteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: siteName,
    },
  };
}

export default async function Page(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const site = await fetchSiteData();
    
    const siteStatus = getSiteStatus(site);
    if (siteStatus === 'parked') {
        redirect('/parked');
    }
    if (siteStatus === 'offline') {
        redirect('/offline');
    }
    
    const RealtyPage = site.IncludeRealty;
    if (!RealtyPage) return <NotFound />;
    const headerList = await headers();
    const userAgent = headerList.get("user-agent") || "";

    const isBot = /bot|crawl|slurp|spider/i.test(userAgent);
    if (isBot && (searchParams?.q || searchParams?.ask)) {
        return <>Please try again</>
    }
    // logger.log(searchParams);
    logger.log('[realty/page] searchParams:', JSON.stringify(searchParams));
    const [data, location] = await Promise.all([fetchListings(site,searchParams), getLocationNew(site)]);
    logger.log('[realty/page] location count:', location?.length || 0);
    const totalRecords = data?.['@odata.count'] || 0;
    const geoJson = data?.geoJson || null;
    const properties = data.value || [];
    const featured_videos = data.featured_videos || [];
    if (data?.category) {
        searchParams.category = data.category;
    }

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
                        <span className="rd-kicker">Homes and real estate</span>
                        <h1>{getSiteName(site)} homes for sale and real estate</h1>
                        <p>
                            Search active IDX listings, compare neighborhoods, and connect with Realty Directions for property guidance.
                        </p>
                        <div className="rd-filter-chips">
                            <Link href="/realty?category=sale">For Sale</Link>
                            <Link href="/realty?category=rent">For Rent</Link>
                            <Link href="/realty?orderBy=price_asc">Lowest Price</Link>
                            <Link href="/sell">Sell Your Home</Link>
                        </div>
                    </div>

                    <div className="rd-search-results-grid">
                        <RealtySidebar link="realty" location={location} categories={[]} params={[]} />
                        <div className="rd-results-column">
                            {totalRecords > 0 ? (
                                <MainPropertiesGridPage
                                    searchParams={searchParams}
                                    location={location}
                                    properties={properties}
                                    totalRecords={totalRecords}
                                    featured_videos={featured_videos}
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
