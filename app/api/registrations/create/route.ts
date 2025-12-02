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
    console.log("Registration request body:", body);
    const {
      tournamentId,
      registrationType,
      teamName,
      teamMembers,
      aadharNumber,
      aadharDocument,
      aadharBackDocument,
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
        {
          message: "You have already registered for this tournament",
          alreadyRegistered: true,
          registration: existingRegistration,
        },
        { status: 200 }
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
        if (
          !member.aadharNumber ||
          !member.aadharFrontDocument ||
          !member.aadharBackDocument
        ) {
          return NextResponse.json(
            {
              error:
                "All team members must upload Aadhar card (front and back)",
            },
            { status: 400 }
          );
        }
      }
    } else {
      // Individual registration - Aadhar required
      if (!aadharNumber || !aadharDocument || !aadharBackDocument) {
        return NextResponse.json(
          { error: "Aadhar card (front and back) upload is mandatory" },
          { status: 400 }
        );
      }
    }

    // Create Razorpay order if entry fee > 0
    let razorpayOrder = null;
    const hasRazorpayConfig =
      process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

    if (tournament.entryFee > 0) {
      if (!hasRazorpayConfig) {
        console.warn(
          "Razorpay not configured. Registration will be created with pending payment status."
        );
        // Allow registration without payment gateway - organizer can collect payment offline
      } else {
        try {
          razorpayOrder = await razorpay.orders.create({
            amount: tournament.entryFee * 100, // Convert to paise
            currency: "INR",
            receipt: `reg_${tournamentId}_${request.user!.userId}`,
          });
        } catch (razorpayError: any) {
          console.error("Razorpay order creation failed:", razorpayError);
          console.warn(
            "Continuing with registration. Payment can be collected offline."
          );
          // Don't fail registration if Razorpay fails - allow offline payment
        }
      }
    }

    // Create registration
    console.log("Creating registration with data:", {
      tournament: tournamentId,
      player: request.user!.userId,
      registrationType,
      aadharDocument,
      aadharBackDocument,
    });
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
      aadharBackDocument:
        registrationType === "individual" ? aadharBackDocument : undefined,
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
      try {
        await sendRegistrationConfirmation(
          user.email,
          user.name,
          tournament.name,
          new Date(tournament.startDate).toLocaleDateString("en-GB"),
          registrationType
        );
      } catch (emailError: any) {
        console.error("Email notification failed:", emailError);
        // Don't fail the registration if email fails
      }
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
    console.error("Registration error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        error: error.message || "Registration failed",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

export const POST = requireRole("player")(handler);
