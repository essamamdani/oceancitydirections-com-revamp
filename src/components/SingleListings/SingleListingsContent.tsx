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

  return (
    <>
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

      <div className="font-sans antialiased text-slate-800 bg-slate-50 min-h-screen">
        
        {/* Banner Image Hero */}
        <div className="relative h-[320px] md:h-[450px] w-full bg-slate-950 overflow-hidden">
          <Image
            src={(business?.claimed_approval && business?.main_image)
              ? business.main_image
              : `/api/og?title=${encodeURIComponent(business?.title || 'Business')}`}
            alt={business?.title || "Business banner"}
            fill
            priority
            style={{ objectFit: 'cover', opacity: 0.85 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/30 to-transparent"></div>
          
          {/* Logo overlay */}
          {business?.claimed_approval && business?.logo && (
            <div className="absolute bottom-8 left-8 z-25 bg-white rounded-2xl p-1.5 shadow-xl border border-slate-200 w-24 h-24 flex items-center justify-center">
              <Image
                src={business.logo}
                alt={`${business.title} logo`}
                width={80}
                height={80}
                style={{ objectFit: 'contain', borderRadius: '10px' }}
              />
            </div>
          )}

          {/* Heading overlay */}
          <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pl-0 md:pl-28">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-orange-400 bg-slate-900/60 px-3 py-1 rounded-full uppercase tracking-wider border border-slate-800">
                  {business?.categories?.name}
                </span>
                {business?.subcategories?.map((sub: any) => (
                  <span key={sub?.name} className="text-xs font-semibold text-slate-300 bg-slate-900/40 px-3 py-1 rounded-full">
                    {sub?.name}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-serif drop-shadow-md flex flex-wrap items-center gap-3">
                {business?.title}
                {isFeatured && (
                  <span className="text-xs font-bold text-slate-950 bg-amber-400 px-3 py-1 rounded-full align-middle font-sans">
                    <i className="bx bxs-star mr-1"></i>Featured
                  </span>
                )}
                {business?.claimed_approval ? (
                  <span className="text-xs font-bold text-white bg-orange-600 px-3 py-1 rounded-full align-middle font-sans">
                    <i className="bx bx-check-circle mr-1"></i>Verified
                  </span>
                ) : (
                  !business?.claimed_by && (
                    <span className="text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full align-middle font-sans border border-slate-700">
                      Unclaimed
                    </span>
                  )
                )}
              </h1>
              
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-4">
                {business?.phone && (
                  <a href={`tel:${business?.phone}`} className="flex items-center gap-1.5 hover:text-white transition">
                    <i className="bx bx-phone text-lg"></i>
                    <span>{business?.phone.replace("+1", "")}</span>
                  </a>
                )}
                <div className="flex items-center gap-1.5">
                  <i className="bx bx-map text-lg"></i>
                  <span>{business.address}, {business.county}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              {business?.claimed_approval ? (
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="bg-slate-900/60 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-750 backdrop-blur-xs text-sm transition"
                >
                  Report listing
                </button>
              ) : (
                !business.claimed_by && (
                  <button
                    onClick={handleClaim}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition shadow-md"
                    disabled={isClaiming}
                  >
                    {isClaiming ? "Claiming..." : "Claim Business"}
                  </button>
                )
              )}
              {!business.deleted_at && (
                <button
                  onClick={() => setIsRequestInfoOpen(true)}
                  className="bg-slate-900/60 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl border border-slate-750 backdrop-blur-xs text-sm transition"
                >
                  Request Suggestions
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          
          {/* Breadcrumbs */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <li>
                <Link href="/" className="hover:text-orange-655 transition">Home</Link>
              </li>
              {breadcrumbs?.map((crumb: any, idx: number) => (
                <React.Fragment key={idx}>
                  <li className="text-slate-400">/</li>
                  <li>
                    {crumb.link ? (
                      <Link href={crumb.link} className="hover:text-orange-655 transition">{crumb.name}</Link>
                    ) : (
                      <span className="text-slate-700 font-bold">{crumb.name}</span>
                    )}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </nav>

          {/* Grid Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Main Pane */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Featured Video */}
              {video?.thumbnail && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 font-serif">Featured Video Coverage</h3>
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <SingleFeaturedVideo video={video} />
                  </div>
                </div>
              )}

              {/* Description Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-lg font-bold text-slate-900 font-serif">About Business</h3>
                <p className="text-sm text-slate-650 leading-relaxed whitespace-pre-line">
                  {business?.description || `${business.title} provides quality services in ${business.city}, ${business.state}.`}
                </p>

                {/* Attributes checklist */}
                {business?.attributes?.available_attributes && 
                  Object.entries(business?.attributes?.available_attributes).map(([title, attributes]) => (
                    attributes && (
                      <div key={title} className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{transformString(title)}</h4>
                        <ul className="grid grid-cols-2 gap-2">
                          {(attributes as any[]).map((attr, idx) => (
                            attr && (
                              <li key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                                <i className="bx bx-check text-orange-600 text-lg"></i>
                                <span>{transformString(attr)}</span>
                              </li>
                            )
                          ))}
                        </ul>
                      </div>
                    )
                  ))
                }
              </div>

              {/* Map & Directions */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
                <h3 className="text-lg font-bold text-slate-900 font-serif">Location & Directions</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <GoogleMapsEmbed
                    apiKey={process.env.NEXT_PUBLIC_MAP_API}
                    height="320px"
                    width="100%"
                    mode="place"
                    loading="lazy"
                    zoom="16"
                    q={`${business.latitude},${business.longitude}`}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-sm font-semibold text-slate-650">
                    <i className="bx bx-map text-orange-600 mr-1.5 align-middle text-lg"></i>
                    <span>{business?.address}</span>
                  </div>
                  <Link
                    href={business?.check_url ? business?.check_url : `https://maps.google.com/maps/dir//${business?.latitude},${business?.longitude}/@${business?.latitude},${business?.longitude},17z`}
                    target="_blank"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-3 rounded-xl transition duration-200 text-sm shadow-sm inline-flex items-center gap-1.5 text-center justify-center"
                  >
                    Get Driving Directions &rarr;
                  </Link>
                </div>
              </div>

            </div>

            {/* Right Sidebar widgets */}
            <div className="space-y-6 lg:sticky lg:top-24">
              
              {/* Contact Panel widget */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-md font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">Contact Details</h3>
                <ul className="space-y-4 text-xs font-semibold text-slate-650">
                  {business?.url && (
                    <li className="flex items-start gap-2.5">
                      <i className="bx bx-globe text-slate-400 text-lg shrink-0 mt-0.5"></i>
                      <a href={business?.url} target="_blank" rel="noopener noreferrer" className="hover:text-orange-700 transition break-all leading-normal">
                        {business?.url}
                      </a>
                    </li>
                  )}
                  {business?.phone && (
                    <li className="flex items-center gap-2.5">
                      <i className="bx bx-phone-call text-slate-400 text-lg shrink-0"></i>
                      <a href={`tel:${business?.phone}`} className="hover:text-orange-705 transition">
                        {business?.phone.replace("+1", "")}
                      </a>
                    </li>
                  )}
                  <li className="flex items-center gap-2.5">
                    <i className="bx bx-map text-slate-400 text-lg shrink-0"></i>
                    <span>{business?.city}, {business?.state}</span>
                  </li>
                </ul>
              </div>

              {/* Suggestions Panel widget */}
              {!business.deleted_at && (
                <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="font-serif text-white text-lg font-bold">Incorrect Details?</h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Help us keep directory details accurate. Suggest corrections or claim this workspace listing to edit description, services, and photos.
                  </p>
                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={() => setIsRequestInfoOpen(true)}
                      className="bg-slate-850 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-700 transition text-center"
                    >
                      Suggest Edits
                    </button>
                    <button
                      onClick={() => setIsRequestRemovalOpen(true)}
                      className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition text-center shadow-xs"
                    >
                      Request Listing Removal
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* Near Real Estate (MLS Integration) */}
          {property?.length > 0 && (
            <section className="mt-16 pt-8 border-t border-slate-200 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block font-sans">Real Estate Context</span>
                  <h2 className="text-2xl font-bold text-slate-900 font-serif">Properties for sale near {business.title}</h2>
                </div>
                <Link
                  href={`/realty/location/${business.county}/${business.city}/${business.zip}`.toLowerCase()}
                  className="text-sm font-semibold text-orange-705 hover:underline inline-flex items-center gap-1"
                >
                  View All Homes <i className="bx bx-right-arrow-alt text-lg align-middle"></i>
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {property.slice(0, 3).map((prop) => (
                  <Link
                    href={`/realty/${prop.ListingKey}--${slug(prop.UnparsedAddress.replace(/,/g, ", ").trim())}-${prop.ListingId}`}
                    className="bg-white border border-slate-200 hover:border-slate-350 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition duration-300 group"
                    key={prop.ListingId}
                  >
                    <div className="relative h-48 w-full bg-slate-900">
                      <Image
                        src={prop?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                        alt="Property image"
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

                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-orange-705 transition leading-snug line-clamp-1">
                        {prop.FullStreetAddress ? `${prop.FullStreetAddress}, ${prop.City}, ${defaultShortState}` : prop?.UnparsedAddress.replace(/,/g, ", ").trim()}
                      </h3>
                      
                      <div className="text-[11px] text-slate-500 font-semibold flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                        <span>Beds {prop.BedroomsTotal} | Baths {prop.BathroomsFull} | {prop.AreaTotal} sqft</span>
                        <span className="text-slate-400 font-normal">IDX feed</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
};

export default SingleListingsContent;
