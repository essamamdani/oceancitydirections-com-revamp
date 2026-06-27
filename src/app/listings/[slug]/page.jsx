import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";
import PageHeaderWithMap from "@/components/Listings/PageHeaderWithMap";
import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";

import { fetchListings, getLocationNew,getRealtyObjectFromDB } from "@/lib/actions";
import Link from "next/link";
import RealtySidebar from "@/components/Listings/RealtySidebar";
import NotFound from "@/components/NotFound";
import NoRecordFound from "@/components/NoRecordFound";
import { fetchSiteData } from "@/lib/site-config";

export async function generateMetadata(props) {
    const params = await props.params;
    const { slug } = params;
    const obj = await getRealtyObjectFromDB(slug);
    
    if (obj === null) {
        return { title: 'Listing Not Found' };
    }
    
    const site = await fetchSiteData();
    const siteName = site?.site_name || 'Realty Directions';
    
    return {
        title: `${obj.question} - ${siteName}`,
        description: obj.question,
        openGraph: {
            title: obj.question,
            description: obj.question,
        },
        alternates: {
            canonical: `${site?.URL || 'https://oceancitydirections.com'}/listings/${slug}`,
        },
    };
}

export default async function Page(props) {
    const searchParams = await props.searchParams;
    const params = await props.params;
    const { slug } = params;
    const obj = await getRealtyObjectFromDB(slug);
    if(obj === null){
        return <NotFound />;
        
    }
    const site = await fetchSiteData();
    const [data, location] = await Promise.all([fetchListings(site,{
        ask:true,
        default_object: obj.extract_object,
        ...searchParams
    }), getLocationNew(site)]);

    const totalRecords = data?.['@odata.count'] || 0;
    const geoJson = data?.geoJson || null;
    const properties = data.value || [];
    const breadcrumbs = [{ name: "Listings", link: "/listings" }, { name: obj.question }];
    if (data?.category) {
        searchParams.category = data.category;
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
                    color:"var(--mainColor)",
                  }} href="/">Home</Link></li>
                                    {breadcrumbs?.length > 0 && breadcrumbs.map((item, index) => (
                                        <li className="item" key={index}>
                                            {item.link ? <Link style={{
                    color:"var(--mainColor)",
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
                                    <RealtySidebar link="realty" location={location} categories={[]} params={[]} />
                                </div>
                                {totalRecords > 0 ? <MainPropertiesGridPage
                                    searchParams={searchParams}
                                    location={location}
                                    properties={properties}
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