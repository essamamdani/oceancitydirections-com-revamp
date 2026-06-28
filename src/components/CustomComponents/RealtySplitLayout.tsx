"use client";

import { useState } from "react";
import Link from "next/link";
import MapPanel from "@/components/Revamp/MapPanel";
import MainPropertiesGridPage from "@/components/CustomComponents/MainPropertiesGridPage";
import NoRecordFound from "@/app/no-records";
import Footer from "@/components/Layouts/Footer";
import { getSiteName, ucwords } from "@/lib/helper";

interface RealtySplitLayoutProps {
  site: any;
  searchParams: any;
  location: any;
  properties: any[];
  totalRecords: number;
  featured_videos: any[];
  geoJson: any;
  params: any;
}

export default function RealtySplitLayout({
  site,
  searchParams,
  location,
  properties,
  totalRecords,
  featured_videos,
  geoJson,
  params,
}: RealtySplitLayoutProps) {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const siteName = getSiteName(site);

  return (
    <div className={`rd-split-layout hide-${viewMode === "list" ? "map" : "list"}`}>
      {/* Map Pane (Sticky / Fixed height on desktop) */}
      <div className="rd-split-map-pane">
        <MapPanel
          geoJson={geoJson}
          eyebrow="Real estate map"
          title={`${totalRecords || 0} homes`}
        />
      </div>

      {/* Listings List Pane (Scrollable on desktop) */}
      <div className="rd-split-scrollable-pane flex flex-col justify-between">
        <section className="rd-results-pane w-full p-0">
          <div className="rd-results-hero">
            <span className="rd-kicker">Homes and real estate</span>
            <h1>{siteName} homes for sale and real estate</h1>
            <p>
              Search active IDX listings, compare neighborhoods, and connect with Realty Directions for property guidance.
            </p>

            {/* Horizontal location quick filters */}
            {location?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 pt-4 mt-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Locations:</span>
                {location.slice(0, 8).map((loc: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/realty/location/${encodeURIComponent(loc.name?.toLowerCase())}`}
                    className="bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-755 text-xs font-bold px-3.5 py-1.5 rounded-xl transition"
                  >
                    {ucwords(loc.name)} {loc.total_records ? `(${loc.total_records})` : ''}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rd-search-results-grid">
            <div className="rd-results-column w-full">
              {totalRecords > 0 ? (
                <MainPropertiesGridPage
                  searchParams={searchParams}
                  location={location}
                  properties={properties}
                  totalRecords={totalRecords}
                  featured_videos={featured_videos}
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
  );
}
