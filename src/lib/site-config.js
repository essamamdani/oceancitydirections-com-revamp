// src/lib/site-config.js
// Multi-domain tenant support - Get site config based on domain

import { headers } from 'next/headers';
import { query } from '@/lib/db';
import { getCountyNameVariants } from '@/lib/county-names';
import logger from '@/lib/logger';

/**
 * Get current domain from request headers
 */
export async function getCurrentDomain() {
  const headersList = await headers();
  return headersList.get('host') || '';
}

/**
 * Get site slug from domain (fallback method)
 * Extracts slug from domain pattern: [slug]directions.com
 */
export function getSlugFromDomain(hostname) {
  // Extract from domain pattern: [slug]directions.com
  const match = hostname.match(/^([a-z-]+)directions\.com$/i);
  if (match) {
    return match[1].toLowerCase();
  }
  
  // Extract from Vercel preview domain pattern
  const vercelMatch = hostname.match(/^([a-z-]+)-[a-z0-9]+\.vercel\.app$/i) || hostname.match(/^([a-z-]+)\.vercel\.app$/i);
  if (vercelMatch) {
     const projectName = vercelMatch[1];
     if (process.env.NEXT_PUBLIC_SLUG) {
        return process.env.NEXT_PUBLIC_SLUG.toLowerCase();
     }
     const slugMatch = projectName.match(/^([a-z-]+)directions/i);
     if (slugMatch) return slugMatch[1].toLowerCase();
  }
  
  // Remove www. and extract first part
  const cleanHost = hostname.replace(/^www\./, '');
  const parts = cleanHost.split('.');
  if (parts.length >= 2) {
    return parts[0].toLowerCase();
  }
  
  return null;
}

/**
 * Fetch site configuration by domain from auth service
 */
export async function fetchSiteConfigByDomain(domain) {
  try {
    if (!domain) {
      logger.warn('Domain is required');
      return null;
    }
    
    // Remove www. prefix for consistency
    const cleanDomain = domain.replace(/^www\./, '');
    
    // DIRECT DB QUERY (Replaces API Call)
    let site = null;
    try {
      let siteRes = await query('SELECT * FROM live_sites WHERE url ILIKE $1 LIMIT 1', [`%${cleanDomain}%`]);
      site = siteRes.rows[0];

      if (!site) {
        let slug = getSlugFromDomain(cleanDomain);
        if (!slug && process.env.NEXT_PUBLIC_SLUG) {
          slug = process.env.NEXT_PUBLIC_SLUG.toLowerCase();
        }
        if (slug) {
          siteRes = await query('SELECT * FROM live_sites WHERE slug = $1 LIMIT 1', [slug]);
          site = siteRes.rows[0];
        }
      }
    } catch(err) {
      logger.error('[fetchSiteConfigByDomain] Database query error:', err);
    }

    if (!site) {
       logger.warn('Site not found for domain:', cleanDomain);
       return null;
    }
    
    // Construct the payload to exactly match what the API used to return
    // 1. Build hero images
    const slides = {
      swiper: site.hero_images && site.hero_images.length > 0 
        ? site.hero_images.map(img => ({ img: img.url || img }))
        : site.hero_image ? [{ img: site.hero_image }] : []
    };

    const logoUrl = site.logo || `https://cdnlogos.realtydirections.com/${site.slug}directions.com/logo.svg`;

    // 2. Counties
    let countiesList = [];
    let displayCountiesList = []; // original names as stored in DB, for frontend display only
    let countiesWithImages = [];

    if (site.counties_jsonb && site.counties_jsonb.length > 0) {
      const expandedCounties = new Set();
      countiesWithImages = site.counties_jsonb.map(c => {
        const countyName = c.name || c.county_name || c;
        const nameVariants = getCountyNameVariants(countyName);
        nameVariants.forEach(v => expandedCounties.add(v));
        return {
          name: countyName,
          name_variants: nameVariants,
          short_name: nameVariants[0],
          full_name: nameVariants[1] || nameVariants[0],
          image: c.image_url || c.image || null,
          slug: c.slug || countyName.toLowerCase().replace(/\s+/g, '-'),
          ...c
        };
      });
      countiesList = Array.from(expandedCounties);
      displayCountiesList = site.counties_jsonb.map(c => {
        const n = typeof c === 'string' ? c : (c.name || c.county_name || '');
        return n.toLowerCase();
      }).filter(Boolean);
    } else {
      try {
          const expandedCounties = new Set();

          if (site.counties) {
             site.counties.split(',').forEach(c => {
                const name = c.trim();
                if (name) {
                   const variants = getCountyNameVariants(name);
                   variants.forEach(v => expandedCounties.add(v));
                   displayCountiesList.push(name.toLowerCase());
                }
             });
          }

          countiesList = Array.from(expandedCounties);
      } catch(err) {}
    }

    // 3. State info
    let state = '';
    let shortState = '';
    if (site.states_jsonb && site.states_jsonb.length > 0) {
      state = site.states_jsonb[0].name || '';
      shortState = site.states_jsonb[0].short_name || '';
    } else {
      state = site.state || '';
      shortState = site.short_state || '';
    }

    // 4. Active sites list
    let sitesList = [];
    try {
      const activeRes = await query("SELECT slug, url, state, short_state, status, logo FROM live_sites WHERE status IN ('active', 'live_realty', 'live_no_realty')");
      sitesList = (activeRes.rows || []).map(s => {
        const sDomain = `${s.slug}directions.com`;
        return {
          slug: s.slug,
          url: s.url,
          logo: s.logo || `https://cdnlogos.realtydirections.com/${sDomain}/logo.svg`,
          state: s.state || '',
          shortState: s.short_state || ''
        };
      });
    } catch(err) { logger.error(err); }

    const data = {
      id: site.id,
      live_site_id: site.id,
      site_name: site.site_name,
      slug: site.slug,
      Slug: site.slug,
      URL: site.url,
      Status: site.status,
      Counties: countiesList.join(', '),
      State: state,
      ShortState: shortState?.toLowerCase() || '',
      IncludeRealty: site.include_realty,
      "GA Analytics ID": site.ga_analytics_id,
      "Analytics ID": site.analytics_id,
      StateLowerCase: state?.toLowerCase() || '',
      DefaultCounties: countiesList.map(name => name.toLowerCase()),
      DisplayCounties: displayCountiesList,
      center: site.center,
      zoom: site.zoom,
      coordinate: site.coordinate,
      extra: site.extra,
      slides: slides,
      logo: logoUrl,
      sites: sitesList,
      videos: [],
      popular_cities: countiesWithImages,
      turnstile_site_key: site.turnstile_site_key,
      turnstile_secret_key: site.turnstile_secret_key,
      _debug: {
        counties_count: countiesList.length,
        counties_with_images: countiesWithImages.length,
        hero_images_count: slides.swiper.length,
        slug: site.slug,
        schema: 'jsonb',
        requested_domain: domain,
        clean_domain: cleanDomain,
        logo_source: site.logo ? 'live_sites_table' : 'cdn_fallback'
      }
    };
    
    try {
        let dbRes;
        if (site.state_database_id) {
            dbRes = await query('SELECT supabase_url, supabase_anon_key FROM state_databases WHERE id = $1 AND is_active = true LIMIT 1', [site.state_database_id]);
        }
        if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
            const dbCreds = dbRes.rows[0];
            data.db = {
               url: dbCreds.supabase_url,
               anon_key: dbCreds.supabase_anon_key
            };
        }
    } catch(err) {
        logger.error('Error fetching DB credentials directly via Auth DB:', err);
    }

    // Add domain to response for reference
    return {
      ...data,
      domain: cleanDomain,
      fullDomain: domain,
    };
  } catch (error) {
    logger.error('Error fetching site config:', error);
    return null;
  }
}

/**
 * Fetch default site configuration using environment variables
 * Backward compatibility for fetchSiteData()
 */
export async function fetchSiteData() {
  let domain = "";
  if (typeof window === 'undefined') {
    try {
      const headersList = await headers();
      const host = headersList.get('host');
      if (host) domain = host;
    } catch(e) {}
  } else {
    domain = window.location.hostname;
  }
  
  if (!domain && process.env.NEXT_PUBLIC_SLUG) {
    domain = `${process.env.NEXT_PUBLIC_SLUG}directions.com`;
  }
  
  const siteConfig = await fetchSiteConfigByDomain(domain);
  if (!siteConfig) {
    logger.warn(`[fetchSiteData] Failed to fetch site config for domain ${domain}. Returning offline fallback.`);
    return {
      Status: 'offline',
      status: 'offline',
      name: domain,
      domain: domain
    };
  }
  return siteConfig;
}

/**
 * Get site status
 */
export function getSiteStatus(siteConfig) {
  if (!siteConfig) return 'offline';
  
  const status = (siteConfig.Status || siteConfig.status)?.toLowerCase();
  
  if (status === 'active' && (siteConfig.include_realty || siteConfig.IncludeRealty)) {
    return 'live';
  }
  if (status === 'active' && !(siteConfig.include_realty || siteConfig.IncludeRealty)) {
    return 'live_no_realty';
  }
  if (status === 'parked') {
    return 'parked';
  }
  if (status === 'offline') {
    return 'offline';
  }
  
  return 'live';
}

export function isParked(siteConfig) {
  return getSiteStatus(siteConfig) === 'parked';
}

export function isOffline(siteConfig) {
  return getSiteStatus(siteConfig) === 'offline';
}

export function isLive(siteConfig) {
  const status = getSiteStatus(siteConfig);
  return status === 'live' || status === 'live_no_realty';
}

export function getSiteUrl(siteConfig) {
  if (siteConfig?.domain) {
    return `https://${siteConfig.domain}`;
  }
  return "";
}
