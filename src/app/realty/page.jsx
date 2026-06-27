import NavbarTwo from "@/components/Layouts/NavbarTwo";
import logger from '@/lib/logger'

import Footer from "@/components/Layouts/Footer";

import PageHeaderWithMap from "@/components/Listings/PageHeaderWithMap";
import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";
import NoRecordFound from "../no-records";
import NotFound from "../not-found";
import { fetchListings, getLocationNew } from "@/lib/actions";
import Link from "next/link";
import RealtySidebar from "@/components/Listings/RealtySidebar";

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
    const breadcrumbs = [{ name: "Real Estate" }];
    if (data?.category) {
        searchParams.category = data.category;
    }
    // logger.log(JSON.stringify(properties[0],null,2))
    return (
        <>
            <NavbarTwo />
            <PageHeaderWithMap geoJson={geoJson} />
            <div className="listings-area pt-1">
                <div className="container-fluid">
                    <div className="row mt-3">
                        <div className="col-xl-12 col-lg-12 col-md-12">
                            <div className="breadcrumb-area my-2">
                                <ol className="breadcrumb p-0">
                                    <li className="item">
                                        <Link style={{
                                            color: "var(--mainColor)",
                                        }} href="/">Home</Link></li>
                                    {breadcrumbs?.length > 0 && breadcrumbs.map((item, index) => (
                                        <li className="item" key={index}>
                                            {item.link ? <Link style={{
                                                color: "var(--mainColor)",
                                            }} href={item.link}>{item.name}</Link> : item.name}
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </div>
                    <div className="row m-0">
                        <div className="col-xl-12 col-lg-12 col-md-12 p-0">
                            <div className="row d-flex">
                                <div className="col-lg-3 col-md-12">
                                    <RealtySidebar link="realty" location={location} categories={[]} params={[]} />
                                </div>

                                {totalRecords > 0 ? <MainPropertiesGridPage
                                    searchParams={searchParams}
                                    location={location}
                                    properties={properties}
                                    totalRecords={totalRecords}
                                    featured_videos={featured_videos}
                                /> : <NoRecordFound params={params} site={site} />}

                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );

}
