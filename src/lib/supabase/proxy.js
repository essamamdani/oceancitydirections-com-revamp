import { NextResponse } from 'next/server'

function geolocation(request) {
  return {
    latitude: request.headers.get('x-vercel-ip-latitude') || request.headers.get('x-user-latitude') || null,
    longitude: request.headers.get('x-vercel-ip-longitude') || request.headers.get('x-user-longitude') || null,
  };
}

// Paths that should always be accessible (APIs, auth, assets)
const PUBLIC_PATHS = [
  '/api/',
  '/_next/',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/parked',
  '/offline',
  '/login'
];

/**
 * Get site status from config
 */
function getSiteStatus(siteConfig) {
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

export async function updateSession(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip middleware for public paths
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return await createGeolocationResponse(request);
  }

  try {
    // Remove www. prefix
    const cleanDomain = hostname.replace(/^www\./, '');
    
    // Fetch site config from Central Auth DB
    const siteResponse = await fetch(
      `https://auth.realtydirections.com/api/domain/${cleanDomain}`,
      { 
        next: { revalidate: 60 },
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    if (siteResponse.ok) {
      const siteConfig = await siteResponse.json();
      const status = getSiteStatus(siteConfig);
      
      // 1. PARKED STATUS
      if (status === 'parked') {
        if (pathname !== '/parked' && pathname !== '/') {
          return NextResponse.redirect(new URL('/parked', request.url));
        }
      }
      
      // 2. OFFLINE STATUS
      if (status === 'offline') {
        if (pathname !== '/offline' && pathname !== '/') {
          return NextResponse.redirect(new URL('/offline', request.url));
        }
      }

      // 3. LIVE_NO_REALTY STATUS
      if (status === 'live_no_realty') {
        const realtyPaths = ['/sell', '/properties', '/property'];
        if (realtyPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
  } catch (error) {
    console.error('[Proxy] Error checking site status:', error);
  }
  
  return await createGeolocationResponse(request);
}

/**
 * Create response with geolocation headers
 */
async function createGeolocationResponse(request) {
  // Get geolocation from request headers
  const geo = geolocation(request);
  const latitude = geo.latitude || null;
  const longitude = geo.longitude || null;

  let response = NextResponse.next({
    request,
  })

  // Add geolocation headers
  response.headers.set('x-user-latitude', latitude);
  response.headers.set('x-user-longitude', longitude);

  return response;
}
