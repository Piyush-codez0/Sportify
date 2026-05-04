import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Please check the email or sign up for a new account.",
        },
        { status: 404 }
      );
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Store hashed version in DB (never store raw tokens)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Build reset URL
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; padding: 20px 0;">
          <h2 style="color: #4f46e5; margin: 0;">Reset Your Password</h2>
        </div>
        <div style="background: #f9fafb; padding: 24px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 16px 0; color: #374151;">Hi ${user.name},</p>
          <p style="margin: 0 0 16px 0; color: #374151;">
            We received a request to reset your password. Click the button below to set a new password:
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            This link will expire in <strong>1 hour</strong>.
          </p>
          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            If the button above doesn't work, copy and paste this link into your browser:
          </p>
          <p style="margin: 8px 0 0 0; color: #6366f1; font-size: 12px; word-break: break-all;">
            ${resetUrl}
          </p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
          Sportify - Transforming Local Sports in India
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password - Sportify",
      html,
    });

    return NextResponse.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
