"use client";
import React, { useState, useEffect } from "react";
import logger from '@/lib/logger'

import { Form } from "react-bootstrap";
import CarouselComponent from "./silder";
import { postData } from "@/lib/server-actions";
import { GoogleMapsEmbed } from '@next/third-parties/google'
import Image from "next/image";
import Link from "next/link";
import SingleFeaturedVideo from "../HomeFour/singleFeaturevideo";
import { useSites } from "@/contexts/SitesContext";
import { realtySlug, getDisplayAddress } from "@/lib/helper";
import { getSiteName } from "@/lib/helper";
import Turnstile from "../Common/Turnstile";
import toast from "react-hot-toast";

const SinglePropertyListingsContent = ({ property, breadcrumbs, video, nearbyProperties, nearbyRestaurants }) => {
  const { site, loading: loading1, error: error1 } = useSites()

  const [form, setForm] = useState({
    address: getDisplayAddress(property),
    task: true,
    remarks: "",
    meeting: true,
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    site_name: "",
  });

  // Phone formatter: (XXX) XXX-XXXX
  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 0; // optional but if provided must be 10 digits
  };

  useEffect(() => {
    if (site) {
      setForm(f => ({ ...f, site_name: getSiteName(site) }));
    }
  }, [site]);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cfToken, setCfToken] = useState(null);

  if (loading1 || !site) return null;
  if (error1) {
    console.error("Error loading site data:", error1);
    return null;
  }
  
  const defaultShortState = site.ShortState?.toUpperCase();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.firstname && form.lastname && form.email) {
      if (!cfToken) {
        toast.error("Please complete the security check.");
        return;
      }
      // Validate phone if provided
      if (form.phone && !validatePhone(form.phone)) {
        toast.error("Please enter a valid 10-digit US phone number.");
        return;
      }
      setLoading(true);
      setError(null);
      logger.log("Form Data Submitted:", form);
      try {
        const submissionData = { ...form, full_url: window.location.href, cf_token: cfToken };
        const result = await postData(submissionData);
        logger.log("PostData result:", result);
        if (result.success || result.status === 200) {
          setSubmitted(true);
          setForm({
            address: getDisplayAddress(property),
            task: true,
            remarks: "",
            meeting: true,
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
          });
        } else {
          setError(result.data || result.error || "Failed to submit form");
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        setError("An error occurred while submitting the form");
      } finally {
        setLoading(false);
      }
    }
  };
  // Format status for display - add spaces between words
  const formatStatus = (status) => {
    if (!status) return status;
    // Handle ActiveUnderContract → Active Under Contract
    return status
      .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space between camelCase
      .replace(/-/g, ' ')                   // Replace hyphens with spaces
      .replace(/\s+/g, ' ')                 // Normalize multiple spaces
      .trim();
  };
  
  const prefixtitle = property?.StandardStatus === 'Active' 
    ? `For ${property.PropertyType?.includes('lease') ? 'Rent' : 'Sale'}` 
    : formatStatus(property.StandardStatus);
  return (
    <>
      <section className="listings-details-area pb-70">
        <div className="listings-details-image">
          <Image
            src={property?.ListPicture3URL || "https://picsum.photos/seed/picsum/1920/480"}
            alt={`${property?.UnparsedAddress} - ${property?.ListPrice}`}
            width={1920}
            height={480}
            style={{ objectFit: 'cover', height: '480px' }}
          />
          <div className="overlay" />
          <div className="container">
            <div className="container">
              <div className="listings-details-content">
                <span className="meta"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <span>
                    <i className="bx bx-home"></i>
                    {property?.ListingId}
                  </span>
                </span>
                <h3> {prefixtitle}:  {property.FullStreetAddress ?
                  <>{property.FullStreetAddress}, {property.City}, {defaultShortState},  {property.PostalCode}</>
                  : <>{property?.UnparsedAddress?.replace(/,/g, ", ").trim()}</>}</h3>



                <ul className="d-flex align-items-center">

                  <li className="time">
                    <i className="bx bx-bed" />
                    <span className="">{property.BedroomsTotal} </span>
                    <div>Beds</div>
                  </li>

                  <li className="time">
                    <i className="bx bx-bath" />
                    <span className="">{property.BathroomsFull}.{property.BathroomsHalf} </span>
                    <div>Bath</div>
                  </li>

                  <li className="time">
                    <i className="bx bx-dollar" />
                    <span className="">${property.ListPrice.toLocaleString()} </span>
                    <div>Price</div>
                  </li>
                  <li className="location">
                    <i className="bx bx-ruler"></i>
                    <span>{property.LivingArea} Sq. ft</span>
                    Living Area
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="row mt-3">
            <div className="col-xl-12 col-lg-12 col-md-12">
              <div className="breadcrumb-area my-2">
                <ol className="breadcrumb p-0">
                  <li className="item">
                    <Link style={{
                      color: "var(--mainColor)",
                    }} href="/">Home</Link></li>
                  {breadcrumbs?.length > 0 && breadcrumbs.map((item, index) => (
                    <li className="item" key={index}>
                      {item.link ? <Link style={{
                        color: "var(--mainColor)",
                      }} href={item.link}>{item.name}</Link> : item.name}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8 col-md-12">
              <div className="listings-details-desc mt-1">
                {video?.thumbnail && <SingleFeaturedVideo video={video} />}
                <p
                  dangerouslySetInnerHTML={{
                    __html: property?.PublicRemarks?.replace(/\n/g, '<br />'),
                  }}
                />
                {/* <h3>{transformString(title)}</h3> */}
                <ul className="amenities-list">
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Status: {formatStatus(property.StandardStatus)}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> MLS #: {property.ListingId}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Days On Market: {property.DaysOnMarket}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Taxes: ${property.TaxAnnualAmount} / {property.TaxYear}
                    </span>
                  </li>

                  <li>
                    <span>
                      <i className="bx bx-check"></i> Property Type: {property?.PropertyType}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Year Built: {property.YearBuilt}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Lot Size: {property.LotSizeAcres} / {property.LotSizeSquareFeet}
                    </span>
                  </li>

                  <li>
                    <span>
                      <i className="bx bx-check"></i> InteriorFeatures: {property.InteriorFeatures.join(", ")}

                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Courtesy of: {property.ListOfficeName}
                    </span>
                  </li>
                </ul>

                <h3>Property Information</h3>
                <ul className="amenities-list">
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Accessibility Features: {property.AccessibilityFeatures.join(", ")}
                    </span>
                  </li>
                  <li>

                    <span>
                      <i className="bx bx-check"></i> New Construction: {property.NewConstructionYN ? "Yes" : "No"}
                    </span>
                  </li>

                  <li>
                    <span>
                      <i className="bx bx-check"></i> Roof: {property.Roof.join(", ") || "-"}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Structure Design Type: {property.StructureDesignType}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Style: {property.ArchitecturalStyle}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Levels: {property.Levels}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Property Condition: {property.PropertyCondition.join(", ") || "-"}
                    </span>
                  </li>

                </ul>
                <h3>Community</h3>
                <ul className="amenities-list">
                  {/* county, city, zip, subdivision */}
                  <li>
                    <span>
                      <i className="bx bx-check"></i> County: {property.County}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> City: {property.City}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Zip: {property.PostalCode}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Subdivision: {property.SubdivisionName}
                    </span>
                  </li>
                </ul>
                <h3>School</h3>
                <ul className="amenities-list">

                  <li>
                    <span>
                      <i className="bx bx-check"></i> School District: {property.SchoolDistrictName || "-"}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Elementary School: {property.ElementarySchool || "-"}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Middle School: {property.MiddleOrJuniorSchool || "-"}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> High School: {property.HighSchool || "-"}
                    </span>
                  </li>
                </ul>
                <h3>Amenities</h3>
                <ul className="amenities-list">

                  <li>
                    <span>
                      <i className="bx bx-check"></i> Property: {property.PropertyType}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> MLS: {property.MlsStatus}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Acres: {property.LotSizeAcres}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Status: {formatStatus(property.StandardStatus)}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Basement: {property.BasementYN ? "Yes" : "No"}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Year Built: {property.YearBuilt}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Lot SQFT: {property.LotSizeSquareFeet}
                    </span>

                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Lot Size Units: {property.LotSizeUnits}
                    </span>
                  </li>
                  <li>
                    <span>
                      <i className="bx bx-check"></i> Structure Design Type: {property.StructureDesignType}
                    </span>
                  </li>

                  {/* <li>
                    <span>
                      <i className="bx bx-check"></i> List Office: {property.ListOfficeName}
                    </span>
                  </li> */}


                </ul>
                <CarouselComponent property={property} />

                <div>
                  <h3 className="mt-5 fs-3">Map</h3>
                  <div className="d-flex flex-column">
                    {/* Left Column with Map and Address */}
                    <div className="mb-3">

                      <div>
                        <GoogleMapsEmbed
                          apiKey={process.env.NEXT_PUBLIC_MAP_API}
                          height="300px"
                          width="100%"
                          mode="place"
                          loading="lazy"
                          zoom={17}
                          q={property?.Latitude + "," + property?.Longitude}
                        />

                      </div>


                      <div className="d-flex justify-content-center gap-4 gap-md-1 my-3">
                        <div>

                          <span className="fs-6 fw-normal">{getDisplayAddress(property)}</span>
                        </div>

                        {/* <Link className="default-btn h-25" href={properties?.checkUrl} target="_blank">
                          Get Directions
                        </Link> */}
                      </div>
                    </div>


                  </div>
                </div>


              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="listings-sidebar mt-1">
                <div className="listings-widget book_listings">
                  <h3>Contact Agent</h3>
                  {!submitted ? (
                    <Form onSubmit={onSubmit}>
                      {error && (
                        <div className="alert alert-danger mb-3">
                          <strong>Error:</strong> {error}
                        </div>
                      )}
                      <div className="row">
                        <div className="col-6">
                          <div className="form-group">
                            <input
                              type="text"
                              name="name"
                              className="form-control"
                              id="name"
                              required
                              placeholder="First name"
                              value={form.firstname}
                              onChange={(e) =>
                                setForm((state) => ({
                                  ...state,
                                  firstname: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>

                        <div className="col-6">
                          <div className="form-group">
                            <input
                              type="text"
                              name="name"
                              className="form-control"
                              id="name"
                              required
                              placeholder="Last name"
                              value={form.lastname}
                              onChange={(e) =>
                                setForm((state) => ({
                                  ...state,
                                  lastname: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">



                        <div className="col-lg-12 col-md-6">
                          <div className="form-group">
                            <input
                              type="email"
                              name="email"
                              className="form-control"
                              id="email"
                              required
                              placeholder="Contact email"
                              value={form.email}
                              onChange={(e) =>
                                setForm((state) => ({
                                  ...state,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>


                        <div className="col-lg-12 col-md-6">
                          <div className="form-group">
                            <input
                              type="tel"
                              name="phone_number"
                              className="form-control"
                              id="phone_number"
                              placeholder="(555) 555-5555"
                              maxLength={14}
                              value={form.phone}
                              onChange={(e) => {
                                const formatted = formatPhone(e.target.value);
                                setForm((state) => ({
                                  ...state,
                                  phone: formatted,
                                }));
                              }}
                              pattern="\(\d{3}\) \d{3}-\d{4}"
                            />
                            {!validatePhone(form.phone) && form.phone && (
                              <small className="text-danger">
                                Please enter a valid 10-digit US phone number
                              </small>
                            )}
                          </div>
                        </div>







                        <div className="col-12">
                          <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />
                        </div>

                        <div className="col-lg-12 col-md-12">
                          <button type="submit" className="default-btn w-100" disabled={loading}>
                            {loading ? "Submitting..." : "Submit"}
                          </button>
                        </div>
                      </div>

                    </Form>
                  ) : (
                    <div className="text-success">
                      <h4>Thank you for submitting your details!</h4>
                      <p>Your inquiry has been sent to our agent. We&apos;ll get back to you soon!</p>
                    </div>
                  )}
                </div>

                {/* <div className="listings-widget listings_contact_details ">
                  <h3>Address</h3>
                  <ul>
                    {property?.FullStreetAddress && <li>
                      <i className="bx bx-map"></i>
                      {property?.FullStreetAddress}
                    </li>}
                    {property?.City && <li>
                      <i className="bx bx-map"></i>
                      {property?.City}
                    </li>}
                    {property?.StateOrProvince && <li>
                      <i className="bx bx-map"></i>
                      {property?.StateOrProvince}
                    </li>}
                    {property?.PostalCode && <li>
                      <i className="bx bx-map"></i>
                      {property?.PostalCode}
                    </li>}

                  </ul>
                </div> */}

              </div>
            </div>
          </div>
        </div>




      </section>

      {nearbyProperties && nearbyProperties.length > 0 && (
        <section className="listings-area pt-100 pb-70 bg-f9f9f9">
          <div className="container">
            <div className="section-title text-left">
              <h2>Nearby Properties for Sale</h2>
            </div>
            <div className="row">
              {nearbyProperties?.map((prop) => (
                <div className="col-xl-4 col-lg-4 col-md-6" key={prop.ListingId}>
                   <Link href={realtySlug(prop)} className="link-btn">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Image
                          src={prop?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                          alt={getDisplayAddress(prop)}
                          width={395}
                          height={200}
                          style={{ objectFit: "cover", height: "200px" }}
                        />
                      </div>
                      <div className="listings-content">
                        <div className="author">
                          <div className="d-flex align-items-center">
                            <span>Price: ${prop.ListPrice?.toLocaleString()}</span>
                          </div>
                        </div>
                        <h3>{getDisplayAddress(prop)}</h3>
                         <ul className="listings-meta">
                          <li>
                            <i className="flaticon-furniture-and-household"></i>
                            Beds {prop.BedroomsTotal} | Bath {prop.BathroomsFull}
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
      )}

      {nearbyRestaurants?.businesses && nearbyRestaurants.businesses.length > 0 && (
        <section className="listings-area pt-100 pb-70">
          <div className="container">
            <div className="section-title text-left">
              <h2>Nearby Restaurants</h2>
            </div>
            <div className="row">
              {nearbyRestaurants.businesses?.slice(0,3)?.map((biz) => (
                <div className="col-xl-4 col-lg-4 col-md-6" key={biz.id}>
                   <Link href={`/s/${biz.slug}`} className="link-btn">
                    <div className="single-listings-box">
                      <div className="listings-image">
                        <Image
                          src={`/api/og?title=${encodeURIComponent(biz?.title || 'Business')}`}
                          alt={biz.title}
                          width={395}
                          height={200}
                          style={{ objectFit: "cover", height: "200px" }}
                        />
                      </div>
                      <div className="listings-content">
                        <h3>{biz.title}</h3>
                        <ul className="listings-meta">
                            <li>
                                <i className="bx bx-map"></i> {biz.address}, {biz.city}
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
      )}

    </>
  );
};

export default SinglePropertyListingsContent;





// "use client";
// import React, { useEffect } from "react";
// import Link from "next/link";
// import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// import { renderStarRating, daysOfWeek, formatTime, formatWorkHours, transformString } from "@/lib/helper";


// const SinglePropertyListingsContent = ({ properties }) => {

//   const { isLoaded } = useJsApiLoader({
//     id: 'google-map-script',
//     googleMapsApiKey: process.env.GOOGLE_PLACES_API_KEY,
//   });

//   return (
//     <>
//       <section className="listings-details-area pb-70">
//         <div className="listings-details-image">
//           <Image
//             src={properties?.ListPictureURL || "https://picsum.photos/seed/picsum/1920/480"}
//             alt="image"
//             width={1920}
//             height={480}
//             style={{ objectFit: 'cover', height: '480px' }}
//           />
//           {/* <div className="overlay" /> */}
//                   </div>
//       </section>

//     </>
//   );
// };

// export default SinglePropertyListingsContent;
