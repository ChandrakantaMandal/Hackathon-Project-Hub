import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    minlength: [2, 'Title must be at least 2 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['web', 'mobile', 'ai', 'blockchain', 'iot', 'game', 'other'],
    default: 'other'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'testing', 'completed', 'paused'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dueDate: {
    type: Date
  },
  links: {
    github: String,
    demo: String,
    design: String,
    documentation: String,
    liveDemo: String,  // For submission
    repository: String  // For submission
  },
  isSubmitted: {
    type: Boolean,
    default: false
  },
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission'
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  showcase: {
    isPublic: {
      type: Boolean,
      default: false
    },
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    views: {
      type: Number,
      default: 0
    },
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      text: {
        type: String,
        required: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  metrics: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    activeCollaborators: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Calculate progress based on completed tasks
projectSchema.methods.updateProgress = async function() {
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ project: this._id });
  
  if (tasks.length === 0) {
    this.progress = 0;
    this.metrics.totalTasks = 0;
    this.metrics.completedTasks = 0;
  } else {
    const completedTasks = tasks.filter(task => task.status === 'completed');
    this.progress = Math.round((completedTasks.length / tasks.length) * 100);
    this.metrics.totalTasks = tasks.length;
    this.metrics.completedTasks = completedTasks.length;
  }
  
  return this.save();
};

// Check if user can access project
projectSchema.methods.canAccess = function(userId) {
  // Owner can always access
  if (this.owner.toString() === userId.toString()) {
    return true;
  }
  
  // Check if user is a collaborator
  const isCollaborator = this.collaborators.some(
    collab => collab.toString() === userId.toString()
  );
  
  if (isCollaborator) {
    return true;
  }
  
  // Check if user is a team member
  if (this.team && this.team.members) {
    const isTeamMember = this.team.members.some(
      member => {
        const memberId = member.user._id || member.user;
        return memberId.toString() === userId.toString();
      }
    );
    return isTeamMember;
  }
  
  return false;
};

export default mongoose.model('Project', projectSchema);



