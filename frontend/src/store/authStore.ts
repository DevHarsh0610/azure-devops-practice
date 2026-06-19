import { create } from 'zustand';
import { api } from '../utils/api.js';

export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-failed', () => {
      set({ user: null, isAuthenticated: false, loading: false });
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    loading: true,

    login: (accessToken, user) => {
      localStorage.setItem('accessToken', accessToken);
      set({ user, isAuthenticated: true, loading: false });
    },

    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        console.error('Logout error:', err);
      } finally {
        localStorage.removeItem('accessToken');
        set({ user: null, isAuthenticated: false, loading: false });
      }
    },

    checkAuth: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        set({ user: null, isAuthenticated: false, loading: false });
        return;
      }

      try {
        const response = await api.get('/auth/me');
        set({ user: response.data.data, isAuthenticated: true, loading: false });
      } catch (err) {
        set({ user: null, isAuthenticated: false, loading: false });
      }
    },
  };
});
