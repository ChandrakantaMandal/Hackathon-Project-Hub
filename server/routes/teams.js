import express from "express";
import {
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
} from "../controller/teams.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest, schemas } from "../middleware/validation.js";

const router = express.Router();

router.post("/",authenticateToken,validateRequest(schemas.createTeam),createTeam);
router.get("/", authenticateToken, getTeams);
router.get("/users/search", authenticateToken, searchUsers);
router.get("/:id", authenticateToken, getTeamById);
router.post("/join/:inviteCode", authenticateToken, joinTeam);
router.put("/:id", authenticateToken, updateTeam);
router.post("/:id/regenerate-code", authenticateToken, regenerateInviteCode);
router.post("/:id/members", authenticateToken, addMember);
router.delete("/:id/members/:userId", authenticateToken, removeMember);
router.delete("/:id", authenticateToken, deleteTeam);
router.get("/search/all", authenticateToken, searchAllTeams);

export default router;
