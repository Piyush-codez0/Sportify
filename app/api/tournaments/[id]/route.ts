import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";

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

// DELETE: Delete tournament by ID (Organizers only)
async function deleteHandler(
  request: AuthenticatedRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await context.params;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Verify that the organizer is deleting their own tournament
    if (tournament.organizer.toString() !== request.user!.userId) {
      return NextResponse.json(
        { error: "You can only delete your own tournaments" },
        { status: 403 }
      );
    }

    await Tournament.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Tournament deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Delete tournament error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete tournament" },
      { status: 500 }
    );
  }
}

export const DELETE = requireRole("organizer")(deleteHandler);
