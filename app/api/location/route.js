import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!response.ok) return NextResponse.json({ error: "Invalid ZIP" }, { status: 404 });
    
    const data = await response.json();
    const place = data.places[0];
    
    return NextResponse.json({
      lat: parseFloat(place.latitude),
      lng: parseFloat(place.longitude),
      city: place['place name'],
      state: place['state abbreviation']
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch location" }, { status: 500 });
  }
}
