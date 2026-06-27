export const sendEmail = async ({ to, subject, body, replyTo, siteDomain }) => {
  const AUTH_SERVER_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.realtydirections.com';
  const API_KEY = process.env.INTERNAL_API_KEY || 'oceancity-secure-db-lookup-2026';

  try {
    const response = await fetch(`${AUTH_SERVER_URL}/api/emails/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        to,
        subject,
        html: body,
        replyTo: replyTo || process.env.ADMIN_REPLY_TO_EMAIL,
        siteDomain,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Auth Server responded with status ${response.status}: ${errorText}`);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email via Auth Server:', error);
    return { success: false, error };
  }
};

