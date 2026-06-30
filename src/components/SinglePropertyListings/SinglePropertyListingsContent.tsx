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
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

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
            site_name: "",
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

  const fullAddress = property.FullStreetAddress
    ? `${property.FullStreetAddress}, ${property.City}, ${defaultShortState} ${property.PostalCode}`
    : property?.UnparsedAddress?.replace(/,/g, ", ").trim();

  const isActive = property?.StandardStatus === 'Active';
  const statusBadgeColor = isActive ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white';

  const publicRemarks = property?.PublicRemarks || "";
  const remarksCutoff = 400;
  const remarksShort = publicRemarks.slice(0, remarksCutoff);
  const needsExpand = publicRemarks.length > remarksCutoff;

  const price = property.ListPrice || 0;
  const loanAmount = price * 0.80;
  const monthlyRate = 0.07 / 12;
  const numPayments = 360;
  const monthlyPayment = loanAmount > 0
    ? Math.round((loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1))
    : 0;

  return (
    <div className="w-full bg-slate-50 font-sans pb-20">

      {/* HERO GALLERY */}
      <div className="w-full bg-slate-900 relative">
        <div className="absolute top-4 left-4 z-20 flex gap-2">
          <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
            New
          </span>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider ${statusBadgeColor}`}>
            {prefixTitle}
          </span>
        </div>

        <div className="w-full h-[300px] sm:h-[420px] md:h-[540px] lg:h-[620px] overflow-hidden">
          <Swiper
            spaceBetween={0}
            pagination={{ clickable: true }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="h-full w-full"
            initialSlide={activeImageIdx}
            onSlideChange={(swiper) => setActiveImageIdx(swiper.activeIndex)}
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
                <div className="absolute bottom-4 right-4 z-10 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
                  {idx + 1} / {imagesList.length}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {imagesList.length > 1 && (
          <div className="w-full bg-slate-950 px-4 py-3 overflow-x-auto">
            <div className="flex gap-2 max-w-[1240px] mx-auto">
              {imagesList.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`flex-shrink-0 relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none ${
                    activeImageIdx === idx
                      ? 'border-orange-500 shadow-lg shadow-orange-500/30'
                      : 'border-transparent opacity-60 hover:opacity-90 hover:border-slate-500'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1240px] mx-auto px-4 mt-6">

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          <div className="lg:col-span-8 space-y-6">

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1 rounded-full border border-slate-200">
                  MLS# {property?.ListingId}
                </span>
                {property.ListOfficeName && (
                  <span className="text-xs text-slate-500">
                    Listed by <span className="font-semibold text-slate-700">{property.ListOfficeName}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-slate-900 leading-tight mb-4">
                {fullAddress}
              </h1>

              <div className="mb-5">
                <span className="text-3xl sm:text-4xl font-extrabold text-orange-600 tracking-tight">
                  ${price.toLocaleString()}
                </span>
                {property.StandardStatus && (
                  <span className={`ml-3 text-xs font-bold px-2.5 py-1 rounded-full align-middle ${statusBadgeColor}`}>
                    {formatStatus(property.StandardStatus)}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-slate-50 rounded-xl">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">{property.BedroomsTotal || 0}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Beds</span>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-slate-50 rounded-xl">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">
                    {property.BathroomsFull || 0}{property.BathroomsHalf ? <span className="text-base text-slate-500">.{property.BathroomsHalf}</span> : null}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Baths</span>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-slate-50 rounded-xl">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">
                    {(property.LivingArea || property.AreaTotal || 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sq Ft</span>
                </div>
                <div className="flex flex-col items-center sm:items-start gap-1 p-3 bg-slate-50 rounded-xl">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="text-2xl font-extrabold text-slate-900 leading-none">
                    {property.LotSizeAcres ? property.LotSizeAcres : (property.LotSizeSquareFeet || 0).toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {property.LotSizeAcres ? 'Acres' : 'Lot sqft'}
                  </span>
                </div>
              </div>
            </div>

            {video?.thumbnail && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                  Featured Property Video
                </h3>
                <SingleFeaturedVideo video={video} />
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                About This Property
              </h3>
              <div
                className="text-slate-600 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: (descExpanded ? publicRemarks : remarksShort + (needsExpand ? '\u2026' : '')).replace(/\n/g, '<br />') || "No public remarks available for this listing.",
                }}
              />
              {needsExpand && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="mt-3 text-orange-600 font-semibold text-sm hover:text-orange-700 transition"
                >
                  {descExpanded ? 'Read Less \u2191' : 'Read More \u2193'}
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                Property Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-sm">
                {[
                  { label: 'Status', value: formatStatus(property.StandardStatus) },
                  { label: 'Property Type', value: property?.PropertyType || '\u2014' },
                  { label: 'Year Built', value: property.YearBuilt || '\u2014' },
                  { label: 'Days on Market', value: property.DaysOnMarket ?? '0' },
                  { label: 'Annual Taxes', value: property.TaxAnnualAmount ? `$${Number(property.TaxAnnualAmount).toLocaleString()} / ${property.TaxYear || ''}` : '\u2014' },
                  { label: 'Lot Size', value: property.LotSizeAcres ? `${property.LotSizeAcres} acres` : property.LotSizeSquareFeet ? `${Number(property.LotSizeSquareFeet).toLocaleString()} sqft` : '\u2014' },
                  property.ArchitecturalStyle ? { label: 'Style', value: property.ArchitecturalStyle } : null,
                  { label: 'Basement', value: property.BasementYN ? 'Yes' : 'No' },
                ].filter(Boolean).map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500 font-medium">{row.label}</span>
                    <span className="text-slate-900 font-semibold text-right ml-4">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                Community &amp; Schools
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-sm">
                {[
                  { label: 'County', value: property.County || '\u2014' },
                  { label: 'Subdivision', value: property.SubdivisionName || '\u2014' },
                  { label: 'School District', value: property.SchoolDistrictName || '\u2014' },
                  { label: 'Elementary School', value: property.ElementarySchool || '\u2014' },
                  { label: 'Middle School', value: property.MiddleOrJuniorSchool || '\u2014' },
                  { label: 'High School', value: property.HighSchool || '\u2014' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                    <span className="text-slate-500 font-medium">{row.label}</span>
                    <span className="text-slate-900 font-semibold text-right ml-4">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-orange-500 rounded-full inline-block" />
                Location Map
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <GoogleMapsEmbed
                  apiKey={process.env.NEXT_PUBLIC_MAP_API}
                  height="340px"
                  width="100%"
                  mode="place"
                  loading="lazy"
                  zoom="16"
                  q={`${property?.Latitude || 0},${property?.Longitude || 0}`}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <i className="bx bx-map text-orange-600 text-lg align-middle" />
                  <span>{getDisplayAddress(property)}</span>
                </div>
                <Link
                  href={`https://maps.google.com/maps/dir//${property?.Latitude},${property?.Longitude}/@${property?.Latitude},${property?.Longitude},17z`}
                  target="_blank"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition duration-200 text-sm shadow-sm"
                >
                  Get Driving Directions
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5">

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium mb-0.5">Listed by</p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {property.ListOfficeName || 'Local Real Estate Agent'}
                  </p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className="w-3.5 h-3.5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-slate-500 ml-1 font-medium">5.0</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => { const el = document.getElementById('contact-form-section'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-md inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Agent
                </button>
                <button
                  type="button"
                  onClick={() => { const el = document.getElementById('contact-form-section'); el?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                  className="w-full bg-white hover:bg-slate-50 text-slate-900 font-bold py-3 rounded-xl transition duration-200 text-sm border-2 border-slate-200 hover:border-orange-400 inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Schedule a Tour
                </button>
              </div>

              {site?.Phone && (
                <a href={`tel:${site.Phone}`} className="flex items-center justify-center gap-2 text-slate-700 hover:text-orange-600 transition text-sm font-semibold py-2">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {site.Phone}
                </a>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Est. Monthly Payment
              </h4>
              <div className="text-center py-3">
                <span className="text-3xl font-extrabold text-slate-900">${monthlyPayment.toLocaleString()}</span>
                <span className="text-slate-500 text-xs">/mo</span>
              </div>
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex justify-between"><span>Home Price</span><span className="font-semibold text-slate-700">${price.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Down Payment (20%)</span><span className="font-semibold text-slate-700">${Math.round(price * 0.2).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Loan Amount</span><span className="font-semibold text-slate-700">${Math.round(loanAmount).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Interest Rate (est.)</span><span className="font-semibold text-slate-700">7.00%</span></div>
                <div className="flex justify-between"><span>Loan Term</span><span className="font-semibold text-slate-700">30 Years</span></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">* Estimate only. Contact a mortgage professional for accurate figures.</p>
            </div>

            {property?.Latitude && property?.Longitude && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div style={{ height: '180px' }}>
                  <GoogleMapsEmbed
                    apiKey={process.env.NEXT_PUBLIC_MAP_API}
                    height="180px"
                    width="100%"
                    mode="place"
                    loading="lazy"
                    zoom="15"
                    q={`${property.Latitude},${property.Longitude}`}
                  />
                </div>
                <div className="px-4 py-3 text-xs text-slate-600 font-medium truncate flex items-center gap-1.5">
                  <i className="bx bx-map text-orange-600" />
                  {getDisplayAddress(property)}
                </div>
              </div>
            )}

            <div id="contact-form-section" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 font-serif mb-1">Request Information</h3>
              <p className="text-xs text-slate-500 mb-4">Get details about this property sent directly to your inbox.</p>

              {!submitted ? (
                <form onSubmit={onSubmit} className="space-y-3">
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-semibold">{error}</div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="first_name" className="text-xs font-bold text-slate-500">First Name</label>
                      <input type="text" id="first_name" required placeholder="First name"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-orange-400 focus:bg-white outline-none transition"
                        value={form.firstname} onChange={(e) => setForm(f => ({ ...f, firstname: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="last_name" className="text-xs font-bold text-slate-500">Last Name</label>
                      <input type="text" id="last_name" required placeholder="Last name"
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-orange-400 focus:bg-white outline-none transition"
                        value={form.lastname} onChange={(e) => setForm(f => ({ ...f, lastname: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="email" className="text-xs font-bold text-slate-500">Email Address</label>
                    <input type="email" id="email" required placeholder="Contact email"
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-orange-400 focus:bg-white outline-none transition"
                      value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-xs font-bold text-slate-500">Phone (Optional)</label>
                    <input type="tel" id="phone" placeholder="(555) 555-5555" maxLength={14}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-orange-400 focus:bg-white outline-none transition"
                      value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))} />
                    {!validatePhone(form.phone) && form.phone && (
                      <small className="text-red-500 text-xs block mt-1">Please enter a valid 10-digit US phone number</small>
                    )}
                  </div>
                  <div className="pt-1">
                    <Turnstile onVerify={setCfToken} siteKey={site?.turnstile_site_key} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition duration-200 text-sm shadow-md inline-flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting…
                      </>
                    ) : 'Submit Inquiry'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                  <div className="text-4xl">✅</div>
                  <h4 className="font-bold text-emerald-900 text-base">Inquiry Submitted!</h4>
                  <p className="text-xs text-emerald-700">Thank you. Your request has been sent to our agent. We will contact you soon.</p>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <h4 className="text-orange-950 font-bold text-sm">Need Direct Help?</h4>
              </div>
              <p className="text-xs text-orange-800 leading-relaxed">
                Connect with our local experts today for neighborhood analysis, buying consultation, or listing inquiries.
              </p>
            </div>
          </div>
        </div>

        {nearbyProperties && nearbyProperties.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">Nearby Properties for Sale</h2>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyProperties.map((prop) => (
                <Link href={realtySlug(prop)} key={prop.ListingId}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
                  <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                    <Image src={prop?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                      alt={getDisplayAddress(prop)} fill style={{ objectFit: "cover" }}
                      className="group-hover:scale-105 transition duration-500" />
                    <span className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm text-white font-bold text-sm px-2.5 py-1 rounded-lg">
                      ${prop.ListPrice?.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition truncate">{getDisplayAddress(prop)}</h3>
                    <div className="text-xs text-slate-500 font-semibold flex gap-3">
                      <span>{prop.BedroomsTotal || 0} Beds</span><span>•</span><span>{prop.BathroomsFull || 0} Baths</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {nearbyRestaurants?.businesses && nearbyRestaurants.businesses.length > 0 && (
          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900">Nearby Places &amp; Restaurants</h2>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyRestaurants.businesses.slice(0, 3).map((biz) => (
                <Link href={`/s/${biz.slug}`} key={biz.id}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition duration-300">
                  <div className="relative h-[200px] w-full overflow-hidden bg-slate-100">
                    <Image src={`/api/og?title=${encodeURIComponent(biz?.title || 'Business')}`}
                      alt={biz.title} fill style={{ objectFit: "cover" }}
                      className="group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition truncate">{biz.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <i className="bx bx-map text-slate-400" />
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
