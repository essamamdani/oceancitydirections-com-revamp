"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import logger from '@/lib/logger';
import { postData } from "@/lib/server-actions";
import { GoogleMapsEmbed } from '@next/third-parties/google';
import SingleFeaturedVideo from "../HomeFour/singleFeaturevideo";
import { useSites } from "@/contexts/SitesContext";
import { realtySlug, getDisplayAddress, getSiteName } from "@/lib/helper";
import Turnstile from "../Common/Turnstile";
import toast from "react-hot-toast";

const SinglePropertyListingsContent = ({ property, breadcrumbs, video, nearbyProperties, nearbyRestaurants }) => {
  const { site, loading: loadingSite, error: errorSite } = useSites();

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

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cfToken, setCfToken] = useState(null);

  useEffect(() => {
    if (site) {
      setForm(f => ({ ...f, site_name: getSiteName(site) }));
    }
  }, [site]);

  if (loadingSite || !site) return null;
  if (errorSite) {
    console.error("Error loading site data:", errorSite);
    return null;
  }

  const defaultShortState = site.ShortState?.toUpperCase();

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length === 10 || digits.length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.firstname && form.lastname && form.email) {
      if (!cfToken) {
        toast.error("Please complete the security check.");
        return;
      }
      if (form.phone && !validatePhone(form.phone)) {
        toast.error("Please enter a valid 10-digit US phone number.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const submissionData = { ...form, full_url: window.location.href, cf_token: cfToken };
        const result = await postData(submissionData);
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

  const formatStatus = (status) => {
    if (!status) return "";
    return status
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const prefixTitle = property?.StandardStatus === 'Active'
    ? `For ${property.PropertyType?.includes('lease') ? 'Rent' : 'Sale'}`
    : formatStatus(property.StandardStatus);

  const imagesList = property.ListImages?.length > 0
    ? property.ListImages
    : [property.ListPicture3URL || property.ListPicture2URL || property.ListPictureURL || "https://picsum.photos/seed/picsum/1920/600"].filter(Boolean);

  return (
    <div className="w-full bg-slate-50 font-sans pb-16">
      {/* Premium Image Gallery (Compass-style full width slider) */}
      <div className="w-full relative h-[320px] md:h-[500px] bg-slate-900 overflow-hidden">
        <Swiper
          spaceBetween={0}
          pagination={{ clickable: true }}
          navigation={true}
          modules={[Pagination, Navigation]}
          className="h-full w-full"
        >
          {imagesList.map((imgUrl, idx) => (
            <SwiperSlide key={idx} className="h-full w-full relative">
              <Image
                src={imgUrl}
                alt={`${property?.UnparsedAddress} - Image ${idx + 1}`}
                fill
                priority={idx === 0}
                style={{ objectFit: "cover" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 mt-6">
        {/* Breadcrumbs */}
        <div className="text-xs text-slate-500 flex items-center flex-wrap gap-1.5 mb-6">
          <Link href="/" className="hover:text-orange-600 transition">Home</Link>
          {breadcrumbs?.length > 0 && breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              {item.link ? (
                <Link href={item.link} className="hover:text-orange-600 transition">{item.name}</Link>
              ) : (
                <span className="text-slate-700 font-medium truncate max-w-[200px]">{item.name}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Column (Left - 65%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header info */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-wider">
                  {prefixTitle}
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                  MLS: {property?.ListingId}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-slate-900 leading-tight">
                {property.FullStreetAddress ? (
                  `${property.FullStreetAddress}, ${property.City}, ${defaultShortState} ${property.PostalCode}`
                ) : (
                  property?.UnparsedAddress?.replace(/,/g, ", ").trim()
                )}
              </h1>

              {/* Spec Bar */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-center md:text-left">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Price</span>
                  <span className="text-lg md:text-xl font-bold text-slate-900">${property.ListPrice?.toLocaleString()}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Beds</span>
                  <span className="text-lg md:text-xl font-bold text-slate-900">{property.BedroomsTotal || 0}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Baths</span>
                  <span className="text-lg md:text-xl font-bold text-slate-900">
                    {property.BathroomsFull || 0}.{property.BathroomsHalf || 0}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Living Area</span>
                  <span className="text-lg md:text-xl font-bold text-slate-900">{property.LivingArea || property.AreaTotal || 0} sqft</span>
                </div>
              </div>
            </div>

            {/* Video (if available) */}
            {video?.thumbnail && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <h3 className="text-lg font-bold font-serif text-slate-900 mb-4">Featured Property Video</h3>
                <SingleFeaturedVideo video={video} />
              </div>
            )}

            {/* Description */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold font-serif text-slate-900">Overview</h3>
              <p
                className="text-slate-600 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: property?.PublicRemarks?.replace(/\n/g, '<br />') || "No public remarks available for this listing.",
                }}
              />
            </div>

            {/* Spec Cards / Tables */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="text-lg font-bold font-serif text-slate-900 pb-2 border-b border-slate-100">Property Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Status</span>
                  <span className="text-slate-900 font-semibold">{formatStatus(property.StandardStatus)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Property Type</span>
                  <span className="text-slate-900 font-semibold">{property?.PropertyType || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Year Built</span>
                  <span className="text-slate-900 font-semibold">{property.YearBuilt || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Days on Market</span>
                  <span className="text-slate-900 font-semibold">{property.DaysOnMarket || 0}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Annual Taxes</span>
                  <span className="text-slate-900 font-semibold">${property.TaxAnnualAmount || 0} / {property.TaxYear || ""}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Lot Size</span>
                  <span className="text-slate-900 font-semibold">
                    {property.LotSizeAcres ? `${property.LotSizeAcres} acres` : `${property.LotSizeSquareFeet || 0} sqft`}
                  </span>
                </div>
                {property.ArchitecturalStyle && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-450 font-medium">Style</span>
                    <span className="text-slate-900 font-semibold">{property.ArchitecturalStyle}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Basement</span>
                  <span className="text-slate-900 font-semibold">{property.BasementYN ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            {/* Neighborhood & Schools */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="text-lg font-bold font-serif text-slate-900 pb-2 border-b border-slate-100">Community & School Context</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">County</span>
                  <span className="text-slate-900 font-semibold">{property.County || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Subdivision</span>
                  <span className="text-slate-900 font-semibold">{property.SubdivisionName || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">School District</span>
                  <span className="text-slate-900 font-semibold">{property.SchoolDistrictName || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Elementary School</span>
                  <span className="text-slate-900 font-semibold">{property.ElementarySchool || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">Middle School</span>
                  <span className="text-slate-900 font-semibold">{property.MiddleOrJuniorSchool || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-450 font-medium">High School</span>
                  <span className="text-slate-900 font-semibold">{property.HighSchool || "-"}</span>
                </div>
              </div>
            </div>

            {/* Map & Location */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-lg font-bold font-serif text-slate-900">Location Map</h3>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <GoogleMapsEmbed
                  apiKey={process.env.NEXT_PUBLIC_MAP_API}
                  height="340px"
                  width="100%"
                  mode="place"
                  loading="lazy"
                  zoom={16}
                  q={`${property?.Latitude || 0},${property?.Longitude || 0}`}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div className="text-sm font-semibold text-slate-650">
                  <i className="bx bx-map text-orange-600 mr-1.5 align-middle text-lg"></i>
                  <span>{getDisplayAddress(property)}</span>
                </div>
                <Link
                  href={`https://maps.google.com/maps/dir//${property?.Latitude},${property?.Longitude}/@${property?.Latitude},${property?.Longitude},17z`}
                  target="_blank"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl transition duration-200 text-sm shadow-sm inline-flex items-center gap-1.5 text-center justify-center"
                >
                  Get Driving Directions &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar Form Column (Right - 35%) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">Contact Agent</h3>
                <p className="text-xs text-slate-500 mt-1">Submit your details to request more information about this property.</p>
              </div>
              {!submitted ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-semibold">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="first_name" className="text-xs font-bold text-slate-500">First Name</label>
                      <input
                        type="text"
                        required
                        placeholder="First name"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:bg-white outline-none transition"
                        value={form.firstname}
                        onChange={(e) => setForm(f => ({ ...f, firstname: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="last_name" className="text-xs font-bold text-slate-500">Last Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Last name"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:bg-white outline-none transition"
                        value={form.lastname}
                        onChange={(e) => setForm(f => ({ ...f, lastname: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-bold text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="Contact email"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:bg-white outline-none transition"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-xs font-bold text-slate-500">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="(555) 555-5555"
                      maxLength={14}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-slate-400 focus:bg-white outline-none transition"
                      value={form.phone}
                      onChange={(e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                    />
                    {!validatePhone(form.phone) && form.phone && (
                      <small className="text-red-500 text-xs block mt-1">
                        Please enter a valid 10-digit US phone number
                      </small>
                    )}
                  </div>

                  <div className="pt-2">
                    <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-sm inline-flex items-center justify-center"
                  >
                    {loading ? "Submitting..." : "Submit Inquiry"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <i className="bx bx-check-circle text-emerald-500 text-4xl"></i>
                  <h4 className="font-bold text-emerald-900 text-base">Inquiry Submitted!</h4>
                  <p className="text-xs text-emerald-700">Thank you. Your request has been sent to our agent. We will contact you soon.</p>
                </div>
              )}
            </div>
            
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 space-y-3">
              <h4 className="text-orange-950 font-bold text-sm">Need Direct Help?</h4>
              <p className="text-xs text-orange-800 leading-relaxed">
                Connect with our local experts today for neighborhood analysis, buying consultation, or listing inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* Nearby Properties for Sale */}
        {nearbyProperties && nearbyProperties.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">Nearby Properties for Sale</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyProperties.map((prop) => (
                <Link href={realtySlug(prop)} key={prop.ListingId} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
                  <div className="relative h-[200px] w-full overflow-hidden">
                    <Image
                      src={prop?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                      alt={getDisplayAddress(prop)}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-102 transition duration-300"
                    />
                    <span className="absolute bottom-3 left-3 bg-slate-900 text-white font-bold text-sm px-2.5 py-1 rounded-lg">
                      ${prop.ListPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition truncate">
                      {getDisplayAddress(prop)}
                    </h3>
                    <div className="text-xs text-slate-500 font-semibold flex gap-3">
                      <span>{prop.BedroomsTotal || 0} Beds</span>
                      <span>•</span>
                      <span>{prop.BathroomsFull || 0} Baths</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Nearby Restaurants */}
        {nearbyRestaurants?.businesses && nearbyRestaurants.businesses.length > 0 && (
          <div className="mt-16 space-y-6">
            <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">Nearby Places & Restaurants</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyRestaurants.businesses.slice(0, 3).map((biz) => (
                <Link href={`/s/${biz.slug}`} key={biz.id} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
                  <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={`/api/og?title=${encodeURIComponent(biz?.title || 'Business')}`}
                      alt={biz.title}
                      fill
                      style={{ objectFit: "cover" }}
                      className="group-hover:scale-102 transition duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition truncate">
                      {biz.title}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <i className="bx bx-map text-slate-400"></i>
                      <span>{biz.address}, {biz.city}</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePropertyListingsContent;
