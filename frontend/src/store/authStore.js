import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      initAuth: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await api.get('/auth/me');
          set({ user: res.data.user, isAuthenticated: true });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, user } = res.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.name}! 🎉`);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          const msg = err.response?.data?.message || 'Login failed';
          toast.error(msg);
          return { success: false, error: msg };
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/auth/register', { name, email, password });
          const { token, user } = res.data;
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          set({ user, token, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome to NeuralPath, ${user.name}! 🚀`);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          const msg = err.response?.data?.message || 'Registration failed';
          toast.error(msg);
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch {}
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },
      refreshUser: async () => {
  try {
    const res = await api.get('/auth/me');
    set({ user: res.data.user });
  } catch (err) {
    console.log("Refresh user failed", err);
  }
},


      updateUser: (updates) => {
        set(state => ({ user: { ...state.user, ...updates } }));
      },

      loginWithToken: (token, user) => {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token, isAuthenticated: true });
      }
    }),
    {
      name: 'neuralpath-auth',
      partialize: (state) => ({ token: state.token, user: state.user })
    }
  )
);
