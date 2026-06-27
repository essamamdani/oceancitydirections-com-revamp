import { fetchSiteConfigByDomain, getSiteStatus } from '@/lib/site-config';
import { fetchMLS } from '@/lib/actions';
import { fetchMLSStatus, transformRealtyCounty, realtySlug } from '@/lib/helper';
import { NextResponse } from 'next/server';
import { notFound } from 'next/navigation';


export const maxDuration = 300;
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const LIMIT = 50000;

function now() {
  return new Date().toISOString();
}

function xmlResponse(xml) {
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function generateUrlset(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(r => `  <url>
    <loc>${r.url}</loc>
    <lastmod>${r.lastmod}</lastmod>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
}

function generateIndex(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${now()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
}

function buildStaticUrls(baseUrl, status, realtyEnabled) {
  const urls = [
    { url: baseUrl, lastmod: now(), priority: 1 },
    { url: `${baseUrl}/about`, lastmod: now(), priority: 0.8 },
    { url: `${baseUrl}/listings`, lastmod: now(), priority: 0.9 },
    { url: `${baseUrl}/sell`, lastmod: now(), priority: 0.7 },
    { url: `${baseUrl}/login`, lastmod: now(), priority: 0.3 },
    { url: `${baseUrl}/register`, lastmod: now(), priority: 0.3 },
    { url: `${baseUrl}/terms`, lastmod: now(), priority: 0.2 },
  ];
  const isLive = status === 'live' || status === 'live_no_realty';
  if (isLive) {
    urls.push({ url: `${baseUrl}/business`, lastmod: now(), priority: 0.9 });
  }
  // Realty static pages go only into the dedicated realty sitemap (last index)
  return urls;
}

async function fetchCategoryUrls(adminClient, baseUrl, p_state, p_counties) {
  try {
    const { data, error } = await adminClient.rpc('get_businesses_extra_type', {
      p_state,
      p_county: p_counties,
      p_type: 'category',
      p_category_name: null,
      p_subcategory_name: null,
      p_city: null,
      p_zip: null,
      p_minimum: 1,
    });
    if (error || !Array.isArray(data)) return [];
    return data
      .filter(row => row?.name)
      .map(({ name }) => ({
        url: `${baseUrl}/business/category/${encodeURIComponent(name.toLowerCase())}`,
        lastmod: now(),
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

async function fetchLocationUrls(adminClient, baseUrl, p_state, siteConfig) {
  const urls = [];
  const defaultCounties = siteConfig?.DefaultCounties || [];

  // County-level pages — one per configured county
  for (const county of defaultCounties) {
    urls.push({
      url: `${baseUrl}/business/location/${encodeURIComponent(county.toLowerCase())}`,
      lastmod: now(),
      priority: 0.7,
    });
  }

  // City-level pages — one DB call per county (counties are typically few)
  for (const county of defaultCounties) {
    try {
      const { data } = await adminClient.rpc('get_businesses_extra_type', {
        p_state,
        p_county: [county.toLowerCase()],
        p_type: 'location',
        p_category_name: null,
        p_subcategory_name: null,
        p_city: null,
        p_zip: null,
        p_minimum: 1,
      });
      if (Array.isArray(data)) {
        for (const { name } of data) {
          if (name) {
            urls.push({
              url: `${baseUrl}/business/location/${encodeURIComponent(county.toLowerCase())}/${encodeURIComponent(name.toLowerCase())}`,
              lastmod: now(),
              priority: 0.6,
            });
          }
        }
      }
    } catch { }
  }

  return urls;
}

async function fetchBusinessCount(adminClient, p_state, p_counties) {
  try {
    const { count, error } = await adminClient
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('state_lower', p_state)
      .in('county_lower', p_counties)
      .eq('status', true);
    return error ? 0 : (count || 0);
  } catch {
    return 0;
  }
}

async function fetchBusinessSlices(adminClient, p_state, p_counties, offset, limit) {
  try {
    const { data, error } = await adminClient
      .from('businesses')
      .select('slug')
      .eq('state_lower', p_state)
      .in('county_lower', p_counties)
      .eq('status', true)
      .order('id')
      .range(offset, offset + limit - 1);
    return error ? [] : (data || []);
  } catch {
    return [];
  }
}

async function buildRealtySitemap(baseUrl, siteConfig) {
  const routes = [
    { url: `${baseUrl}/realty`, lastmod: now(), priority: 0.9 },
  ];

  const defaultShortState = siteConfig?.ShortState?.toLowerCase() || 'md';
  const defaultCounties = siteConfig?.DefaultCounties || [];

  // Realty county-level location pages
  for (const county of defaultCounties) {
    routes.push({
      url: `${baseUrl}/realty/location/${encodeURIComponent(county.toLowerCase())}`,
      lastmod: now(),
      priority: 0.7,
    });
  }

  try {
    const countyList = defaultCounties
      .map(c => `'${transformRealtyCounty(c)}-${defaultShortState}'`)
      .join(', ');
    const select = 'ListingKey,UnparsedAddress,ListingId,ModificationTimestamp,City,County';
    const filter = `StateOrProvince eq '${defaultShortState}' and County in (${countyList}) and MlsStatus in (${fetchMLSStatus['default']}) and DaysOnMarket le 180`;

    const listings = [];
    const maxLimit = 30000;
    const chunkSize = 10000;

    for (let skip = 0; skip < maxLimit; skip += chunkSize) {
      const encodedUrl = `BrightProperties?$format=json&$top=${chunkSize}&$skip=${skip}&$select=${select}&$filter=${filter}`.replace(/ /g, '%20');
      const mlsResult = await fetchMLS(siteConfig, encodedUrl);
      const chunk = mlsResult?.value || [];
      listings.push(...chunk);

      if (chunk.length < chunkSize) {
        break;
      }
    }

    // Unique realty city-level location pages extracted from listings
    const seenCities = new Set();
    for (const listing of listings) {
      if (!listing.County || !listing.City) continue;
      // BrightMLS County field comes as "worcester-md", strip state suffix for URL
      const rawCounty = listing.County.replace(new RegExp(`-${defaultShortState}$`, 'i'), '').trim();
      const cityKey = `${rawCounty}|${listing.City}`;
      if (!seenCities.has(cityKey)) {
        seenCities.add(cityKey);
        routes.push({
          url: `${baseUrl}/realty/location/${encodeURIComponent(rawCounty.toLowerCase())}/${encodeURIComponent(listing.City.toLowerCase())}`,
          lastmod: now(),
          priority: 0.6,
        });
      }
    }

    // Individual listing pages
    for (const listing of listings) {
      if ((!listing.FullStreetAddress && !listing.UnparsedAddress) || !listing.ListingKey) continue;
      routes.push({
        url: `${baseUrl}${realtySlug(listing)}`,
        lastmod: listing.ModificationTimestamp || now(),
        priority: 0.6,
      });
    }
  } catch (err) {
    console.error('[Sitemap] MLS error:', err);
  }

  return routes;
}

export async function GET(request, { params }) {
  try {
    const domain = request.headers.get('host') || '';
    const baseUrl = `https://${domain}`;

    const { sitemap } = await params;
    // sitemap values: "sitemap" (index) or "sitemap-0", "sitemap-1", etc.
    const dashIdx = sitemap.indexOf('-');
    const name = dashIdx === -1 ? sitemap : sitemap.slice(0, dashIdx);
    const idStr = dashIdx === -1 ? undefined : sitemap.slice(dashIdx + 1);

    if (name !== 'sitemap') {
      notFound();
    }

    const siteConfig = await fetchSiteConfigByDomain(domain);
    const status = getSiteStatus(siteConfig);

    // Parked / offline — minimal single sitemap
    if (status === 'parked' || status === 'offline') {
      if (idStr === '0') {
        return xmlResponse(generateUrlset([{ url: baseUrl, priority: 1, lastmod: now() }]));
      }
      if (idStr === undefined) {
        return xmlResponse(generateIndex([`${baseUrl}/sitemap-0.xml`]));
      }
      notFound();
    }

    const isLive = status === 'live' || status === 'live_no_realty';
    const realtyEnabled = status === 'live' && !!siteConfig?.IncludeRealty;

    const p_state = siteConfig?.StateLowerCase || '';
    const p_counties = (siteConfig?.DefaultCounties || []).map(c => c.toLowerCase());

    let adminClient = null;
    let categoryUrls = [];
    let locationUrls = [];
    let businessCount = 0;

    if (isLive && p_state && p_counties.length > 0) {
      try {
        adminClient = await (await import('@/utils/supabase/admin')).getSupabaseAdmin();
      } catch (e) {
        console.error('[Sitemap] Could not get admin client:', e);
      }

      if (adminClient) {
        [categoryUrls, locationUrls, businessCount] = await Promise.all([
          fetchCategoryUrls(adminClient, baseUrl, p_state, p_counties),
          fetchLocationUrls(adminClient, baseUrl, p_state, siteConfig),
          fetchBusinessCount(adminClient, p_state, p_counties),
        ]);
      }
    }

    const staticUrls = buildStaticUrls(baseUrl, status, realtyEnabled);
    const prefixUrls = [...staticUrls, ...categoryUrls, ...locationUrls];
    const totalNonRealty = prefixUrls.length + businessCount;
    const nonRealtySitemaps = Math.max(1, Math.ceil(totalNonRealty / LIMIT));
    const totalSitemaps = nonRealtySitemaps + (realtyEnabled ? 1 : 0);

    // ── Index sitemap (/sitemap.xml) ──────────────────────────────────────────
    if (idStr === undefined) {
      const urls = Array.from({ length: totalSitemaps }, (_, i) => `${baseUrl}/sitemap-${i}.xml`);
      return xmlResponse(generateIndex(urls));
    }

    const id = parseInt(idStr, 10);
    if (isNaN(id) || id < 0 || id >= totalSitemaps) {
      notFound();
    }

    // ── Realty sitemap (always last index) ───────────────────────────────────
    if (realtyEnabled && id === totalSitemaps - 1) {
      const routes = await buildRealtySitemap(baseUrl, siteConfig);
      return xmlResponse(generateUrlset(routes));
    }

    // ── Non-realty sitemap (statics + categories + locations + businesses) ───
    const routes = [];
    const virtualStart = id * LIMIT;
    const virtualEnd = (id + 1) * LIMIT;
    const prefixSize = prefixUrls.length;

    // Slice of prefix items that fall in this page's virtual range
    if (virtualStart < prefixSize) {
      routes.push(...prefixUrls.slice(virtualStart, Math.min(virtualEnd, prefixSize)));
    }

    // Business items that fill the remainder of this page
    const bizStart = Math.max(0, virtualStart - prefixSize);
    const bizCount = virtualEnd - Math.max(virtualStart, prefixSize);

    if (bizCount > 0 && adminClient && p_state && p_counties.length > 0) {
      const businesses = await fetchBusinessSlices(adminClient, p_state, p_counties, bizStart, bizCount);
      for (const b of businesses) {
        if (b.slug) {
          routes.push({ url: `${baseUrl}/s/${b.slug}`, lastmod: now(), priority: 0.6 });
        }
      }
    }

    return xmlResponse(generateUrlset(routes));

  } catch (error) {
    if (error && (error.digest === 'NEXT_HTTP_ERROR_FALLBACK;404' || error.message?.includes('NEXT_HTTP_ERROR_FALLBACK;404'))) {
      throw error;
    }
    console.error('[Sitemap] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
