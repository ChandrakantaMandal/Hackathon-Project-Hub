import mongoose from "mongoose";
import crypto from "crypto";

const generateInviteCode = () => {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
};

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    stats: {
      totalProjects: {
        type: Number,
        default: 0,
      },
      completedProjects: {
        type: Number,
        default: 0,
      },
      totalMembers: {
        type: Number,
        default: 1,
      },
    },
    inviteCode: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Check if user is member
teamSchema.methods.isMember = function (userId) {
  if (!userId) return false;
  return this.members.some((member) => {
    const memberId = member.user._id || member.user;
    return memberId.toString() === userId.toString();
  });
};

// Get member role
teamSchema.methods.getMemberRole = function (userId) {
  if (!userId) return null;
  const member = this.members.find((member) => {
    const memberId = member.user._id || member.user;
    return memberId.toString() === userId.toString();
  });
  return member ? member.role : null;
};

// Regenerate invite code
teamSchema.methods.regenerateInviteCode = function () {
  this.inviteCode = generateInviteCode();
  return this.save();
};

// Pre-save middleware to generate inviteCode if not present
teamSchema.pre("save", function (next) {
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }
  next();
});

// Performance: Add indexes for frequently queried fields
// Note: inviteCode already has unique index from schema definition (line 67)
teamSchema.index({ name: 1 }); // Search by name
teamSchema.index({ owner: 1 }); // Get teams by owner
teamSchema.index({ "members.user": 1 }); // Get teams by member
teamSchema.index({ createdAt: -1 }); // Sort by creation date

export default mongoose.model("Team", teamSchema);
