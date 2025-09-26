import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest, schemas } from "../middleware/validation.js";
import {
  createProject,
  getProject,
  getProjectById,
  updateProject,
  addMember,
  showcaseProject,
  deleteProject,
} from "../controller/projects.js";

const router = express.Router();

router.post("/",authenticateToken,validateRequest(schemas.createProject),createProject);
router.get("/", authenticateToken,getProject);
router.get("/:id", authenticateToken, getProjectById);
router.put("/:id", authenticateToken, updateProject);
router.post("/:id/collaborators", authenticateToken, addMember);
router.post("/:id/toggle-showcase", authenticateToken, showcaseProject);
router.delete("/:id", authenticateToken,deleteProject );

export default router;
