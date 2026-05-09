import { NextResponse } from "next/server";

const PHOTON_URL = "https://photon.komoot.io/reverse";

function buildDisplayName(properties: any, fallback: string) {
  const parts = [
    properties.name,
    properties.street,
    properties.housenumber,
    properties.locality,
    properties.city,
    properties.county,
    properties.state,
  ]
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  const uniqueParts: string[] = [];
  for (const part of parts) {
    if (
      !uniqueParts.some(
        (existing) => existing.toLowerCase() === part.toLowerCase(),
      )
    ) {
      uniqueParts.push(part);
    }
  }

  return uniqueParts.length ? uniqueParts.join(", ") : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat")?.trim();
  const lng = searchParams.get("lng")?.trim();

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `${PHOTON_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&lang=en`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Photon reverse failed: ${response.status}`);
    }

    const data = await response.json();
    const properties = data?.features?.[0]?.properties || {};
    const result = {
      display_name: buildDisplayName(properties, `${lat}, ${lng}`),
      lat,
      lon: lng,
      city: properties.city || properties.locality || properties.name,
      district: properties.district || properties.county || properties.locality,
      state: properties.state,
    };

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      {
        result: {
          display_name: `${lat}, ${lng}`,
          lat,
          lon: lng,
        },
      },
      { status: 200 },
    );
  }
}
