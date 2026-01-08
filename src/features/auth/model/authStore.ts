/**
 * Auth store using Zustand with localStorage persistence
 * Manages authentication state and actions
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import type { Role, LoginCredentials } from './types';

interface AuthState {
  accessToken: string | null;
  role: Role | null;
  roles: Role[];
  isAuthenticated: boolean;
  user: { _id: string; email: string } | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      role: null,
      roles: [],
      isAuthenticated: false,
      user: null,

      login: async (credentials) => {
        const response = await authApi.login(credentials);
        set({
          accessToken: response.accessToken,
          role: response.role,
          roles: response.roles,
          isAuthenticated: true,
          user: { _id: '', email: credentials.email },
        });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({
            accessToken: null,
            role: null,
            roles: [],
            isAuthenticated: false,
            user: null,
          });
        }
      },

      refreshToken: async () => {
        const response = await authApi.refresh();
        set({ accessToken: response.accessToken });
      },

      hasPermission: (_permission) => {
        // TODO: Implement permission checking logic
        // For now, return true if authenticated
        return get().isAuthenticated;
      },

      setToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        roles: state.roles,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
