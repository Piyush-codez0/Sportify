import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sponsorship from "@/models/Sponsorship";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// POST: Create sponsorship request
async function postHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { tournamentId, amount, sponsorshipType, benefits, message } = body;

    // Validation
    if (!tournamentId || !amount || !sponsorshipType) {
      return NextResponse.json(
        { error: "Tournament ID, amount, and sponsorship type are required" },
        { status: 400 }
      );
    }

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Create sponsorship
    const sponsorship = await Sponsorship.create({
      tournament: tournamentId,
      sponsor: request.user!.userId,
      amount,
      sponsorshipType,
      benefits: benefits || [],
      message,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Sponsorship request created successfully", sponsorship },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create sponsorship error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create sponsorship request" },
      { status: 500 }
    );
  }
}

// GET: Fetch sponsor's sponsorships
async function getHandler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const sponsorships = await Sponsorship.find({
      sponsor: request.user!.userId,
    })
      .populate("tournament", "name sport city state startDate organizer")
      .populate({
        path: "tournament",
        populate: {
          path: "organizer",
          select: "name organizationName email phone",
        },
      })
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

export const POST = requireRole("sponsor")(postHandler);
export const GET = requireRole("sponsor")(getHandler);
