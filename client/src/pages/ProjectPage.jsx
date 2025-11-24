import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { toast } from 'react-hot-toast';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import SubmissionModal from '../components/projects/SubmissionModal';

const ProjectPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); 
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);


  const isProjectOwner = () => {
    if (!project || !user) return false;
    return (
      project?.owner?._id === user?._id ||
      project?.owner === user?._id
    );
  };

 
  const getFilteredTasks = () => {
    if (!project?.tasks) return [];
    
    if (isProjectOwner()) {
    
      return project.tasks;
    } else {
      return project.tasks.filter(task => 
        task.assignedTo?._id === user?._id
      );
    }
  };

  const filteredTasks = getFilteredTasks();

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.success) {
        const project = response.data.data.project;
       
        setProject(project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      console.error('Error response:', error.response);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-red-600 text-lg font-medium">{error}</div>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-gray-600">Project not found</div>
        <Button onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleToggleShowcase = async () => {
    if (!project) return;
    setUpdating(true);
    try {
      const res = await api.post(`/projects/${project._id}/toggle-showcase`);
      if (res.data.success) {
        await fetchProject();
      }
    } catch (error) {
      toast.error('Failed to update showcase settings ❌');
    } finally {
      setUpdating(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setProject(prev => ({
      ...prev,
      tasks: [...(prev.tasks || []), newTask]
    }));
    setShowCreateTask(false);
    toast.success('Task created successfully! ✨');
  };

  const handleTaskStatusToggle = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      
      const response = await api.put(`/tasks/${taskId}`, {
        status: newStatus
      });

      if (response.data.success) {
        setProject(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => 
            task._id === taskId 
              ? { ...task, status: newStatus, completedAt: newStatus === 'completed' ? new Date() : null }
              : task
          )
        }));
        
        await fetchProject();
        
        toast.success(`Task marked as ${newStatus === 'completed' ? 'completed ✅' : 'incomplete 📝'}`);
      }
    } catch (error) {
      console.error('Task update error:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied - You don\'t have permission to update this task ❌');
      } else {
        toast.error('Failed to update task status ❌');
      }
    }
  };

  const handleDeleteTask = (taskId) => {
    const task = project.tasks.find(t => t._id === taskId);
    setConfirmDelete({
      type: 'task',
      id: taskId,
      title: task?.title || 'this task'
    });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/tasks/${confirmDelete.id}`);

      if (response.data.success) {
        setProject(prev => ({
          ...prev,
          tasks: prev.tasks.filter(task => task._id !== confirmDelete.id)
        }));
        
        toast.success('Task deleted successfully! 🗑️');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied - You don\'t have permission to delete this task ❌');
      } else {
        toast.error('Failed to delete task ❌');
      }
    } finally {
      setConfirmDelete(null);
    }
  };

  const canDeleteTask = (task) => {
    return task.createdBy?._id === user?._id || isProjectOwner();
  };

  const getAllMembersList = () => {
    const result = [];
    const seen = new Set();
    const add = (u) => {
      if (!u) return;
      const obj = u.user ? u.user : u;
      const id = obj?._id || obj?.id || obj?.email || obj?.name;
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push(obj);
      }
    };
    add(project?.owner);
    (project?.collaborators || []).forEach(add);
    (project?.team?.members || []).forEach(add);
    return result;
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionModal(false);
    setProject(prev => ({
      ...prev,
      status: 'submitted',
      isSubmitted: true
    }));
    toast.success('Project submitted successfully! 🎉');
  };

  return (
    <div className="space-y-8">
      <div className="glass-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.title}</h2>
            <p className="text-gray-600 mt-2 max-w-3xl">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {project.tags?.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">{t}</span>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Progress</p>
            <div className="w-48 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${project.progress}%` }} />
            </div>
            <p className="text-sm text-gray-700 mt-1">{project.progress}%</p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {isProjectOwner() && (
            <>
              <Button onClick={handleToggleShowcase} loading={updating}>
                {project.showcase?.isPublic ? 'Make Private' : 'Make Public'}
              </Button>
              {project.isSubmitted ? (
                <span className="ml-2 inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white cursor-default select-none">
                  ✅ Project Submitted
                </span>
              ) : (
                <button
                  id="submit-project-button"
                  type="button"
                  onClick={() => setShowSubmissionModal(true)}
                  className="ml-2 inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                >
                  Submit Project
                </button>
              )}
            </>
          )}
          <div className="text-sm text-gray-600">
            {project.showcase?.isPublic ? 'Public on Showcase' : 'Private'} • {project.showcase?.views || 0} views
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks Section */}
          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Tasks {!isProjectOwner() && "(Assigned to you)"}
              </h3>
              {isProjectOwner() && (
                <button 
                  onClick={() => setShowCreateTask(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add Task
                </button>
              )}
            </div>
            
            {filteredTasks && filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div key={task._id} className="task-card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!isProjectOwner() && task.assignedTo?._id === user?._id && (
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => handleTaskStatusToggle(task._id, task.status)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-500"
                            />
                          )}
                          <h4 className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500 dark:text-slate-400' : 'text-gray-900 dark:text-slate-100'}`}>
                            {task.title}
                          </h4>
                        </div>
                        {task.description && (
                          <p className="text-gray-600 dark:text-slate-300 text-sm mt-1">{task.description}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.status === 'completed' ? 'status-completed' :
                            task.status === 'in-progress' ? 'status-in-progress' :
                            task.status === 'review' ? 'status-review' :
                            'status-todo'
                          }`}>
                            {task.status}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${
                            task.priority === 'urgent' ? 'priority-urgent' :
                            task.priority === 'high' ? 'priority-high' :
                            task.priority === 'medium' ? 'priority-medium' :
                            'priority-low'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          {task.assignedTo && (
                            <p className="text-sm text-gray-600 dark:text-slate-300">
                              Assigned to: {task.assignedTo.name}
                            </p>
                          )}
                          {task.dueDate && (
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        
                        {canDeleteTask(task) && (
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200 flex items-center gap-1"
                            title="Delete task"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {isProjectOwner() ? 'No tasks created yet' : 'No tasks assigned to you'}
              </p>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">All Members</h3>
            <div className="flex -space-x-2">
              {getAllMembersList().length > 0 ? (
                getAllMembersList().map((member, index) => (
                  <img
                    key={member._id || index}
                    src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'User')}&background=8B5CF6&color=ffffff&size=128&bold=true`}
                    alt={member.name || 'Member'}
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800"
                    title={member.name}
                  />
                ))
              ) : (
                <p className="text-gray-600">No members yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Showcase</h3>
            <p className="text-gray-600">Likes: {project.showcase?.likes?.length || 0}</p>
            <p className="text-gray-600">Comments: {project.showcase?.comments?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          projectId={projectId}
          members={getAllMembersList()}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {showSubmissionModal && (
        <SubmissionModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          project={project}
          onSubmissionSuccess={handleSubmissionSuccess}
        />
      )}

      {confirmDelete && (
        <ConfirmationModal
          isOpen={!!confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onConfirm={confirmDeleteAction}
          title={`Delete ${confirmDelete.type}`}
          message={`Are you sure you want to delete "${confirmDelete.title}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};


export default ProjectPage;























































