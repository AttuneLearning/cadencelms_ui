/**
 * useDepartmentContext Hook - Track C Implementation
 * Version: 2.1.0 (Contract Alignment - Phase 1)
 * Date: 2026-01-11
 *
 * Combines authStore roleHierarchy with navigationStore department selection
 * to provide a complete department context for permission-aware components.
 *
 * Features:
 * - Current department ID, roles, and access rights from navigationStore
 * - Permission checking scoped to current department
 * - Role checking within current department
 * - Department switching capability
 * - Loading state management
 * - Handles null/undefined gracefully
 *
 * Dependencies:
 * - Track A: authStore with roleHierarchy
 * - Track B: navigationStore with department state
 */

import { useMemo, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';

// ============================================================================
// Types
// ============================================================================

/**
 * Complete department context combining auth and navigation state
 */
export interface DepartmentContext {
  // From navigationStore
  /** Currently selected department ID (null if no department selected) */
  currentDepartmentId: string | null;

  /** Roles assigned in the current department */
  currentDepartmentRoles: string[];

  /** Access rights granted in the current department */
  currentDepartmentAccessRights: string[];

  /** Name of the current department */
  currentDepartmentName: string | null;

  // Helper functions
  /** Check if user has a specific permission in current department */
  hasPermission: (permission: string) => boolean;

  /** Check if user has any of the specified permissions in current department */
  hasAnyPermission: (permissions: string[]) => boolean;

  /** Check if user has all of the specified permissions in current department */
  hasAllPermissions: (permissions: string[]) => boolean;

  /** Check if user has a specific role in current department */
  hasRole: (role: string) => boolean;

  // Actions
  /** Switch to a different department (calls API and updates state) */
  switchDepartment: (deptId: string) => Promise<void>;

  // Loading state
  /** Is department switch in progress? */
  isSwitching: boolean;

  /** Error from last department switch attempt */
  switchError: string | null;
}

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook to get complete department context with permission checking
 *
 * Combines data from:
 * - authStore: roleHierarchy with all permissions
 * - navigationStore: selected department and cached API response
 *
 * @returns Complete department context with helper functions
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     currentDepartmentId,
 *     currentDepartmentRoles,
 *     hasPermission,
 *     switchDepartment
 *   } = useDepartmentContext();
 *
 *   if (!currentDepartmentId) {
 *     return <div>No department selected</div>;
 *   }
 *
 *   if (!hasPermission('course:content:edit')) {
 *     return <div>No permission to edit content</div>;
 *   }
 *
 *   return <div>Content editor</div>;
 * }
 * ```
 */
export function useDepartmentContext(): DepartmentContext {
  // Get auth state (for permission checking)
  const roleHierarchy = useAuthStore((state) => state.roleHierarchy);

  // Get navigation state (for current department context)
  const selectedDepartmentId = useNavigationStore((state) => state.selectedDepartmentId);
  const currentDepartmentRoles = useNavigationStore((state) => state.currentDepartmentRoles);
  const currentDepartmentAccessRights = useNavigationStore(
    (state) => state.currentDepartmentAccessRights
  );
  const currentDepartmentName = useNavigationStore((state) => state.currentDepartmentName);
  const isSwitchingDepartment = useNavigationStore((state) => state.isSwitchingDepartment);
  const switchDepartmentError = useNavigationStore((state) => state.switchDepartmentError);
  const switchDepartmentAction = useNavigationStore((state) => state.switchDepartment);

  // ============================================================================
  // Permission Checking Functions (Memoized)
  // ============================================================================

  /**
   * Check if user has a specific permission in the current department
   * Uses cached access rights from navigationStore for efficiency
   */
  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      // No department selected - no permissions
      if (!selectedDepartmentId) {
        return false;
      }

      // No auth data - no permissions
      if (!roleHierarchy) {
        return false;
      }

      // Check for wildcard permission (global-admin)
      if (roleHierarchy.allPermissions.includes('system:*')) {
        return true;
      }

      // Check if permission exists in current department's cached access rights
      // This is more efficient than traversing roleHierarchy
      if (currentDepartmentAccessRights.includes(permission)) {
        return true;
      }

      // Check for wildcard patterns (e.g., "course:*" matches "course:content:edit")
      const [domain] = permission.split(':');
      if (currentDepartmentAccessRights.includes(`${domain}:*`)) {
        return true;
      }

      return false;
    };
  }, [selectedDepartmentId, roleHierarchy, currentDepartmentAccessRights]);

  /**
   * Check if user has any of the specified permissions in current department
   */
  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (permissions.length === 0) {
        return false;
      }
      return permissions.some((perm) => hasPermission(perm));
    };
  }, [hasPermission]);

  /**
   * Check if user has all of the specified permissions in current department
   */
  const hasAllPermissions = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (permissions.length === 0) {
        return true; // Empty array = no requirements
      }
      return permissions.every((perm) => hasPermission(perm));
    };
  }, [hasPermission]);

  /**
   * Check if user has a specific role in the current department
   * Uses cached roles from navigationStore for efficiency
   */
  const hasRole = useMemo(() => {
    return (role: string): boolean => {
      // No department selected - no roles
      if (!selectedDepartmentId) {
        return false;
      }

      // Check cached department roles
      return currentDepartmentRoles.includes(role);
    };
  }, [selectedDepartmentId, currentDepartmentRoles]);

  // ============================================================================
  // Actions (Stabilized)
  // ============================================================================

  /**
   * Stable reference to switchDepartment action
   * Wrapped in useCallback to prevent infinite loops in useEffect dependencies
   */
  const switchDepartment = useCallback(
    (deptId: string) => {
      return switchDepartmentAction(deptId);
    },
    [switchDepartmentAction]
  );

  // ============================================================================
  // Return Context
  // ============================================================================

  return {
    // Department context
    currentDepartmentId: selectedDepartmentId,
    currentDepartmentRoles,
    currentDepartmentAccessRights,
    currentDepartmentName,

    // Helper functions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,

    // Actions
    switchDepartment,

    // Loading state
    isSwitching: isSwitchingDepartment,
    switchError: switchDepartmentError,
  };
}
