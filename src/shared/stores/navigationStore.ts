/**
 * Navigation Store - Phase 2 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Zustand store for navigation state management
 * Handles department selection and sidebar UI state
 *
 * Features:
 * - Department selection with persistence
 * - Last accessed department tracking per user
 * - Sidebar open/close state
 * - localStorage persistence for department preferences
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ============================================================================
// State Interface
// ============================================================================

interface NavigationState {
  /** Currently selected department ID (null = no department selected) */
  selectedDepartmentId: string | null;

  /** Map of userId to their last accessed department ID */
  lastAccessedDepartments: Record<string, string>;

  /** Mobile sidebar open state */
  isSidebarOpen: boolean;

  // Actions
  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
  clearDepartmentSelection: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useNavigationStore = create<NavigationState>()(
  devtools(
    persist(
      (set) => ({
        // ================================================================
        // Initial State
        // ================================================================
        selectedDepartmentId: null,
        lastAccessedDepartments: {},
        isSidebarOpen: false,

        // ================================================================
        // Department Selection
        // ================================================================

        /**
         * Set the currently selected department
         * Set to null to clear selection
         */
        setSelectedDepartment: (deptId) => {
          set({ selectedDepartmentId: deptId });
          console.log('[NavigationStore] Department selected:', deptId);
        },

        /**
         * Remember the last accessed department for a user
         * This is stored in localStorage and restored on next login
         */
        rememberDepartment: (userId, deptId) => {
          set((state) => ({
            lastAccessedDepartments: {
              ...state.lastAccessedDepartments,
              [userId]: deptId,
            },
          }));
          console.log('[NavigationStore] Remembered department for user:', {
            userId,
            deptId,
          });
        },

        /**
         * Clear the current department selection
         * Called on logout or when user needs to select a different department
         */
        clearDepartmentSelection: () => {
          set({ selectedDepartmentId: null });
          console.log('[NavigationStore] Department selection cleared');
        },

        // ================================================================
        // Sidebar State
        // ================================================================

        /**
         * Toggle the sidebar open/close state
         * Used for mobile navigation
         */
        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        /**
         * Set the sidebar open state explicitly
         * Used to close sidebar after navigation on mobile
         */
        setSidebarOpen: (open) => {
          set({ isSidebarOpen: open });
        },
      }),
      {
        name: 'navigation-storage',
        // Only persist department selections, not sidebar state
        // Sidebar state is UI-only and should reset on page load
        partialize: (state) => ({
          lastAccessedDepartments: state.lastAccessedDepartments,
        }),
      }
    ),
    { name: 'NavigationStore' }
  )
);

// ============================================================================
// Utility Hooks and Functions
// ============================================================================

/**
 * Get the last accessed department for a specific user
 * Returns null if no department was previously accessed
 */
export function getLastAccessedDepartment(userId: string): string | null {
  const state = useNavigationStore.getState();
  return state.lastAccessedDepartments[userId] || null;
}

/**
 * Check if a department is currently selected
 * Useful for conditional rendering
 */
export function isDepartmentSelected(): boolean {
  const state = useNavigationStore.getState();
  return state.selectedDepartmentId !== null;
}

/**
 * Get the current department ID
 * Returns null if no department is selected
 */
export function getCurrentDepartmentId(): string | null {
  const state = useNavigationStore.getState();
  return state.selectedDepartmentId;
}
