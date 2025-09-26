import express from "express";
import {
  getShowcase,
  getShowcaseProject,
  likeShowcaseProject,
  addShowcaseComment,
  getShowcaseStats,
} from "../controller/showcase.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = express.Router();


router.get("/", optionalAuth, getShowcase);
router.get("/:id", optionalAuth, getShowcaseProject);
router.post("/:id/like", authenticateToken, likeShowcaseProject);
router.post("/:id/comments", authenticateToken, addShowcaseComment);
router.get("/stats", optionalAuth, getShowcaseStats);

export default router;
