import { NextResponse } from 'next/server'
import { updateSession } from "./src/lib/supabase/proxy.js"

// Configuration for Rate Limiting
const RATE_LIMIT_MS = 60000;
const MAX_REQUESTS = 1000;
const ipCache = new Map();

// XSS Protection Patterns
const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /onerror/i,
  /onload/i,
  /eval\(/i,
  /alert\(/i,
  /document\.cookie/i,
  /document\.location/i,
];

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/edit-business', '/add-business', '/edit-submission']

export default async function proxy(request) {
  const { pathname, searchParams } = request.nextUrl
  const url = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // --- 1. XSS PROTECTION (GET Requests) ---
  if (request.method === 'GET') {
    const searchString = searchParams.toString();
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(decodeURIComponent(searchString)) || pattern.test(decodeURIComponent(pathname))) {
        console.warn(`[SECURITY] Blocked potential XSS attack from IP: ${ip} on path: ${pathname}`);
        return new NextResponse('Blocked by Security Policy', { status: 403 });
      }
    }
  }

  // --- 2. RATE LIMITING ---
  const now = Date.now();
  const userData = ipCache.get(ip) || { count: 0, startTime: now };
  if (now - userData.startTime > RATE_LIMIT_MS) {
    userData.count = 1;
    userData.startTime = now;
  } else {
    userData.count++;
  }
  ipCache.set(ip, userData);
  if (userData.count > MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // --- 3. AUTH PROXY ---
  const isAuthPost = request.method === 'POST' && (pathname.includes('sign-in') || pathname.includes('sign-up'));
  
  // Routes to handle locally (do not proxy)
  const isLocalAuthRoute = pathname.includes('/api/auth/me') || pathname.includes('/api/auth/update-user');

  if (pathname.startsWith('/api/auth') && !isAuthPost && !isLocalAuthRoute) {
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.realtydirections.com';
    const targetPath = pathname.replace(/^\/api\/auth/, '/api/auth');
    const proxyUrl = new URL(targetPath, authUrl);
    searchParams.forEach((v, k) => proxyUrl.searchParams.set(k, v));
    
    const headers = new Headers(request.headers);
    headers.set('x-proxy-secret', process.env.INTERNAL_PROXY_SECRET || 'realty-directions-proxy-2026');
    return NextResponse.rewrite(proxyUrl, { request: { headers } });
  }

  // --- 4. SITEMAP REWRITE ---
  if (url.href.includes("sitemap") && url.href.includes(".xml")){
    return NextResponse.rewrite(new URL(new URL(url.href).pathname.replace(".xml",""), url.origin));
  }
  
  // --- 5. AUTH PROTECTION ---
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  const token = request.cookies.get('auth-token')?.value || request.cookies.get('sb-access-token')?.value

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Fall back to supabase session update and site status check
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
