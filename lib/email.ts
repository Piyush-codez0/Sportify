import nodemailer from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST!;
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587", 10);
const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD!;

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
      console.warn("Email configuration missing. Notifications disabled.");
      return null;
    }

    transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: EMAIL_PORT === 465,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log("Email sending skipped - no configuration");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"Sportify" <${EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
    });
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
}

export async function sendRegistrationConfirmation(
  email: string,
  name: string,
  tournamentName: string,
  tournamentDate: string,
  registrationType: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Registration Confirmed!</h2>
      <p>Hi ${name},</p>
      <p>Your registration for <strong>${tournamentName} tournament</strong> has been confirmed.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${tournamentDate}</p>
        <p><strong>Registration Type:</strong> ${registrationType}</p>
      </div>
      <p>The organizer will verify your documents shortly. You'll receive another email once verification is complete.</p>
      <p>Good luck!</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Sportify - Transforming Local Sports in India
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Registration Confirmed - ${tournamentName}`,
    html,
  });
}

export async function sendPaymentConfirmation(
  email: string,
  name: string,
  tournamentName: string,
  amount: number,
  paymentId: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10b981;">Payment Successful!</h2>
      <p>Hi ${name},</p>
      <p>Your payment for <strong>${tournamentName}</strong> has been received and verified.</p>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Amount Paid:</strong> ₹${amount}</p>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Tournament:</strong> ${tournamentName}</p>
      </div>
      <p>Your registration is now complete. See you at the tournament!</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Sportify - Transforming Local Sports in India
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Confirmed - ${tournamentName}`,
    html,
  });
}

export async function sendVerificationUpdate(
  email: string,
  name: string,
  tournamentName: string,
  organizerName: string,
  sportName: string,
  verified: boolean
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
        <h2 style="color: ${
          verified ? "#10b981" : "#ef4444"
        }; margin: 0 0 12px 0;">
          ${verified ? "Documents Verified!" : "Verification Issue"}
        </h2>
        <p style="margin: 0 0 8px 0;">Hi ${name},</p>
        ${
          verified
            ? `<p style="margin: 0 0 6px 0;">Great news! Your documents for <strong>${tournamentName}</strong> have been verified by <strong>${organizerName}</strong>.</p>
              <p style="margin: 0 0 6px 0;">You're all set to participate. We'll send you more details as the tournament date approaches.</p>`
            : `<p style="margin: 0 0 6px 0;">Unfortunately, there was an issue with your document verification for the tournament <strong>${tournamentName}</strong>, organized by <strong>${organizerName}</strong>.</p>
              <p style="margin: 0 0 6px 0;">Please contact the organizer for more information or resubmit your documents.</p>`
        }
      </div>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Sportify - Transforming Local Sports in India
      </p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `${
      verified ? "Verified" : "Verification Required"
    } - ${tournamentName}`,
    html,
  });
}

export async function sendTournamentUpdateToParticipants(
  emails: string[],
  tournamentName: string,
  updateMessage: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Tournament Update</h2>
      <p><strong>${tournamentName}</strong></p>
      <p>${updateMessage}</p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
        Sportify - Transforming Local Sports in India
      </p>
    </div>
  `;

  const promises = emails.map((email) =>
    sendEmail({
      to: email,
      subject: `Update: ${tournamentName}`,
      html,
    })
  );

  const results = await Promise.allSettled(promises);
  return results.filter((r) => r.status === "fulfilled").length;
}
