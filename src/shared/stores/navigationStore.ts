/**
 * Navigation Store - Phase 2 Implementation
 * Version: 2.1.0 (Contract Alignment - Track B)
 * Date: 2026-01-11
 *
 * Zustand store for navigation state management
 * Handles department selection and sidebar UI state
 *
 * Features:
 * - Department selection with persistence
 * - Last accessed department tracking per user
 * - Sidebar open/close state
 * - Department switching with API integration
 * - Cached department roles and access rights
 * - localStorage persistence for department preferences
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { authApi } from '@/entities/auth/api/authApi';

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

  // Cached department context from API
  /** Roles in the currently selected department */
  currentDepartmentRoles: string[];

  /** Access rights in the currently selected department */
  currentDepartmentAccessRights: string[];

  /** Name of the currently selected department */
  currentDepartmentName: string | null;

  // Loading and error states
  /** Is department switch in progress? */
  isSwitchingDepartment: boolean;

  /** Error from last department switch attempt */
  switchDepartmentError: string | null;

  // Breadcrumb navigation state (Phase 2 - Navigation Redesign 2026-02-05)
  /** Stack of department IDs representing the current drill-down path */
  departmentPath: string[];

  /** Whether breadcrumb navigation mode is active */
  isBreadcrumbMode: boolean;

  // Actions
  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
  clearDepartmentSelection: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // API-connected department switching
  switchDepartment: (deptId: string) => Promise<void>;

  // Breadcrumb navigation actions
  /** Navigate to a department (updates path based on hierarchy) */
  navigateToDepartment: (deptId: string, ancestors?: string[]) => void;
  /** Go up one level in the breadcrumb path */
  navigateUp: () => void;
  /** Clear the department path */
  clearDepartmentPath: () => void;
  /** Toggle between list and breadcrumb mode */
  toggleBreadcrumbMode: () => void;
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

        // Department context cache
        currentDepartmentRoles: [],
        currentDepartmentAccessRights: [],
        currentDepartmentName: null,

        // Loading and error states
        isSwitchingDepartment: false,
        switchDepartmentError: null,

        // Breadcrumb navigation state
        departmentPath: [],
        isBreadcrumbMode: true, // Default to breadcrumb mode

        // ================================================================
        // Department Selection
        // ================================================================

        /**
         * Set the currently selected department
         * Set to null to clear selection
         */
        setSelectedDepartment: (deptId) => {
          set({ selectedDepartmentId: deptId });
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
        },

        /**
         * Clear the current department selection
         * Called on logout or when user needs to select a different department
         */
        clearDepartmentSelection: () => {
          set({
            selectedDepartmentId: null,
            currentDepartmentRoles: [],
            currentDepartmentAccessRights: [],
            currentDepartmentName: null,
            switchDepartmentError: null,
          });
        },

        /**
         * Switch to a new department (with API call)
         * Calls backend API to switch department context and caches the response
         *
         * @param deptId - Department ID to switch to
         * @throws Error if department switch fails
         */
        switchDepartment: async (deptId: string) => {
          // Set loading state
          set({
            isSwitchingDepartment: true,
            switchDepartmentError: null,
          });

          try {
            // Call the API
            const response = await authApi.switchDepartment({ departmentId: deptId });

            // Extract department data from response
            const { currentDepartment } = response.data;

            // Update state with API response
            set({
              selectedDepartmentId: deptId,
              currentDepartmentRoles: currentDepartment.roles,
              currentDepartmentAccessRights: currentDepartment.accessRights,
              currentDepartmentName: currentDepartment.departmentName,
              isSwitchingDepartment: false,
              switchDepartmentError: null,
            });

          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            console.error('[NavigationStore] Department switch failed:', error);

            // Update error state
            set({
              isSwitchingDepartment: false,
              switchDepartmentError: errorMessage,
            });

            // Re-throw so calling code can handle the error
            throw error;
          }
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

        // ================================================================
        // Breadcrumb Navigation (Phase 2 - Navigation Redesign 2026-02-05)
        // ================================================================

        /**
         * Navigate to a department and update the breadcrumb path
         * If ancestors are provided, they're used to build the path
         * Otherwise, the department is added to the current path
         */
        navigateToDepartment: (deptId, ancestors) => {
          set((state) => {
            if (ancestors) {
              // Build path from ancestors + current
              return {
                selectedDepartmentId: deptId,
                departmentPath: [...ancestors, deptId],
              };
            }

            // Check if this department is already in the path (navigating up)
            const existingIndex = state.departmentPath.indexOf(deptId);
            if (existingIndex >= 0) {
              // Truncate path to this department
              return {
                selectedDepartmentId: deptId,
                departmentPath: state.departmentPath.slice(0, existingIndex + 1),
              };
            }

            // Add to path (drilling down)
            return {
              selectedDepartmentId: deptId,
              departmentPath: [...state.departmentPath, deptId],
            };
          });
        },

        /**
         * Navigate up one level in the breadcrumb path
         */
        navigateUp: () => {
          set((state) => {
            if (state.departmentPath.length <= 1) {
              return state; // Can't go up from root
            }

            const newPath = state.departmentPath.slice(0, -1);
            return {
              selectedDepartmentId: newPath[newPath.length - 1] || null,
              departmentPath: newPath,
            };
          });
        },

        /**
         * Clear the department path (reset to root)
         */
        clearDepartmentPath: () => {
          set({
            selectedDepartmentId: null,
            departmentPath: [],
          });
        },

        /**
         * Toggle between list and breadcrumb navigation modes
         */
        toggleBreadcrumbMode: () => {
          set((state) => ({
            isBreadcrumbMode: !state.isBreadcrumbMode,
          }));
        },
      }),
      {
        name: 'navigation-storage',
        // Only persist department selections and preferences, not sidebar state
        // Sidebar state is UI-only and should reset on page load
        partialize: (state) => ({
          lastAccessedDepartments: state.lastAccessedDepartments,
          isBreadcrumbMode: state.isBreadcrumbMode,
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
