import Project from "../models/Project.js";
import Team from "../models/Team.js";

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      tags,
      category,
      teamId,
      dueDate,
    } = req.body;

    // Verify team exists and user is a member
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    if (!team.isMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this team",
      });
    }

    const project = new Project({
      title,
      description,
      shortDescription,
      tags: tags || [],
      category: category || "other",
      team: teamId,
      owner: req.user._id,
      collaborators: [req.user._id],
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await project.save();

    // Add project to team
    team.projects.push(project._id);
    await team.save();

    await project.populate([
      { path: "owner", select: "name email avatar" },
      { path: "collaborators", select: "name email avatar" },
      { path: "team", select: "name" },
    ]);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: { project },
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// @route   GET /api/projects
// @desc    Get user's projects
// @access  Private
const getProject = async (req, res) => {
  try {
    const { teamId, status } = req.query;

    let query = {
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    };

    if (teamId) {
      query.team = teamId;
    }

    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate("owner", "name email avatar")
      .populate("collaborators", "name email avatar")
      .populate("team", "name")
      .populate("tasks", "title status priority")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
const getProjectById = async (req, res) => {
  try {

    const project = await Project.findById(req.params.id)
      .populate("owner", "name email avatar")
      .populate("collaborators", "name email avatar")
      .populate({
        path: "team",
        select: "name members",
        populate: {
          path: "members.user",
          select: "name email avatar",
        },
      })
      .populate({
        path: "tasks",
        populate: [
          { path: "assignedTo", select: "name email avatar" },
          { path: "createdBy", select: "name email avatar" },
        ],
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }


    // Check access properly
    const canAccess =
      project.owner._id.toString() === req.user._id.toString() ||
      project.collaborators.some(
        (collab) => collab._id.toString() === req.user._id.toString()
      ) ||
      (project.team &&
        project.team.members &&
        project.team.members.some(
          (member) => member.user._id.toString() === req.user._id.toString()
        ));


    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner or collaborator
    if (
      project.owner.toString() !== req.user._id.toString() &&
      !project.collaborators.includes(req.user._id)
    ) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "shortDescription",
      "tags",
      "category",
      "status",
      "priority",
      "dueDate",
      "links",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    await project.save();
    await project.populate([
      { path: "owner", select: "name email avatar" },
      { path: "collaborators", select: "name email avatar" },
      { path: "team", select: "name" },
    ]);

    res.json({
      success: true,
      message: "Project updated successfully",
      data: { project },
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// @route   POST /api/projects/:id/collaborators
// @desc    Add collaborator to project
// @access  Private
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can add collaborators",
      });
    }

    // Check if user is already a collaborator
    if (project.collaborators.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a collaborator",
      });
    }

    project.collaborators.push(userId);
    await project.save();

    await project.populate("collaborators", "name email avatar");

    res.json({
      success: true,
      message: "Collaborator added successfully",
      data: { collaborators: project.collaborators },
    });
  } catch (error) {
    console.error("Add collaborator error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add collaborator",
      error: error.message,
    });
  }
};

// @route   POST /api/projects/:id/toggle-showcase
// @desc    Toggle project showcase visibility
// @access  Private
const showcaseProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can toggle showcase visibility",
      });
    }

    project.showcase.isPublic = !project.showcase.isPublic;
    await project.save();

    res.json({
      success: true,
      message: `Project is now ${
        project.showcase.isPublic ? "public" : "private"
      }`,
      data: { isPublic: project.showcase.isPublic },
    });
  } catch (error) {
    console.error("Toggle showcase error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle showcase visibility",
      error: error.message,
    });
  }
};

// @route   DELETE /api/projects/:id
// @desc    Delete project (owner only)
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("team")
      .populate("tasks");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user is project owner
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only project owner can delete the project",
      });
    }

    // Delete all tasks associated with the project
    const Task = (await import("../models/Task.js")).default;
    await Task.deleteMany({ project: project._id });

    // Remove project from team's projects array
    if (project.team) {
      const Team = (await import("../models/Team.js")).default;
      await Team.findByIdAndUpdate(project.team._id, {
        $pull: { projects: project._id },
      });
    }

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project and all associated tasks deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

export {
  createProject,
  getProject,
  getProjectById,
  updateProject,
  addMember,
  showcaseProject,
  deleteProject,
};
