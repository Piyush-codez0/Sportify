import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      city,
      state,
      gender,
      organizationName,
      sportsPreferences,
      companyName,
    } = body;

    // Build update object based on provided fields
    const updateData: any = {};

    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (gender) updateData.gender = gender;
    if (organizationName) updateData.organizationName = organizationName;
    if (sportsPreferences) updateData.sportsPreferences = sportsPreferences;
    if (companyName) updateData.companyName = companyName;

    // Update user profile
    const user = await User.findByIdAndUpdate(decoded.userId, updateData, {
      new: true,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          city: user.city,
          state: user.state,
          gender: user.gender,
          phoneVerified: user.phoneVerified,
          organizationName: user.organizationName,
          sportsPreferences: user.sportsPreferences,
          companyName: user.companyName,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
