import { create } from 'zustand';
import { persist } from 'zustand/middleware';


const applyDarkClass = (enabled) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', !!enabled);
  }
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      user: null,
      authReady: false,
      darkMode: false,
      sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,

      // User
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Auth functions
      initAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ authReady: true });
            return;
          }
          const { default: api } = await import('../utils/api');
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/auth/me');
          if (res.data?.success) set({ user: res.data.data.user });
        } catch (_) {
          localStorage.removeItem('token');
        } finally {
          set({ authReady: true });
        }
      },

      login: async (email, password) => {
        const { default: api } = await import('../utils/api');
        const res = await api.post('/auth/login', { email, password });
        if (res.data?.success) {
          const { token, user } = res.data.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user });
          return { success: true, user };
        }
        return { success: false };
      },

      register: async (name, email, password) => {
        const { default: api } = await import('../utils/api');
        const res = await api.post('/auth/register', { name, email, password });
        if (res.data?.success) {
          const { token, user } = res.data.data;
          localStorage.setItem('token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user });
          return { success: true, user };
        }
        return { success: false };
      },

      refreshUser: async () => {
        const { default: api } = await import('../utils/api');
        const res = await api.get('/auth/me');
        if (res.data?.success) set({ user: res.data.data.user });
      },

      updateProfile: async (profileData) => {
        const { default: api } = await import('../utils/api');
        const res = await api.put('/auth/profile', profileData);
        if (res.data?.success) set({ user: res.data.data.user });
        return res.data?.success;
      },

      logout: async () => {
        const { default: api } = await import('../utils/api');
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        set({ user: null });
      },

      // Theme
      setDarkMode: (value) => {
        applyDarkClass(value);
        set({ darkMode: !!value });
      },
      toggleDarkMode: () => {
        const next = !get().darkMode;
        applyDarkClass(next);
        set({ darkMode: next });
      },

      // Sidebar
      setSidebarOpen: (open) => set({ sidebarOpen: !!open }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({ darkMode: state.darkMode, user: state.user }),
    }
  )
);
