/**
 * Auth hook
 * Re-exports the auth store for convenient usage in components
 */

import { useAuthStore } from './authStore';

export const useAuth = () => {
  return useAuthStore();
};
