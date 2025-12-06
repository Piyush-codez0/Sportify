import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Sponsorship from "@/models/Sponsorship";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    await connectDB();
    const { id, action } = await params;
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (decoded.role !== "organizer") {
      return NextResponse.json(
        { error: "Only organizers can manage sponsorships" },
        { status: 403 }
      );
    }

    const sponsorship = await Sponsorship.findById(id)
      .populate({
        path: "tournament",
        populate: { path: "organizer" },
      })
      .populate("sponsor", "companyName email phone");

    if (!sponsorship) {
      return NextResponse.json(
        { error: "Sponsorship not found" },
        { status: 404 }
      );
    }

    // Check if organizer owns the tournament
    const tournament = sponsorship.tournament as any;
    if (tournament.organizer.toString() !== decoded.userId) {
      return NextResponse.json(
        { error: "You can only manage sponsorships for your tournaments" },
        { status: 403 }
      );
    }

    // Update status based on action
    if (action === "approve") {
      sponsorship.status = "approved";
    } else if (action === "reject") {
      sponsorship.status = "rejected";
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await sponsorship.save();

    return NextResponse.json({
      message: `Sponsorship ${action}d`,
      sponsorship,
    });
  } catch (error: any) {
    console.error("Error managing sponsorship:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
