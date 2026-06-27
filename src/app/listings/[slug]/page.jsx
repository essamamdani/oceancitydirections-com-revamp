import NavbarTwo from "@/components/Layouts/NavbarTwo";
import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";

import { fetchListings, getLocationNew,getRealtyObjectFromDB } from "@/lib/actions";
import Link from "next/link";
import RealtySidebar from "@/components/Listings/RealtySidebar";
import NotFound from "@/components/NotFound";
import NoRecordFound from "@/components/NoRecordFound";
import { fetchSiteData } from "@/lib/site-config";
import MapPanel from "@/components/Revamp/MapPanel";

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
    if (data?.category) {
        searchParams.category = data.category;
    }
    return (
        <>
            <NavbarTwo />
            <div className="rd-search-layout rd-property-layout">
                <MapPanel
                    geoJson={geoJson}
                    eyebrow="Saved search map"
                    title={`${totalRecords || 0} homes`}
                />
                <section className="rd-results-pane">
                    <div className="rd-results-hero">
                        <span className="rd-kicker">AI property search</span>
                        <h1>{obj.question}</h1>
                        <p>
                            Realty Directions translated this request into live IDX search criteria. Refine by location, price, or property type.
                        </p>
                        <div className="rd-filter-chips">
                            <Link href="/realty">All Homes</Link>
                            <Link href="/realty?category=sale">For Sale</Link>
                            <Link href="/realty?category=rent">For Rent</Link>
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
