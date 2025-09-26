import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controller/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest, schemas } from "../middleware/validation.js";

const router = express.Router();


router.post("/register", validateRequest(schemas.register), register);
router.post("/login", validateRequest(schemas.login), login);
router.get("/me", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

export default router;
