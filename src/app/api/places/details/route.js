import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const place_id = searchParams.get('place_id');
    
    if (!place_id) {
        return NextResponse.json({ error: 'Missing place_id' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=address_component,formatted_address,geometry&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.status !== 'OK') {
            console.error('Google Places API Error:', data);
            return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching details:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
