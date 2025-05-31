import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs"; 
import crypto from "crypto";
import { promisify } from "util";
import IUser from "../types/IUser";

const pbkdf2Async = promisify(crypto.pbkdf2);

const userSchema = new Schema<IUser>({
  firstname: {
    type: String,
    required: [true, "Please enter the first name"],
  },
  lastname: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  }],
  phone: {
    type: String,
  },
  password: {
    type: String,
    select: false,
  },
  // Remove salt field as bcrypt handles it internally
  avatar: {
    public_id: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
  },
  
  lastLogin: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Suspended"],
    default: "Active",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
});

// Update timestamps pre-save
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Email validation
userSchema.pre("save", function (next) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    return next(new Error("Please enter a valid email address"));
  }
  next();
});

// Password hashing with bcrypt
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password
  // No need to store salt explicitly, bcrypt handles it within the hash

  next();
});

// Method to compare password with bcrypt
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate reset token
userSchema.methods.getToken = async function (): Promise<string> {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  return resetToken;
};

// Method to log activity
userSchema.methods.logActivity = function(action: string, details?: string, ipAddress?: string) {
  this.activityLog.push({
    action,
    details,
    ipAddress,
    timestamp: new Date()
  });
};

export const User = mongoose.model<IUser>("User", userSchema);


