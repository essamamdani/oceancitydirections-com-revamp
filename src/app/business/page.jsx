import { getBusinessesNew, getCategoriesNew, getLocationNew, toGeoJSONPoints } from "@/lib/actions";
import BusinessPage from "@/components/Template/BusinessPage";
import { headers } from "next/headers";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";
import { redirect } from "next/navigation";

export const maxDuration = 60;

export async function generateMetadata() {
  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  const state = site?.state || '';
  const title = `Businesses Directory - ${siteName}`;
  const description = `Browse businesses directory in ${state} on ${siteName}.`;

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
  
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || "";

  const isBot = /bot|crawl|slurp|spider/i.test(userAgent);
  if (isBot && (searchParams?.q || searchParams?.ask)) {
    return <>Please try again</>
  }
  const [categories, location, data] = await Promise.all([getCategoriesNew(site), getLocationNew(site), getBusinessesNew(site,searchParams)]);

  const { businesses, totalRecords, geoJson, featured_videos } = data;

  return (
    <BusinessPage
      breadcrumbs={[
        { name: "Businesses" },
      ]}
      params={params}
      searchParams={searchParams}
      geoJson={geoJson}
      categories={categories}
      businesses={businesses}
      location={location}
      totalRecords={totalRecords}
      featured_videos={featured_videos}
      site={site}
    />
  );
}