import { NextResponse } from 'next/server';
import { getAnswerRealtyObject, getAnswer } from '@/lib/actions';


export async function GET(request) {
  try {
    const ask = request.nextUrl.searchParams.get('ask');
    const result = await getAnswerRealtyObject({ ask, lat: null, long: null });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
