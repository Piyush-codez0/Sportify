import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import { requireRole, AuthenticatedRequest } from "@/lib/middleware";
import crypto from "crypto";
import { sendPaymentConfirmation } from "@/lib/email";

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      registrationId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    } = body;

    // Validation
    if (
      !registrationId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Find registration
    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update registration
    registration.paymentStatus = "paid";
    registration.razorpayPaymentId = razorpayPaymentId;
    registration.razorpaySignature = razorpaySignature;
    registration.paymentDate = new Date();
    registration.status = "confirmed";
    await registration.save();

    // Send payment confirmation email
    const [user, tournament] = await Promise.all([
      User.findById(registration.player),
      Tournament.findById(registration.tournament),
    ]);

    if (user && tournament && registration.amountPaid) {
      await sendPaymentConfirmation(
        user.email,
        user.name,
        tournament.name,
        registration.amountPaid,
        razorpayPaymentId
      );
    }

    return NextResponse.json(
      { message: "Payment verified successfully", registration },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    );
  }
}

export const POST = requireRole("player")(handler);
