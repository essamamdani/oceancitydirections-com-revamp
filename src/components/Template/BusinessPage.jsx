import Sidebar from "@/components/Listings/Sidebar";
import MainGridPage from "@/components/CustomComponents/MainGridPage";
import NoRecordFound from "@/components/NoRecordFound";
import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Link from "next/link";
import AddBusinessButton from "@/components/CTA/AddBusinessButton";
import MapPanel from "@/components/Revamp/MapPanel";
import { getSiteName } from "@/lib/helper";
// import dynamic from 'next/dynamic';

// import AddBusinessCTA from "../CTA/AddBusiness";

// const Footer = dynamic(() => import('@/components/Layouts/Footer'), {
//   ssr: false
// });

export default async function BusinessPage(props) {
  const { geoJson, categories, businesses, location, totalRecords, breadcrumbs, link, featured_videos, site } = props;
  const searchParams = await props.searchParams;
  const params = await props.params;
  const siteName = getSiteName(site);
  const queryLabel = searchParams?.q || searchParams?.ask || "local businesses";
  const stateLabel = site?.State || site?.state || site?.ShortState?.toUpperCase() || "your area";

  return (
    <>
      <NavbarTwo />
      <div className="rd-search-layout rd-business-results-page">
        <section className="rd-results-pane">
          <div className="rd-results-hero">
            <span className="rd-kicker">Business directory</span>
            <h1>{queryLabel === "local businesses" ? `Top local businesses near ${stateLabel}` : `Best matches for ${queryLabel}`}</h1>
            <p>
              Compare verified local businesses, request corrections, claim your listing, and see nearby real estate context from {siteName}.
            </p>
            <div className="rd-filter-chips">
              <Link href="/business/category/restaurant">Restaurants</Link>
              <Link href="/business/category/home-services">Home Services</Link>
              <Link href="/business/category/shopping">Shopping</Link>
              <Link href="/business/category/health">Health</Link>
              <AddBusinessButton />
            </div>
          </div>

          <div className="rd-search-results-grid">
            <Sidebar link={link} categories={categories} location={location} params={params} />
            <div className="rd-results-column">
              {businesses?.length > 0 ? (
                <MainGridPage
                  featured_videos={featured_videos}
                  businesses={businesses?.filter((b) => !b?.deleted_at)}
                  categories={categories}
                  searchParams={searchParams}
                  params={params}
                  totalRecords={totalRecords}
                />
              ) : (
                <NoRecordFound params={params} site={site} />
              )}
            </div>
          </div>
        </section>

        <MapPanel
          geoJson={geoJson}
          eyebrow="Business map"
          title={`${totalRecords || 0} local results`}
        />
      </div>
    </>
  );
}
