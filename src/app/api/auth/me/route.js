export async function GET(request) {
  try {
    // Extract auth-token from cookies
    const cookies = request.headers.get('cookie') || '';
    const tokenMatch = cookies.match(/auth-token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return Response.json({ user: null, message: 'No token found' }, { status: 401 });
    }
    
    const response = await fetch('https://auth.realtydirections.com/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Origin': request.headers.get('origin') || 'https://oceancitydirections-com-private.vercel.app',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    // Handle both { id, email } and { user: { id, email } } response shapes
    const user = (data && data.id) ? data : (data?.user || null);

    if (!user || !user.id) {
        return Response.json({ user: null, message: data?.error || 'Invalid session' }, { status: 401 });
    }

    if (user.emailVerified === false || user.email_verified === false) {
        return Response.json({ user: null, message: 'Please verify your email address to access your account.', error: 'email_not_verified' }, { status: 403 });
    }

    return Response.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Auth me proxy error:', error);
    return Response.json(
      { user: null, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
