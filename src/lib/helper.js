import moment from 'moment-timezone';
import { createClient } from '@supabase/supabase-js';
// slugify 
import slugify from 'slugify';
import logger from '@/lib/logger';

export const baseUrl = process.env.BRIGHT_MLS_BASE_URL;
export const env = (key) => process.env[key]
export const ITEMS_PER_PAGE = parseInt(process.env.NEXT_PUBLIC_ITEMS_PER_PAGE, 10) || 21;
export const TOKEN_KEY = "brightmls_token";

const _supabaseClients = new Map();

/**
 * Initialize Supabase client with site data (Public info)
 * Used on client side when site configuration is loaded
 */
export function initSupabaseWithSiteData(siteData) {
  if (siteData?.db?.url && siteData?.db?.anon_key) {
    if (!_supabaseClients.has(siteData.db.url)) {
      logger.log('[Supabase] Initializing client side with dynamic site data');
      _supabaseClients.set(siteData.db.url, createClient(siteData.db.url, siteData.db.anon_key));
    }
    return _supabaseClients.get(siteData.db.url);
  }
  return null;
}

async function initSupabaseDynamic() {
  const isServer = typeof window === 'undefined';
  let url = process.env.NEXT_PUBLIC_AUTH_URL || null;
  let key = process.env.INTERNAL_API_KEY || null;
  let domainKey = "default";

  if (isServer) {
    try {
      let domain = "";
      try {
        const { headers } = await import('next/headers');
        const headersList = await headers();
        domain = headersList.get('host') || "";
      } catch (e) {
        logger.warn('Could not get host from headers in helper.js');
      }
      const cleanDomain = domain.replace(/^www\./, '');
      domainKey = cleanDomain || "default";

      if (_supabaseClients.has(domainKey)) {
        return _supabaseClients.get(domainKey);
      }

      const siteSlug = process.env.NEXT_PUBLIC_SLUG || cleanDomain.split('.')[0] || 'oceancity-private';
      const { query } = await import('@/lib/db');

      let sites = null;
      if (cleanDomain && cleanDomain.length > 3) {
        const siteRes = await query('SELECT short_state, state_database_id FROM live_sites WHERE url ILIKE $1 LIMIT 1', [`%${cleanDomain}%`]);
        if (siteRes.rows.length > 0) sites = siteRes.rows;
      }

      if (!sites || sites.length === 0) {
        const siteRes = await query('SELECT short_state, state_database_id FROM live_sites WHERE slug = $1 LIMIT 1', [siteSlug]);
        if (siteRes.rows.length > 0) sites = siteRes.rows;
      }

      if (sites && sites.length > 0) {
        const site = sites[0];
        const dbId = site.state_database_id;

        let dbRes;
        if (dbId) {
          dbRes = await query('SELECT supabase_url, supabase_anon_key, supabase_service_key, state_name FROM state_databases WHERE id = $1 AND is_active = true LIMIT 1', [dbId]);
        }

        if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
          const dbCreds = dbRes.rows[0];
          url = dbCreds.supabase_url;
          key = dbCreds.supabase_service_key || dbCreds.supabase_anon_key;
          logger.log('[Supabase] Successfully loaded credentials for:', dbCreds.state_name);
        } else {
          logger.warn('[Supabase] No state_databases entry found for dbId:', dbId);
        }
      } else {
        logger.warn('[Supabase] No database configuration found for domain:', cleanDomain, 'slug:', siteSlug);
      }
    } catch (err) {
      console.error('[Supabase] Dynamic Supabase lookup error:', err);
    }
  }

  if (!url || !key) return null;

  if (_supabaseClients.has(url)) {
    const client = _supabaseClients.get(url);
    if (domainKey !== 'default') _supabaseClients.set(domainKey, client);
    return client;
  }

  const newClient = createClient(url, key, {
    fetchOptions: {
      timeout: 10000,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate",
      }
    },
  });

  _supabaseClients.set(url, newClient);
  if (domainKey !== 'default') _supabaseClients.set(domainKey, newClient);
  return newClient;
}

function getSupabaseClient() {
  if (typeof window !== 'undefined') {
    return null;
  }
  return null;
}

export async function getSupabaseAdmin() {
  return await initSupabaseDynamic();
}

// Proxy so `supabase.from(...)` still works everywhere (Sync fallback)
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return a function that throws only when called, to avoid import-time crashes
      return (...args) => {
        throw new Error('Supabase client not initialized. Ensure env vars are set or await getSupabaseAdmin() on server.');
      };
    }
    return client[prop];
  }
});
export const decodeAndLowercase = (value) => value ? decodeURIComponent(value).toLowerCase() : null;

export function getSiteName(siteConfig) {
  let siteName = siteConfig?.site_name || siteConfig?.slug || process.env.NEXT_PUBLIC_SITE_NAME || 'Realty Directions';
  if (siteName && siteName.toLowerCase() === siteConfig?.slug?.toLowerCase() && !siteName.toLowerCase().includes('directions')) {
    siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1) + " Directions";
  } else if (siteName && !siteName.toLowerCase().includes('.com')) {
    siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
  }
  // Remove spaces in domain-style names: "Frederick Directions.com" → "FrederickDirections.com"
  if (siteName.toLowerCase().includes('.com')) {
    siteName = siteName.replace(/\s+/g, '');
  }
  return siteName;
}


export function transformString(string) {
  return string
    .split('_')                // Split by underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word 
    .join(' ');                // Join them back with a space
}

export function ucwords(s, decode = false) {
  if (!s) {
    return s;
  }
  let str = s?.toLowerCase();
  str = decode ? decodeURIComponent(str) : str;
  return (str + '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
    return $1.toUpperCase();
  });
}
export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function formatTime(hour, minute) {
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const adjustedHour = hour % 12 || 12; // Convert 0 or 12 to 12, and 13-23 to 1-11
  const formattedMinute = minute.toString().padStart(2, '0');
  return `${adjustedHour}:${formattedMinute} ${ampm}`;
};

export function formatWorkHours(workTime) {
  if (!workTime || !workTime.timetable) return { status: 'Not Available', timings: '' };

  // Get the current day (e.g., 'monday', 'tuesday')
  const currentDay = moment.tz('America/New_York').format('dddd').toLowerCase(); // Example: New York time zone

  // Extract the work hours for the current day
  const todaysHours = workTime.timetable[currentDay];
  if (!todaysHours || todaysHours.length === 0) return { status: 'Currently Closed', timings: '' };

  const formatTime = (hour, minute) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 hour to 12
    const formattedMinute = minute < 10 ? '0' + minute : minute;
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  };

  // Get current time in the specified time zone
  const now = moment.tz('America/New_York');

  // Check the open and close times
  const hours = todaysHours[0]; // Assuming only one session per day
  const openTime = moment.tz({ hour: hours.open.hour, minute: hours.open.minute }, 'America/New_York');
  const closeTime = moment.tz({ hour: hours.close.hour, minute: hours.close.minute }, 'America/New_York');

  const open = formatTime(hours.open.hour, hours.open.minute);
  const close = formatTime(hours.close.hour, hours.close.minute);

  let status = '';
  if (now.isBefore(openTime) || now.isAfter(closeTime)) {
    status = 'Currently Closed';
  } else {
    status = 'Currently Open';
  }

  return {
    status,
    timings: `${open} - ${close}`
  };
}

export function renderStarRating(ratingInput = 0) {
  let rating = 0;
  if (ratingInput && typeof ratingInput === 'object') {
    rating = Number(ratingInput.value || ratingInput.rating || ratingInput.stars || 0);
  } else if (ratingInput) {
    rating = Number(ratingInput);
  }

  if (isNaN(rating) || rating < 0) rating = 0;
  if (rating > 5) rating = 5;

  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.05;
  const emptyStars = Math.max(0, 5 - fullStars - (halfStar ? 1 : 0));

  return (
    <>
      {[...Array(fullStars)].map((_, index) => (
        <span key={index * Math.random()} className="bx bxs-star checked"></span>
      ))}
      {halfStar && <span className="bx bxs-star-half checked"></span>}
      {[...Array(emptyStars)].map((_, index) => (
        <span key={index * Math.random()} className="bx bxs-star"></span>
      ))}
    </>
  );
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at indices i and j
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function randomGrid() {
  const x = [
    shuffleArray([3, 3, 6]),
    [6, 6],
    shuffleArray([8, 4]),
    [4, 4, 4],
  ];
  return x[Math.floor(Math.random() * x.length)]
}


export const fetchCategories = {
  "sale": "Residential",
  "rent": "Residential Lease",
  "land": "Land",
  "multi": "Multi-Family",
  "commercial": "Commercial Sale",
  "commercial-lease": "CommercialLease",
}
export const fetchMLSStatus = {
  "default": "'ACTIVE-BRIGHT','COMING SOON-BRIGHT','ACTIVE UNDER CONTRACT-BRIGHT','PENDING-BRIGHT'",
  "coming_soon": "'COMING SOON-BRIGHT'",
  "active": "'ACTIVE-BRIGHT'",
  "pending": "'PENDING-BRIGHT'",
  "under_contract": "'ACTIVE UNDER CONTRACT-BRIGHT'",
  "closed": "'CLOSED-BRIGHT'"
}
export const convertOrder = (orderBy) => {

  if (orderBy) {
    const map = {
      'price': 'ListPrice',
      'sqrft': 'AreaTotal',
      'bedroom': 'BedroomsTotal',
    }
    for (const [key, value] of Object.entries(map)) {
      if (orderBy.includes(key)) {
        const [order, dir] = orderBy.split('_');
        // logger.log(`${value} ${dir}`)
        return `${value} ${dir}`
      }
    }
  }

  return 'StandardStatus asc,DaysOnMarket asc';
}

export const realtySlug = (property) => {
  const { ListingKey, ListingId, UnparsedAddress, FullStreetAddress, City, StateOrProvince, PostalCode, County } = property;

  let addressStr;

  // BrightMLS UnparsedAddress already includes county: "STREET,CITY,STATE,ZIP,COUNTY"
  // Use it directly when it has a proper street number.
  if (UnparsedAddress && /\d/.test(UnparsedAddress) && UnparsedAddress.replace(/,/g, '').trim().length > 10) {
    addressStr = UnparsedAddress;
  } else {
    // UnparsedAddress is broken (e.g. "MD,ANNE ARUNDEL") — build from structured fields + county
    const parts = [FullStreetAddress, City, StateOrProvince, PostalCode].filter(Boolean);
    if (County && StateOrProvince) {
      const countyName = County.replace(new RegExp(`-${StateOrProvince.toLowerCase()}$`, 'i'), '').trim();
      if (countyName) parts.push(countyName);
    } else if (County) {
      const countyName = County.replace(/-[a-z]{2}$/i, '').trim();
      if (countyName) parts.push(countyName);
    }
    addressStr = parts.length > 0 ? parts.join(' ') : (UnparsedAddress || 'unknown');
  }

  return `/realty/${ListingKey}--${slugify(addressStr.replace(/,/g, ' '), {
    lower: true,
    strict: true,
  })}-${ListingId}`;
}

// Returns the best display address for a property.
// BrightMLS UnparsedAddress includes county: "364 CHESSINGTON DR,ODENTON,MD,21113,ANNE ARUNDEL"
// Use it directly when it has a proper street number.
// Fallback to FullStreetAddress+City+State+Zip when UnparsedAddress is broken ("MD,ANNE ARUNDEL").
export const getDisplayAddress = (property) => {
  if (!property) return '';
  const { UnparsedAddress, FullStreetAddress, City, StateOrProvince, PostalCode } = property;
  const unparsed = UnparsedAddress || '';
  if (unparsed && /\d/.test(unparsed) && unparsed.replace(/,/g, '').trim().length > 10) {
    return unparsed.replace(/,/g, ', ').trim();
  }
  return [FullStreetAddress, City, StateOrProvince, PostalCode].filter(Boolean).join(', ') || unparsed;
};

export function toGeoJSONPointsRealty(data) {
  if (!data || data.length === 0) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  return {
    type: 'FeatureCollection',
    features: data.map(item => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.Longitude, item.Latitude],
      },
      properties: {
        id: item.ListingId,
        name: item.UnparsedAddress,
        slug: item.ListingKey,
        address: item.FullStreetAddress,
        state: item.StateOrProvince,
        city: item.City,
        zip: item.PostalCode,
        category_name: item.PropertyType,
        mainImage: item.ListPictureURL,
        popupContent: `
           <div class="card text-white border-0" style="width: 200px; overflow: hidden; position: relative;">
            <img src="${item.ListPictureURL}" alt="Image" class="card-img" style="height: 150px; object-fit: cover;">
            <div class="card-img-overlay d-flex flex-column justify-content-end p-2" style="background: rgba(0, 0, 0, 0.4);">
              <h6 class="text-white">${item.UnparsedAddress.replace(/,/ig, ", ")}</h6>
              <a href="${realtySlug(item)}" class="btn btn-primary btn-sm w-100" target="_blank">View Details</a>
            </div>
          </div>`
      },
    })),
  };
}

export function toGeoJSONPoints(data) {
  if (!data || data.length === 0) {
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }

  return {
    type: 'FeatureCollection',
    features: data.map((item) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [item.longitude, item.latitude],
      },
      properties: {
        id: item.id,
        name: item.title || "No Name",
        slug: item.slug,
        address: item.address,
        state: item.state,
        city: item.city,
        zip: item.zip,
        category_name: item.categories?.name || "Unknown",
        subcategory_name: item.subcategories?.name || "Unknown",
        main_image: item.main_image,
        popupContent: `
          <div class="card text-white border-0" style="width: 200px; overflow: hidden; position: relative;">
            <img src="/api/og?title=${encodeURIComponent(item.title || "No Name")}" alt="Image" class="card-img" style="height: 150px; object-fit: cover;">
            <div class="card-img-overlay d-flex flex-column justify-content-end p-2" style="background: rgba(0, 0, 0, 0.4);">
              <h6 class="text-white">${item.title || "No Name"}</h6>
              <a href="/s/${item.slug}" class="btn btn-primary btn-sm w-100" target="_blank">View Details</a>
            </div>
          </div>`
      },
    })),
  };
}



export const videohomes = async (host, featured = false, type = 'property') => {

  const response = await fetch(`https://www.videohomes.com/api/videos/${host}${featured ? `/featured?${`type=${type}`}` : ''}`, {
    next: { revalidate: 3600, tags: [host] } // Cache for 1 hour with tag for manual revalidation
  });
  const result = await response.json();
  return result;
}


export function distanceMiles(lat1, lon1, lat2, lon2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
export const transformRealtyCounty = (county) => {
  if (!county) return county;
  // Replace hyphens/underscores with spaces (handle URL slugs like "anne-arundel")
  let c = county.trim().replace(/[-_]/g, ' ');
  // Strip " County" suffix — BRIGHTCounty uses bare name e.g. 'anne arundel-md' not 'anne arundel county-md'
  c = c.replace(/\s+county$/i, '').trim().toLowerCase();
  // Strip apostrophes — OData filter breaks on them, BrightMLS stores "prince georges-md" not "prince george's-md"
  c = c.replace(/'/g, '');
  // Normalize saint/st variants
  if (c === 'st marys' || c === 'saint marys') return 'saint marys';
  return c;
}
