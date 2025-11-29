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
    const { registrationId, verified, verificationNotes } = body;

    // Validation
    if (!registrationId || verified === undefined) {
      return NextResponse.json(
        { error: "Registration ID and verification status are required" },
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
    if (user && tournament) {
      await sendVerificationUpdate(
        user.email,
        user.name,
        tournament.name,
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
