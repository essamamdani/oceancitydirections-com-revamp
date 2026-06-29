"use client";

import Image from 'next/image';
import Link from 'next/link';
import { realtySlug } from '@/lib/helper';
import { useSites } from "@/contexts/SitesContext";

export default function PropertyListing({ properties }) {
  const { site, loading, error } = useSites();
  if (loading || !site) return null; // Wait until site data is ready
  if (error) {
    console.error("Error loading site data:", error);
    return null;
  }
  const defaultShortState = site.ShortState;

  return (
    <div className="rd-property-grid">
      {properties.value && properties.value.map((property) => (
        <Link
          href={realtySlug(property)}
          className="single-listings-box rd-property-card flex flex-col justify-between"
          key={property.ListingId}
        >
          <div className="listings-image relative">
            <Image
              src={property?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
              alt={property.FullStreetAddress || property?.UnparsedAddress || "Property listing"}
              width={395}
              height={200}
              style={{ objectFit: "cover", height: "200px" }}
            />
            <span className="rd-property-price">
              ${property.ListPrice?.toLocaleString()}
            </span>
          </div>

          <div className="listings-content p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="rd-card-topline flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-orange-100">
                  {property.StandardStatus || "Active"}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">MLS {property.ListingId}</span>
              </div>

              {property.FullStreetAddress ? (
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-2">
                  {property.FullStreetAddress}, {property.City}, {defaultShortState}, {property.PostalCode}
                </h3>
              ) : (
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-2">
                  {property?.UnparsedAddress?.replace(/,/g, ", ")?.trim()}
                </h3>
              )}
            </div>

            <div>
              <div className="rd-property-specs flex items-center gap-3 text-xs text-slate-500 font-semibold mb-2">
                <span>{property.BedroomsTotal || 0} beds</span>
                <span>•</span>
                <span>{property.BathroomsFull || 0}.{property.BathroomsHalf || 0} baths</span>
                <span>•</span>
                <span>{property.AreaTotal || property.LivingArea || 0} sqft</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium italic border-t border-slate-100 pt-2">
                Courtesy of {property.ListOfficeName || "Bright MLS"}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
