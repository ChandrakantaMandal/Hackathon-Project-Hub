export const PROJECT_CATEGORIES = [
  { value: 'web', label: 'Web Development', icon: '🌐' },
  { value: 'mobile', label: 'Mobile App', icon: '📱' },
  { value: 'ai', label: 'AI/Machine Learning', icon: '🤖' },
  { value: 'blockchain', label: 'Blockchain', icon: '⛓️' },
  { value: 'iot', label: 'IoT', icon: '🔗' },
  { value: 'game', label: 'Game Development', icon: '🎮' },
  { value: 'other', label: 'Other', icon: '💡' }
];

export const TASK_STATUSES = [
  { value: 'todo', label: 'To Do', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'review', label: 'In Review', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' }
];

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
];

export const PROJECT_STATUSES = [
  { value: 'planning', label: 'Planning', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'testing', label: 'Testing', color: 'yellow' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'paused', label: 'Paused', color: 'orange' }
];

export const SHOWCASE_SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'views', label: 'Most Viewed' }
];

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    PROFILE: '/auth/profile'
  },
  TEAMS: {
    BASE: '/teams',
    JOIN: (code) => `/teams/join/${code}`,
    REGENERATE_CODE: (id) => `/teams/${id}/regenerate-code`
  },
  PROJECTS: {
    BASE: '/projects',
    TOGGLE_SHOWCASE: (id) => `/projects/${id}/toggle-showcase`,
    COLLABORATORS: (id) => `/projects/${id}/collaborators`
  },
  TASKS: {
    BASE: '/tasks',
    COMMENTS: (id) => `/tasks/${id}/comments`
  },
  CHAT: {
    BASE: (projectId) => `/chat/${projectId}`,
    REACT: (messageId) => `/chat/${messageId}/react`
  },
  SHOWCASE: {
    BASE: '/showcase',
    LIKE: (id) => `/showcase/${id}/like`,
    COMMENTS: (id) => `/showcase/${id}/comments`,
    STATS: '/showcase/stats'
  }
};