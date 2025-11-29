import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// GET: Fetch all registrations for a specific tournament
async function handler(
  request: AuthenticatedRequest,
  context: { params: { tournamentId: string } }
) {
  const { params } = context;
  try {
    await dbConnect();

    // Verify that the organizer owns this tournament
    const tournament = await Tournament.findById(params.tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    if (tournament.organizer.toString() !== request.user!.userId) {
      return NextResponse.json(
        { error: "Unauthorized - You do not own this tournament" },
        { status: 403 }
      );
    }

    // Fetch registrations
    const registrations = await Registration.find({
      tournament: params.tournamentId,
    })
      .populate("player", "name email phone")
      .sort({ registrationDate: -1 });

    return NextResponse.json({ registrations }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch registrations error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}

export const GET = requireRole("organizer")(handler);
