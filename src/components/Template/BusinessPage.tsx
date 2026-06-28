"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Listings/Sidebar";
import MainGridPage from "@/components/CustomComponents/MainGridPage";
import NoRecordFound from "@/components/NoRecordFound";
import Navbar from "@/components/Layouts/Navbar";
import AddBusinessButton from "@/components/CTA/AddBusinessButton";
import MapPanel from "@/components/Revamp/MapPanel";
import Footer from "@/components/Layouts/Footer";
import { getSiteName } from "@/lib/helper";

export default function BusinessPage(props: any) {
  const { geoJson, categories, businesses, location, totalRecords, breadcrumbs, link, featured_videos, site, searchParams, params } = props;
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const siteName = getSiteName(site);
  const queryLabel = searchParams?.q || searchParams?.ask || "local businesses";
  const stateLabel = site?.State || site?.state || site?.ShortState?.toUpperCase() || "your area";

  return (
    <>
      <Navbar />
      <div className={`rd-split-layout rd-business-split-layout hide-${viewMode === "list" ? "map" : "list"}`}>
        
        {/* Listings List Pane (Scrollable on desktop) */}
        <div className="rd-split-scrollable-pane flex flex-col justify-between">
          <section className="rd-results-pane w-full p-0">
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
              <div className="rd-results-column w-full">
                {businesses?.length > 0 ? (
                  <MainGridPage
                    featured_videos={featured_videos}
                    businesses={businesses?.filter((b: any) => !b?.deleted_at)}
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

          {/* Footer sits inside scroll container at the bottom */}
          <div className="mt-12 pt-6 border-t border-slate-200 w-full">
            <Footer bgColor="bg-transparent" />
          </div>
        </div>

        {/* Map Pane (Sticky / Fixed height on desktop) */}
        <div className="rd-split-map-pane">
          <MapPanel
            geoJson={geoJson}
            eyebrow="Business map"
            title={`${totalRecords || 0} local results`}
          />
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
          className="rd-mobile-toggle-btn"
          aria-label={viewMode === "list" ? "Show map view" : "Show list view"}
        >
          <i className={`bx ${viewMode === "list" ? "bx-map" : "bx-list-ul"}`}></i>
          <span>{viewMode === "list" ? "Map" : "List"}</span>
        </button>

      </div>
    </>
  );
}
