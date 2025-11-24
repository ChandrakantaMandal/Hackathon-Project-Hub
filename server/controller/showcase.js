import Project from "../models/Project.js";

// @route   GET /api/showcase
// @desc    Get public projects for showcase
// @access  Public
const getShowcase = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = "recent",
    } = req.query;

    let query = { "showcase.isPublic": true };
    let sortOptions = {};

    if (category && category !== "all") {
      query.category = category;
    }

    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

 
    switch (sort) {
      case "popular":
        sortOptions = { "showcase.likes": -1, "showcase.views": -1 };
        break;
      case "views":
        sortOptions = { "showcase.views": -1 };
        break;
      case "recent":
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const projects = await Project.find(query)
      .populate("owner", "name email avatar")
      .populate("collaborators", "name email avatar")
      .populate("team", "name")
      .select("-tasks -showcase.comments") 
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean() 
      .exec();

    const total = await Project.countDocuments(query);

    // Add user like status if authenticated
    if (req.user) {
      projects.forEach((project) => {
        project.userLiked = project.showcase.likes.some(
          (like) => like.user.toString() === req.user._id.toString()
        );
      });
    }

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get showcase error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch showcase projects",
      error: error.message,
    });
  }
};

// @route   GET /api/showcase/:id
// @desc    Get single project from showcase
// @access  Public
const getShowcaseProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      "showcase.isPublic": true,
    })
      .populate("owner", "name email avatar bio")
      .populate("collaborators", "name email avatar bio")
      .populate("team", "name description")
      .populate("showcase.likes.user", "name email avatar")
      .populate("showcase.comments.user", "name email avatar");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not public",
      });
    }

    if (
      !req.user ||
      !project.collaborators.some(
        (collab) => collab._id.toString() === req.user._id.toString()
      )
    ) {
      project.showcase.views += 1;
      await project.save();
    }

  
    if (req.user) {
      project.userLiked = project.showcase.likes.some(
        (like) => like.user._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Get showcase project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// @route   POST /api/showcase/:id/like
// @desc    Like/unlike a project
// @access  Private
const likeShowcaseProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      "showcase.isPublic": true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not public",
      });
    }

    const existingLike = project.showcase.likes.find(
      (like) => like.user.toString() === req.user._id.toString()
    );

    if (existingLike) {
      project.showcase.likes = project.showcase.likes.filter(
        (like) => like.user.toString() !== req.user._id.toString()
      );
    } else {
      project.showcase.likes.push({ user: req.user._id });
    }

    await project.save();

    res.json({
      success: true,
      message: existingLike ? "Project unliked" : "Project liked",
      data: {
        liked: !existingLike,
        totalLikes: project.showcase.likes.length,
      },
    });
  } catch (error) {
    console.error("Like project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update like",
      error: error.message,
    });
  }
};

// @route   POST /api/showcase/:id/comments
// @desc    Add comment to a project
// @access  Private
const addShowcaseComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      "showcase.isPublic": true,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or not public",
      });
    }

    project.showcase.comments.push({
      user: req.user._id,
      text: text.trim(),
    });

    await project.save();
    await project.populate("showcase.comments.user", "name email avatar");

    const newComment =
      project.showcase.comments[project.showcase.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: newComment,
        totalComments: project.showcase.comments.length,
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

// @route   GET /api/showcase/stats
// @desc    Get showcase statistics
// @access  Public
const getShowcaseStats = async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({
      "showcase.isPublic": true,
    });
    const totalViews = await Project.aggregate([
      { $match: { "showcase.isPublic": true } },
      { $group: { _id: null, totalViews: { $sum: "$showcase.views" } } },
    ]);

    const totalLikes = await Project.aggregate([
      { $match: { "showcase.isPublic": true } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: "$showcase.likes" } },
        },
      },
    ]);

    const categoryCounts = await Project.aggregate([
      { $match: { "showcase.isPublic": true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        totalViews: totalViews[0]?.totalViews || 0,
        totalLikes: totalLikes[0]?.totalLikes || 0,
        categories: categoryCounts,
      },
    });
  } catch (error) {
    console.error("Get showcase stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

export {
  getShowcase,
  getShowcaseProject,
  likeShowcaseProject,
  addShowcaseComment,
  getShowcaseStats,
};
