"use client";

import Map from "@/components/CustomComponents/PatchMap";

export default function MapPanel({ geoJson, title = "Explore the map", eyebrow = "Live local map" }) {
  return (
    <aside className="rd-map-panel" aria-label={title}>
      <div className="rd-map-toolbar">
        <div>
          <span>{eyebrow}</span>
          <strong>{title}</strong>
        </div>
      </div>
      <div className="rd-map-canvas">
        {geoJson?.features?.length ? (
          <Map geoJson={geoJson} />
        ) : (
          <div className="rd-map-empty">
            <i className="bx bx-map-alt" aria-hidden="true"></i>
            <strong>Map updates as results load</strong>
            <span>Search by neighborhood, city, category, or address.</span>
          </div>
        )}
      </div>
    </aside>
  );
}
