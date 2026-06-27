'use client';
import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { renderStarRating, daysOfWeek, formatTime, formatWorkHours, transformString } from "@/lib/helper";
import { GoogleMapsEmbed } from '@next/third-parties/google'
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

const SingleListingsContent = ({ business, breadcrumbs, video, isFeatured }) => {
  const { site, loading, error } = useSites();
  const [currentUrl, setCurrentUrl] = useState('');
  const [property, setProperty] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  // const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  // const [isRemoving, setIsRemoving] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isRequestRemovalOpen, setIsRequestRemovalOpen] = useState(false);

  // ✅ Define RealtyPage *before* using it in useEffect
  const RealtyPage = site?.IncludeRealty;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
    const checkUser = async () => {
      const { user } = await getClientUser();
      setUser(user ?? null);
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (!RealtyPage) return; // ✅ Check before fetching
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
    // Always show confirm modal first (same pattern as GridBlock)
    setIsConfirmOpen(true);
  };

  // const handleRemove = async () =>{
  //   window.location.href = `/removal-request/${business.id}`;
  // }

  // const performRemovalRequest = async () => {
  //   setIsRemoving(true);
  //   try {
  //     const response = await fetch('/api/removal-request', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ businessId: business.id }),
  //     });
  //     const result = await response.json();
  //     if (response.ok) {
  //       toast.success('Removal request submitted');
  //     } else {
  //       toast.error(result.error || 'Failed to submit removal request');
  //     }
  //   } catch (err) {
  //     console.error('Removal request error:', err);
  //     toast.error('An error occurred.');
  //   } finally {
  //     setIsRemoving(false);
  //   }
  // };

  const handleAuthSuccess = (user) => {
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
      <section className="listings-details-area pb-70">
        <div className="listings-details-image" style={{ position: 'relative' }}>
          <Image
            src={(business?.claimed_approval && business?.main_image)
              ? business.main_image
              : `/api/og?title=${encodeURIComponent(business?.title || 'Business')}`}
            alt={business?.title || "image"}
            width={1920}
            height={480}
            style={{ objectFit: 'cover', height: '480px' }}
            priority={true}
          />
          {/* Logo — only shown when claimed and logo uploaded */}
          {business?.claimed_approval && business?.logo && (
            <div style={{
              position: 'absolute',
              bottom: '24px',
              left: '32px',
              zIndex: 10,
              background: '#fff',
              borderRadius: '12px',
              padding: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
              width: '88px',
              height: '88px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Image
                src={business.logo}
                alt={`${business.title} logo`}
                width={76}
                height={76}
                style={{ objectFit: 'contain', borderRadius: '8px' }}
              />
            </div>
          )}
          <div className="overlay" />
          <div className="container">
            <div className="container">
              <div className="listings-details-content">
                <span className="meta"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <span>
                    <i className="flaticon-cooking"></i>
                    {business?.categories?.name}
                  </span>
                  {business?.subcategories.length > 0 && business?.subcategories.map(e => <span key={e?.name}>
                    <><i className="flaticon-furniture-and-household"></i>
                      {e?.name}</>
                  </span>)}
                </span>
                <div className="d-flex align-items-center gap-3 justify-content-between flex-wrap">
                  <h3>
                    {business?.title}
                    {isFeatured && (
                      <span className="ms-2 badge rounded-pill align-middle" style={{ fontSize: '0.55em', verticalAlign: 'middle', marginLeft: '8px', background: '#f39c12', color: '#fff' }} title="Featured Business">
                        <i className='bx bxs-star'></i> Featured
                      </span>
                    )}
                    {business?.claimed_approval ? (
                      <span className="ms-2 badge bg-primary rounded-pill fs-6 align-middle" style={{ fontSize: '0.6em', verticalAlign: 'middle', marginLeft: '10px' }} title="Claimed Business">
                        <i className='bx bx-check-circle'></i> Claimed
                      </span>
                    ) : (
                      !business?.claimed_by && (
                        <span className="ms-2 badge bg-secondary rounded-pill fs-6 align-middle" style={{ fontSize: '0.6em', verticalAlign: 'middle', marginLeft: '10px' }} title="Unclaimed Business">
                          Unclaimed
                        </span>
                      )
                    )}
                  </h3>

                  <div className="d-flex gap-2">
                    {business?.claimed_approval ? (
                      <button
                        onClick={() => setIsReportOpen(true)}
                        className="default-btn mt-3"
                      >
                        Report
                      </button>
                    ) : (
                      !business.claimed_by ? (
                        <button
                          onClick={handleClaim}
                          className="default-btn mt-3"
                          disabled={isClaiming}
                        >
                          {isClaiming ? "Claiming..." : "Claim this Business"}
                        </button>
                      ) : (
                        user && user.id === business.claimed_by && (
                          <Link href={`/dashboard/edit-business/${business.id}`} className="default-btn mt-3">
                            Edit Business (Claimed)
                          </Link>
                        )
                      )
                    )}
                    {!business.deleted_at && (
                      <>
                        <button
                          onClick={() => setIsRequestInfoOpen(true)}
                          className="default-btn mt-3"
                        >
                          Request Suggestions
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* <div className="rating d-flex align-items-center">

                  {business?.rating?.value ? <>
                    {renderStarRating(business?.rating?.value)}
                    <span className="rating-count m-2">
                      {business?.rating?.value}
                    </span>
                    {business?.rating?.votes_count &&
                      <span className="rating-count">
                        ({business?.rating?.votes_count} review)
                      </span>}
                  </> : <span> No Reviews</span>}

                </div> */}

                <ul className="d-flex align-items-center">
                  {business?.phone && <li className="phone-number">
                    <a href={`tel:${business?.phone}`}>
                      <i className="bx bx-phone-call"></i> {business?.phone.replace("+1", "")}
                    </a>
                  </li>}


                  {/* <li className="time">
                    <i className="bx bx-time-five" />
                    <span className="">{formatWorkHours(business?.workTime?.work_hours).status}</span>
                    {business?.workTime?.work_hours.timings && <div>{formatWorkHours(business?.workTime?.work_hours).timings}</div>}
                  </li> */}
                  <li className="location">
                    <i className="bx bx-map"></i>
                    <span>Location</span>
                    {business.address}, {business.county}

                  </li>
                </ul>
              </div>
            </div>
          </div>


        </div>

        <div className="container">
          <div className="row">
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
              <div className="listings-details-desc mt-3">
                <h3>{business?.title}</h3>
                {video?.thumbnail && <SingleFeaturedVideo video={video} />}
                <p>{business?.description}</p>

                {business?.attributes?.available_attributes && Object.entries(business?.attributes?.available_attributes).map(([title, attributes]) => (
                  attributes ? <div key={title}>
                    <h3>{transformString(title)}</h3>
                    <ul className="amenities-list">
                      {attributes.map((attribute, index) => (
                        attribute && (
                          <li key={index}>
                            <span>
                              <i className="bx bx-check"></i> {transformString(attribute)}
                            </span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div> : <></>
                ))}




                <div className="w-full">
                  <div>
                    <h3>Location & Hours</h3>
                    <GoogleMapsEmbed
                      apiKey={process.env.NEXT_PUBLIC_MAP_API}
                      height="300px"
                      width="100%"
                      mode="place"
                      loading="lazy"
                      zoom={17}
                      q={business.latitude + "," + business.longitude}
                    />
                  </div>
                  <div className="d-flex justify-content-center gap-4 gap-md-1 my-3">
                    <div style={{ width: "180px" }}>
                      <span className="fs-6 fw-normal">{business?.address}</span>
                    </div>
                    <Link className="default-btn h-25" href={business?.check_url ? business?.check_url : `https://maps.google.com/maps/dir//${business?.latitude},${business?.longitude}/@${business?.latitude},${business?.longitude},17z`} target="_blank">
                      Get Directions
                    </Link>
                  </div>
                </div>

              </div>
            </div>

            <div className="col-lg-4 col-md-12">
              <div className="listings-sidebar">

                <div className="listings-widget listings_contact_details">
                  <h3>Contact Details</h3>
                  <ul>
                    {business?.url && <li>
                      <i className="bx bx-globe"></i>
                      <a href={business?.url} target="_blank">{business?.url}</a>
                    </li>}
                    {business?.phone && <li>
                      <i className="bx bx-phone-call"></i>
                      <a href={`tel:${business?.phone}`}>{business?.phone.replace("+1", "")}</a>
                    </li>}
                    {business?.checkUrl && <li>
                      <i className="bx bx-directions"></i>
                      <Link href={business?.checkUrl} target="_blank">
                        Get Directions
                      </Link>
                    </li>}
                    <li>
                      <i className="bx bx-map"></i>{business?.city}, {business?.state}
                    </li>
                  </ul>

                </div>

              </div>
            </div>
          </div>
          {property?.length > 0 && <div className="row mt-5">
            <div className="section-title text-left">
              <h2>Properties for sale near this business</h2>
              <Link href={`/realty/location/${business.county}/${business.city}/${business.zip}`.toLowerCase()} className="link-btn">
                Show All <i className="flaticon-right-chevron"></i>
              </Link>
            </div>
            {property?.slice(0, 3).map((property) => (
              <div className="col-xl-4 col-lg-4 col-md-4" key={property.ListingId}>
                <Link
                  href={`/realty/${property.ListingKey}--${slug(property.UnparsedAddress.replace(/,/g, ", ").trim())}-${property.ListingId}`}
                  className="link-btn"
                >
                  <div className="single-listings-box">
                    <div className="listings-image">

                      <Image
                        src={property?.ListPictureURL || "https://picsum.photos/seed/picsum/790/200"}
                        alt="image"
                        width={790}
                        height={200}
                        style={{ objectFit: "cover", height: "200px" }}
                      />


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
                          <i className="flaticon-furniture-and-household"></i>
                          Beds {property.BedroomsTotal} | Bath {property.BathroomsFull}.{property.BathroomsHalf} |        {property.AreaTotal} Sq. ft
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
          </div>}
        </div>
      </section >

    </>
  );
};

export default SingleListingsContent;
