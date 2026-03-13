import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  try {
    // Step 1: ZIP to coordinates
    const locationRes = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!locationRes.ok) throw new Error("Invalid ZIP");
    const locationData = await locationRes.json();
    const lat = parseFloat(locationData.places[0].latitude);
    const lng = parseFloat(locationData.places[0].longitude);
    const city = locationData.places[0]['place name'];
    const state = locationData.places[0]['state abbreviation'];

    // Step 2: Find nearest USGS station using bounding box
    const delta = 0.5;
    const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
    const stationUrl = `https://waterservices.usgs.gov/nwis/iv/?format=json&bBox=${bbox}&parameterCd=00010&siteStatus=active`;

    const usgsRes = await fetch(stationUrl);
    const usgsData = await usgsRes.json();

    const station = usgsData.value?.timeSeries?.[0];

    // Step 3: Clean the temperature value
    const rawTemp = parseFloat(station?.values?.[0]?.value?.[0]?.value);
    const temperature = (isNaN(rawTemp) || rawTemp < -100 || rawTemp > 100) ? null : rawTemp;

    // Step 4: Compute risk score
    const tempScore = temperature !== null ? Math.min(100, temperature * 3) : 40;
    const risk_score = Math.round(tempScore);
    const risk_label = risk_score < 33 ? "LOW" : risk_score < 66 ? "MEDIUM" : "HIGH";

    return NextResponse.json({
      water_name: station?.sourceInfo?.siteName ?? `${city} Area Water`,
      station_id: station?.sourceInfo?.siteCode?.[0]?.value ?? "000000",
      risk_score,
      risk_label,
      lat,
      lng,
      city,
      state,
      metrics: {
        temperature,
        turbidity: null,
        dissolved_oxygen: null,
        pH: null,
      },
      last_updated: new Date().toISOString(),
      source_url: "https://waterservices.usgs.gov"
    });

  } catch (err) {
    console.error("Water route error:", err);
    return NextResponse.json({
      water_name: "Local Water Body",
      station_id: "000000",
      risk_score: 45,
      risk_label: "MEDIUM",
      lat: 41.4993,
      lng: -81.6944,
      city: "Demo City",
      state: "OH",
      metrics: {
        temperature: null,
        turbidity: null,
        dissolved_oxygen: null,
        pH: null
      },
      last_updated: new Date().toISOString(),
      source_url: "https://waterservices.usgs.gov"
    });
  }
}