import mongoose, { Schema, Model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "organizer" | "player" | "sponsor";
  profilePicture?: string;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  city?: string;
  state?: string;
  verified: boolean;
  phoneVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Role-specific fields
  // Organizer
  organizationName?: string;
  verifiedOrganizer?: boolean;
  tournamentsOrganized?: number;

  // Player
  sportsPreferences?: string[];
  skillLevel?: string;
  achievements?: string[];
  dateOfBirth?: Date;
  gender?: string;

  // Sponsor
  companyName?: string;
  companyWebsite?: string;
  brandLogo?: string;
  sponsorshipBudget?: number;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    role: {
      type: String,
      enum: ["organizer", "player", "sponsor"],
      required: [true, "Role is required"],
    },
    profilePicture: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    city: String,
    state: String,
    verified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },

    // Organizer fields
    organizationName: String,
    verifiedOrganizer: {
      type: Boolean,
      default: false,
    },
    tournamentsOrganized: {
      type: Number,
      default: 0,
    },

    // Player fields
    sportsPreferences: [String],
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "professional"],
    },
    achievements: [String],
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    // Sponsor fields
    companyName: String,
    companyWebsite: String,
    brandLogo: String,
    sponsorshipBudget: Number,
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
UserSchema.index({ location: "2dsphere" });

// Hash password before saving
// Use async middleware without `next` parameter to avoid Mongoose middleware
// confusion where `next` may not be provided. Return or throw instead.
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
