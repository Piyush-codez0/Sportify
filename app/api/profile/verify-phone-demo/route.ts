import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    // Update user's phoneVerified status using direct method
    const user = await User.findById(request.user!.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Before update - phoneVerified:", user.phoneVerified);

    user.phoneVerified = true;
    // Also mark overall verified status. For organizers, set verifiedOrganizer flag.
    user.verified = true;
    if (user.role === "organizer") {
      user.verifiedOrganizer = true;
    }
    await user.save();

    console.log("After save - phoneVerified:", user.phoneVerified);

    // Verify the update was saved
    const verifyUser = await User.findById(request.user!.userId);
    console.log(
      "Verification check - phoneVerified in DB:",
      verifyUser?.phoneVerified,
    );

    return NextResponse.json(
      {
        message: "Phone verified successfully (Demo mode)",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 },
    );
  }
}

export const POST = requireAuth(handler);
