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
        <div className="section-title text-left">
          <h2>Property Listing</h2>
          <Link href={"/realty"} className="link-btn">
            Show All <i className="flaticon-right-chevron"></i>
          </Link>
        </div>
        <div className="row">
          {properties.value && properties.value.map((property) => (
            // <li key={index}>{property.UnparsedAddress || 'Address not available'}</li>
            <div className="col-xl-4 col-lg-4 col-md-4" key={property.ListingId}>
              <Link
                href={realtySlug(property)}
                className="link-btn"
              >
                <div className="single-listings-box">
                  <div className="listings-image">

                    <Image
                      src={property?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                      alt="image"
                      width={395}
                      height={200}
                      style={{ objectFit: "cover", height: "200px" }}
                    />

                    {/* <button type="button" className="bookmark-save" aria-label="Save bookmark">
                                <i className="flaticon-heart"></i>
                            </button>
                            <button type="button" className="category" aria-label="Category">
                                <i className="flaticon-cooking"></i>
                            </button> */}
                  </div>

                  <div className="listings-content">
                    <div className="author">
                      <div className="d-flex align-items-center">
                        <span>Price: ${property.ListPrice.toLocaleString()}</span>
                      </div>
                    </div>



                    {property.FullStreetAddress ?
                      <h3>{property.FullStreetAddress}, {property.City}, {defaultShortState},  {property.PostalCode}</h3>
                      : <h3>{property?.UnparsedAddress.replace(/,/g, ", ").trim()}</h3>}


                    <ul className="listings-meta">
                      <li>
                        {/* <Link href={`/property/category/${property.
                                    categories?.name.toLowerCase()}`}> */}
                        <i className="flaticon-furniture-and-household"></i>
                        Beds {property.BedroomsTotal} | Bath {property.BathroomsFull}.{property.BathroomsHalf} |        {property.AreaTotal} Sq. ft
                        {/* </Link>  */}

                      </li>
                      <li>
                        <i className="flaticon-cooking"></i>
                        Courtesy of: {property.ListOfficeName}
                      </li>
                    </ul>

                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
