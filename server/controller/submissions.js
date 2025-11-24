import Submission from "../models/Submission.js";
import Project from "../models/Project.js";

// @route   POST /api/submissions
// @desc    Submit a project
// @access  Private (Team owner only)
const submitProject = async (req, res) => {
  try {
    const { projectId, liveLink, githubLink, description, techStack } =
      req.body;

  
    if (!projectId || !liveLink || !githubLink) {
      return res.status(400).json({
        success: false,
        message: "Project ID, live link, and GitHub link are required",
      });
    }

    const project = await Project.findById(projectId).populate("team");
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }


    if (project.team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only team owner can submit project",
      });
    }


    const existingSubmission = await Submission.findOne({ project: projectId });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "Project already submitted",
      });
    }

    const submission = new Submission({
      project: projectId,
      team: project.team._id,
      submittedBy: req.user._id,
      liveLink,
      githubLink,
      description: description || "",
      techStack: Array.isArray(techStack) ? techStack : [],
    });

    await submission.save();


    try {
      project.isSubmitted = true;
      project.submissionId = submission._id;
      project.links = {
        ...(project.links || {}),
        liveDemo: liveLink,
        repository: githubLink,
      };
      await project.save();
    } catch (_) {}


    const submissionCount = await Submission.countDocuments();
    if (submissionCount === 1) {
      submission.badges.push({
        type: "first-riser",
        name: "The First Riser",
        description: "First team to submit their project",
        awardedBy: null,
      });
      await submission.save();
    }

    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: { submission },
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({
      success: false,
      message: "Submission failed",
      error: error.message,
    });
  }
};

// @route   GET /api/submissions/leaderboard
// @desc    Get leaderboard
// @access  Public
const leaderboard = async (req, res) => {
  try {
    const basePopulate = [
      { path: 'project', select: 'title description category' },
      { path: 'team', select: 'name' },
      { path: 'badges.awardedBy', select: 'name' },
    ];

    const fetchWith = async (filter) => {
      const docs = await Submission.find(filter).populate(basePopulate).lean();
      const computed = docs.map((d) => {
        const scores = d.scores || [];
        const hasScores = Array.isArray(scores) && scores.length > 0;
        const sum = hasScores
          ? scores.reduce((acc, s) => acc + (s.innovation + s.technical + s.design + s.presentation + s.overall), 0)
          : 0;
        const avg = hasScores ? sum / (scores.length * 5) : 0;
        return { ...d, finalScore: typeof d.finalScore === 'number' && d.finalScore > 0 ? d.finalScore : avg };
      });
      computed.sort((a, b) => {
        if ((b.finalScore || 0) !== (a.finalScore || 0)) return (b.finalScore || 0) - (a.finalScore || 0);
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      return computed;
    };

    let submissions = await fetchWith({ status: 'reviewed', 'scores.0': { $exists: true } });
    if (!submissions || submissions.length === 0) {
      submissions = await fetchWith({ 'scores.0': { $exists: true } });
    }

    submissions.forEach((s, i) => { s.rank = i + 1; });

    res.json({ success: true, data: { leaderboard: submissions } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message,
    });
  }
};

export {submitProject,leaderboard}
