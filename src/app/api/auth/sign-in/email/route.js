import { verifyTurnstileToken } from '@/lib/turnstile'
import logger from '@/lib/logger'

import { fetchSiteConfigByDomain } from '@/lib/site-config'


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
    
    const origin = request.headers.get('origin') || 'https://oceancitydirections-com-private.vercel.app'
    
    const response = await fetch('https://auth.realtydirections.com/api/auth/sign-in/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': origin,
        'x-proxy-secret': process.env.INTERNAL_PROXY_SECRET || 'realty-directions-proxy-2026'
      },
      body: JSON.stringify(rest),
    })

    const data = await response.json()
    
    logger.log('Auth server response:', JSON.stringify(data, null, 2))

    // Block unverified users from logging in
    if (response.ok && data.user && (data.user.emailVerified === false || data.user.email_verified === false)) {
        return Response.json({ 
            message: 'Please verify your email address to log in.', 
            error: 'email_not_verified' 
        }, { status: 403 })
    }

    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error('Proxy error:', error)
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
