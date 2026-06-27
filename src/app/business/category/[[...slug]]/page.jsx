import { getBusinessesNew, getCategoriesNew, getLocationNew } from "@/lib/actions";
import logger from '@/lib/logger'

import NotFound from "@/components/NotFound";

import BusinessPage from "@/components/Template/BusinessPage";
import { ucwords } from "@/lib/helper";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";
import { redirect } from "next/navigation";



export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || [];
  const [category, subcategory] = slug;
  
  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  const state = site?.state || '';
  
  let title, description;
  if (subcategory) {
    title = `${ucwords(subcategory)} in ${state} - ${siteName}`;
    description = `Find the best ${ucwords(subcategory)} businesses in ${state}. Browse reviews, photos, and contact information on ${siteName}.`;
  } else if (category) {
    title = `${ucwords(category)} in ${state} - ${siteName}`;
    description = `Find the best ${ucwords(category)} businesses in ${state}. Browse reviews, photos, and contact information on ${siteName}.`;
  } else {
    title = `Business Categories - ${siteName}`;
    description = `Browse business categories in ${state} on ${siteName}.`;
  }

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
  const slug = params?.slug || [];

  // Redirect if no slug is provided
  if (slug.length === 0) {
    return redirect('/business')
  }

  // If the last segment is "category", remove it and redirect
  if (slug[slug.length - 1] === "category") {
    redirect(`/business/category/${slug.slice(0, -1).join("/")}`);
  }

  



  const { slug: categoryParams } = params;
  let [category, subcategory, not_found] = categoryParams;


  if (not_found) {
    return <NotFound />;
  }
  const site = await fetchSiteData();
  const siteStatus = getSiteStatus(site);
  if (siteStatus === 'parked') {
    redirect('/parked');
  }
  if (siteStatus === 'offline') {
    redirect('/offline');
  }

  const [categories, location] = await Promise.all([
    subcategory ? [] : getCategoriesNew(site,{
      category,
      subcategory,
      minimum: 0,
    }),
    getLocationNew(site,{
      categoryPage:true,
      category,
      subcategory,
      minimum: 0,
    }),
  ]);

  if (!categories || (categories.subcategories && categories.subcategories.length === 0)) {
    return <NotFound />;
  }

  const { businesses, totalRecords, geoJson } = await getBusinessesNew(site,{
    ...searchParams,
    category: category,
    subcategory: subcategory,
  });

  let breadcrumbs = [{ name: "Businesses", link: "/business" }];
  if (category) {
    breadcrumbs.push({ name: ucwords(category, true), link: `/business/category/${category?.toLowerCase()}` });
  }
  if (subcategory) {
    breadcrumbs.push({ name: ucwords(subcategory, true) });
  }
  logger.log({
      // categories,
      categories_length: categories?.length,
      // location,
      location_length: location?.length
      
    })
  return (
    <BusinessPage
      link='category'
      breadcrumbs={breadcrumbs}
      params={params}
      searchParams={searchParams}
      geoJson={geoJson}
      categories={categories}
      businesses={businesses}
      location={location}
      totalRecords={totalRecords}
      site={site}
    />
  );
}
