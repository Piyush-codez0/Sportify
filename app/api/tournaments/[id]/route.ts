import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

interface Params {
  params: {
    id: string;
  };
}

// GET: Fetch single tournament by ID
export async function GET(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();

    const tournament = await Tournament.findById(params.id).populate(
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
