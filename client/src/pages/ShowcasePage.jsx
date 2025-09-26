import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  HeartIcon,
  EyeIcon,
  FolderIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import api from "../utils/api";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
import { formatDate, getCategoryIcon } from "../utils/helpers";
import { useAppStore } from "../store/useAppStore";

const ShowcasePage = () => {
  const { projectId } = useParams();
  const { user } = useAppStore();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadSingleProject(projectId);
    } else {
      loadProjects();
    }
  }, [projectId, searchTerm, selectedCategory, sortBy, pagination.current]);

  // Always fetch leaderboard once on mount so winners section persists across refresh
  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const loadProjects = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        sort: sortBy,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory !== "all")
        params.append("category", selectedCategory);

      const response = await api.get(`/showcase?${params}`);

      if (response.data.success) {
        setProjects(response.data.data.projects);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      toast.error("Failed to load projects");
      console.error("Load projects error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSingleProject = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/showcase/${id}`);

      if (response.data.success) {
        setSelectedProject(response.data.data.project);
      }
    } catch (error) {
      toast.error("Project not found");
      console.error("Load project error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (project) => {
    if (!user) {
      toast.error("Please sign in to like projects");
      return;
    }

    try {
      const response = await api.post(`/showcase/${project._id}/like`);

      if (response.data.success) {
        if (selectedProject && selectedProject._id === project._id) {
          setSelectedProject((prev) => ({
            ...prev,
            userLiked: response.data.data.liked,
            showcase: {
              ...prev.showcase,
              likes: response.data.data.liked
                ? [...prev.showcase.likes, { user: user._id }]
                : prev.showcase.likes.filter(
                    (like) => like.user._id !== user._id
                  ),
            },
          }));
        }

        setProjects((prev) =>
          prev.map((p) =>
            p._id === project._id
              ? {
                  ...p,
                  userLiked: response.data.data.liked,
                  showcase: {
                    ...p.showcase,
                    likes: response.data.data.liked
                      ? [...p.showcase.likes, { user: user._id }]
                      : p.showcase.likes.filter(
                          (like) => like.user._id !== user._id
                        ),
                  },
                }
              : p
          )
        );
      }
    } catch (error) {
      toast.error("Failed to update like");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, current: 1 }));
    loadProjects(1);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !selectedProject) return;

    setSubmittingComment(true);
    try {
      const response = await api.post(
        `/showcase/${selectedProject._id}/comments`,
        {
          text: comment.trim(),
        }
      );

      if (response.data.success) {
        setSelectedProject((prev) => ({
          ...prev,
          showcase: {
            ...prev.showcase,
            comments: [...(prev.showcase?.comments || []), response.data.data.comment],
          },
        }));
        setComment("");
        toast.success("Comment added successfully!");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/submissions/leaderboard');
      if (res.data.success) {
        setLeaderboard(res.data.data.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  if (loading && !projects.length) {
    return (
      <div className="min-h-screen gradient-purple-blue flex items-center justify-center">
        <LoadingSpinner size="large" color="white" />
      </div>
    );
  }

  // Single project view
  if (projectId && selectedProject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProjectDetailView
          project={selectedProject}
          onLike={() => handleLike(selectedProject)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Project Showcase
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Discover amazing projects from our community
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant={showLeaderboard ? "primary" : "outline"}
              onClick={() => {
                const next = !showLeaderboard;
                setShowLeaderboard(next);
                if (next) {
                  // Load leaderboard on demand
                  fetchLeaderboard();
                }
              }}
            >
              🏆 {showLeaderboard ? 'Show Projects' : 'Leaderboard'}
            </Button>
          </div>
        </div>

        {/* Winners Section (only when not viewing full leaderboard) */}
        {leaderboard.length > 0 && !showLeaderboard && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏆 Hackathon Winners</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {leaderboard.slice(0, 3).map((submission, index) => (
                <div key={submission._id} className={`glass-card p-6 ${index === 0 ? 'border-2 border-yellow-400' : index === 1 ? 'border-2 border-gray-400' : 'border-2 border-orange-400'}`}>
                  <div className="text-center">
                    <div className={`text-4xl mb-2 ${index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <h3 className="font-bold text-lg">{submission.project?.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">Team: {submission.team?.name}</p>
                    <p className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      Score: {submission.finalScore?.toFixed(1) || 'N/A'}/10
                    </p>
                    {submission.badges?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1 justify-center">
                        {submission.badges.map((badge, i) => (
                          <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            🏅 {badge.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard (exclusive view) */}
        {showLeaderboard && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">🏆 Leaderboard</h2>
            <div className="space-y-4">
              {leaderboard.map((submission, index) => (
                <div key={submission._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${index < 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{submission.project?.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Team: {submission.team?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{submission.finalScore?.toFixed(1) || 'N/A'}/10</p>
                    {submission.badges?.length > 0 && (
                      <p className="text-sm text-gray-600">🏅 {submission.badges.length} badges</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters (hidden when leaderboard is shown) */}
        {!showLeaderboard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-8 shadow-lg"
          >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile App</option>
              <option value="design">Design</option>
              <option value="ai">AI/ML</option>
              <option value="game">Game Development</option>
              <option value="other">Other</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Popular</option>
              <option value="views">Most Viewed</option>
            </select>
            <Button type="submit" loading={loading} className="px-6">
              Search
            </Button>
          </form>
        </motion.div>
        )}

        {/* Projects Grid (hidden when leaderboard is shown) */}
        {!showLeaderboard && (projects.length > 0 ? (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project._id}
                project={project}
                onLike={() => handleLike(project)}
                onClick={() => setSelectedProject(project)}
                user={user}
                index={index}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-gray-400 dark:text-slate-500">
              <FolderIcon className="w-20 h-20 mx-auto mb-4" />
              <p className="text-xl mb-2">
                {loading ? "Loading projects..." : "No projects found"}
              </p>
              <p className="text-sm">
                {!loading && "Try adjusting your search criteria"}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Pagination (hidden when leaderboard is shown) */}
        {!showLeaderboard && pagination.pages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-12"
          >
            <div className="flex space-x-2">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => loadProjects(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === pagination.current
                        ? "bg-purple-500 text-white"
                        : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>
          </motion.div>
        )}

        {/* Project Detail Modal */}
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onLike={() => handleLike(selectedProject)}
            onComment={handleComment}
            comment={comment}
            setComment={setComment}
            submittingComment={submittingComment}
            user={user}
          />
        )}
      </div>
    </div>
  );
};

// ✅ Fixed Project Card
const ProjectCard = ({ project, onLike, onClick, user, index }) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card hover-lift overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* Project Image */}
      {project.images && project.images.length > 0 ? (
        <img
          src={project.images.find(img => img.isPrimary)?.url || project.images[0].url}
          alt={project.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <span className="text-6xl">{getCategoryIcon(project.category)}</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-2 line-clamp-1">
          {project.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.tags?.slice(0, 3).map((tag, tagIndex) => (
            <span
              key={tagIndex}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats & Like */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
          <div className="flex items-center space-x-2">
            <EyeIcon className="w-4 h-4" />
            <span>{project.showcase.views} views</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
              project.userLiked
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-red-100 hover:text-red-600"
            }`}
          >
            {project.userLiked ? (
              <HeartSolidIcon className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
            <span>{project.showcase.likes?.length || 0}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ✅ Fixed Project Detail View
const ProjectDetailView = ({ project, onLike }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-card overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {project.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>by {project.owner.name}</span>
                  <span>•</span>
                  <span>{project.team.name}</span>
                  <span>•</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <EyeIcon className="w-4 h-4" />
                  <span>{project.showcase.views} views</span>
                </div>
                <button
                  onClick={onLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                    project.userLiked
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                  }`}
                >
                  {project.userLiked ? (
                    <HeartSolidIcon className="w-5 h-5" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                  <span>{project.showcase.likes?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {project.description}
            </p>

            {/* Links */}
            {project.links &&
              Object.keys(project.links).some((key) => project.links[key]) && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Links
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        GitHub
                      </a>
                    )}
                    {project.links.demo && (
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Live Demo
                      </a>
                    )}
                    {project.links.design && (
                      <a
                        href={project.links.design}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Design
                      </a>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link to="/showcase">
            <Button variant="outline">← Back to Showcase</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

// Project Detail Modal Component
const ProjectDetailModal = ({ 
  project, 
  onClose, 
  onLike, 
  onComment, 
  comment, 
  setComment, 
  submittingComment, 
  user 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                {project.title}
              </h2>
              <p className="text-gray-600 dark:text-slate-400">
                {project.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Quick Links (GitHub / Live Demo) */}
        {(project.links && (project.links.github || project.links.demo || project.links.repository || project.links.liveDemo)) && (
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-3">
              {project.links.github && (
                <a href={project.links.github} target="_blank" rel="noreferrer" className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">GitHub</a>
              )}
              {(project.links.demo || project.links.liveDemo) && (
                <a href={project.links.demo || project.links.liveDemo} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Live Demo</a>
              )}
              {project.links.design && (
                <a href={project.links.design} target="_blank" rel="noreferrer" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Design</a>
              )}
              {project.links.documentation && (
                <a href={project.links.documentation} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">Docs</a>
              )}
            </div>
          </div>
        )}

        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <div className="p-6">
            <img
              src={project.images.find(img => img.isPrimary)?.url || project.images[0].url}
              alt={project.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Project Info */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  project.showcase?.likes?.some(like => like.user === user?._id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                }`}
              >
                <HeartIcon className="w-5 h-5" />
                <span>{project.showcase?.likes?.length || 0}</span>
              </button>
              <div className="flex items-center space-x-2 text-gray-600 dark:text-slate-400">
                <EyeIcon className="w-5 h-5" />
                <span>{project.showcase?.views || 0} views</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <img
                src={project.owner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(project.owner?.name || 'User')}`}
                alt={project.owner?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-gray-600 dark:text-slate-400">
                by {project.owner?.name}
              </span>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Team & Members */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-3">Team & Members</h3>
          <div className="space-y-2 text-sm text-gray-700 dark:text-slate-300">
            <div>Team: <span className="font-medium">{project.team?.name || 'N/A'}</span></div>
            <div>Owner: <span className="font-medium">{project.owner?.name || 'Unknown'}</span></div>
          </div>
          <div className="mt-3">
            <div className="flex -space-x-2">
              {(() => {
                const arr = [];
                const seen = new Set();
                const add = (u) => { if (!u) return; const obj = u.user ? u.user : u; const id = obj?._id || obj?.id || obj?.email || obj?.name; if (id && !seen.has(id)) { seen.add(id); arr.push(obj); } };
                add(project.owner);
                (project.team?.members || []).forEach(add);
                (project.collaborators || []).forEach(add);
                return arr;
              })().map((m, i) => (
                <img key={m._id || i} src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name || 'User')}&background=8B5CF6&color=ffffff&size=128&bold=true`} alt={m.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" title={m.name} />
              ))}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">
            Comments ({project.showcase?.comments?.length || 0})
          </h3>

          {/* Add Comment */}
          {user && (
            <form onSubmit={onComment} className="mb-6">
              <div className="flex space-x-3">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    rows="3"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="submit"
                      loading={submittingComment}
                      disabled={!comment.trim()}
                      size="small"
                    >
                      Post Comment
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {(project.showcase?.comments || []).map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <img
                  src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user?.name || 'User')}`}
                  alt={comment.user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-slate-100">
                        {comment.user?.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-slate-300">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {(!project.showcase?.comments || project.showcase.comments.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShowcasePage;








