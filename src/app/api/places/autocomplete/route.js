import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input');
    
    if (!input) {
        return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:us&types=address&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            console.error('Google Places API Error:', data);
            return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching autocomplete:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
