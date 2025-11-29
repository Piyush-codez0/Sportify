import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

// GET: Fetch tournaments created by the organizer
async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const tournaments = await Tournament.find({
      organizer: request.user!.userId,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ tournaments }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch organizer tournaments error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

export const GET = requireRole("organizer")(handler);
