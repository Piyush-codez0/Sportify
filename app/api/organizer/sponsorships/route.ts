import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sponsorship from "@/models/Sponsorship";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// GET: Fetch all sponsorships for organizer's tournaments
async function getHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    // Find all tournaments by this organizer
    const tournaments = await Tournament.find({
      organizer: request.user!.userId,
    }).select("_id");
    const tournamentIds = tournaments.map((t) => t._id);

    // Find sponsorships for these tournaments
    const sponsorships = await Sponsorship.find({
      tournament: { $in: tournamentIds },
    })
      .populate("sponsor", "companyName email phone brandLogo")
      .populate("tournament", "name sport city state startDate")
      .sort({ createdAt: -1 });

    return NextResponse.json({ sponsorships }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch sponsorships error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sponsorships" },
      { status: 500 }
    );
  }
}

// POST: Respond to sponsorship request
async function postHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sponsorshipId, status, organizerResponse } = body;

    // Validation
    if (!sponsorshipId || !status) {
      return NextResponse.json(
        { error: "Sponsorship ID and status are required" },
        { status: 400 }
      );
    }

    // Find sponsorship
    const sponsorship = await Sponsorship.findById(sponsorshipId).populate(
      "tournament"
    );
    if (!sponsorship) {
      return NextResponse.json(
        { error: "Sponsorship not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    const tournament = await Tournament.findById(sponsorship.tournament);
    if (
      !tournament ||
      tournament.organizer.toString() !== request.user!.userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized - You do not own this tournament" },
        { status: 403 }
      );
    }

    // Update sponsorship
    sponsorship.status = status;
    sponsorship.organizerResponse = organizerResponse;
    await sponsorship.save();

    return NextResponse.json(
      { message: "Sponsorship updated successfully", sponsorship },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update sponsorship error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update sponsorship" },
      { status: 500 }
    );
  }
}

export const GET = requireRole("organizer")(getHandler);
export const POST = requireRole("organizer")(postHandler);
