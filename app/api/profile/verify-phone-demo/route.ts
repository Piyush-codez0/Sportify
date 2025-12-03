import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Update user's phoneVerified status using direct method
    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Before update - phoneVerified:", user.phoneVerified);

    user.phoneVerified = true;
    await user.save();

    console.log("After save - phoneVerified:", user.phoneVerified);

    // Verify the update was saved
    const verifyUser = await User.findById(decoded.userId);
    console.log(
      "Verification check - phoneVerified in DB:",
      verifyUser?.phoneVerified
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
