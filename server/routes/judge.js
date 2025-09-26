import express from "express";
import {
  register,
  login,
  verifyJudge,
  getSubmissions,
  scoreSubmission,
  awardBadge,
  deleteBadge,
} from "../controller/judge.js";
import { authenticateJudge } from "../middleware/judgeAuth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticateJudge, verifyJudge);
router.get("/submissions", authenticateJudge, getSubmissions);
router.post("/submissions/:id/score", authenticateJudge, scoreSubmission);
router.post("/submissions/:id/badge", authenticateJudge, awardBadge);
router.delete("/submissions/:id/badge/:badgeIndex",authenticateJudge,deleteBadge);

export default router;
