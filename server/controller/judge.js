import jwt from "jsonwebtoken";
import Judge from "../models/Judge.js";
import Submission from "../models/Submission.js";



// @route   POST /api/judge/register
// @desc    Register a new judge
// @access  Public (with judge code)
const register = async (req, res) => {
  try {
    const { name, email, password, judgeCode, specialization } = req.body;

    const existingJudge = await Judge.findOne({ email });
    if (existingJudge) {
      return res.status(400).json({
        success: false,
        message: "Judge already exists with this email",
      });
    }

    const validJudgeCodes = process.env.JUDGE_CODES?.split(",") || [
      "JUDGE2024",
      "HACKJUDGE",
    ];
    if (!validJudgeCodes.includes(judgeCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid judge code",
      });
    }

    const judge = new Judge({
      name,
      email,
      password,
      judgeCode,
      specialization: specialization || "general",
    });

    await judge.save();

    const token = jwt.sign(
      { judgeId: judge._id, type: "judge" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Judge registered successfully",
      data: {
        judge: {
          _id: judge._id,
          name: judge.name,
          email: judge.email,
          specialization: judge.specialization,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// @route   POST /api/judge/login
// @desc    Login judge
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const judge = await Judge.findOne({ email, isActive: true });
    if (!judge) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await judge.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { judgeId: judge._id, type: "judge" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        judge: {
          _id: judge._id,
          name: judge.name,
          email: judge.email,
          specialization: judge.specialization,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// @route   GET /api/judge/verify
// @desc    Verify judge token
// @access  Private (Judge only)
const verifyJudge = async (req, res) => {
  try {
    const judge = await Judge.findById(req.judge.judgeId).select("-password");

    if (!judge || !judge.isActive) {
      return res.status(401).json({
        success: false,
        message: "Judge not found or inactive",
      });
    }

    res.json({
      success: true,
      data: {
        judge: {
          _id: judge._id,
          name: judge.name,
          email: judge.email,
          specialization: judge.specialization,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Token verification failed",
      error: error.message,
    });
  }
};

// @route   GET /api/judge/submissions
// @desc    Get all submissions for judging
// @access  Private (Judge only)
const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("project", "title description category tags")
      .populate("team", "name")
      .populate("submittedBy", "name email")
      .populate("scores.judge", "name")
      .sort({ createdAt: 1 }); // First submitted first

    res.json({
      success: true,
      data: { submissions },
    });
  } catch (error) {
    console.error("Judge submissions fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// @route   POST /api/judge/submissions/:id/score
// @desc    Score a submission
// @access  Private (Judge only)
const scoreSubmission = async (req, res) => {
  try {
    const { innovation, technical, design, presentation, overall, feedback } =
      req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

  
    const existingScore = submission.scores.find(
      (score) => score.judge.toString() === req.judge._id.toString()
    );

    if (existingScore) {
      existingScore.innovation = innovation;
      existingScore.technical = technical;
      existingScore.design = design;
      existingScore.presentation = presentation;
      existingScore.overall = overall;
      existingScore.feedback = feedback;
      existingScore.scoredAt = new Date();
    } else {
      submission.scores.push({
        judge: req.judge._id,
        innovation,
        technical,
        design,
        presentation,
        overall,
        feedback,
      });
    }

  
    if (submission.status === 'submitted') {
      submission.status = 'under-review';
    }

    
    submission.calculateFinalScore();
    try {
      const totalJudges = await (await import('../models/Judge.js')).default.countDocuments({ isActive: true });
      const uniqueJudgeScores = new Set(submission.scores.map(s => s.judge.toString())).size;
      if (totalJudges > 0 && uniqueJudgeScores >= totalJudges) {
        submission.status = 'reviewed';
      }
    } catch (_) {
      
    }

    await submission.save();

    res.json({
      success: true,
      message: "Score submitted successfully",
      data: { submission },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit score",
      error: error.message,
    });
  }
};

// @route   POST /api/judge/submissions/:id/badge
// @desc    Award a badge to submission
// @access  Private (Judge only)
const awardBadge = async (req, res) => {
  try {
    const { type, name, description } = req.body;

    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    const existingBadge = submission.badges.find(
      (badge) => badge.type === type
    );
    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: "Badge already awarded",
      });
    }

    submission.badges.push({
      type,
      name,
      description,
      awardedBy: req.judge._id,
    });

    await submission.save();

    res.json({
      success: true,
      message: "Badge awarded successfully",
      data: { submission },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to award badge",
      error: error.message,
    });
  }
};

// @route   DELETE /api/judge/submissions/:id/badge/:badgeIndex
// @desc    Remove a badge from submission
// @access  Private (Judge only)
const deleteBadge = async (req, res) => {
  try {
    const { id, badgeIndex } = req.params;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    if (badgeIndex < 0 || badgeIndex >= submission.badges.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid badge index",
      });
    }

    submission.badges.splice(badgeIndex, 1);
    await submission.save();

    res.json({
      success: true,
      message: "Badge removed successfully",
      data: { submission },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove badge",
      error: error.message,
    });
  }
};

export {
  register,
  login,
  verifyJudge,
  getSubmissions,
  scoreSubmission,
  awardBadge,
  deleteBadge,
};
