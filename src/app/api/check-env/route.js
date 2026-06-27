import { NextResponse } from 'next/server';


export async function GET() {
  return NextResponse.json({ 
    gemini: !!process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    gemini_key_start: process.env.GOOGLE_GENERATIVE_AI_API_KEY ? process.env.GOOGLE_GENERATIVE_AI_API_KEY.substring(0, 5) : null
  });
}
