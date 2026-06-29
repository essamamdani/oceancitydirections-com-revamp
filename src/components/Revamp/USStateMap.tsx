"use client";

import React, { useState, useEffect } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup, Marker } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import mapDataJson from "@/domains/map.json";

const countiesGeoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3.0.1/counties-10m.json";

// Mapping of State Abbreviation to FIPS Code
const stateFipsMap: Record<string, string> = {
  "AL": "01", "AK": "02", "AZ": "04", "AR": "05", "CA": "06",
  "CO": "08", "CT": "09", "DE": "10", "FL": "12", "GA": "13",
  "HI": "15", "ID": "16", "IL": "17", "IN": "18", "IA": "19",
  "KS": "20", "KY": "21", "LA": "22", "ME": "23", "MD": "24",
  "MA": "25", "MI": "26", "MN": "27", "MS": "28", "MO": "29",
  "MT": "30", "NE": "31", "NV": "32", "NH": "33", "NJ": "34",
  "NM": "35", "NY": "36", "NC": "37", "ND": "38", "OH": "39",
  "OK": "40", "OR": "41", "PA": "42", "RI": "44", "SC": "45",
  "SD": "46", "TN": "47", "TX": "48", "UT": "49", "VT": "50",
  "VA": "51", "WA": "53", "WV": "54", "WI": "55", "WY": "56",
  "DC": "11"
};

// Hardcoded standard zoom and center for key states we operate in
const stateZoomCenters: Record<string, { zoom: number; center: [number, number] }> = {
  "24": { zoom: 8.5, center: [-76.8, 39.0] }, // Maryland
  "12": { zoom: 7.0, center: [-82.5, 28.5] }, // Florida
  "11": { zoom: 12.0, center: [-77.0, 38.9] }  // District of Columbia
};

// Colors associated with each site for visual clarity
const siteColors: Record<string, string> = {
  "AnnapolisDirections.com": "#F97316",    // Orange-500
  "BaltimoreDirections.com": "#3B82F6",    // Blue-500
  "OceanCityDirections.com": "#10B981",    // Emerald-500
  "FrederickDirections.com": "#8B5CF6",    // Violet-500
  "KeyWestDirections.com": "#EC4899",      // Pink-500
  "DaytonaDirections.com": "#F59E0B",      // Amber-500
  "TampaDirections.com": "#EF4444",        // Red-500
  "OrlandoDirections.com": "#6366F1",      // Indigo-500
  "MiamiDirections.com": "#06B6D4",        // Cyan-500
  "FortLauderdaleDirections.com": "#D946EF",// Fuchsia-500
  "FortMyersDirections.com": "#14B8A6",    // Teal-500
  "JacksonvilleDirections.com": "#84CC16",  // Lime-500
  "NaplesDirections.com": "#059669",       // Emerald-600
  "DCDirections.com": "#475569",           // Slate-500
};

interface USStateMapProps {
  stateAbbr: string; // e.g. "MD", "FL"
  currentDomain?: string; // e.g. "annapolisdirections.com"
}

export default function USStateMap({ stateAbbr, currentDomain = "" }: USStateMapProps) {
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const upperStateAbbr = stateAbbr?.toUpperCase() || "MD";
  const stateFips = stateFipsMap[upperStateAbbr] || "24";
  const stateConfig = (mapDataJson as any)[stateFips];
  const zoomConfig = stateZoomCenters[stateFips] || { zoom: 6, center: [-96, 38] as [number, number] };

  if (!stateConfig) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-100 rounded-2xl h-[260px] text-center">
        <p className="text-sm font-semibold text-slate-500">State Map configuration not found for {upperStateAbbr}</p>
      </div>
    );
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: event.clientX - rect.left + 15,
      y: event.clientY - rect.top - 15,
    });
  };

  const getCleanSiteName = (siteName: string) => {
    return siteName.replace(/^www\./, "").charAt(0).toUpperCase() + siteName.replace(/^www\./, "").slice(1);
  };

  return (
    <div 
      className="w-full relative bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-center min-h-[300px]"
      onMouseMove={handleMouseMove}
    >
      <div className="w-full h-[300px]">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
          className="w-full h-full"
        >
          <ZoomableGroup
            zoom={zoomConfig.zoom}
            center={zoomConfig.center}
            maxZoom={12}
            minZoom={2}
          >
            <Geographies geography={countiesGeoUrl}>
              {({ geographies }) => {
                const stateCounties = geographies.filter((geo) => {
                  const geoStateFips = geo.id ? geo.id.slice(0, 2) : null;
                  return geoStateFips === stateFips;
                });

                return stateCounties.map((geo) => {
                  const countyId = geo.id;
                  const countyData = stateConfig?.counties?.[countyId];
                  const isEnabled = countyData?.enabled || false;
                  const isHovered = hoveredCounty === countyId;
                  
                  let fillColor = "#F1F5F9"; // Inactive county fallback
                  if (isEnabled && countyData) {
                    const cleanSite = countyData.siteName || getCleanSiteName(countyData.url || "");
                    fillColor = siteColors[cleanSite] || "#FF6B35";
                  }

                  return (
                    <Geography
                      key={geo.rsmKey || `county-${countyId}`}
                      geography={geo}
                      fill={isHovered ? `${fillColor}CC` : fillColor}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", cursor: isEnabled ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        setHoveredCounty(countyId);
                        if (countyData && isEnabled) {
                          setTooltipContent(
                            `${countyData.name} - ${countyData.siteName || "Active Site"}`
                          );
                        } else {
                          setTooltipContent(`${geo.properties?.name || "County"} (Not Covered)`);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredCounty(null);
                        setTooltipContent(null);
                      }}
                      onClick={() => {
                        if (isEnabled && countyData?.url) {
                          window.open(countyData.url, "_blank");
                        }
                      }}
                    />
                  );
                });
              }}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Floating Tooltip inside the relative container */}
      {tooltipContent && (
        <div 
          className="absolute z-50 pointer-events-none bg-slate-900/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-700/50 backdrop-blur-xs transition-opacity duration-150"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px` 
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* Color Legend for sites in this state */}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 max-w-[90%] bg-white/80 backdrop-blur-xs border border-slate-100 p-2 rounded-xl text-[9px] font-semibold text-slate-600">
        {(Object.entries(stateConfig.counties) as [string, any][])
          .filter(([_, county]) => county.enabled && county.siteName)
          .reduce((acc, [_, county]) => {
            if (!acc.some(x => x.siteName === county.siteName)) {
              acc.push(county);
            }
            return acc;
          }, [] as any[])
          .map((county) => {
            const color = siteColors[county.siteName] || "#FF6B35";
            return (
              <div key={county.siteName} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span>{county.siteName}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}
