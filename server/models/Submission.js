import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    liveLink: {
      type: String,
      required: [true, "Live demo link is required"],
      trim: true,
    },
    githubLink: {
      type: String,
      required: [true, "GitHub repository link is required"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["submitted", "under-review", "reviewed"],
      default: "submitted",
    },
    scores: [
      {
        judge: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Judge",
          required: true,
        },
        innovation: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
        },
        technical: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
        },
        design: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
        },
        presentation: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
        },
        overall: {
          type: Number,
          min: 0,
          max: 10,
          required: true,
        },
        feedback: {
          type: String,
          maxlength: [500, "Feedback cannot exceed 500 characters"],
        },
        scoredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    badges: [
      {
        type: {
          type: String,
          enum: [
            "first-riser",
            "last-arrival",
            "innovation-master",
            "tech-wizard",
            "design-guru",
            "peoples-choice",
          ],
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        awardedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Judge",
          required: false, 
        },
        awardedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    finalScore: {
      type: Number,
      default: 0,
    },
    rank: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate final score when scores are updated
submissionSchema.methods.calculateFinalScore = function () {
  if (this.scores.length === 0) {
    this.finalScore = 0;
    return;
  }

  const totalScore = this.scores.reduce((sum, score) => {
    return (
      sum +
      (score.innovation +
        score.technical +
        score.design +
        score.presentation +
        score.overall)
    );
  }, 0);

  this.finalScore = totalScore / (this.scores.length * 5);
};

// Performance: Add indexes for frequently queried fields
submissionSchema.index({ project: 1 }); 
submissionSchema.index({ team: 1 });
submissionSchema.index({ status: 1 });
submissionSchema.index({ finalScore: -1 }); 
submissionSchema.index({ rank: 1 }); 
submissionSchema.index({ createdAt: -1 }); 
submissionSchema.index({ status: 1, finalScore: -1 }); 

export default mongoose.model("Submission", submissionSchema);
