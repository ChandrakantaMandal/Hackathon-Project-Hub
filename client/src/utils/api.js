import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('judgeToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      
      try {
        const { useAppStore } = await import('../store/useAppStore');
        if (useAppStore?.getState) {
          useAppStore.getState().clearUser?.();
        }
      } catch (_) {}

      if (localStorage.getItem('judgeToken')) {
        localStorage.removeItem('judgeToken');
        localStorage.removeItem('judge');
        if (window.location.pathname !== '/judge/login') {
          window.location.assign('/judge/login');
        }
      } else {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/auth') {
          window.location.assign('/auth');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

