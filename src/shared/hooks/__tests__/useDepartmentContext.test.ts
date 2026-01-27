/**
 * Unit Tests for useDepartmentContext Hook
 * Track C - Contract Alignment Phase 1
 * Date: 2026-01-11
 *
 * Test coverage:
 * - Hook returns correct context from stores
 * - Permission checking functions work correctly
 * - Role checking works correctly
 * - Handles null/undefined gracefully
 * - Department switching integration
 * - Loading and error states
 */

import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDepartmentContext } from '../useDepartmentContext';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import type { RoleHierarchy } from '@/shared/types/auth';

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * Reset all stores to initial state before each test
 */
function resetStores() {
  // Reset auth store - UNIFIED AUTHORIZATION (ADR-AUTH-001)
  useAuthStore.setState({
    accessToken: null,
    user: null,
    roleHierarchy: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    // New unified authorization fields
    globalRights: [],
    departmentRights: {},
    departmentHierarchy: {},
    permissionVersion: 0,
  });

  // Reset navigation store
  useNavigationStore.setState({
    selectedDepartmentId: null,
    lastAccessedDepartments: {},
    isSidebarOpen: false,
    currentDepartmentRoles: [],
    currentDepartmentAccessRights: [],
    currentDepartmentName: null,
    isSwitchingDepartment: false,
    switchDepartmentError: null,
  });
}

/**
 * Create a mock role hierarchy for testing
 */
function createMockRoleHierarchy(): RoleHierarchy {
  return {
    primaryUserType: 'staff',
    allUserTypes: ['staff'],
    defaultDashboard: 'staff',
    globalRoles: [],
    staffRoles: {
      departmentRoles: [
        {
          departmentId: 'dept-123',
          departmentName: 'Engineering',
          isPrimary: true,
          roles: [
            {
              role: 'instructor',
              displayName: 'Instructor',
              scopeType: 'department',
              scopeId: 'dept-123',
              scopeName: 'Engineering',
              permissions: [
                'course:content:view',
                'course:content:edit',
                'course:enrollment:view',
              ],
            },
          ],
        },
        {
          departmentId: 'dept-456',
          departmentName: 'Marketing',
          isPrimary: false,
          roles: [
            {
              role: 'content-admin',
              displayName: 'Content Admin',
              scopeType: 'department',
              scopeId: 'dept-456',
              scopeName: 'Marketing',
              permissions: ['course:content:view', 'course:content:edit', 'course:content:delete'],
            },
          ],
        },
      ],
    },
    allPermissions: [
      'course:content:view',
      'course:content:edit',
      'course:enrollment:view',
      'course:content:delete',
    ],
  };
}

// ============================================================================
// Test Suite
// ============================================================================

describe('useDepartmentContext', () => {
  beforeEach(() => {
    resetStores();
  });

  // ==========================================================================
  // Basic Context Tests
  // ==========================================================================

  describe('Basic Context', () => {
    it('should return null department ID when no department selected', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.currentDepartmentId).toBeNull();
      expect(result.current.currentDepartmentRoles).toEqual([]);
      expect(result.current.currentDepartmentAccessRights).toEqual([]);
      expect(result.current.currentDepartmentName).toBeNull();
    });

    it('should return department context when department is selected', () => {
      // Set up navigation store with department selected
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: ['instructor', 'content-admin'],
          currentDepartmentAccessRights: [
            'course:content:view',
            'course:content:edit',
            'course:enrollment:view',
          ],
          currentDepartmentName: 'Engineering',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.currentDepartmentId).toBe('dept-123');
      expect(result.current.currentDepartmentRoles).toEqual(['instructor', 'content-admin']);
      expect(result.current.currentDepartmentAccessRights).toEqual([
        'course:content:view',
        'course:content:edit',
        'course:enrollment:view',
      ]);
      expect(result.current.currentDepartmentName).toBe('Engineering');
    });

    it('should update when department context changes', () => {
      const { result, rerender } = renderHook(() => useDepartmentContext());

      // Initial state - no department
      expect(result.current.currentDepartmentId).toBeNull();

      // Select a department
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: ['instructor'],
          currentDepartmentAccessRights: ['course:content:view'],
          currentDepartmentName: 'Engineering',
        });
      });

      rerender();

      expect(result.current.currentDepartmentId).toBe('dept-123');
      expect(result.current.currentDepartmentName).toBe('Engineering');
    });
  });

  // ==========================================================================
  // Permission Checking Tests
  // ==========================================================================

  describe('Permission Checking', () => {
    beforeEach(() => {
      // Set up auth store with role hierarchy
      act(() => {
        useAuthStore.setState({
          roleHierarchy: createMockRoleHierarchy(),
          isAuthenticated: true,
        });
      });
    });

    it('should return false for any permission when no department selected', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasPermission('course:content:view')).toBe(false);
      expect(result.current.hasPermission('course:content:edit')).toBe(false);
    });

    it('should return true for permissions in current department', () => {
      // UNIFIED AUTHORIZATION: Set up departmentRights in authStore
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          departmentRights: {
            'dept-123': [
              'course:content:view',
              'course:content:edit',
              'course:enrollment:view',
            ],
          },
        });
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasPermission('course:content:view')).toBe(true);
      expect(result.current.hasPermission('course:content:edit')).toBe(true);
      expect(result.current.hasPermission('course:enrollment:view')).toBe(true);
    });

    it('should return false for permissions not in current department', () => {
      // UNIFIED AUTHORIZATION: Set up departmentRights in authStore
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          departmentRights: {
            'dept-123': ['course:content:view'],
          },
        });
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasPermission('course:content:view')).toBe(true);
      expect(result.current.hasPermission('course:content:delete')).toBe(false);
      expect(result.current.hasPermission('user:profile:edit')).toBe(false);
    });

    it('should handle wildcard system permission', () => {
      // UNIFIED AUTHORIZATION: system:* goes in globalRights
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          globalRights: ['system:*'],
          departmentRights: {},
        });
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasPermission('course:content:view')).toBe(true);
      expect(result.current.hasPermission('course:content:delete')).toBe(true);
      expect(result.current.hasPermission('user:profile:edit')).toBe(true);
      expect(result.current.hasPermission('anything:at:all')).toBe(true);
    });

    it('should handle wildcard domain permissions', () => {
      // UNIFIED AUTHORIZATION: Set up departmentRights in authStore
      act(() => {
        useAuthStore.setState({
          isAuthenticated: true,
          departmentRights: {
            'dept-123': ['course:*', 'user:profile:view'],
          },
        });
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      // course:* should match any course permission
      expect(result.current.hasPermission('course:content:view')).toBe(true);
      expect(result.current.hasPermission('course:content:edit')).toBe(true);
      expect(result.current.hasPermission('course:enrollment:view')).toBe(true);

      // But not other domains without wildcard
      expect(result.current.hasPermission('user:profile:view')).toBe(true);
      expect(result.current.hasPermission('user:profile:edit')).toBe(false);
    });

    it('should return false when no roleHierarchy available', () => {
      // Clear auth store
      act(() => {
        useAuthStore.setState({
          roleHierarchy: null,
          isAuthenticated: false,
        });

        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentAccessRights: ['course:content:view'],
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasPermission('course:content:view')).toBe(false);
    });
  });

  // ==========================================================================
  // Multiple Permission Tests
  // ==========================================================================

  describe('Multiple Permission Checking', () => {
    beforeEach(() => {
      // UNIFIED AUTHORIZATION: Set up departmentRights in authStore
      act(() => {
        useAuthStore.setState({
          roleHierarchy: createMockRoleHierarchy(),
          isAuthenticated: true,
          departmentRights: {
            'dept-123': [
              'course:content:view',
              'course:content:edit',
              'course:enrollment:view',
            ],
          },
        });

        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
        });
      });
    });

    it('hasAnyPermission should return true if user has any permission', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(
        result.current.hasAnyPermission([
          'course:content:view',
          'course:content:delete', // Don't have this one
        ])
      ).toBe(true);

      expect(
        result.current.hasAnyPermission(['course:content:view', 'course:content:edit'])
      ).toBe(true);
    });

    it('hasAnyPermission should return false if user has none', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(
        result.current.hasAnyPermission(['course:content:delete', 'user:profile:edit'])
      ).toBe(false);
    });

    it('hasAnyPermission should return false for empty array', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasAnyPermission([])).toBe(false);
    });

    it('hasAllPermissions should return true if user has all permissions', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(
        result.current.hasAllPermissions(['course:content:view', 'course:content:edit'])
      ).toBe(true);

      expect(
        result.current.hasAllPermissions([
          'course:content:view',
          'course:content:edit',
          'course:enrollment:view',
        ])
      ).toBe(true);
    });

    it('hasAllPermissions should return false if user lacks any permission', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(
        result.current.hasAllPermissions([
          'course:content:view',
          'course:content:delete', // Don't have this
        ])
      ).toBe(false);
    });

    it('hasAllPermissions should return true for empty array', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasAllPermissions([])).toBe(true);
    });
  });

  // ==========================================================================
  // Role Checking Tests
  // ==========================================================================

  describe('Role Checking', () => {
    it('should return false when no department selected', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasRole('instructor')).toBe(false);
      expect(result.current.hasRole('content-admin')).toBe(false);
    });

    it('should return true for roles in current department', () => {
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: ['instructor', 'content-admin'],
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasRole('instructor')).toBe(true);
      expect(result.current.hasRole('content-admin')).toBe(true);
    });

    it('should return false for roles not in current department', () => {
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: ['instructor'],
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasRole('instructor')).toBe(true);
      expect(result.current.hasRole('content-admin')).toBe(false);
      expect(result.current.hasRole('department-admin')).toBe(false);
    });
  });

  // ==========================================================================
  // Department Switching Tests
  // ==========================================================================

  describe('Department Switching', () => {
    it('should expose switchDepartment function', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(typeof result.current.switchDepartment).toBe('function');
    });

    it('should expose loading state', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.isSwitching).toBe(false);
    });

    it('should expose error state', () => {
      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.switchError).toBeNull();
    });

    it('should update loading state during department switch', async () => {
      // Mock switchDepartment to track loading state
      const mockSwitch = vi.fn().mockImplementation(async () => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 10));
        useNavigationStore.setState({
          isSwitchingDepartment: false,
          selectedDepartmentId: 'dept-456',
          currentDepartmentName: 'Marketing',
        });
      });

      act(() => {
        useNavigationStore.setState({
          switchDepartment: mockSwitch,
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      // Initial state
      expect(result.current.isSwitching).toBe(false);

      // Trigger switch
      act(() => {
        useNavigationStore.setState({ isSwitchingDepartment: true });
        result.current.switchDepartment('dept-456');
      });

      // Should be switching
      expect(result.current.isSwitching).toBe(true);

      // Wait for switch to complete
      await waitFor(() => {
        expect(result.current.isSwitching).toBe(false);
      });

      expect(result.current.currentDepartmentId).toBe('dept-456');
    });

    it('should update error state on switch failure', () => {
      act(() => {
        useNavigationStore.setState({
          switchDepartmentError: 'Department not found',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.switchError).toBe('Department not found');
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe('Edge Cases', () => {
    it('should handle undefined roleHierarchy gracefully', () => {
      act(() => {
        useAuthStore.setState({
          roleHierarchy: null,
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(() => result.current.hasPermission('course:content:view')).not.toThrow();
      expect(result.current.hasPermission('course:content:view')).toBe(false);
    });

    it('should handle empty access rights array', () => {
      act(() => {
        useAuthStore.setState({
          roleHierarchy: createMockRoleHierarchy(),
        });

        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentAccessRights: [],
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasPermission('course:content:view')).toBe(false);
    });

    it('should handle empty roles array', () => {
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: [],
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.hasRole('instructor')).toBe(false);
    });

    it('should re-memoize helpers when dependencies change', () => {
      const { result, rerender } = renderHook(() => useDepartmentContext());

      const firstHasPermission = result.current.hasPermission;

      // Change navigation state
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentAccessRights: ['course:content:view'],
        });
      });

      rerender();

      // Function reference should change because dependencies changed
      expect(result.current.hasPermission).not.toBe(firstHasPermission);
    });

    it('should handle null department name', () => {
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentName: null,
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      expect(result.current.currentDepartmentName).toBeNull();
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration', () => {
    it('should work with complete realistic scenario', () => {
      // UNIFIED AUTHORIZATION: Set up authStore with departmentRights
      act(() => {
        useAuthStore.setState({
          roleHierarchy: createMockRoleHierarchy(),
          isAuthenticated: true,
          departmentRights: {
            'dept-123': [
              'course:content:view',
              'course:content:edit',
              'course:enrollment:view',
            ],
          },
        });

        // Select Engineering department
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: ['instructor'],
          currentDepartmentName: 'Engineering',
        });
      });

      const { result } = renderHook(() => useDepartmentContext());

      // Verify complete context
      expect(result.current.currentDepartmentId).toBe('dept-123');
      expect(result.current.currentDepartmentName).toBe('Engineering');
      expect(result.current.currentDepartmentRoles).toContain('instructor');

      // Verify permissions (now delegated to authStore)
      expect(result.current.hasPermission('course:content:view')).toBe(true);
      expect(result.current.hasPermission('course:content:edit')).toBe(true);
      expect(result.current.hasPermission('course:content:delete')).toBe(false);

      // Verify role
      expect(result.current.hasRole('instructor')).toBe(true);
      expect(result.current.hasRole('content-admin')).toBe(false);

      // Verify multiple permission checks
      expect(
        result.current.hasAnyPermission(['course:content:view', 'course:content:delete'])
      ).toBe(true);
      expect(
        result.current.hasAllPermissions(['course:content:view', 'course:content:edit'])
      ).toBe(true);
    });

    it('should maintain stable switchDepartment reference across renders', () => {
      const { result, rerender } = renderHook(() => useDepartmentContext());

      // Capture initial switchDepartment reference
      const firstSwitchDepartment = result.current.switchDepartment;

      // Re-render without changing any dependencies
      rerender();

      // switchDepartment reference should remain stable
      expect(result.current.switchDepartment).toBe(firstSwitchDepartment);

      // Change navigation state (but not switchDepartment function itself)
      act(() => {
        useNavigationStore.setState({
          selectedDepartmentId: 'dept-123',
          currentDepartmentRoles: ['instructor'],
          currentDepartmentAccessRights: ['course:content:view'],
        });
      });

      rerender();

      // switchDepartment reference should STILL be stable
      expect(result.current.switchDepartment).toBe(firstSwitchDepartment);
    });
  });
});
