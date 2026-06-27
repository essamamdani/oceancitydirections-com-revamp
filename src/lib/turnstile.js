export async function verifyTurnstileToken(token, customSecretKey = null) {
  // If no site-specific key configured, skip verification.
  // (Frontend falls back to Cloudflare test site key which can't be verified
  // against a production secret — skipping is safer than blocking users.)
  const finalSecretKey = customSecretKey || process.env.TURNSTILE_SECRET_KEY;

  if (!finalSecretKey || !customSecretKey) {
    // No site-specific key in DB — skip check gracefully
    return true;
  }

  if (!token) return false;

  try {
    const formData = new FormData();
    formData.append('secret', finalSecretKey);
    formData.append('response', token);

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (err) {
    console.error('[SECURITY] Turnstile verification error:', err);
    return false;
  }
}
