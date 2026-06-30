'use client';

import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { renderStarRating, daysOfWeek, formatTime, formatWorkHours, transformString } from "@/lib/helper";
import { GoogleMapsEmbed } from '@next/third-parties/google';
import Image from "next/image";
import slug from "slug";
import SingleFeaturedVideo from "../HomeFour/singleFeaturevideo";
import { useSites } from "@/contexts/SitesContext";

import AuthModal from "../Auth/AuthModal";
import { getClientUser } from "@/utils/auth/session";
import ConfirmModal from "../Common/ConfirmModal";
import ReportModal from "../Common/ReportModal";
import RequestInfoModal from "../Common/RequestInfoModal";
import RequestRemovalModal from "../Common/RequestRemovalModal";

interface SingleListingsContentProps {
  business: any;
  breadcrumbs?: any;
  video?: any;
  isFeatured?: boolean;
}

const SingleListingsContent = ({ business, breadcrumbs, video, isFeatured }: SingleListingsContentProps) => {
  const { site, loading, error } = useSites();
  const [currentUrl, setCurrentUrl] = useState('');
  const [property, setProperty] = useState<any[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isRequestRemovalOpen, setIsRequestRemovalOpen] = useState(false);

  const RealtyPage = site?.IncludeRealty;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
    const checkUser = async () => {
      const { user: fetchedUser } = await getClientUser();
      setUser(fetchedUser ?? null);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!RealtyPage) return;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/realty?city=${business?.city}&zip=${business?.zip}`
        );
        if (!response.ok) throw new Error("Failed to fetch realty data");
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        console.error("Error fetching realty data:", err);
      }
    };
    fetchData();
  }, [RealtyPage, business?.city, business?.zip]);

  const performClaim = async () => {
    setIsClaiming(true);
    try {
      const response = await fetch("/api/claims/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_id: business.id,
          proposed_data: {
            title: business.title,
            phone: business.phone,
            address: business.address,
            city: business.city,
            state: business.state,
            zip: business.zip,
            lat: business.latitude,
            long: business.longitude,
            description: business.description,
            url: business.url,
          },
          proposed_update_slug: business.update_slug || `${slug(business.title)}--${slug(business.address || '')}`,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Claim created. Redirecting to dashboard...");
        window.location.href = "/dashboard";
      } else {
        toast.error(result.error || "Failed to create claim.");
      }
    } catch (err) {
      console.error("Error creating claim:", err);
      toast.error("An error occurred.");
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaim = () => {
    setIsConfirmOpen(true);
  };

  const handleAuthSuccess = (user: any) => {
    setUser(user);
    setIsConfirmOpen(true);
  };

  if (loading || !site) return null;
  if (error) {
    console.error("Error loading site data:", error);
    return null;
  }

  const defaultShortState = site.ShortState?.toUpperCase();

  // ── Photo mosaic helpers ──────────────────────────────────────────────────
  const heroImage =
    (business?.claimed_approval && business?.main_image)
      ? business.main_image
      : `/api/og?title=${encodeURIComponent(business?.title || 'Business')}`;

  const photos: string[] = Array.isArray(business?.photos)
    ? business.photos.map((p: any) => (typeof p === 'string' ? p : p?.url)).filter(Boolean)
    : [];

  const mosaicLeft  = photos[0] || heroImage;
  const mosaicTop   = photos[1] || heroImage;
  const mosaicBot   = photos[2] || heroImage;

  // Category name (may be object or string)
  const categoryName =
    typeof business?.categories === 'string'
      ? business.categories
      : business?.categories?.name ?? '';

  // Work hours object keys
  const workHoursEntries = business?.workHours
    ? Object.entries(business.workHours as Record<string, any>)
    : [];

  return (
    <>
      {/* ── Modals (always rendered at top) ──────────────────────────────── */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title={`Claim "${business?.title}"`}
        message={`Do you want to claim "${business?.title}"? After verifying, you'll be able to edit this business information. Create a Free Account to get started.`}
        confirmText={user ? (isClaiming ? "Claiming..." : "Yes, Claim") : "Login / Register"}
        cancelText="Cancel"
        onConfirm={() => {
          setIsConfirmOpen(false);
          if (!user) {
            localStorage.setItem('pending_claim_business', JSON.stringify({
              business_id: business.id,
              proposed_data: {
                title: business.title,
                phone: business.phone,
                address: business.address,
                city: business.city,
                state: business.state,
                zip: business.zip,
                lat: business.latitude,
                long: business.longitude,
                description: business.description,
                url: business.url,
              },
              proposed_update_slug: business.update_slug || `${slug(business.title)}--${slug(business.address || '')}`,
            }));
            window.location.href = '/register';
            return;
          }
          performClaim();
        }}
        onCancel={() => setIsConfirmOpen(false)}
        onClose={() => setIsConfirmOpen(false)}
      />
      <RequestInfoModal
        isOpen={isRequestInfoOpen}
        onClose={() => setIsRequestInfoOpen(false)}
        businessTitle={business?.title}
        businessUrl={currentUrl}
        businessId={business?.id}
      />
      <RequestRemovalModal
        isOpen={isRequestRemovalOpen}
        onClose={() => setIsRequestRemovalOpen(false)}
        businessId={business?.id}
        businessTitle={business?.title}
      />
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        businessId={business?.id}
        businessTitle={business?.title}
      />

      {/* ── Page shell ───────────────────────────────────────────────────── */}
      <div className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen">

        {/* ── Photo Mosaic Header ──────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">

          {/* Top bar: Back link + Share/Save */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href={breadcrumbs?.[breadcrumbs.length - 2]?.link ?? '/'}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-orange-600 transition-colors"
            >
              <i className="bx bx-chevron-left text-lg" />
              Back to Directory
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (navigator?.share) {
                    navigator.share({ title: business?.title, url: currentUrl });
                  } else {
                    navigator.clipboard.writeText(currentUrl);
                    toast.success('Link copied!');
                  }
                }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-orange-600 border border-slate-200 bg-white hover:border-orange-300 rounded-xl px-3 py-2 transition-all shadow-sm"
              >
                <i className="bx bx-share-alt text-base" />
                Share
              </button>
              <button
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-orange-600 border border-slate-200 bg-white hover:border-orange-300 rounded-xl px-3 py-2 transition-all shadow-sm"
              >
                <i className="bx bx-bookmark text-base" />
                Save
              </button>
            </div>
          </div>

          {/* Mosaic grid: large left (2/3) + 2 stacked right (1/3) */}
          <div className="grid grid-cols-3 gap-2 h-[380px] md:h-[460px] rounded-2xl overflow-hidden">
            {/* Large left photo */}
            <div className="col-span-2 relative bg-slate-200">
              <Image
                src={mosaicLeft}
                alt={business?.title || 'Business photo'}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 hover:scale-[1.02]"
              />
              {/* Logo badge */}
              {business?.claimed_approval && business?.logo && (
                <div className="absolute bottom-4 left-4 z-10 bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 w-20 h-20 flex items-center justify-center">
                  <Image
                    src={business.logo}
                    alt={`${business.title} logo`}
                    width={68}
                    height={68}
                    style={{ objectFit: 'contain', borderRadius: '10px' }}
                  />
                </div>
              )}
            </div>
            {/* Right stack */}
            <div className="col-span-1 flex flex-col gap-2">
              <div className="relative flex-1 bg-slate-200 rounded-tr-2xl overflow-hidden">
                <Image
                  src={mosaicTop}
                  alt={`${business?.title} photo 2`}
                  fill
                  sizes="33vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-[1.02]"
                />
              </div>
              <div className="relative flex-1 bg-slate-200 rounded-br-2xl overflow-hidden">
                <Image
                  src={mosaicBot}
                  alt={`${business?.title} photo 3`}
                  fill
                  sizes="33vw"
                  style={{ objectFit: 'cover' }}
                  className="transition-transform duration-500 hover:scale-[1.02]"
                />
                {/* "View all photos" overlay */}
                {photos.length > 3 && (
                  <div className="absolute inset-0 bg-slate-950/55 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      +{photos.length - 3} photos
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Business identity block ──────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {business?.claimed_approval && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-orange-600 px-3 py-1 rounded-full">
                <i className="bx bx-check-circle" />
                Verified Business
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-amber-400 px-3 py-1 rounded-full">
                <i className="bx bxs-star" />
                Featured
              </span>
            )}
            {categoryName && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-100 bg-slate-700 px-3 py-1 rounded-full">
                {categoryName}
              </span>
            )}
            {business?.subcategories?.map((sub: any) => (
              <span key={sub?.name} className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                {sub?.name}
              </span>
            ))}
            {!business?.claimed_approval && !business?.claimed_by && (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                Unclaimed
              </span>
            )}
          </div>

          {/* Business name */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight font-serif mb-3 leading-tight">
            {business?.title}
          </h1>

          {/* Rating + address + phone inline */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 mb-5">
            <span className="flex items-center gap-1.5">
              {renderStarRating(business?.rating)}
              {(business?.rating?.reviews || business?.review_count || business?.reviews) ? (
                <span className="text-slate-500 font-medium">({business?.rating?.reviews || business?.review_count || business?.reviews} reviews)</span>
              ) : null}
            </span>
            {business?.address && (
              <span className="flex items-center gap-1">
                <i className="bx bx-map text-orange-500" />
                {business.address}{business.city ? `, ${business.city}` : ''}{business.state ? `, ${business.state}` : ''}{business.zip ? ` ${business.zip}` : ''}
              </span>
            )}
            {business?.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-orange-600 transition-colors font-medium">
                <i className="bx bx-phone text-orange-500" />
                {business.phone.replace("+1", "")}
              </a>
            )}
          </div>

          {/* Action buttons row */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200">
            {business?.phone && (
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm"
              >
                <i className="bx bx-phone text-base" />
                Call
              </a>
            )}
            {business?.url && (
              <a
                href={business.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-sm border border-slate-300 hover:border-slate-400 transition-all shadow-sm"
              >
                <i className="bx bx-globe text-base" />
                Website
              </a>
            )}
            <Link
              href={business?.check_url ?? `https://maps.google.com/maps/dir//${business?.latitude},${business?.longitude}/@${business?.latitude},${business?.longitude},17z`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-sm border border-slate-300 hover:border-slate-400 transition-all shadow-sm"
            >
              <i className="bx bx-directions text-base" />
              Directions
            </Link>
            {!business?.claimed_approval && !business?.claimed_by && (
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm disabled:opacity-60"
              >
                <i className="bx bx-badge-check text-base" />
                {isClaiming ? "Claiming..." : "Claim Business"}
              </button>
            )}
            {business?.claimed_approval && (
              <button
                onClick={() => setIsReportOpen(true)}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-semibold px-5 py-2.5 rounded-xl text-sm border border-slate-300 hover:border-slate-400 transition-all shadow-sm"
              >
                <i className="bx bx-flag text-base" />
                Report
              </button>
            )}
          </div>
        </div>

        {/* ── Main 8/4 column layout ───────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* ── LEFT: Main content (8 cols) ─────────────────────────── */}
            <div className="lg:col-span-8 space-y-6">

              {/* About section */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
                  <i className="bx bx-info-circle text-orange-500 text-2xl" />
                  About {business?.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {business?.description ||
                    `${business.title} provides quality services in ${business.city}, ${business.state}. Contact us to learn more about what we offer.`}
                </p>

                {/* Attribute checklist */}
                {business?.attributes?.available_attributes &&
                  Object.entries(business.attributes.available_attributes).map(([title, attributes]) =>
                    attributes ? (
                      <div key={title} className="pt-4 border-t border-slate-100 space-y-3">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                          {transformString(title)}
                        </h3>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(attributes as any[]).map((attr, idx) =>
                            attr ? (
                              <li key={idx} className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                <i className="bx bx-check-circle text-orange-600 text-base shrink-0" />
                                {transformString(attr)}
                              </li>
                            ) : null
                          )}
                        </ul>
                      </div>
                    ) : null
                  )
                }
              </section>

              {/* Featured Video (if exists) */}
              {video?.thumbnail && (
                <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
                    <i className="bx bx-play-circle text-orange-500 text-2xl" />
                    Featured Video
                  </h2>
                  <div className="overflow-hidden rounded-xl border border-slate-100">
                    <SingleFeaturedVideo video={video} />
                  </div>
                </section>
              )}

              {/* Map & Directions */}
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
                  <i className="bx bx-map-alt text-orange-500 text-2xl" />
                  Map &amp; Directions
                </h2>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <GoogleMapsEmbed
                    apiKey={process.env.NEXT_PUBLIC_MAP_API}
                    height="340px"
                    width="100%"
                    mode="place"
                    loading="lazy"
                    zoom="16"
                    q={`${business.latitude},${business.longitude}`}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <p className="text-sm text-slate-600 font-medium flex items-center gap-1.5">
                    <i className="bx bx-map-pin text-orange-500 text-lg" />
                    {business?.address}{business?.city ? `, ${business.city}` : ''}{business?.state ? `, ${business.state}` : ''}
                  </p>
                  <Link
                    href={business?.check_url ?? `https://maps.google.com/maps/dir//${business?.latitude},${business?.longitude}/@${business?.latitude},${business?.longitude},17z`}
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-sm"
                  >
                    Get Driving Directions
                    <i className="bx bx-right-arrow-alt text-lg" />
                  </Link>
                </div>
              </section>

              {/* Nearby Real Estate */}
              {property?.length > 0 && (
                <section className="space-y-5">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block">
                        Real Estate Nearby
                      </span>
                      <h2 className="text-2xl font-bold text-slate-900 font-serif mt-0.5">
                        Properties near {business.title}
                      </h2>
                    </div>
                    <Link
                      href={`/realty/location/${business.county}/${business.city}/${business.zip}`.toLowerCase()}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      View All
                      <i className="bx bx-right-arrow-alt text-lg align-middle" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {property.slice(0, 3).map((prop) => (
                      <Link
                        href={`/realty/${prop.ListingKey}--${slug(prop.UnparsedAddress.replace(/,/g, ", ").trim())}-${prop.ListingId}`}
                        className="bg-white border border-slate-200 hover:border-orange-300 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group"
                        key={prop.ListingId}
                      >
                        <div className="relative h-44 w-full bg-slate-900">
                          <Image
                            src={prop?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                            alt="Property"
                            fill
                            sizes="(max-width: 768px) 100vw, 360px"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-slate-950/80 text-white font-bold text-xs px-3 py-1 rounded-full">
                              ${prop.ListPrice.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-bold text-slate-800 text-sm group-hover:text-orange-600 transition-colors leading-snug line-clamp-1">
                            {prop.FullStreetAddress
                              ? `${prop.FullStreetAddress}, ${prop.City}, ${defaultShortState}`
                              : prop?.UnparsedAddress.replace(/,/g, ", ").trim()}
                          </h3>
                          <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                            <span>Beds {prop.BedroomsTotal} · Baths {prop.BathroomsFull} · {prop.AreaTotal} sqft</span>
                            <span className="text-slate-400">IDX</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* ── RIGHT: Sticky sidebar (4 cols) ──────────────────────── */}
            <div className="lg:col-span-4">
              <div className="space-y-5 lg:sticky lg:top-24">

                {/* Business Details card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                    Business Details
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    {business?.url && (
                      <li className="flex items-start gap-3">
                        <i className="bx bx-globe text-slate-400 text-lg shrink-0 mt-0.5" />
                        <a
                          href={business.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-orange-600 transition-colors break-all leading-normal font-medium"
                        >
                          {business.url.replace(/^https?:\/\//, '')}
                        </a>
                      </li>
                    )}
                    {business?.phone && (
                      <li className="flex items-center gap-3">
                        <i className="bx bx-phone-call text-slate-400 text-lg shrink-0" />
                        <a href={`tel:${business.phone}`} className="hover:text-orange-600 transition-colors font-medium">
                          {business.phone.replace("+1", "")}
                        </a>
                      </li>
                    )}
                    {(business?.address || business?.city) && (
                      <li className="flex items-start gap-3">
                        <i className="bx bx-map text-slate-400 text-lg shrink-0 mt-0.5" />
                        <span className="leading-snug">
                          {business?.address && <span className="block">{business.address}</span>}
                          {business?.city && (
                            <span className="block text-slate-500">
                              {business.city}{business.state ? `, ${business.state}` : ''}{business.zip ? ` ${business.zip}` : ''}
                            </span>
                          )}
                        </span>
                      </li>
                    )}
                    {business?.county && (
                      <li className="flex items-center gap-3">
                        <i className="bx bx-building text-slate-400 text-lg shrink-0" />
                        <span className="text-slate-500">{business.county} County</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Hours card (if workHours exists) */}
                {workHoursEntries.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-3">
                      Business Hours
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {workHoursEntries.map(([day, hours]) => {
                        const formatted = formatWorkHours ? formatWorkHours(hours) : hours;
                        return (
                          <li key={day} className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-slate-700 capitalize w-24 shrink-0">{day}</span>
                            <span className="text-slate-500 text-right">{formatted}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Corrections widget (dark bg) */}
                {!business.deleted_at && (
                  <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-serif text-white text-base font-bold">
                      Incorrect Details?
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Help us keep this directory accurate. Suggest corrections or claim this listing to manage photos, hours, and descriptions.
                    </p>
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() => setIsRequestInfoOpen(true)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl text-xs border border-slate-700 transition-all text-center"
                      >
                        Suggest Edits
                      </button>
                      <button
                        onClick={() => setIsRequestRemovalOpen(true)}
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-all text-center shadow-sm"
                      >
                        Request Listing Removal
                      </button>
                    </div>
                  </div>
                )}

                {/* Breadcrumbs in sidebar */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      Directory Path
                    </h3>
                    <nav aria-label="Breadcrumb">
                      <ol className="space-y-1.5">
                        <li>
                          <Link href="/" className="text-xs text-slate-500 hover:text-orange-600 transition-colors font-medium flex items-center gap-1">
                            <i className="bx bx-home text-sm" />
                            Home
                          </Link>
                        </li>
                        {breadcrumbs.map((crumb: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5 pl-3">
                            <i className="bx bx-chevron-right text-slate-300 text-sm shrink-0" />
                            {crumb.link ? (
                              <Link
                                href={crumb.link}
                                className="text-xs text-slate-500 hover:text-orange-600 transition-colors font-medium leading-snug"
                              >
                                {crumb.name}
                              </Link>
                            ) : (
                              <span className="text-xs text-slate-800 font-bold leading-snug">
                                {crumb.name}
                              </span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </nav>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default SingleListingsContent;
