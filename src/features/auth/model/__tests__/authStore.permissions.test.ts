/**
 * Auth Store Permission Tests - Unified Authorization Model
 * Version: 3.0.0
 * Date: 2026-01-22
 *
 * Tests for unified authorization permission checking in authStore (ADR-AUTH-001)
 * Uses globalRights + departmentRights instead of roleHierarchy.allPermissions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('AuthStore Permission Checking (Unified Authorization)', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      // UNIFIED AUTHORIZATION
      globalRights: [],
      departmentRights: {},
      departmentHierarchy: {},
      permissionVersion: 0,
    });
  });

  describe('hasPermission - Global Checks (No Department)', () => {
    it('should return false when no rights exist', () => {
      const { hasPermission } = useAuthStore.getState();
      expect(hasPermission('content:courses:read')).toBe(false);
    });

    it('should return true for system:* wildcard in globalRights', () => {
      useAuthStore.setState({
        globalRights: ['system:*'],
        departmentRights: {},
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('system:settings:manage')).toBe(true);
      expect(hasPermission('anything:at:all')).toBe(true);
    });

    it('should return true for direct permission match in globalRights', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read', 'content:courses:create'],
        departmentRights: {},
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('content:courses:create')).toBe(true);
    });

    it('should return true if permission exists in any departmentRights', () => {
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          'dept-001': ['content:courses:read'],
          'dept-002': ['content:lessons:read'],
        },
      });
      const { hasPermission } = useAuthStore.getState();

      // No departmentId - checks if permission exists anywhere
      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('content:lessons:read')).toBe(true);
      expect(hasPermission('content:courses:delete')).toBe(false);
    });

    it('should return false for missing permission', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read'],
        departmentRights: {},
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:delete')).toBe(false);
    });

    it('should support domain wildcard (content:*) in globalRights', () => {
      useAuthStore.setState({
        globalRights: ['content:*'],
        departmentRights: {},
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('content:courses:create')).toBe(true);
      expect(hasPermission('content:lessons:manage')).toBe(true);
      expect(hasPermission('grades:own:edit')).toBe(false); // Different domain
    });

    it('should support two-level wildcard (content:courses:*)', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:*'],
        departmentRights: {},
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('content:courses:create')).toBe(true);
      expect(hasPermission('content:lessons:read')).toBe(false); // Different resource
    });
  });

  describe('hasPermission - Department Scoped Checks', () => {
    const dept1Id = 'dept-001';
    const dept2Id = 'dept-002';

    it('should check permissions in specific department', () => {
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [dept1Id]: ['content:courses:read', 'content:courses:create'],
          [dept2Id]: ['content:courses:read'], // Only read, no create
        },
      });
      const { hasPermission } = useAuthStore.getState();

      // Department 1 - has both read and create
      expect(hasPermission('content:courses:read', dept1Id)).toBe(true);
      expect(hasPermission('content:courses:create', dept1Id)).toBe(true);

      // Department 2 - only has read
      expect(hasPermission('content:courses:read', dept2Id)).toBe(true);
      expect(hasPermission('content:courses:create', dept2Id)).toBe(false);
    });

    it('should return false for non-existent department', () => {
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [dept1Id]: ['content:courses:read'],
        },
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read', 'dept-999')).toBe(false);
    });

    it('should support wildcards in department-scoped permissions', () => {
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [dept1Id]: ['content:*'], // Wildcard for all content permissions
        },
      });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read', dept1Id)).toBe(true);
      expect(hasPermission('content:courses:create', dept1Id)).toBe(true);
      expect(hasPermission('content:lessons:manage', dept1Id)).toBe(true);
      expect(hasPermission('grades:own:edit', dept1Id)).toBe(false); // Different domain
    });

    it('should prioritize globalRights over department scoping', () => {
      useAuthStore.setState({
        globalRights: ['system:*'],
        departmentRights: {}, // No department rights
      });
      const { hasPermission } = useAuthStore.getState();

      // Even with department scope, globalRights grants everything
      expect(hasPermission('content:courses:read', dept1Id)).toBe(true);
      expect(hasPermission('anything:at:all', 'any-dept')).toBe(true);
    });

    it('should inherit permissions from parent department via hierarchy', () => {
      const parentDeptId = 'dept-parent';
      const childDeptId = 'dept-child';

      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [parentDeptId]: ['content:courses:manage'],
          // Child department has no direct rights
        },
        departmentHierarchy: {
          [parentDeptId]: [childDeptId], // Parent has child
        },
      });
      const { hasPermission } = useAuthStore.getState();

      // Child inherits from parent
      expect(hasPermission('content:courses:manage', childDeptId)).toBe(true);
      // Parent has its own rights
      expect(hasPermission('content:courses:manage', parentDeptId)).toBe(true);
    });
  });

  describe('hasDepartmentPermission', () => {
    it('should check permission for specific department', () => {
      const deptId = 'dept-001';
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [deptId]: ['content:courses:read', 'content:courses:create'],
        },
      });
      const { hasDepartmentPermission } = useAuthStore.getState();

      expect(hasDepartmentPermission('content:courses:read', deptId)).toBe(true);
      expect(hasDepartmentPermission('content:courses:delete', deptId)).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions globally', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read'],
        departmentRights: {},
      });
      const { hasAnyPermission } = useAuthStore.getState();

      expect(
        hasAnyPermission(['content:courses:read', 'content:courses:create', 'content:courses:delete'])
      ).toBe(true);
    });

    it('should return false if user has none of the specified permissions', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read'],
        departmentRights: {},
      });
      const { hasAnyPermission } = useAuthStore.getState();

      expect(hasAnyPermission(['content:courses:create', 'content:courses:delete'])).toBe(false);
    });

    it('should work with department scope', () => {
      const deptId = 'dept-001';
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [deptId]: ['content:courses:read'],
        },
      });
      const { hasAnyPermission } = useAuthStore.getState();

      expect(hasAnyPermission(['content:courses:read', 'content:courses:create'], deptId)).toBe(true);
      expect(hasAnyPermission(['content:courses:create', 'content:courses:delete'], deptId)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions globally', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read', 'content:courses:create', 'content:courses:delete'],
        departmentRights: {},
      });
      const { hasAllPermissions } = useAuthStore.getState();

      expect(hasAllPermissions(['content:courses:read', 'content:courses:create'])).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read'],
        departmentRights: {},
      });
      const { hasAllPermissions } = useAuthStore.getState();

      expect(hasAllPermissions(['content:courses:read', 'content:courses:create'])).toBe(false);
    });

    it('should work with department scope', () => {
      const deptId = 'dept-001';
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          [deptId]: ['content:courses:read', 'content:courses:create'],
        },
      });
      const { hasAllPermissions } = useAuthStore.getState();

      expect(hasAllPermissions(['content:courses:read', 'content:courses:create'], deptId)).toBe(true);
      expect(hasAllPermissions(['content:courses:read', 'content:courses:delete'], deptId)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions', () => {
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {},
      });
      const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(false);
      expect(hasAnyPermission(['content:courses:read'])).toBe(false);
      expect(hasAllPermissions(['content:courses:read'])).toBe(false);
    });

    it('should handle empty departmentId', () => {
      useAuthStore.setState({
        globalRights: [],
        departmentRights: {
          'dept-001': ['content:courses:read'],
        },
      });
      const { hasPermission } = useAuthStore.getState();

      // Empty string departmentId should return false for that department
      expect(hasPermission('content:courses:read', '')).toBe(false);
    });

    it('should combine globalRights with departmentRights', () => {
      const deptId = 'dept-001';
      useAuthStore.setState({
        globalRights: ['content:courses:read'], // Global read
        departmentRights: {
          [deptId]: ['content:courses:create'], // Department create
        },
      });
      const { hasPermission } = useAuthStore.getState();

      // Global right applies to all departments
      expect(hasPermission('content:courses:read', deptId)).toBe(true);
      // Department right only in that department
      expect(hasPermission('content:courses:create', deptId)).toBe(true);
      expect(hasPermission('content:courses:create', 'other-dept')).toBe(false);
    });

    it('should handle permissionVersion for cache validation', () => {
      useAuthStore.setState({
        globalRights: ['content:courses:read'],
        departmentRights: {},
        permissionVersion: 42,
      });
      const state = useAuthStore.getState();

      expect(state.permissionVersion).toBe(42);
    });
  });
});
