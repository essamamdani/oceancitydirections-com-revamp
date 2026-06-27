export async function POST(request) {
  try {
    const body = await request.json();
    const origin = request.headers.get('origin') || 'https://oceancitydirections-com-private.vercel.app';
    
    // Better Auth 'sendVerificationEmail' requires email and callbackURL
    const callbackURL = body.callbackURL || '/dashboard';

    // We can call Better Auth's direct endpoint or use the auth client.
    // auth.realtydirections.com exposes Better Auth endpoints.
    // The endpoint is /api/auth/send-verification-email
    
    const response = await fetch('https://auth.realtydirections.com/api/auth/send-verification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': origin,
      },
      body: JSON.stringify({
        email: body.email,
        callbackURL: callbackURL
      }),
    });

    const data = await response.json();
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Resend verification error:', error);
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
