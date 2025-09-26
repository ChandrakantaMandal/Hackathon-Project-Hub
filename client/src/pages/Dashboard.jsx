import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";
import CreateTeamModal from "../components/dashboard/CreateTeamModal";
import CreateProjectModal from "../components/dashboard/CreateProjectModal";
import TeamCard from "../components/dashboard/TeamCard";
import ProjectCard from "../components/dashboard/ProjectCard";
import DashboardStats from "../components/dashboard/DashboardStats";
import { 
  PlusIcon, 
  UsersIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import ConfirmationModal from "../components/common/ConfirmationModal";

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [searchTeamTerm, setSearchTeamTerm] = useState('');
  const [searchProjectTerm, setSearchProjectTerm] = useState('');
  const [globalTeamSearch, setGlobalTeamSearch] = useState([]);
  const [searchingGlobalTeams, setSearchingGlobalTeams] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, id, name }

  const navigate = useNavigate();


  useEffect(() => {
    fetchDashboardData();
  }, []);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTeamTerm.trim().length >= 2) {
        searchAllTeams(searchTeamTerm);
      } else {
        setGlobalTeamSearch([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTeamTerm]);


  const fetchDashboardData = async () => {
    try {
      setLoading(true); 
      const [teamsResponse, projectsResponse] = await Promise.all([
        api.get('/teams'),
        api.get('/projects')
      ]);

      if (teamsResponse.data.success) {
        setTeams(teamsResponse.data.data.teams);
      }

      if (projectsResponse.data.success) {
        setProjects(projectsResponse.data.data.projects);
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const searchAllTeams = async (query) => {
    if (!query || query.trim().length < 2) {
      setGlobalTeamSearch([]);
      return;
    }

    try {
      setSearchingGlobalTeams(true);
      const response = await api.get(`/teams/search/all?q=${encodeURIComponent(query)}`);
      
      if (response.data.success) {
        setGlobalTeamSearch(response.data.data.teams);
      }
    } catch (error) {
      console.error('Global team search error:', error);
      toast.error('Failed to search teams');
    } finally {
      setSearchingGlobalTeams(false);
    }
  };

  const handleTeamCreated = (newTeam) => {
    setTeams(prev => [newTeam, ...prev]);
    setShowCreateTeam(false);
    toast.success('Team created successfully!');
  };

  const handleProjectCreated = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    setShowCreateProject(false);
    toast.success('Project created successfully!');
  };

  const handleDeleteTeam = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    setConfirmDelete({
      type: 'team',
      id: teamId,
      name: team?.name || 'this team'
    });
  };

  const handleDeleteProject = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    setConfirmDelete({
      type: 'project',
      id: projectId,
      name: project?.title || 'this project'
    });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/${confirmDelete.type}s/${confirmDelete.id}`);
      
      if (response.data.success) {
        if (confirmDelete.type === 'team') {
          setTeams(prev => prev.filter(team => team._id !== confirmDelete.id));
        } else {
          setProjects(prev => prev.filter(project => project._id !== confirmDelete.id));
        }
        toast.success(`${confirmDelete.type} deleted successfully`);
      }
    } catch (error) {
      console.error(`Delete ${confirmDelete.type} error:`, error);
      toast.error(error.response?.data?.message || `Failed to delete ${confirmDelete.type}`);
    } finally {
      setConfirmDelete(null);
    }
  };


  const getDisplayTeams = () => {
    if (!searchTeamTerm.trim()) {
      return teams;
    }
    
    if (searchTeamTerm.trim().length < 2) {
      return [];
    }
    
    return globalTeamSearch;
  };

  const filteredProjects = projects.filter(project => {
    if (!searchProjectTerm.trim()) return true;
    
    const searchLower = searchProjectTerm.toLowerCase().trim();
    const projectTitleMatch = project.title?.toLowerCase().includes(searchLower);
    const descriptionMatch = project.description?.toLowerCase().includes(searchLower);
    const teamNameMatch = project.team?.name?.toLowerCase().includes(searchLower);
    
    return projectTitleMatch || descriptionMatch || teamNameMatch;
  });

  const displayTeams = getDisplayTeams();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Dashboard Stats */}
      <motion.div variants={itemVariants} className="mb-8">
        <DashboardStats projects={projects} teams={teams} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6 mb-8 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={() => setShowCreateProject(true)}
            className="w-full btn-glow flex items-center justify-center"
            size="medium"
          >
            <PlusIcon className="w-5 h-5 mr-2 shrink-0" />
            <span>New Project</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateTeam(true)}
            className="w-full"
            size="medium"
          >
            <UsersIcon className="w-5 h-5 mr-2" />
            Create Team
          </Button>
          <Link to="/showcase">
            <Button
              variant="secondary"
              className="w-full"
              size="medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Browse Showcase
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Teams Section */}
      <motion.div variants={itemVariants} className="mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            {searchTeamTerm.trim() ? 'Search Results' : 'Your Teams'} ({displayTeams.length}{!searchTeamTerm.trim() ? `/${teams.length}` : ''})
          </h2>
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search all teams..."
              value={searchTeamTerm}
              onChange={(e) => setSearchTeamTerm(e.target.value)}
              className="input-glass pl-10 w-full"
            />
            {searchTeamTerm && (
              <button
                onClick={() => setSearchTeamTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
            {searchingGlobalTeams && (
              <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="small" />
              </div>
            )}
          </div>
        </div>

        {searchTeamTerm.trim().length > 0 && searchTeamTerm.trim().length < 2 && (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            Type at least 2 characters to search all teams
          </div>
        )}

        {displayTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTeams.map((team) => (
              <TeamCard
                key={team._id}
                team={team}
                onDelete={handleDeleteTeam}
                showMembershipStatus={!!searchTeamTerm.trim()}
              />
            ))}
          </div>
        ) : searchTeamTerm.trim().length >= 2 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              No teams found matching "{searchTeamTerm}"
            </p>
          </div>
        ) : !searchTeamTerm.trim() && teams.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400 text-lg mb-4">
              You haven't joined any teams yet
            </p>
            <Button onClick={() => setShowCreateTeam(true)} className="btn-glow">
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Your First Team
            </Button>
          </div>
        ) : null}
      </motion.div>

      {/* Projects Section */}
      <motion.div variants={itemVariants} className="mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Your Projects ({filteredProjects.length}/{projects.length})
          </h2>
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchProjectTerm}
              onChange={(e) => setSearchProjectTerm(e.target.value)}
              className="input-glass pl-10 w-full"
            />
          </div>
        </div>

        {filteredProjects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 dark:text-slate-400 text-lg mb-4">
              {searchProjectTerm ? `No projects found matching "${searchProjectTerm}"` : "No projects yet"}
            </p>
            {!searchProjectTerm && (
              <Button onClick={() => setShowCreateProject(true)} className="btn-glow">
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showCreateTeam && (
        <CreateTeamModal
          isOpen={showCreateTeam}
          onClose={() => setShowCreateTeam(false)}
          onTeamCreated={handleTeamCreated}
        />
      )}

      {showCreateProject && (
        <CreateProjectModal
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={handleProjectCreated}
          teams={teams}
        />
      )}

      {confirmDelete && (
        <ConfirmationModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAction}
          title={`Delete ${confirmDelete.type}`}
          message={`Are you sure you want to delete "${confirmDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </motion.div>
  );
};

export default Dashboard;
































