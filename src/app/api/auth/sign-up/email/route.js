import { verifyTurnstileToken } from '@/lib/turnstile'
import logger from '@/lib/logger'
import { fetchSiteConfigByDomain } from '@/lib/site-config'
import { getSiteName } from '@/lib/helper'


export async function POST(request) {
  try {
    const body = await request.json()
    const { cf_token, ...rest } = body

    // --- SECURITY: Turnstile Verification ---
    const hostHeader = request.headers.get('host') || 'unknown';
    const siteConfig = await fetchSiteConfigByDomain(hostHeader);

    const isHuman = await verifyTurnstileToken(cf_token, siteConfig?.turnstile_secret_key);
    if (!isHuman) {
        return Response.json({ message: "Security verification failed. Please try again." }, { status: 403 });
    }
    
    // Better Auth 'admin' plugin blocks setting 'role' during signup. We remove it.
    if (rest.role) {
      delete rest.role;
    }
    
    const origin = request.headers.get('origin') || 'https://oceancitydirections-com-private.vercel.app'
    
    // Extract site slug from hostname (e.g. baltimoredirections-com-private.vercel.app → baltimore)
    const host = request.headers.get('host') || 'unknown';
    let siteSlug = host.replace(/^www\./, '').split('.')[0];
    siteSlug = siteSlug.replace(/-com-private$/, '').replace(/-com-new$/, '');
    const match = siteSlug.match(/^([a-z]+)directions$/i);
    siteSlug = match ? match[1].toLowerCase() : siteSlug.toLowerCase();
    
    // Pass callbackURL explicitly for Better Auth
    const callbackURL = rest.callbackURL || '/dashboard'
    
    const response = await fetch('https://auth.realtydirections.com/api/auth/sign-up/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': origin,
        'x-proxy-secret': process.env.INTERNAL_PROXY_SECRET || 'realty-directions-proxy-2026'
      },
      body: JSON.stringify({
        ...rest,
        site: siteSlug,
        siteName: getSiteName(siteConfig),
        callbackURL
      }),
    })

    const data = await response.json()
    
    logger.log('Auth server sign-up response:', JSON.stringify(data, null, 2))

    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
