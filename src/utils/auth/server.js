import logger from '@/lib/logger';

export async function getServerUser(request) {
  try {
    const cookies = request.headers.get('cookie') || '';

    // Try auth-token first, then Better Auth session cookie
    let tokenMatch = cookies.match(/auth-token=([^;]+)/);
    let token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      tokenMatch = cookies.match(/realty-auth\.session_token=([^;]+)/);
      token = tokenMatch ? tokenMatch[1] : null;
    }

    if (!token) {
      logger.log('[getServerUser] No auth token found in cookies');
      return null;
    }

    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.realtydirections.com';
    logger.log('[getServerUser] Verifying token with auth server');

    const response = await fetch(`${authUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `realty-auth.session_token=${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      logger.log('[getServerUser] Auth server returned', response.status);
      return null;
    }

    const data = await response.json();

    // Handle both { id, email, ... } and { user: { id, email, ... } } response shapes
    const user = (data && data.id) ? data : (data?.user || null);

    if (!user || !user.id) {
      logger.log('[getServerUser] No valid user in session response');
      return null;
    }

    if (user.emailVerified === false || user.email_verified === false) {
      logger.warn('[getServerUser] User email not verified');
      return { ...user, _blocked: true, error: 'email_not_verified' };
    }

    logger.log('[getServerUser] Session verified successfully');
    return user;
  } catch (error) {
    console.error('[getServerUser] Error verifying session:', error);
    return null;
  }
}
