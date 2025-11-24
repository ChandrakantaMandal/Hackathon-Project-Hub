import express from "express";
import {
  register,
  login,
  logout,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  checkauth,
  getProfile,
  updateProfile,
} from "../controller/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateRequest, schemas } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validateRequest(schemas.register), register);
router.post("/signup", validateRequest(schemas.register), register); // Alias for frontend compatibility
router.post("/login", validateRequest(schemas.login), login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Semi-protected routes (check auth without requiring token)
router.get("/check-auth", checkauth);

// Protected routes
router.get("/me", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

export default router;
