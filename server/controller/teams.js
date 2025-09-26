import Team from "../models/Team.js";
import User from "../models/User.js";

// @route   POST /api/teams
// @desc    Create a new team
// @access  Private
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;

    const team = new Team({
      name,
      description,
      owner: req.user._id,
      members: [
        {
          user: req.user._id,
          role: "owner",
        },
      ],
    });

    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { teams: team._id },
    });

    // Populate the team data before sending response
    await team.populate([
      { path: "members.user", select: "name email avatar" },
      { path: "owner", select: "name email avatar" },
      { path: "projects", select: "title status progress" },
    ]);

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: { team },
    });
  } catch (error) {
    console.error("Create team error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create team",
      error: error.message,
    });
  }
};

// @route   GET /api/teams
// @desc    Get user's teams
// @access  Private
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      "members.user": req.user._id,
    })
      .populate("members.user", "name email avatar")
      .populate("owner", "name email avatar")
      .populate("projects", "title status progress")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { teams },
    });
  } catch (error) {
    console.error("Get teams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch teams",
      error: error.message,
    });
  }
};

// @route   GET /api/teams/users/search
// @desc    Search for users to add to team
// @access  Private
const searchUsers = async (req, res) => {
  try {
    const { q, teamId } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { users: [] },
      });
    }

    // Get team members to exclude them from search
    let excludeUsers = [];
    if (teamId) {
      const team = await Team.findById(teamId).select("members.user");
      if (team) {
        excludeUsers = team.members.map((member) => member.user);
      }
    }

    // Search for users by name or email
    const searchQuery = {
      $and: [
        { _id: { $nin: excludeUsers } }, // Exclude current team members
        {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
      ],
    };

    const users = await User.find(searchQuery)
      .select("name email avatar")
      .limit(10);

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message,
    });
  }
};

// @route   GET /api/teams/:id
// @desc    Get team by ID
// @access  Private
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("members.user", "name email avatar bio skills")
      .populate("projects", "title description status progress createdAt")
      .populate("owner", "name email avatar");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }


    // Check if user is a member
    const isMember = team.isMember(req.user._id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Calculate stats
    const stats = {
      totalProjects: team.projects.length,
      completedProjects: team.projects.filter((p) => p.status === "completed")
        .length,
      totalTasks: 0,
      completedTasks: 0,
    };

    const teamData = {
      ...team.toObject(),
      stats,
    };

    res.json({
      success: true,
      data: { team: teamData },
    });
  } catch (error) {
    console.error("Get team error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch team",
      error: error.message,
    });
  }
};

// @route   POST /api/teams/join/:inviteCode
// @desc    Join team using invite code
// @access  Private
const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const team = await Team.findOne({ inviteCode }).populate(
      "members.user",
      "name email avatar"
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite code",
      });
    }

    // Check if user is already a member
    if (team.isMember(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this team",
      });
    }

    // Add user to team
    team.members.push({
      user: req.user._id,
      role: "member",
    });
    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { teams: team._id },
    });

    await team.populate("members.user", "name email avatar");

    res.json({
      success: true,
      message: "Successfully joined the team",
      data: { team },
    });
  } catch (error) {
    console.error("Join team error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join team",
      error: error.message,
    });
  }
};

// @route   PUT /api/teams/:id
// @desc    Update team
// @access  Private
const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user has permission to update (owner or admin)
    const userRole = team.getMemberRole(req.user._id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    const { name, description } = req.body;

    team.name = name || team.name;
    team.description =
      description !== undefined ? description : team.description;

    await team.save();
    await team.populate("members.user", "name email avatar");

    res.json({
      success: true,
      message: "Team updated successfully",
      data: { team },
    });
  } catch (error) {
    console.error("Update team error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update team",
      error: error.message,
    });
  }
};

// @route   POST /api/teams/:id/regenerate-code
// @desc    Regenerate team invite code
// @access  Private
const regenerateInviteCode = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is owner or admin
    const userRole = team.getMemberRole(req.user._id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    await team.regenerateInviteCode();

    res.json({
      success: true,
      message: "Invite code regenerated successfully",
      data: { inviteCode: team.inviteCode },
    });
  } catch (error) {
    console.error("Regenerate code error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to regenerate invite code",
      error: error.message,
    });
  }
};

// @route   POST /api/teams/:id/members
// @desc    Add member to team
// @access  Private
const addMember = async (req, res) => {
  try {
    const { userId, role = "member" } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is owner or admin
    const userRole = team.getMemberRole(req.user._id);

    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    // Check if user exists
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already a member
    if (team.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this team",
      });
    }

    // Add user to team
    team.members.push({
      user: userId,
      role: role,
    });
    await team.save();

    // Add team to user's teams array
    await User.findByIdAndUpdate(userId, {
      $push: { teams: team._id },
    });

    await team.populate("members.user", "name email avatar");

    res.json({
      success: true,
      message: "Member added successfully",
      data: { team },
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add member",
      error: error.message,
    });
  }
};

// @route   DELETE /api/teams/:id/members/:userId
// @desc    Remove member from team
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is owner or admin
    const userRole = team.getMemberRole(req.user._id);
    if (!userRole || !["owner", "admin"].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    // Check if user is trying to remove themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot remove yourself from the team",
      });
    }

    // Check if user is a member
    if (!team.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this team",
      });
    }

    // Remove user from team
    team.members = team.members.filter(
      (member) => member.user.toString() !== userId
    );
    await team.save();

    // Remove team from user's teams array
    await User.findByIdAndUpdate(userId, {
      $pull: { teams: team._id },
    });

    await team.populate("members.user", "name email avatar");

    res.json({
      success: true,
      message: "Member removed successfully",
      data: { team },
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: error.message,
    });
  }
};


// @route   DELETE /api/teams/:id
// @desc    Delete team (owner only)
// @access  Private
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate("members.user", "name email")
      .populate("projects");

    if (!team) {
      return res.status(404).json({
        success: false,
        message: "Team not found",
      });
    }

    // Check if user is team owner
    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only team owner can delete the team",
      });
    }

    // Check if team has projects
    if (team.projects && team.projects.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete team with existing projects. Please delete all projects first.",
      });
    }

    // Remove team from all members' teams array
    const memberIds = team.members.map(
      (member) => member.user._id || member.user
    );
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $pull: { teams: team._id } }
    );

    // Delete the team
    await Team.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    console.error("Delete team error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete team",
      error: error.message,
    });
  }
};

// @route   GET /api/teams/search/all
// @desc    Search all teams globally
// @access  Private
const searchAllTeams = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: { teams: [] },
      });
    }

    const searchQuery = {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    };

    const teams = await Team.find(searchQuery)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar")
      .select("name description owner members stats createdAt")
      .limit(20)
      .sort({ createdAt: -1 });

    // Add membership status for current user
    const teamsWithMembership = teams.map((team) => ({
      ...team.toObject(),
      isMember: team.isMember(req.user._id),
      memberRole: team.getMemberRole(req.user._id),
    }));

    res.json({
      success: true,
      data: { teams: teamsWithMembership },
    });
  } catch (error) {
    console.error("Search all teams error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search teams",
      error: error.message,
    });
  }
};

export {
  createTeam,
  getTeams,
  searchUsers,
  getTeamById,
  joinTeam,
  updateTeam,
  regenerateInviteCode,
  addMember,
  removeMember,
  deleteTeam,
  searchAllTeams,
};
