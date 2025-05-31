import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import { promisify } from "util";
import IUser from "../types/IUser";

const pbkdf2Async = promisify(crypto.pbkdf2);

const userSchema = new Schema({
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
  organisation: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organisation",
  }],
  phone: {
    type: String,
  },
  password: {
    type: String,
    select: false,
  },
  salt: {
    type: String,
  },
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

// Password hashing
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = crypto.randomBytes(16).toString('hex');
  this.salt = salt;

  const derivedKey = await pbkdf2Async(
    this.password,
    salt,
    1000,
    64,
    'sha512'
  );
  this.password = derivedKey.toString('hex');

  next();
});

// Set default permissions based on role
userSchema.pre<IUser>('save', function (next) {
  if (this.role === 'superadmin') {
    this.permissions = {
      ...this.permissions,
      managePayments: true,
      manageSettings: true,
      manageAdmins: true,
    };
  }
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const hashedPassword = await new Promise((resolve, reject) => {
    crypto.pbkdf2(
      candidatePassword,
      this.salt,
      1000,
      64,
      "sha512",
      (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey.toString("hex"));
      }
    );
  });

  return hashedPassword === this.password;
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

export const Admin = mongoose.model<IUser>("User", userSchema);


