import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";
import { sendVerificationUpdate } from "@/lib/email";

// POST: Verify Aadhar and update registration status
async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { registrationId, verified, verificationNotes, reset } = body;

    // Validation
    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }
    if (!reset && verified === undefined) {
      return NextResponse.json(
        { error: "Verification status is required" },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await Registration.findById(registrationId).populate(
      "tournament"
    );
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Verify that the organizer owns the tournament
    const tournament = await Tournament.findById(registration.tournament);
    if (
      !tournament ||
      tournament.organizer.toString() !== request.user!.userId
    ) {
      return NextResponse.json(
        { error: "Unauthorized - You do not own this tournament" },
        { status: 403 }
      );
    }

    // Handle reset to pending
    if (reset) {
      registration.verified = false;
      registration.status = "pending";
      registration.verificationNotes = undefined;
      registration.verifiedBy = undefined as any;
      registration.verifiedAt = undefined as any;

      await registration.save();

      return NextResponse.json(
        { message: "Registration reset to pending", registration },
        { status: 200 }
      );
    }

    // Update verification status
    registration.verified = verified;
    registration.verificationNotes = verificationNotes;
    registration.verifiedBy = request.user!.userId as any;
    registration.verifiedAt = new Date();

    // If verified and payment is done, confirm registration
    if (verified && registration.paymentStatus === "paid") {
      registration.status = "confirmed";
    } else if (!verified) {
      registration.status = "rejected";
    }

    await registration.save();

    // Send verification email to player
    const user = await User.findById(registration.player);
    const organizer = await User.findById(tournament.organizer);
    if (user && tournament) {
      await sendVerificationUpdate(
        user.email,
        user.name,
        tournament.name,
        organizer?.name || "Organizer",
        tournament.sport || "Sport",
        verified
      );
    }

    return NextResponse.json(
      { message: "Registration verification updated", registration },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify registration error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}

export const POST = requireRole("organizer")(handler);
