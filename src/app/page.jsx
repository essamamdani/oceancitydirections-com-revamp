import { Suspense, cache } from 'react';
import { redirect } from 'next/navigation';

import ListingAreaTwo from '@/components/Common/ListingAreaTwo';
import CategoryTwo from '@/components/Common/CategoryTwo';
import HowItWorks from '@/components/Common/HowItWorks';
import Banner from '@/components/HomeFour/Banner';
import Destinations from '@/components/HomeFour/Destination';
import HomepageListings from '@/components/HomeFour/HomepageListings';
import ContactInfo from '@/components/Contact/ContactInfo';
import FeaturedVideo from '@/components/HomeFour/featurevideo';
import Navbar from '@/components/Layouts/Navbar';

import { getBestRatedBusiness } from '@/lib/actions';
import { fetchSiteData, getSiteStatus } from '@/lib/site-config';
import { ucwords } from '@/lib/helper';
import { query } from '@/lib/db';

// Deduplicate fetchSiteData across generateMetadata + Page within the same request
const getSiteDataOnce = cache(fetchSiteData);

// ─── Featured Videos Section ───────────────────────────────────────────────────
// Fetches featured videos directly from auth database for the current site
async function FeaturedVideosSection({ site }) {
  try {
    // Get site ID from live_sites table
    const siteRes = await query(
      'SELECT id FROM live_sites WHERE slug = $1 OR url ILIKE $2 LIMIT 1',
      [site?.slug, `%${site?.domain || site?.URL}%`]
    );
    
    const siteId = siteRes?.rows?.[0]?.id;
    if (!siteId) return null;
    
    // Fetch featured videos for this site from auth DB
    const videosRes = await query(
      `SELECT 
        v.id,
        v.video_id,
        v.title,
        v.description,
        v.thumbnail,
        v.video_url,
        v.mls_id,
        v.p_id_b_slug,
        v.embeded_for,
        v.source_business_slug
      FROM videos v
      WHERE v.featured_video = true 
        AND v.featured_type IN ('home_page', 'home_and_listing')
        AND v.is_video_approved = true
        AND v.featured_site_ids::jsonb @> to_jsonb($1::int)
      ORDER BY v.created_at DESC
      LIMIT 6`,
      [siteId]
    );
    
    const videos = videosRes?.rows || [];
    if (!videos.length) return null;
    
    // Format videos for FeaturedVideo component
    const formattedVideos = videos.map(v => ({
      video_id: v.video_id,
      title: v.title || 'Untitled',
      description: v.description,
      thumbnail: v.thumbnail,
      siteurl: site?.domain || site?.URL?.replace('https://www.', ''),
      p_id_b_slug: v.p_id_b_slug,
      mls_id: v.mls_id,
      embeded_for: v.embeded_for
    }));
    
    return (
      <div className="blog-area bg-f9f9f9 ptb-100">
        <FeaturedVideo videos={formattedVideos} />
      </div>
    );
  } catch (err) {
    console.error('[FeaturedVideosSection] Error fetching videos:', err);
    return null;
  }
}

// ─── Per-request server component: best-rated restaurants ────────────────────
// getBestRatedBusiness calls getSupabaseAdmin() which reads request headers,
// so it cannot use 'use cache'. It runs per-request but is a fast DB query (~50ms).
// Wrapped in Suspense so it doesn't block the page shell.
async function RestaurantsSection({ site }) {
  const businesses = await getBestRatedBusiness(site, 'restaurant');
  if (!businesses?.length) return null;
  return (
    <div className="pb-100">
      <ListingAreaTwo
        businesses={businesses}
        categoryLink="/business/category/restaurant"
        title="Restaurants: Top Listings"
      />
    </div>
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata() {
  let site;
  try {
    site = await getSiteDataOnce();
  } catch {
    site = { Status: 'offline' };
  }

  let siteName = site?.site_name || site?.slug || process.env.NEXT_PUBLIC_SITE_NAME || 'Realty Directions';
  if (siteName && siteName.toLowerCase() === site?.slug?.toLowerCase() && !siteName.toLowerCase().includes('directions')) {
    siteName = ucwords(siteName) + ' Directions';
  } else if (siteName && !siteName.toLowerCase().includes('.com')) {
    siteName = ucwords(siteName);
  }

  const state = site?.state || 'your city';
  const description = `${siteName} - Find businesses, real estate, and local attractions in ${state}.`;

  return {
    title: `${siteName} - Home`,
    description,
    openGraph: {
      title: `${siteName} - Home`,
      description,
      url: `https://${site?.domain || 'oceancitydirections.com'}`,
      siteName,
      images: [
        {
          url: site?.logo || `https://cdnlogos.realtydirections.com/${site?.domain}/logo.svg`,
          width: 800,
          height: 600,
          alt: `${siteName} Logo`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    alternates: {
      canonical: `https://${site?.domain || 'oceancitydirections.com'}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function Page() {
  let site;
  try {
    // Reuses the same in-flight request as generateMetadata — no second DB hit
    site = await getSiteDataOnce();
  } catch {
    site = { Status: 'offline' };
  }

  const siteStatus = getSiteStatus(site);

  if (siteStatus === 'parked') redirect('/parked');
  if (siteStatus === 'offline') redirect('/offline');

  const showRealty = !!site?.IncludeRealty;

  return (
    <>
      <Navbar />
      <Banner />

      {showRealty && <Destinations titleTwo={true} />}

      {/* Featured Videos from VideoHomes API */}
      <Suspense fallback={<div className="pb-100" style={{ minHeight: '300px' }}></div>}>
        <FeaturedVideosSection site={site} />
      </Suspense>

      {/* MLS listings: fetched client-side on page load */}
      {showRealty && <HomepageListings />}

      <div className="bg-f9f9f9" style={{ minHeight: '600px' }}>
        <CategoryTwo titleTwo={true} />
      </div>

      {/* Restaurants: fast per-request Supabase query, doesn't block page shell */}
      <Suspense fallback={<div className="pb-100" style={{ minHeight: '300px' }}></div>}>
        <RestaurantsSection site={site} />
      </Suspense>

      <div style={{ minHeight: '400px' }}>
        <HowItWorks bgColor="bg-f9f9f9" />
      </div>
      <ContactInfo />
    </>
  );
}
