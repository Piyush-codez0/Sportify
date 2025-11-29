import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// GET: Fetch registrations for a player
async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const registrations = await Registration.find({
      player: request.user!.userId,
    })
      .populate(
        "tournament",
        "name sport venue city state startDate endDate status entryFee"
      )
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

export const GET = requireRole("player")(handler);
