import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
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
        { status: 400 },
      );
    }

    const user = await User.findById(request.user!.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    if (new Date() > new Date(tournament.registrationDeadline)) {
      return NextResponse.json(
        { error: "Registration deadline has passed" },
        { status: 400 },
      );
    }

    const registrationSlots =
      registrationType === "team" ? teamMembers?.length || 0 : 1;
    if (registrationSlots <= 0) {
      return NextResponse.json(
        { error: "Invalid registration details" },
        { status: 400 },
      );
    }

    // Validate team registration
    if (registrationType === "team") {
      if (!tournament.allowTeamRegistration) {
        return NextResponse.json(
          { error: "Team registration not allowed for this tournament" },
          { status: 400 },
        );
      }

      if (!teamName || !teamMembers || teamMembers.length === 0) {
        return NextResponse.json(
          { error: "Team name and team members are required" },
          { status: 400 },
        );
      }

      // Validate team size
      if (tournament.teamSize && teamMembers.length !== tournament.teamSize) {
        return NextResponse.json(
          { error: `Team must have exactly ${tournament.teamSize} members` },
          { status: 400 },
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
            { status: 400 },
          );
        }
      }
    } else {
      // Individual registration - Aadhar required
      if (!aadharNumber || !aadharDocument || !aadharBackDocument) {
        return NextResponse.json(
          { error: "Aadhar card (front and back) upload is mandatory" },
          { status: 400 },
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
          "Razorpay not configured. Registration will be created with pending payment status.",
        );
      } else {
        try {
          razorpayOrder = await razorpay.orders.create({
            amount: tournament.entryFee * 100,
            currency: "INR",
            receipt: `reg_${tournamentId}_${request.user!.userId}`,
          });
        } catch (razorpayError: any) {
          console.error("Razorpay order creation failed:", razorpayError);
          console.warn(
            "Continuing with registration. Payment can be collected offline.",
          );
        }
      }
    }

    const session = await mongoose.startSession();
    let registration;
    let alreadyRegistered = false;

    try {
      await session.withTransaction(async () => {
        const existingRegistration = await Registration.findOne({
          tournament: tournamentId,
          player: request.user!.userId,
        }).session(session);

        if (existingRegistration) {
          registration = existingRegistration;
          alreadyRegistered = true;
          return;
        }

        const reservedTournament = await Tournament.findOneAndUpdate(
          {
            _id: tournamentId,
            registrationDeadline: { $gte: new Date() },
            $expr: {
              $lte: [
                { $add: ["$currentParticipants", registrationSlots] },
                "$maxParticipants",
              ],
            },
          },
          {
            $inc: { currentParticipants: registrationSlots },
          },
          {
            new: true,
            session,
          },
        );

        if (!reservedTournament) {
          throw new Error("Tournament is full");
        }

        registration = await Registration.create(
          [
            {
              tournament: tournamentId,
              player: request.user!.userId,
              registrationType,
              teamName: registrationType === "team" ? teamName : undefined,
              teamMembers:
                registrationType === "team" ? teamMembers : undefined,
              aadharNumber:
                registrationType === "individual" ? aadharNumber : undefined,
              aadharDocument:
                registrationType === "individual" ? aadharDocument : undefined,
              aadharBackDocument:
                registrationType === "individual"
                  ? aadharBackDocument
                  : undefined,
              razorpayOrderId: razorpayOrder?.id,
              amountPaid: tournament.entryFee,
              paymentStatus: tournament.entryFee === 0 ? "paid" : "pending",
              status: tournament.entryFee === 0 ? "confirmed" : "pending",
            },
          ],
          { session },
        );
      });
    } finally {
      session.endSession();
    }

    if (Array.isArray(registration)) {
      registration = registration[0];
    }

    if (!registration) {
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 500 },
      );
    }

    if (alreadyRegistered) {
      return NextResponse.json(
        {
          message: "You have already registered for this tournament",
          alreadyRegistered: true,
          registration,
        },
        { status: 200 },
      );
    }

    // Send email notification after the transaction commits
    try {
      await sendRegistrationConfirmation(
        user.email,
        user.name,
        tournament.name,
        new Date(tournament.startDate).toLocaleDateString("en-GB"),
        registrationType,
      );
    } catch (emailError: any) {
      console.error("Email notification failed:", emailError);
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
      { status: 201 },
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
      { status: 500 },
    );
  }
}

export const POST = requireRole("player")(handler);
