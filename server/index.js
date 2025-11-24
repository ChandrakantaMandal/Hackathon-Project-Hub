import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";

// Import routes
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/teams.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";

import showcaseRoutes from "./routes/showcase.js";
import judgeRoutes from "./routes/judge.js";
import submissionRoutes from "./routes/submissions.js";

dotenv.config();


if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dev_secret_change_me";
}

const DEV_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];
const CORS_ORIGINS = (() => {
  if (process.env.CORS_ORIGINS) {
    return process.env.CORS_ORIGINS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (process.env.CORS_ORIGIN) {
    return [process.env.CORS_ORIGIN];
  }
  return process.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"]
    : DEV_ORIGINS;
})();

const app = express();

app.use(helmet());

const corsOptions = {
  origin: CORS_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: process.env.NODE_ENV === "production" ? 100 : 1000, 
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later",
      retryAfter: Math.round(limiter.windowMs / 1000),
    });
  },
});

if (process.env.NODE_ENV === "production") {
  app.use("/api/", limiter);
} else {
  app.use("/api/teams", limiter);
  app.use("/api/projects", limiter);
  app.use("/api/tasks", limiter);
  app.use("/api/chat", limiter);
  app.use("/api/showcase", limiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 50,
    message: {
      success: false,
      message: "Too many login attempts, please try again later",
    },
    handler: (req, res) => {
      console.log(`⚠️ Auth rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many login attempts, please try again later",
        retryAfter: Math.round(15 * 60), 
      });
    },
  });
  app.use("/api/auth", authLimiter);
}

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, 
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/hackathon-hub")
  .then(() => console.log("🚀 Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/showcase", showcaseRoutes);
app.use("/api/judge", judgeRoutes);
app.use("/api/submissions", submissionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running!" });
});


if (process.env.NODE_ENV !== "production") {
  app.post("/api/reset-rate-limit", (req, res) => {
    res.json({
      status: "OK",
      message: "Rate limit reset - restart server to apply changes",
      note: "This endpoint is only available in development",
    });
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Error:", error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🎉 Server running on port ${PORT}`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});
