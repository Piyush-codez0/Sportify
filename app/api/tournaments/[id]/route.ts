import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

// GET: Fetch single tournament by ID (Next.js 16: params is a Promise)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const tournament = await Tournament.findById(id).populate(
      "organizer",
      "name email organizationName phone contactEmail contactPhone"
    );

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tournament }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tournament" },
      { status: 500 }
    );
  }
}
