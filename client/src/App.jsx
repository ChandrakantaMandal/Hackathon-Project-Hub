import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppStore } from "./store/useAppStore";

import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const SignupPage = lazy(() => import("./pages/Auth/SignupPage"));
const SiginPage = lazy(() => import("./pages/Auth/SiginPage"));
const EmailVerificationPage = lazy(() =>
  import("./pages/Auth/EmailVerificationPage")
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/Auth/ForgotPasswordPage")
);
const ResetPasswordPage = lazy(() => import("./pages/Auth/ResetPasswordPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeamPage = lazy(() => import("./pages/TeamPage.jsx"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const JudgeLogin = lazy(() => import("./pages/Judge/JudgeLogin"));
const JudgeDashboard = lazy(() => import("./pages/Judge/JudgeDashboard"));


import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  const { user, isAuthenticated, authReady, initAuth } = useAppStore();
  const [loading, setLoading] = useState(true);

  // User is fully authenticated only if they have a user object AND are authenticated
  const isFullyAuthenticated = user && isAuthenticated;

  useEffect(() => {
    let done = false;
    (async () => {
      await initAuth();
      if (!done) setLoading(false);
    })();
    return () => {
      done = true;
    };
  }, [initAuth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-purple-blue">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isFullyAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LandingPage />
          )
        }
      />

      <Route
        path="/signup"
        element={
          isFullyAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SignupPage />
          )
        }
      />

      <Route
        path="/signin"
        element={
          isFullyAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <SiginPage />
          )
        }
      />

      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route path="/judge/login" element={<JudgeLogin />} />
      <Route path="/judge/dashboard" element={<JudgeDashboard />} />

      <Route path="/showcase" element={<ShowcasePage />} />
      <Route path="/showcase/:projectId" element={<ShowcasePage />} />

      {/* Protected Routes */}
      {isFullyAuthenticated ? (
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="team/:teamId" element={<TeamPage />} />
          <Route path="project/:projectId" element={<ProjectPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      ) : (
        <Route
          path="/dashboard/*"
          element={<Navigate to="/signin" replace />}
        />
      )}

      {/* Catch all route */}
      <Route
        path="*"
        element={
          <Navigate to={isFullyAuthenticated ? "/dashboard" : "/"} replace />
        }
      />
    </Routes>
  );
}

export default App;
