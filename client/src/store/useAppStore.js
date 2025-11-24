import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

// Base API URL
const API_URL = "http://localhost:5000/api/auth";
axios.defaults.withCredentials = true; // important for cookies


const applyDarkClass = (enabled) => {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", !!enabled);
  }
};

export const useAppStore = create(
  persist(
    (set, get) => ({
      user: null,
      authReady: false,
      darkMode: false,
      sidebarOpen:
        typeof window !== "undefined" ? window.innerWidth >= 1024 : true,

      isAuthenticated: false,
      isLoading: false,
      isCheckingAuth: true,
      error: null,
      message: null,

      get loading() {
        return get().isLoading;
      },

    
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      initAuth: async () => {
        set({ isCheckingAuth: true, error: null, authReady: false });
        try {
          const response = await axios.get(`${API_URL}/check-auth`);

          if (response.data.authenticated && response.data.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isCheckingAuth: false,
              authReady: true,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isCheckingAuth: false,
              authReady: true,
              error: null,
            });
          }
        } catch (error) {
          
          set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            authReady: true,
            error: null,
          });
        }
      },

      
      checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });
        try {
          const response = await axios.get(`${API_URL}/check-auth`);

      
          if (response.data.authenticated && response.data.user) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isCheckingAuth: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isCheckingAuth: false,
              error: null,
            });
          }
        } catch (error) {
          
          set({
            user: null,
            isAuthenticated: false,
            isCheckingAuth: false,
            error: null,
          });
        }
      },

      //REGISTER 
      register: async (name, email, password) => {
        try {
          set({ isLoading: true, error: null });
          const res = await axios.post(`${API_URL}/register`, {
            name,
            email,
            password,
          });

          set({
            user: res.data.user,
            isAuthenticated: false,
            isLoading: false,
          });
          return { success: true, user: res.data.user };
        } catch (error) {
          const msg = error.response?.data?.message || "Error Signing Up";
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      //LOGIN
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          const res = await axios.post(`${API_URL}/login`, { email, password });
          set({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return { success: true, user: res.data.user };
        } catch (error) {
          const msg = error.response?.data?.message || "Error Logging In";
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      //LOGOUT
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await axios.post(`${API_URL}/logout`);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const msg = error.response?.data?.message || "Error Logging Out";
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      //VERIFY EMAIL
      verifyEmail: async (verificationCode) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/verify-email`, {
            code: verificationCode,
          });
          set({
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return res.data;
        } catch (error) {
          const msg = error.response?.data?.message || "Error Verifying Email";
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      //FORGOT PASSWORD
      forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
          if (!email) {
            set({
              isLoading: false,
              error: "Email is required",
            });
            throw new Error("Email is required");
          }
          const res = await axios.post(`${API_URL}/forgot-password`, { email });
          set({ message: res.data.message, isLoading: false });
          return res.data;
        } catch (error) {
          const msg =
            error.response?.data?.message ||
            "Error sending reset password email";
          set({ isLoading: false, error: msg });
          throw error;
        }
      },

      //RESET PASSWORD
      resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/reset-password/${token}`, {
            password,
          });
          set({ message: res.data.message, isLoading: false });
          return res.data;
        } catch (error) {
          const msg =
            error.response?.data?.message || "Error resetting password";
          set({ isLoading: false, error: msg });
          throw error;
        }
      },

      //UPDATE PROFILE 
      updateProfile: async (profileData) => {
        try {
          const res = await axios.put(`${API_URL}/profile`, profileData);
          if (res.data?.success) set({ user: res.data.data.user });
          return res.data?.success;
        } catch (error) {
          set({ error: "Error updating profile" });
        }
      },

      //THEME
      setDarkMode: (value) => {
        applyDarkClass(value);
        set({ darkMode: !!value });
      },
      toggleDarkMode: () => {
        const next = !get().darkMode;
        applyDarkClass(next);
        set({ darkMode: next });
      },

      // IDEBAR
      setSidebarOpen: (open) => set({ sidebarOpen: !!open }),
    }),
    {
      name: "app-store",
      partialize: (state) => ({
        darkMode: state.darkMode,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
