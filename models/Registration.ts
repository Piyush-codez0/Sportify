import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ITeamMember {
  name: string;
  email: string;
  phone: string;
  aadharNumber: string;
  aadharDocument?: string; // URL to uploaded Aadhar card (kept for backward compatibility)
  aadharFrontDocument?: string; // Front of Aadhar
  aadharBackDocument?: string; // Back of Aadhar
  dateOfBirth?: Date;
  gender?: string;
}

export interface IRegistration extends Document {
  _id: Types.ObjectId;
  tournament: mongoose.Types.ObjectId;
  player: mongoose.Types.ObjectId;

  // Registration type
  registrationType: "individual" | "team";

  // Team details (if team registration)
  teamName?: string;
  teamMembers?: ITeamMember[];

  // Individual player Aadhar (for individual registration)
  aadharNumber?: string;
  aadharDocument?: string; // Front of Aadhar
  aadharBackDocument?: string; // Back of Aadhar

  // Payment details
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amountPaid?: number;
  paymentDate?: Date;

  // Verification
  verified: boolean;
  verificationNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;

  // Status
  status: "pending" | "confirmed" | "rejected" | "cancelled";

  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TeamMemberSchema = new Schema<ITeamMember>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    aadharNumber: {
      type: String,
      required: true,
    },
    aadharDocument: String, // Kept for backward compatibility
    aadharFrontDocument: String,
    aadharBackDocument: String,
    dateOfBirth: Date,
    gender: String,
  },
  { _id: false }
);

const RegistrationSchema = new Schema<IRegistration>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    player: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Registration type
    registrationType: {
      type: String,
      enum: ["individual", "team"],
      required: true,
    },

    // Team details
    teamName: String,
    teamMembers: [TeamMemberSchema],

    // Individual Aadhar
    aadharNumber: String,
    aadharDocument: String, // Front of Aadhar
    aadharBackDocument: String, // Back of Aadhar

    // Payment
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amountPaid: Number,
    paymentDate: Date,

    // Verification
    verified: {
      type: Boolean,
      default: false,
    },
    verificationNotes: String,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,

    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
    },

    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
RegistrationSchema.index({ tournament: 1, player: 1 }, { unique: true });
RegistrationSchema.index({ paymentStatus: 1 });
RegistrationSchema.index({ status: 1 });

const Registration: Model<IRegistration> =
  mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
