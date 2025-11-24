import bcryptjs from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";


import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from "../mailtrap/emails.js";


// SIGNUP
export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    saveTempRegistration(email, {
      email,
      password: hashedPassword,
      name,
      verificationToken,
    });

    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message:
        "Verification code sent to email. Please verify within 10 minutes to complete registration.",
      user: {
        email,
        name,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  try {

    const tempData = getTempRegistration(code);

    if (!tempData) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please register again.",
      });
    }

    const existingUser = await User.findOne({ email: tempData.email });
    if (existingUser) {
      deleteTempRegistration(tempData.email);
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = new User({
      email: tempData.email,
      password: tempData.password,
      name: tempData.name,
      isVerified: true,
    });

    await user.save();

    deleteTempRegistration(tempData.email);

    await sendWelcomeEmail(user.email, user.name);

    generateTokenAndSetCookie(res, user._id);

    res.status(200).json({
      success: true,
      message: "Email verified successfully. Account created!",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// RESEND VERIFICATION EMAIL
export const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }

    res.status(400).json({
      success: false,
      message:
        "Verification code expired. Please register again from the signup page.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate("teams");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials" });
    }

    generateTokenAndSetCookie(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logout successful" });
};


// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpireAt = Date.now() + 60 * 60 * 1000; 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpireAt;
    await user.save();

    const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await sendPasswordResetEmail(user.email, resetURL);
    } catch (emailError) {
      console.log("Email sending failed:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// CHECK AUTH 
export const checkauth = async (req, res) => {
  try {
    // Get token from cookie
    const token = req.cookies?.token;

    // If no token, return not authenticated (200 status, not 401)
    if (!token) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    // Verify token
    const jwt = await import("jsonwebtoken");
    let decoded;
    try {
      decoded = jwt.default.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Invalid token - return not authenticated
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    // Get user
    const user = await User.findById(decoded.userId)
      .select("-password")
      .populate("teams", "name description inviteCode");

    if (!user) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    res.status(200).json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        name: name || undefined,
        bio: bio !== undefined ? bio : undefined,
        skills: skills || undefined,
        avatar: avatar || undefined,
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


export const register = signup;
export const getProfile = checkauth;
