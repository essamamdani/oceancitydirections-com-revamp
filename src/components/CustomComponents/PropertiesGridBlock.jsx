"use client";
import Image from "next/image";
import Link from "next/link";
import { realtySlug } from '@/lib/helper';
import { useSites } from '@/contexts/SitesContext';


const GridBlock = ({ properties, featured_videos }) => {
    const { site, loading, error } = useSites()
    if (loading || !site) return null; // Wait until site data is ready
    if (error) {
        console.error("Error loading site data:", error);
        return null;
    }
    const defaultShortState = site.ShortState

    return (
        <>
            {featured_videos?.map((video) => (
                <div className="single-listings-box rd-property-card" key={video.video_id}>
                        <div className="listings-image">
                            <Image
                                src={video.thumbnail}
                                alt="image"
                                width={790}
                                height={200}

                                style={{ objectFit: "cover", height: "200px" }}
                            />
                            <Link
                                href={video.embeded_for === 'property'
                                  ? `/realty/${video.p_id_b_slug}`
                                  : `https://www.${video.siteurl}/s/${video.p_id_b_slug}`}
                                className="link-btn"
                                aria-label={`View video for ${video.title}`}
                            ></Link>
                            <button type="button" className="bookmark-save" aria-label="Save bookmark">
                                <i className="flaticon-heart"></i>
                            </button>
                            <button type="button" className="category" aria-label="Play video">
                                <i className="bx bx-play"></i>
                            </button>
                        </div>

                        <div className="listings-content">
                            <div className="rd-card-topline">
                                <span className="rd-card-category">Featured Video</span>
                                <span className="rd-card-status">Media placement</span>
                            </div>
                            <h3>
                                <Link
                                    href={video.embeded_for === 'property'
                                  ? `/realty/${video.p_id_b_slug}`
                                  : `https://www.${video.siteurl}/s/${video.p_id_b_slug}`}
                                >
                                    {video.title}
                                </Link>
                            </h3>
                        </div>
                </div>
            ))}
            {properties?.map((property) => (
                <Link
                    href={realtySlug(property)}
                    className="single-listings-box rd-property-card"
                    aria-label={`View details for ${property?.FullStreetAddress || property?.UnparsedAddress || 'property'}`}
                    key={property.ListingId}
                >
                            <div className="listings-image">

                                <Image
                                    src={property?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                                    alt={property?.FullStreetAddress || property?.UnparsedAddress || "Property listing"}
                                    width={600}
                                    height={200}
                                    style={{ objectFit: "cover", height: "200px" }}
                                />
                                <span className="rd-property-price">
                                    ${property.ListPrice?.toLocaleString()}
                                </span>

                            </div>

                            <div className="listings-content">
                                <div className="rd-card-topline">
                                    <span className="rd-card-category">
                                        {property.StandardStatus || "Active"}
                                    </span>
                                    <span className="rd-card-status">
                                        MLS {property.ListingId}
                                    </span>
                                </div>

                                {property.FullStreetAddress ?
                                    <h3>{property.FullStreetAddress}, {property.City}, {defaultShortState},  {property.PostalCode}</h3>
                                    : <h3>{property?.UnparsedAddress?.replace(/,/g, ", ").trim()}</h3>}

                                <div className="rd-property-specs">
                                    <span>{property.BedroomsTotal || 0} beds</span>
                                    <span>{property.BathroomsFull || 0}.{property.BathroomsHalf || 0} baths</span>
                                    <span>{property.AreaTotal || property.LivingArea || 0} sqft</span>
                                </div>
                                <p className="rd-card-office">Courtesy of {property.ListOfficeName || "Bright MLS"}</p>

                            </div>
                </Link>
            ))}
        </>
    );
};

export default GridBlock;




