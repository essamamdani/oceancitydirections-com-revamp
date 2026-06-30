import { cache } from 'react';
import { redirect } from 'next/navigation';

import Navbar from "@/components/Layouts/Navbar";
import HomeRevamp from '@/components/Revamp/HomeRevamp';
import StructuredData from '@/components/SEO/StructuredData';

import { getBestRatedBusiness, getRecentClaimedBusinesses } from '@/lib/actions';
import { fetchSiteData, getSiteStatus } from '@/lib/site-config';
import { ucwords } from '@/lib/helper';
import { query } from '@/lib/db';

// Deduplicate fetchSiteData across generateMetadata + Page within the same request
const getSiteDataOnce = cache(fetchSiteData);

async function getFeaturedVideosForSite(site) {
  try {
    const siteRes = await query(
      'SELECT id FROM live_sites WHERE slug = $1 OR url ILIKE $2 LIMIT 1',
      [site?.slug, `%${site?.domain || site?.URL}%`]
    );
    
    const siteId = siteRes?.rows?.[0]?.id;
    if (!siteId) return [];
    
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
    if (!videos.length) return [];
    
    return videos.map(v => ({
      video_id: v.video_id,
      title: v.title || 'Untitled',
      description: v.description,
      thumbnail: v.thumbnail,
      siteurl: site?.domain || site?.URL?.replace('https://www.', ''),
      p_id_b_slug: v.p_id_b_slug,
      mls_id: v.mls_id,
      embeded_for: v.embeded_for
    }));
  } catch (err) {
    console.error('[getFeaturedVideosForSite] Error fetching videos:', err);
    return [];
  }
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
  const description = `${siteName} helps people search homes, local businesses, videos, services, and neighborhood information in ${state}.`;

  return {
    title: `${siteName} | Homes, Businesses, Local Videos & Neighborhood Guide`,
    description,
    keywords: [
      `${siteName} real estate`,
      `${siteName} businesses`,
      `${state} homes for sale`,
      `${state} local directory`,
      'Realty Directions',
    ],
    openGraph: {
      title: `${siteName} | Homes, Businesses, Local Videos & Neighborhood Guide`,
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
  const [featuredVideos, recentBusinesses] = await Promise.all([
    getFeaturedVideosForSite(site),
    getRecentClaimedBusinesses(site, 3).catch(() => []),
  ]);

  const siteName = ucwords(site?.site_name || site?.slug || 'Realty Directions');
  const domain = site?.domain || site?.URL?.replace(/^https?:\/\//, '').replace(/^www\./, '') || 'oceancitydirections.com';
  const homeSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `https://${domain}/#website`,
        name: siteName,
        url: `https://${domain}`,
        potentialAction: [
          {
            '@type': 'SearchAction',
            target: `https://${domain}/business?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
          showRealty ? {
            '@type': 'SearchAction',
            target: `https://${domain}/realty?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          } : null,
        ].filter(Boolean),
      },
      {
        '@type': 'RealEstateAgent',
        '@id': `https://${domain}/#realty-directions`,
        name: 'Realty Directions',
        url: 'https://www.realtydirections.com/',
        areaServed: site?.State || site?.state || 'United States',
      },
    ],
  };

  return (
    <>
      <Navbar variant="home" />
      <StructuredData data={homeSchema} />
      <HomeRevamp
        site={site}
        topBusinesses={recentBusinesses || []}
        featuredVideos={featuredVideos || []}
        showRealty={showRealty}
      />
    </>
  );
}
