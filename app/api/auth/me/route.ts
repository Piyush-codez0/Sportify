import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth, AuthenticatedRequest } from "@/lib/middleware";

async function handler(request: AuthenticatedRequest) {
  try {
    await dbConnect();

    const user = await User.findById(request.user!.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture,
          city: user.city,
          state: user.state,
          verified: user.verified,

          // Role-specific fields
          ...(user.role === "organizer" && {
            organizationName: user.organizationName,
            verifiedOrganizer: user.verifiedOrganizer,
            tournamentsOrganized: user.tournamentsOrganized,
          }),

          ...(user.role === "player" && {
            sportsPreferences: user.sportsPreferences,
            skillLevel: user.skillLevel,
            achievements: user.achievements,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
          }),

          ...(user.role === "sponsor" && {
            companyName: user.companyName,
            companyWebsite: user.companyWebsite,
            brandLogo: user.brandLogo,
            sponsorshipBudget: user.sponsorshipBudget,
          }),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user" },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
