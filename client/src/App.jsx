import React,{lazy} from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAppStore } from "./store/useAppStore";

// Components
import LoadingSpinner from "./components/common/LoadingSpinner";

// Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TeamPage = lazy(() => import("./pages/TeamPage.jsx"));
const ProjectPage = lazy(() => import("./pages/ProjectPage"));
const ShowcasePage = lazy(() => import("./pages/ShowcasePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const JudgeLogin = lazy(() => import("./pages/JudgeLogin"));
const JudgeDashboard = lazy(() => import("./pages/JudgeDashboard"));


// Layout
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  const { user, authReady, initAuth } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;
    (async () => {
      await initAuth();
      if (!done) setLoading(false);
    })();
    return () => { done = true; };
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
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />

      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
      />

      <Route path="/judge/login" element={<JudgeLogin />} />
      <Route path="/judge/dashboard" element={<JudgeDashboard />} />

      <Route path="/showcase" element={<ShowcasePage />} />
      <Route path="/showcase/:projectId" element={<ShowcasePage />} />

      {/* Protected Routes */}
      {user ? (
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="team/:teamId" element={<TeamPage />} />
          <Route path="project/:projectId" element={<ProjectPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      ) : (
        <Route path="/dashboard/*" element={<Navigate to="/auth" replace />} />
      )}

      {/* Catch all route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/"} replace />}
      />
    </Routes>
  );
}

export default App;
