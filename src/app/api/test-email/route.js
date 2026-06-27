import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import ClaimedBusinessEmail from '@/emails/claimedBusiness.jsx';
import { sendEmail } from '@/lib/sendEmail';

// Next.js handles env vars automatically - no need for dotenv


export async function GET() {
  try {
    const html = await render(
      <ClaimedBusinessEmail
        businessName={"Test Business"}
        businessId={"TEST-123"}
        userEmail={process.env.NOTIFY_EMAIL || 'info@videohomes.com'}
        siteUrl={""}
      />
    );

    const to = process.env.NOTIFY_EMAIL || 'info@videohomes.com';
    const result = await sendEmail({
      to,
      subject: 'Test: Claimed Business Email',
      body: html,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
