import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: "",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    teams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },
    ],

    // Authentication and verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    resetPasswordToken: String,
    resetPasswordExpiresAt: Date,

    // Track last login
    lastLogin: Date,
  },
  { timestamps: true }
);

// 🔒 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    const isBcryptHash = /^\$2[aby]\$/.test(this.password);

    if (isBcryptHash) {
      return next();
    }

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔑 Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🧹 Remove password field from output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.verificationTokenExpiresAt;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpiresAt;
  return userObject;
};

// Performance: Add indexes for frequently queried fields
// Note: email already has unique index from schema definition (line 16)
userSchema.index({ name: 1 }); // Search by name
userSchema.index({ createdAt: -1 }); // Sort by registration date

export default mongoose.model("User", userSchema);
