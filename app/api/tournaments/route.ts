import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// GET: Fetch all tournaments with filters
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const sport = searchParams.get("sport");
    const status = searchParams.get("status");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusKmParam = searchParams.get("radiusKm");

    const query: any = {};

    if (city) query.city = new RegExp(city, "i");
    if (state) query.state = new RegExp(state, "i");
    if (sport) query.sport = new RegExp(sport, "i");
    if (status) query.status = status;

    // Radius filter logic (optional): if lat,lng,radiusKm provided, apply geospatial $near
    if (latParam && lngParam && radiusKmParam) {
      const latitude = parseFloat(latParam);
      const longitude = parseFloat(lngParam);
      const radiusKm = parseFloat(radiusKmParam);

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude) ||
        Number.isNaN(radiusKm)
      ) {
        return NextResponse.json(
          { error: "lat, lng and radiusKm must be valid numbers" },
          { status: 400 }
        );
      }

      // Convert km to meters for MongoDB $maxDistance
      const maxDistanceMeters = radiusKm * 1000;

      // Attach geospatial query
      query.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: maxDistanceMeters,
        },
      };
    }

    const tournaments = await Tournament.find(query)
      .populate("organizer", "name email organizationName phone")
      .sort({ startDate: 1 });

    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch tournaments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

// POST: Create a new tournament (Organizers only)
async function createHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      sport,
      description,
      venue,
      city,
      state,
      latitude,
      longitude,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      allowTeamRegistration,
      teamSize,
      entryFee,
      prizePool,
      rules,
      ageGroup,
      skillLevel,
      contactEmail,
      contactPhone,
    } = body;

    // Validation
    if (!name || !sport || !description || !venue || !city || !state) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    // Create Google Maps link if coordinates provided
    let googleMapsLink = "";
    if (latitude && longitude) {
      googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    }

    const tournament = await Tournament.create({
      name,
      sport,
      description,
      organizer: request.user!.userId,
      location: {
        type: "Point",
        coordinates: [longitude || 0, latitude || 0],
      },
      venue,
      city,
      state,
      googleMapsLink,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
      allowTeamRegistration: allowTeamRegistration || false,
      teamSize,
      entryFee: entryFee || 0,
      prizePool,
      rules,
      ageGroup,
      skillLevel,
      contactEmail,
      contactPhone,
      status: "open",
    });

    return NextResponse.json(
      { message: "Tournament created successfully", tournament },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create tournament" },
      { status: 500 }
    );
  }
}

export const POST = requireRole("organizer")(createHandler);
