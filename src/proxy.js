import { NextResponse } from 'next/server';

export default function proxy(request) {
  const password = process.env.SITE_PASSWORD;
  
  // If no password configured, pass through
  if (!password) {
    return NextResponse.next();
  }

  const { pathname, searchParams } = request.nextUrl;

  // Paths to bypass password check (static files, API, favicon, and the password page itself)
  const isStatic = pathname.startsWith('/_next') || 
                   pathname.startsWith('/images/') || 
                   pathname.startsWith('/favicon.ico') || 
                   pathname.startsWith('/api/');
  const isPasswordPage = pathname === '/password';

  if (isStatic || isPasswordPage) {
    return NextResponse.next();
  }

  // Check bypass cookie
  const cookiePassword = request.cookies.get('site_password')?.value;

  if (cookiePassword === password) {
    // If password is correct, we can also inject the noindex header globally for search engines when password is set
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return response;
  }

  // Redirect to password page
  const redirectUrl = new URL('/password', request.url);
  redirectUrl.searchParams.set('next', pathname + searchParams.toString());
  
  const response = NextResponse.redirect(redirectUrl);
  // Also add noindex to redirect response just in case
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

// Configure matching paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
