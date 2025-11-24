import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  EyeIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  RocketLaunchIcon,
  PlusIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useAppStore } from "../store/useAppStore";
import api from "../utils/api";
import Button from "../components/common/Button";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";


const DashboardLayout = () => {
  const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode } = useAppStore();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [teams, setTeams] = useState([]);
  const { user, logout } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Showcase", href: "/showcase", icon: EyeIcon },
  ];

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebarVariants = undefined;

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        if (!user) return;
        const res = await api.get("/teams");
        if (res.data?.success) {
          setTeams(res.data.data.teams || []);
        }
      } catch (_) {
        setTeams([]);
      }
    };
    loadTeams();
  }, [user]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', !!darkMode);
    }
  }, [darkMode]);

  const handleProjectCreated = (newProject) => {
    setShowCreateProject(false);
    window.location.reload();
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-black/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-600 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-white/10 dark:border-slate-600">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <RocketLaunchIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <span className="text-xl font-bold gradient-text">HackHub</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-white/10 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 py-6">
            {/* Quick Actions */}
            <div className="mb-8">
              <Button
                onClick={() => setShowCreateProject(true)}
                className="w-full mb-3 btn-glow flex items-center justify-center"
                size="medium"
              >
                <PlusIcon className="w-5 h-5 mr-2 shrink-0" />
                <span>New Project</span>
              </Button>
            </div>

            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`sidebar-item ${
                    isActive(item.href) ? "active" : ""
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-6 h-6" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Teams Section */}
            {teams && teams.length > 0 && (
              <div className="mt-8">
                <h3 className="px-4 text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Your Teams
                </h3>
                <div className="space-y-1">
                  {teams.slice(0, 3).map((team) => (
                    <Link
                      key={team._id}
                      to={`/dashboard/team/${team._id}`}
                      className="sidebar-item"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <UsersIcon className="w-6 h-6" />
                      <span className="truncate">{team.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Dark Mode Toggle & Sign Out */}
          <div className="px-6 pb-3 space-y-3">
            <Button
              variant="ghost"
              className={`w-full hover:bg-gray-100 hover:text-purple-600 dark:hover:bg-slate-700 dark:hover:text-purple-300 transition-all duration-200 ${
                darkMode ? "bg-purple-50 dark:bg-purple-500/10" : ""
              }`}
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <>
                  <SunIcon className="w-5 h-5 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <MoonIcon className="w-5 h-5 mr-2" />
                  Dark Mode
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full btn-signout"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>

        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:ml-72 ml-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-600 shadow-none px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-slate-300" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900 dark:text-slate-100">
                Dashboard
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-white/10 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User"
                    )}&background=8B5CF6&color=ffffff&size=128&bold=true`
                  }
                  alt={user?.name}
                  className="w-8 h-8 rounded-full ring-2 ring-purple-500/20"
                />
                <span className="hidden sm:block font-medium text-gray-700 dark:text-slate-200">
                  {user?.name}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 dark:text-slate-300" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-56 glass-card rounded-lg shadow-lg z-50 dark:bg-slate-800 dark:border-slate-600"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="py-2">
                      <Link
                        to="/dashboard/profile"
                        className="flex items-center px-4 py-2 text-gray-700 dark:text-slate-200 hover:bg-white/10 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <UserCircleIcon className="w-5 h-5 mr-3" />
                        Profile Settings
                      </Link>
                      <hr className="my-2 border-white/20 dark:border-slate-600" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">
          <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleProjectCreated}
        teams={teams}
      />
    </div>
  );
};

export default DashboardLayout;
