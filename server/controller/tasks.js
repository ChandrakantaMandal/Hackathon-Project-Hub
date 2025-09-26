import Task from "../models/Task.js";
import Project from "../models/Project.js";

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      project,
      assignedTo,
      dueDate,
      estimatedHours,
    } = req.body;

    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (!projectDoc.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const task = new Task({
      title,
      description,
      priority: priority || "medium",
      project: project,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      estimatedHours: estimatedHours || 0,
    });

    await task.save();

    // Add task to project
    projectDoc.tasks.push(task._id);
    await projectDoc.save();

    await task.populate([
      { path: "assignedTo", select: "name email avatar" },
      { path: "createdBy", select: "name email avatar" },
      { path: "project", select: "title" },
    ]);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
};

// @route   GET /api/tasks
// @desc    Get tasks for a project or user
// @access  Private
const getTask = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;

    let query = {};

    if (projectId) {
      // Verify project access
      const project = await Project.findById(projectId);
      if (!project || !project.canAccess(req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }
      query.project = projectId;
    } else {
      // Get user's projects
      const userProjects = await Project.find({
        $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
      }).select("_id");

      query.project = { $in: userProjects.map((p) => p._id) };
    }

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate("project", "title")
      .populate("comments.user", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { tasks },
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

// @route   GET /api/tasks/:id
// @desc    Get task by ID
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .populate({
        path: "project",
        select: "title collaborators owner team",
        populate: {
          path: "team",
          select: "name members",
          populate: {
            path: "members.user",
            select: "name email avatar",
          },
        },
      })
      .populate("comments.user", "name email avatar")
      .populate("dependencies", "title status");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to the project
    if (!task.project.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch task",
      error: error.message,
    });
  }
};

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: "project",
      populate: {
        path: "team",
        select: "name members",
        populate: {
          path: "members.user",
          select: "name email avatar",
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to the project
    if (!task.project.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "assignedTo",
      "dueDate",
      "estimatedHours",
      "actualHours",
      "tags",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    await task.save();
    await task.populate([
      { path: "assignedTo", select: "name email avatar" },
      { path: "createdBy", select: "name email avatar" },
      { path: "project", select: "title" },
    ]);

    res.json({
      success: true,
      message: "Task updated successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
};

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
const addCommentTask = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const task = await Task.findById(req.params.id).populate({
      path: "project",
      populate: {
        path: "team",
        select: "name members",
        populate: {
          path: "members.user",
          select: "name email avatar",
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user has access to the project
    if (!task.project.canAccess(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await task.save();
    await task.populate("comments.user", "name email avatar");

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: task.comments[task.comments.length - 1],
        totalComments: task.comments.length,
      },
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
      error: error.message,
    });
  }
};

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: "project",
      populate: {
        path: "team",
        select: "name members",
        populate: {
          path: "members.user",
          select: "name email avatar",
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Check if user is task creator or project owner
    if (
      task.createdBy.toString() !== req.user._id.toString() &&
      task.project.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    // Remove task from project
    await Project.findByIdAndUpdate(task.project._id, {
      $pull: { tasks: task._id },
    });

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

export {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  addCommentTask,
  deleteTask,
};
