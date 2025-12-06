import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Sponsorship from "@/models/Sponsorship";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "organizer") {
      return NextResponse.json(
        { error: "Only organizers can reject sponsorships" },
        { status: 403 }
      );
    }

    console.log("Looking for sponsorship with ID:", id);
    const sponsorship = await Sponsorship.findById(id)
      .populate({
        path: "tournament",
        populate: { path: "organizer" },
      })
      .populate("sponsor", "companyName email phone");

    console.log("Found sponsorship:", sponsorship);
    if (!sponsorship) {
      console.error("Sponsorship not found for ID:", id);
      return NextResponse.json(
        { error: "Sponsorship not found for ID: " + id },
        { status: 404 }
      );
    }

    // Check if organizer owns the tournament
    const tournament = sponsorship.tournament as any;
    if (
      !tournament.organizer ||
      tournament.organizer.toString() !== decoded.userId
    ) {
      return NextResponse.json(
        { error: "You can only reject sponsorships for your tournaments" },
        { status: 403 }
      );
    }

    sponsorship.status = "rejected";
    await sponsorship.save();

    return NextResponse.json({
      message: "Sponsorship rejected",
      sponsorship,
    });
  } catch (error: any) {
    console.error("Error rejecting sponsorship:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
