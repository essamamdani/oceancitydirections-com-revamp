import Navbar from "@/components/Layouts/Navbar";
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
import { getSiteName, ucwords } from "@/lib/helper";
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

import RealtySplitLayout from "@/components/CustomComponents/RealtySplitLayout";

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
    
    const RealtyPage = (site as any).IncludeRealty;
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
            <Navbar />
            <RealtySplitLayout
                site={site}
                searchParams={searchParams}
                location={location}
                properties={properties}
                totalRecords={totalRecords}
                featured_videos={featured_videos}
                geoJson={geoJson}
                params={params}
            />
        </>
    );

}
