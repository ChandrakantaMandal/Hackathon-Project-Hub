import express from "express";
import {
  createTask,
  getTask,
  getTaskById,
  updateTask,
  addCommentTask,
  deleteTask,
} from "../controller/tasks.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest, schemas } from "../middleware/validation.js";

const router = express.Router();

router.post("/",authenticateToken,validateRequest(schemas.createTask),createTask);
router.get("/", authenticateToken, getTask);
router.get("/:id", authenticateToken,getTaskById);
router.put("/:id", authenticateToken, updateTask);
router.post("/:id/comments", authenticateToken, addCommentTask);
router.delete("/:id", authenticateToken,deleteTask);

export default router;
