import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const judgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Judge name is required"],
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
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    judgeCode: {
      type: String,
      required: [true, "Judge code is required"],
      unique: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specialization: {
      type: String,
      enum: ["web", "mobile", "ai", "blockchain", "iot", "game", "general"],
      default: "general",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
judgeSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
judgeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Performance: Add indexes for frequently queried fields
// Note: email and judgeCode already have unique indexes from schema definition (lines 16, 28)
judgeSchema.index({ isActive: 1 }); // Filter active judges
judgeSchema.index({ specialization: 1 }); // Filter by specialization

export default mongoose.model("Judge", judgeSchema);
