import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }
  
  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }
  
  return format(dateObj, 'MMM d, yyyy');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getStatusColor = (status, type = 'task') => {
  const colors = {
    task: {
      'todo': 'gray',
      'in-progress': 'blue',
      'review': 'yellow',
      'completed': 'green'
    },
    project: {
      'planning': 'gray',
      'in-progress': 'blue',
      'testing': 'yellow',
      'completed': 'green',
      'paused': 'orange'
    },
    priority: {
      'low': 'green',
      'medium': 'yellow',
      'high': 'orange',
      'urgent': 'red'
    }
  };
  
  return colors[type][status] || 'gray';
};

export const getPriorityIcon = (priority) => {
  const icons = {
    low: '⬇️',
    medium: '➡️',
    high: '⬆️',
    urgent: '🚨'
  };
  
  return icons[priority] || '➡️';
};

export const getCategoryIcon = (category) => {
  const icons = {
    web: '🌐',
    mobile: '📱',
    ai: '🤖',
    blockchain: '⛓️',
    iot: '🔗',
    game: '🎮',
    other: '💡'
  };
  
  return icons[category] || '💡';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export const calculateProgress = (completed, total) => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const generateAvatar = (name) => {
  const colors = [
    '#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#ec4899', '#84cc16', '#f97316', '#3b82f6'
  ];
  
  const initials = getInitials(name);
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${backgroundColor.slice(1)}&color=ffffff&size=128&bold=true`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};