import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ISponsorship extends Document {
  _id: Types.ObjectId;
  tournament: mongoose.Types.ObjectId;
  sponsor: mongoose.Types.ObjectId;

  // Sponsorship details
  amount: number;
  sponsorshipType:
    | "title"
    | "platinum"
    | "gold"
    | "silver"
    | "bronze"
    | "associate";
  benefits: string[];

  // Brand visibility
  logoPlacement?: string;
  bannerPlacement?: string;

  // Status
  status: "pending" | "approved" | "rejected" | "active" | "completed";

  // Contract
  contractDocument?: string;
  startDate?: Date;
  endDate?: Date;

  // Communication
  message?: string;
  organizerResponse?: string;

  createdAt: Date;
  updatedAt: Date;
}

const SponsorshipSchema = new Schema<ISponsorship>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    sponsor: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Details
    amount: {
      type: Number,
      required: [true, "Sponsorship amount is required"],
    },
    sponsorshipType: {
      type: String,
      enum: ["title", "platinum", "gold", "silver", "bronze", "associate"],
      required: true,
    },
    benefits: [String],

    // Visibility
    logoPlacement: String,
    bannerPlacement: String,

    // Status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "completed"],
      default: "pending",
    },

    // Contract
    contractDocument: String,
    startDate: Date,
    endDate: Date,

    // Communication
    message: String,
    organizerResponse: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
SponsorshipSchema.index({ tournament: 1 });
SponsorshipSchema.index({ sponsor: 1 });
SponsorshipSchema.index({ status: 1 });

const Sponsorship: Model<ISponsorship> =
  mongoose.models.Sponsorship ||
  mongoose.model<ISponsorship>("Sponsorship", SponsorshipSchema);

export default Sponsorship;
