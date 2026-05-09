import { NextResponse } from "next/server";
import { INDIAN_STATES } from "@/lib/indianStates";
import { INDIAN_DISTRICTS } from "@/lib/indianDistricts";

const PHOTON_URL = "https://photon.komoot.io/api";

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

function buildIndiaFallback(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const results: Array<{
    display_name: string;
    lat: string;
    lon: string;
    city?: string;
    district?: string;
    state?: string;
  }> = [];

  for (const state of INDIAN_STATES) {
    if (state.toLowerCase().includes(normalized)) {
      results.push({
        display_name: state,
        lat: "20.5937",
        lon: "78.9629",
        state,
      });
    }
  }

  for (const [state, districts] of Object.entries(INDIAN_DISTRICTS)) {
    for (const district of districts) {
      const label = `${district}, ${state}`;
      if (label.toLowerCase().includes(normalized)) {
        results.push({
          display_name: label,
          lat: "20.5937",
          lon: "78.9629",
          district,
          state,
        });
      }
    }
  }

  return results.slice(0, 5);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim() || "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `${PHOTON_URL}?q=${encodeURIComponent(query)}&limit=10&lang=en`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Photon search failed: ${response.status}`);
    }

    const data = await response.json();
    const results = Array.isArray(data?.features)
      ? data.features
          .filter((feature: any) => {
            const properties = feature.properties || {};
            const country = String(
              properties.country || properties.countrycode || "",
            ).toLowerCase();
            return country === "india" || country === "in" || !country;
          })
          .map((feature: any) => {
            const properties = feature.properties || {};
            const coordinates = feature.geometry?.coordinates || [];
            const displayName = buildDisplayName(properties, query);
            return {
              display_name: displayName,
              lat: String(coordinates[1] ?? ""),
              lon: String(coordinates[0] ?? ""),
              city:
                properties.city ||
                properties.locality ||
                properties.name ||
                properties.county,
              district:
                properties.district ||
                properties.county ||
                properties.locality ||
                properties.city,
              state: properties.state,
            };
          })
      : [];

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ results: buildIndiaFallback(query) });
  }
}
