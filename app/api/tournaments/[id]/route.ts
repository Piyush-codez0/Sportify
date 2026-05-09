import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// GET: Fetch single tournament by ID (Next.js 16: params is a Promise)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const tournament = await Tournament.findById(id).populate(
      "organizer",
      "name email organizationName phone contactEmail contactPhone",
    );

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tournament" },
      { status: 500 },
    );
  }
}

// DELETE: Delete tournament by ID (Organizers only)
async function deleteHandler(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    // Verify that the organizer is deleting their own tournament
    if (tournament.organizer.toString() !== request.user!.userId) {
      return NextResponse.json(
        { error: "You can only delete your own tournaments" },
        { status: 403 },
      );
    }

    await Tournament.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Tournament deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Delete tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete tournament" },
      { status: 500 },
    );
  }
}

export const DELETE = requireRole("organizer")(deleteHandler);

// PUT: Update tournament by ID (Organizers only)
async function updateHandler(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();

    const { id } = await context.params;
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    if (tournament.organizer.toString() !== request.user!.userId) {
      return NextResponse.json(
        { error: "You can only update your own tournaments" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      sport,
      description,
      venue,
      city,
      district,
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
      status,
    } = body;

    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (sport !== undefined) updateData.sport = sport;
    if (description !== undefined) updateData.description = description;
    if (venue !== undefined) updateData.venue = venue;
    if (city !== undefined) updateData.city = city;
    if (district !== undefined) updateData.district = district;
    if (state !== undefined) updateData.state = state;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (registrationDeadline !== undefined)
      updateData.registrationDeadline = registrationDeadline;
    if (maxParticipants !== undefined)
      updateData.maxParticipants = maxParticipants;
    if (allowTeamRegistration !== undefined)
      updateData.allowTeamRegistration = allowTeamRegistration;
    if (teamSize !== undefined) updateData.teamSize = teamSize;
    if (entryFee !== undefined) updateData.entryFee = entryFee;
    if (prizePool !== undefined) updateData.prizePool = prizePool;
    if (rules !== undefined) updateData.rules = rules;
    if (ageGroup !== undefined) updateData.ageGroup = ageGroup;
    if (skillLevel !== undefined) updateData.skillLevel = skillLevel;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (status !== undefined) updateData.status = status;

    if (latitude !== undefined && longitude !== undefined) {
      updateData.location = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
      updateData.googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      },
    ).populate(
      "organizer",
      "name email organizationName phone contactEmail contactPhone",
    );

    return NextResponse.json(
      {
        message: "Tournament updated successfully",
        tournament: updatedTournament,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Update tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update tournament" },
      { status: 500 },
    );
  }
}

export const PUT = requireRole("organizer")(updateHandler);
