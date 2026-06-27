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
                <div className="col-xl-4 col-lg-4 col-md-4" key={video.video_id}>
                    <div className="single-listings-box">
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
                            <ul className="listings-meta">
                                <li>
                                    <i className="flaticon-video"></i>
                                    Featured Video
                                </li>
                            </ul>
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
                </div>
            ))}
            {properties?.map((property) => (
                <div className="col-xl-4 col-lg-4 col-md-4" key={property.ListingId}>
                    <Link
                        href={realtySlug(property)}
                        className="link-btn"
                        aria-label={`View details for ${property?.FullStreetAddress || property?.UnparsedAddress || 'property'}`}
                    >
                        <div className="single-listings-box">
                            <div className="listings-image">

                                <Image
                                    src={property?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                                    alt="image"
                                    width={600}
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
                                    : <h3>{property?.UnparsedAddress?.replace(/,/g, ", ").trim()}</h3>}


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
        </>
    );
};

export default GridBlock;





