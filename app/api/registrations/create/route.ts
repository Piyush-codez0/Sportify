import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Registration from "@/models/Registration";
import User from "@/models/User";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";
import razorpay from "@/lib/razorpay";
import { sendRegistrationConfirmation } from "@/lib/email";

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      tournamentId,
      registrationType,
      teamName,
      teamMembers,
      aadharNumber,
      aadharDocument,
    } = body;

    // Validation
    if (!tournamentId || !registrationType) {
      return NextResponse.json(
        { error: "Tournament ID and registration type are required" },
        { status: 400 }
      );
    }

    // Check tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 }
      );
    }

    // Check if registration deadline passed
    if (new Date() > new Date(tournament.registrationDeadline)) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 }
      );
    }

    // Check if tournament is full
    if (tournament.currentParticipants >= tournament.maxParticipants) {
      return NextResponse.json(
        { error: "Tournament is full" },
        { status: 400 }
      );
    }

    // Check if already registered
    const existingRegistration = await Registration.findOne({
      tournament: tournamentId,
      player: request.user!.userId,
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "You have already registered for this tournament" },
        { status: 400 }
      );
    }

    // Validate team registration
    if (registrationType === "team") {
      if (!tournament.allowTeamRegistration) {
        return NextResponse.json(
          { error: "Team registration not allowed for this tournament" },
          { status: 400 }
        );
      }

      if (!teamName || !teamMembers || teamMembers.length === 0) {
        return NextResponse.json(
          { error: "Team name and team members are required" },
          { status: 400 }
        );
      }

      // Validate team size
      if (tournament.teamSize && teamMembers.length !== tournament.teamSize) {
        return NextResponse.json(
          { error: `Team must have exactly ${tournament.teamSize} members` },
          { status: 400 }
        );
      }

      // Validate all team members have Aadhar
      for (const member of teamMembers) {
        if (!member.aadharNumber || !member.aadharDocument) {
          return NextResponse.json(
            { error: "All team members must upload Aadhar card" },
            { status: 400 }
          );
        }
      }
    } else {
      // Individual registration - Aadhar required
      if (!aadharNumber || !aadharDocument) {
        return NextResponse.json(
          { error: "Aadhar card upload is mandatory" },
          { status: 400 }
        );
      }
    }

    // Create Razorpay order if entry fee > 0
    let razorpayOrder = null;
    if (tournament.entryFee > 0) {
      razorpayOrder = await razorpay.orders.create({
        amount: tournament.entryFee * 100, // Convert to paise
        currency: "INR",
        receipt: `reg_${tournamentId}_${request.user!.userId}`,
      });
    }

    // Create registration
    const registration = await Registration.create({
      tournament: tournamentId,
      player: request.user!.userId,
      registrationType,
      teamName: registrationType === "team" ? teamName : undefined,
      teamMembers: registrationType === "team" ? teamMembers : undefined,
      aadharNumber:
        registrationType === "individual" ? aadharNumber : undefined,
      aadharDocument:
        registrationType === "individual" ? aadharDocument : undefined,
      razorpayOrderId: razorpayOrder?.id,
      amountPaid: tournament.entryFee,
      paymentStatus: tournament.entryFee === 0 ? "paid" : "pending",
      status: tournament.entryFee === 0 ? "confirmed" : "pending",
    });

    // Update tournament participant count
    await Tournament.findByIdAndUpdate(tournamentId, {
      $inc: {
        currentParticipants:
          registrationType === "team" ? teamMembers.length : 1,
      },
    });

    // Send email notification
    const user = await User.findById(request.user!.userId);
    if (user) {
      await sendRegistrationConfirmation(
        user.email,
        user.name,
        tournament.name,
        new Date(tournament.startDate).toLocaleDateString(),
        registrationType
      );
    }

    return NextResponse.json(
      {
        message: "Registration initiated successfully",
        registration,
        razorpayOrder: razorpayOrder
          ? {
              orderId: razorpayOrder.id,
              amount: razorpayOrder.amount,
              currency: razorpayOrder.currency,
              keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            }
          : null,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}

export const POST = requireRole("player")(handler);
