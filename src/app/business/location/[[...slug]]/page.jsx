import NotFound from "@/components/NotFound";
import BusinessPage from "@/components/Template/BusinessPage";
import { ucwords } from "@/lib/helper";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import { getSiteName } from "@/lib/helper";
import { getBusinessesNew, getCategoriesNew, getLocationNew } from "@/lib/actions";
import { redirect } from "next/navigation";

export async function generateMetadata(props) {
  const params = await props.params;
  const slug = params?.slug || [];

  let site;
  try {
    site = await fetchSiteData();
  } catch (error) {}
  const siteName = site ? getSiteName(site) : 'Realty Directions';
  const state = site?.state || '';

  // Parse location parts from slug
  const catIndex = slug.indexOf("category");
  const locationParts = catIndex !== -1 ? slug.slice(0, catIndex) : slug;
  const [county, city, zip] = locationParts;
  const categoryParts = catIndex !== -1 ? slug.slice(catIndex + 1) : [];
  const [category, subcategory] = categoryParts;

  let title, description;
  if (zip) {
    title = `Businesses in ${ucwords(city)}, ${state} ${zip} - ${siteName}`;
    description = `Find local businesses in ${ucwords(city)}, ${state} ${zip}. Browse top-rated businesses, reviews, and contact information on ${siteName}.`;
  } else if (city) {
    title = `Businesses in ${ucwords(city)}, ${ucwords(county)} - ${siteName}`;
    description = `Find local businesses in ${ucwords(city)}, ${ucwords(county)} County, ${state}. Browse top-rated businesses, reviews, and contact information on ${siteName}.`;
  } else if (county) {
    title = `Businesses in ${ucwords(county)} County, ${state} - ${siteName}`;
    description = `Find local businesses in ${ucwords(county)} County, ${state}. Browse top-rated businesses, reviews, and contact information on ${siteName}.`;
  } else {
    title = `Local Businesses - ${siteName}`;
    description = `Browse local businesses in ${state} on ${siteName}.`;
  }

  // Append category if present
  if (category) {
    const catText = subcategory ? ucwords(subcategory) : ucwords(category);
    title = `${catText} ${title}`;
    description = `Find the best ${catText} businesses. ${description}`;
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
    if (slug?.length === 0) {
        return redirect('/business')
    }

    // If the last segment is "category", remove it and redirect
    if (slug[slug?.length - 1] === "category") {
        redirect(`/business/location/${slug.slice(0, -1).join("/")}`);
    }

    // Find "category" index
    const catIndex = slug.indexOf("category");

    // If there are more than 3 segments before "category", return 404
    if (catIndex === -1 && slug.length > 3) {
        return <NotFound />;
    }

    // If "category" exists but has more than 3 segments before it → 404
    if (catIndex !== -1 && catIndex > 3) {
        return <NotFound />;
    }

    // If "category" exists but has more than 2 segments after it → 404
    if (catIndex !== -1 && slug.length - catIndex - 1 > 2) {
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
    // Split location & category parts
    const locationParts = catIndex !== -1 ? slug.slice(0, catIndex) : slug;
    const categoryParts = catIndex !== -1 ? slug.slice(catIndex + 1) : [];

    // Extract location parts
    const [county, city, zip] = locationParts;
    const [category, subcategory] = categoryParts;


    const [{ businesses, totalRecords, geoJson }, categories, location] = await Promise.all([
        getBusinessesNew(site,{
            ...searchParams,
            county,
            city,
            zip,
            category,
            subcategory
        }),
        subcategory ? [] : getCategoriesNew(site,{county, city, zip, category, subcategory, minimum:0}),
        zip ? [] : getLocationNew(site,{county, city, zip, category, subcategory, minimum:0}),
    ]);

    let breadcrumbs = [{ name: "Businesses", link: "/business" }];
    if (county) {
        breadcrumbs.push({ name: ucwords(county, true), link: `/business/location/${county.toLowerCase()}` });
    }
    if (city) {
        breadcrumbs.push({ name: ucwords(city, true), link: `/business/location/${county.toLowerCase()}/${city.toLowerCase()}` });
    }
    if (zip) {
        breadcrumbs.push({ name: zip });
    }

    // Add categories if present
    if (category) {
        breadcrumbs.push({ name: ucwords(category, true), link: `/business/location/${locationParts.join("/")}/category/${category.toLowerCase()}` });
    }
    if (subcategory) {
        breadcrumbs.push({ name: ucwords(subcategory, true), link: `/business/location/${locationParts.join("/")}/category/${category.toLowerCase()}/${subcategory.toLowerCase()}` });
    }

    return (
        <BusinessPage
        link={'business'}
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
};

