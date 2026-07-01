"use client";
import React, { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ucwords } from '@/lib/helper';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/Common/ConfirmModal';

function renderStarRating(rating = 0) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.05;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <>
      {[...Array(fullStars)].map((_, index) => (
        <i key={index} className="bx bxs-star checked"></i>
      ))}
      {hasHalfStar && <i className="bx bxs-star-half checked"></i>}
      {[...Array(emptyStars)].map((_, index) => (
        <i key={index} className="bx bx-star"></i>
      ))}
    </>
  );
}

// ─── Claim Button Component ──────────────────────────────────────────────
function ClaimButton({ business }) {
  const { user } = useAuth();
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClaim = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (business.claimed_approval) {
      router.push(user ? `/dashboard/edit-business/${business.id}` : '/login');
      return;
    }

    // Always show the confirm popup first (logged in or not)
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);

    if (!user) {
      // Not logged in — save redirect intent and go to register
      localStorage.setItem('claim_redirect', `/s/${business.update_slug || business.slug}`);
      localStorage.setItem('claim_business_id', business.id);
      router.push('/register');
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Claim request submitted! Admin will review shortly.');
      } else {
        toast.error(data.error || 'Failed to claim business');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const isClaimed = business.claimed_approval;

  return (
    <>
      <ConfirmModal
        isOpen={showModal}
        title={isClaimed ? 'Business Claimed' : `Claim "${business.title}"`}
        message={
          isClaimed
            ? `This business has already been claimed.`
            : `Do you want to claim "${business.title}"?\n\nAfter verifying, you'll be able to edit this business information.\n\nCreate a Free Account to get started.`
        }
        confirmText={user ? 'Yes, Claim' : 'Login / Register'}
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        onClose={() => setShowModal(false)}
      />
      {isClaimed ? (
        <span className="claim-btn claimed" aria-label="Claimed" title="This business has been claimed and verified">
          <i className="bx bxs-badge-check"></i>
          Claimed
        </span>
      ) : (
        <button
          type="button"
          className="claim-btn"
          aria-label="Claim this business"
          title="Claim this business"
          onClick={handleClaim}
          disabled={claiming}
          style={{ opacity: claiming ? 0.7 : 1 }}
        >
          <i className="bx bx-purchase-tag-alt"></i>
          {claiming ? 'Claiming…' : 'Unclaimed'}
        </button>
      )}
    </>
  );
}

// ─── Watchlist/Favorite Button Component ──────────────────────────────────
function WatchlistButton({ business }) {
  const { user } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      localStorage.setItem('watchlist_redirect', window.location.pathname + window.location.search);
      toast('Please login to add to watchlist', { icon: '🔐' });
      router.push('/login');
      return;
    }

    setSaving(true);
    try {
      // TODO: Implement watchlist API
      // For now, just toggle local state
      setSaved(!saved);
      toast.success(saved ? 'Removed from watchlist' : 'Added to watchlist');
    } catch (err) {
      toast.error('Failed to update watchlist');
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      type="button"
      className="bookmark-save"
      aria-label={saved ? 'Remove from watchlist' : 'Add to watchlist'}
      title={saved ? 'In watchlist' : 'Add to watchlist'}
      onClick={handleToggle}
      disabled={saving}
    >
      <i className={saved ? 'flaticon-heart-1' : 'flaticon-heart'}></i>
    </button>
  );
}

// ─── Business Card Info ────────────────────────────────────────────────────
function isNew(createdAt) {
  if (!createdAt) return false;
  return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24) <= 30;
}

function BusinessInfo({ business }) {
  return (
    <div className="listings-content">
      <div className="rd-card-topline">
        <span className="rd-card-category">
          {business.categories?.name || business.category || "Local Business"}
        </span>
        <span className="rd-card-status">
          {business.claimed_approval ? "Verified listing" : "Owner can claim"}
        </span>
      </div>
      <h3>
        <Link href={`/s/${business.update_slug || business.slug}`}>
          {business?.title}
        </Link>
      </h3>

      {isNew(business.created_at) && (
        <span className="status" style={{ background: '#17a2b8', color: '#fff', borderColor: '#17a2b8' }}>
          <i className="bx bx-star"></i> New
        </span>
      )}

      <ul className="rd-card-meta">
        <li>
          <i className="bx bx-map" aria-hidden="true"></i>
          <Link href={`/business/location/${business?.county?.toLowerCase()}/${business?.city?.toLowerCase()}`}>
            {business.address || `${ucwords(business?.city)}, ${ucwords(business?.state)}`}
          </Link>
        </li>
        {business.phone && (
          <li>
            <i className="bx bx-phone" aria-hidden="true"></i>
            <a href={`tel:${business.phone}`}>{business.phone.replace("+1", "")}</a>
          </li>
        )}
        {business?.description && (
          <li>
            <i className="bx bx-message-square-detail" aria-hidden="true"></i>
            <span>{business.description.slice(0, 145)}{business.description.length > 145 ? "..." : ""}</span>
          </li>
        )}
      </ul>
    </div>
  );
}

function BusinessImageFallback({ business, index }) {
  const title = business?.title || 'Local Business';

  return (
    <div className={`biz-logo logo-${(index ?? 0) % 4}`} style={{ height: '200px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0' }}>
      {title}
    </div>
  );
}

// ─── Main GridBlock Component ───────────────────────────────────────────────
const GridBlock = ({ businesses, featured_videos }) => {
  return (
    <>
      {featured_videos?.map((video) => (
        <div className="single-listings-box rd-business-card" key={video.video_id}>
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
                aria-label={`View details for ${video.title}`}
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
                <Link href={video.embeded_for === 'property'
                  ? `/realty/${video.p_id_b_slug}`
                  : `https://www.${video.siteurl}/s/${video.p_id_b_slug || video.slug}`}>
                  {video.title}
                </Link>
              </h3>
            </div>
        </div>
      ))}

      {businesses?.filter((b) => !b?.deleted_at).map((business, index) => {
        const listingImg = business.main_image;
        const isCdn = listingImg && 
          (listingImg.startsWith('http') || listingImg.includes('cdn')) && 
          !listingImg.startsWith('/api/og') && 
          !listingImg.includes('placeholder') &&
          listingImg !== '/images/about-img.jpg';
        return (
        <div className="single-listings-box rd-business-card" key={business.id}>
            <div className="listings-image">
              {isCdn ? (
                <Image
                  src={listingImg}
                  alt={business?.title || "image"}
                  width={790}
                  height={200}
                  priority={index < 4}
                  style={{ objectFit: "cover", height: "200px" }}
                />
              ) : (
                <BusinessImageFallback business={business} index={index} />
              )}
              <Link
                href={`/s/${business.update_slug || business.slug}`}
                className="link-btn"
                aria-label={`View details for ${business?.title || 'business'}`}
              ></Link>

              {/* Blue: Watchlist/Favorite */}
              <WatchlistButton business={business} />

              {/* Red: Claim button */}
              <ClaimButton business={business} />
            </div>

            {/* Green: Full info with address + rating */}
            <BusinessInfo business={business} />
        </div>
        );
      })}
    </>
  );
};

export default GridBlock;
