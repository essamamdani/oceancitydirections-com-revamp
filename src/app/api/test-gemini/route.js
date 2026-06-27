import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';


export async function GET(request) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'test',
    });
    return NextResponse.json({ success: true, text: response.text });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
