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
    <section className="listings-area pt-100">
      <div className="container">
        <div className="rd-section-head">
          <div>
            <span className="rd-kicker">Featured homes</span>
            <h2>Homes worth a closer look</h2>
          </div>
          <Link href={"/realty"} className="link-btn">
            View all homes
          </Link>
        </div>
        <div className="rd-property-grid">
          {properties.value && properties.value.map((property) => (
              <Link
                href={realtySlug(property)}
                className="single-listings-box rd-property-card"
                key={property.ListingId}
              >
                  <div className="listings-image">

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

                  <div className="listings-content">
                    <div className="rd-card-topline">
                      <span className="rd-card-category">{property.StandardStatus || "Active"}</span>
                      <span className="rd-card-status">MLS {property.ListingId}</span>
                    </div>

                    {property.FullStreetAddress ?
                      <h3>{property.FullStreetAddress}, {property.City}, {defaultShortState},  {property.PostalCode}</h3>
                      : <h3>{property?.UnparsedAddress.replace(/,/g, ", ").trim()}</h3>}

                    <div className="rd-property-specs">
                      <span>{property.BedroomsTotal || 0} beds</span>
                      <span>{property.BathroomsFull || 0}.{property.BathroomsHalf || 0} baths</span>
                      <span>{property.AreaTotal || property.LivingArea || 0} sqft</span>
                    </div>
                    <p className="rd-card-office">Courtesy of {property.ListOfficeName || "Bright MLS"}</p>

                  </div>
              </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
