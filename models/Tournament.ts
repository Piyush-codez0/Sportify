import mongoose, { Schema, Model, Document, Types } from "mongoose";

export interface ITournament extends Document {
  _id: Types.ObjectId;
  name: string;
  sport: string;
  description: string;
  organizer: mongoose.Types.ObjectId;

  // Location details
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  venue: string;
  city: string;
  state: string;
  googleMapsLink?: string;

  // Dates
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;

  // Registration details
  maxParticipants: number;
  currentParticipants: number;
  allowTeamRegistration: boolean;
  teamSize?: number;
  entryFee: number;

  // Tournament details
  prizePool?: number;
  rules?: string;
  ageGroup?: string;
  skillLevel?: string;

  // Status
  status: "draft" | "open" | "closed" | "ongoing" | "completed" | "cancelled";

  // Additional info
  bannerImage?: string;
  contactEmail?: string;
  contactPhone?: string;

  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
    },
    sport: {
      type: String,
      required: [true, "Sport type is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    googleMapsLink: String,

    // Dates
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    registrationDeadline: {
      type: Date,
      required: [true, "Registration deadline is required"],
    },

    // Registration
    maxParticipants: {
      type: Number,
      required: [true, "Maximum participants is required"],
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    allowTeamRegistration: {
      type: Boolean,
      default: false,
    },
    teamSize: Number,
    entryFee: {
      type: Number,
      required: [true, "Entry fee is required"],
      default: 0,
    },

    // Details
    prizePool: Number,
    rules: String,
    ageGroup: String,
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "professional", "all"],
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "open", "closed", "ongoing", "completed", "cancelled"],
      default: "draft",
    },

    // Additional
    bannerImage: String,
    contactEmail: String,
    contactPhone: String,
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
TournamentSchema.index({ location: "2dsphere" });
TournamentSchema.index({ city: 1, state: 1 });
TournamentSchema.index({ sport: 1 });
TournamentSchema.index({ status: 1 });
TournamentSchema.index({ startDate: 1 });

const Tournament: Model<ITournament> =
  mongoose.models.Tournament ||
  mongoose.model<ITournament>("Tournament", TournamentSchema);

export default Tournament;
