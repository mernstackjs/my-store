import { create } from 'zustand';
import type { User } from '../types';
import client from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; address?: import('../types').UserAddress }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isInitialized: false,
  isAuthenticated: false,
  isAdmin: false,

  initialize: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ isLoading: false, isInitialized: true, isAuthenticated: false, isAdmin: false });
      return;
    }

    try {
      const { data } = await client.get('/auth/me');
      const user = data.user;
      set({
        user,
        token,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
      });
    } catch {
      localStorage.removeItem('auth_token');
      set({
        user: null,
        token: null,
        isLoading: false,
        isInitialized: true,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  },

  login: async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isAdmin: data.user.role === 'admin',
    });
    return data.user;
  },

  register: async (name, email, password) => {
    const { data } = await client.post('/auth/register', { name, email, password });
    localStorage.setItem('auth_token', data.token);
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
      isAdmin: data.user.role === 'admin',
    });
    return data.user;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },

  updateProfile: async (data) => {
    const { data: res } = await client.put('/auth/me', data);
    set({
      user: res.user,
      isAdmin: res.user.role === 'admin',
    });
  },
}));
