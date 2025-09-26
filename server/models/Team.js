import mongoose from 'mongoose';
import crypto from 'crypto';

// Generate random invite code without nanoid
const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  stats: {
    totalProjects: {
      type: Number,
      default: 0
    },
    completedProjects: {
      type: Number,
      default: 0
    },
    totalMembers: {
      type: Number,
      default: 1
    }
  },
  inviteCode: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Check if user is member
teamSchema.methods.isMember = function(userId) {
  if (!userId) return false;
  return this.members.some(member => {
    const memberId = member.user._id || member.user;
    return memberId.toString() === userId.toString();
  });
};

// Get member role
teamSchema.methods.getMemberRole = function(userId) {
  if (!userId) return null;
  const member = this.members.find(member => {
    const memberId = member.user._id || member.user;
    return memberId.toString() === userId.toString();
  });
  return member ? member.role : null;
};

// Regenerate invite code
teamSchema.methods.regenerateInviteCode = function() {
  this.inviteCode = generateInviteCode();
  return this.save();
};

// Pre-save middleware to generate inviteCode if not present
teamSchema.pre('save', function(next) {
  // Only generate inviteCode if it's not already set (for new documents)
  if (this.isNew && !this.inviteCode) {
    this.inviteCode = generateInviteCode();
  }
  next();
});

export default mongoose.model('Team', teamSchema);




