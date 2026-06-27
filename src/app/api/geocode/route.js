
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
        return NextResponse.json({ error: 'Lat and Long are required' }, { status: 400 });
    }

    try {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY; // Reusing existing Google Places API Key
        // Using Google Geocoding API (Reverse Geocoding)
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Find the result that contains "administrative_area_level_2" (County)
            // Usually the first result is the most specific, but we iterate to be sure.

            let county = null;

            // Iterate through results to find the most appropriate address component
            for (const result of data.results) {
                for (const component of result.address_components) {
                    if (component.types.includes('administrative_area_level_2')) {
                        county = component.long_name;
                        break;
                    }
                }
                if (county) break; // Found it
            }

            // Special Case: Baltimore City (Independent City)
            if (!county) {
                for (const result of data.results) {
                    let isBaltimoreCity = false;
                    let isMaryland = false;

                    for (const component of result.address_components) {
                        // Check for Locality: Baltimore
                        if (component.types.includes('locality') && component.long_name === 'Baltimore') {
                            isBaltimoreCity = true;
                        }
                        // Check for Admin Level 1: Maryland
                        if (component.types.includes('administrative_area_level_1') && (component.long_name === 'Maryland' || component.short_name === 'MD')) {
                            isMaryland = true;
                        }
                    }

                    if (isBaltimoreCity && isMaryland) {
                        county = 'Baltimore City';
                        break;
                    }
                }
            }

            if (county) {
                // Return clean county name
                const cleanCounty = county.replace(/ County$/i, "").trim();
                return NextResponse.json({ county: cleanCounty });
            }
        }

        return NextResponse.json({ county: null, message: 'County not found' }, { status: 404 });

    } catch (error) {
        console.error('Geocoding error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
