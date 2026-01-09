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
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;

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
        try {
          const response = await authApi.login(credentials);
          console.log('Auth response:', response);

          // Backend returns: { success, data: { user, token, refreshToken, expiresIn } }
          // Extract token and user from nested data structure
          const { data } = response as any;
          console.log('Extracted data:', data);

          if (!data || !data.user || !data.token) {
            throw new Error('Invalid response format from server');
          }

          const userRole = data.user.role as Role;

          set({
            accessToken: data.token, // Backend uses "token", not "accessToken"
            role: userRole,
            roles: [userRole], // Convert single role to array
            isAuthenticated: true,
            user: {
              _id: data.user.id,
              email: data.user.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName
            },
          });
        } catch (error) {
          console.error('Login failed in authStore:', error);
          throw error;
        }
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
