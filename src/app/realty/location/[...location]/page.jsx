
import { ucwords, getSiteName } from "@/lib/helper";
import { fetchSiteData, getSiteStatus } from "@/lib/site-config";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import { redirect } from "next/navigation";

import NotFound from "@/components/NotFound";
import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";
import PageHeaderWithMap from "@/components/Listings/PageHeaderWithMap";
import NoRecordFound from "@/components/NoRecordFound";

import { getLocationNew, fetchListings } from "@/lib/actions";
import Link from "next/link";
import RealtySidebar from "@/components/Listings/RealtySidebar";



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
let breadcrumbs = [{ name: "Real Estate", link: "/realty" }];
if (county) {
    breadcrumbs.push({ name: ucwords(county, true), link: `/realty/location/${county.toLowerCase()}` });
}
if (city) {
    breadcrumbs.push({ name: ucwords(city, true), link: `/realty/location/${county.toLowerCase()}/${city.toLowerCase()}` });
}
if (zip) {
    breadcrumbs.push({ name: zip });
}
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
                        <div className="row">
                            <div className="col-lg-3 col-md-12">
                                <RealtySidebar
                                    link="realty"
                                    location={location}
                                    categories={[]}
                                    params={params}
                                />
                            </div>
                            {totalRecords > 0 ? <MainPropertiesGridPage
                                breadcrumbs={breadcrumbs}
                                searchParams={searchParams}
                                properties={properties}
                                params={params}
                                totalRecords={totalRecords}
                            /> : <NoRecordFound params={params} site={site} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
    </>
);
}
