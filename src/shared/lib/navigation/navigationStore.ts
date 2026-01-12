/**
 * Navigation store using Zustand with localStorage persistence
 * Manages navigation state including active route, breadcrumbs, and history
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Breadcrumb, NavigationHistoryItem, NavigationState } from './types';

interface NavigationStore extends NavigationState {
  setActiveRoute: (path: string) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
  addToHistory: (path: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  clearHistory: () => void;
}

const MAX_HISTORY_ITEMS = 50;

export const useNavigationStore = create<NavigationStore>()(
  persist(
    (set, get) => ({
      activeRoute: '/',
      breadcrumbs: [],
      history: [],
      isSidebarOpen: false,
      isSidebarCollapsed: false,

      setActiveRoute: (path) => {
        set({ activeRoute: path });
        get().addToHistory(path);
      },

      setBreadcrumbs: (breadcrumbs) => {
        set({ breadcrumbs });
      },

      addToHistory: (path) => {
        const { history } = get();
        const newItem: NavigationHistoryItem = {
          path,
          timestamp: Date.now(),
        };

        // Avoid duplicates of consecutive same paths
        const lastItem = history[history.length - 1];
        if (lastItem?.path === path) {
          return;
        }

        const newHistory = [...history, newItem].slice(-MAX_HISTORY_ITEMS);
        set({ history: newHistory });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (isOpen) => {
        set({ isSidebarOpen: isOpen });
      },

      toggleSidebarCollapse: () => {
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed }));
      },

      setSidebarCollapsed: (isCollapsed) => {
        set({ isSidebarCollapsed: isCollapsed });
      },

      clearHistory: () => {
        set({ history: [] });
      },
    }),
    {
      name: 'navigation-storage',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        history: state.history.slice(-10), // Only persist last 10 items
      }),
    }
  )
);
