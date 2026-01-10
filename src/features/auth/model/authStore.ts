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

          // Backend returns: { status, data: { user, learner, accessToken, refreshToken }, message }
          // Extract token and user from nested data structure
          const { data } = response as any;
          console.log('Extracted data:', data);

          if (!data || !data.user || !data.accessToken) {
            throw new Error('Invalid response format from server');
          }

          // Backend returns roles as array, take first role
          const userRole = (data.user.roles?.[0] || 'learner') as Role;

          // firstName/lastName are in the learner/staff object, not user object
          const profile = data.learner || data.staff || {};

          set({
            accessToken: data.accessToken,
            role: userRole,
            roles: data.user.roles || [userRole],
            isAuthenticated: true,
            user: {
              _id: data.user._id,
              email: data.user.email,
              firstName: profile.firstName,
              lastName: profile.lastName
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
