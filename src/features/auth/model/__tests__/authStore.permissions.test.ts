/**
 * Auth Store Permission Tests - Track G
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Comprehensive tests for scoped permission checking in authStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import type { RoleHierarchy, UserType } from '@/shared/types/auth';

describe('AuthStore Permission Checking', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  describe('hasPermission - Global Checks (No Scope)', () => {
    it('should return false when no roleHierarchy exists', () => {
      const { hasPermission } = useAuthStore.getState();
      expect(hasPermission('content:courses:read')).toBe(false);
    });

    it('should return true for system:* wildcard permission', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'global-admin' as UserType,
        allUserTypes: ['global-admin'],
        defaultDashboard: 'admin',
        globalRoles: [],
        allPermissions: ['system:*'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('system:settings:manage')).toBe(true);
      expect(hasPermission('anything:at:all')).toBe(true);
    });

    it('should return true for direct permission match', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read', 'content:courses:create'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('content:courses:create')).toBe(true);
    });

    it('should return false for missing permission', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:delete')).toBe(false);
    });

    it('should support domain wildcard (content:*)', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:*'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('content:courses:create')).toBe(true);
      expect(hasPermission('content:lessons:manage')).toBe(true);
      expect(hasPermission('grades:own:edit')).toBe(false); // Different domain
    });

    it('should handle multiple permissions with wildcards', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:*', 'grades:own:edit', 'reports:view:own'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(true);
      expect(hasPermission('grades:own:edit')).toBe(true);
      expect(hasPermission('reports:view:own')).toBe(true);
      expect(hasPermission('grades:all:edit')).toBe(false);
    });
  });

  describe('hasPermission - Department Scoped Checks', () => {
    const dept1Id = 'dept-001';
    const dept2Id = 'dept-002';

    it('should check permissions in specific department (staff)', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        staffRoles: {
          departmentRoles: [
            {
              departmentId: dept1Id,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'instructor',
                  displayName: 'Instructor',
                  scopeType: 'department',
                  scopeId: dept1Id,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:read', 'content:courses:create'],
                },
              ],
            },
            {
              departmentId: dept2Id,
              departmentName: 'Department 2',
              isPrimary: false,
              roles: [
                {
                  role: 'instructor',
                  displayName: 'Instructor',
                  scopeType: 'department',
                  scopeId: dept2Id,
                  scopeName: 'Department 2',
                  permissions: ['content:courses:read'], // Only read, no create
                },
              ],
            },
          ],
        },
        allPermissions: ['content:courses:read', 'content:courses:create'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      // Department 1 - has both read and create
      expect(hasPermission('content:courses:read', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('content:courses:create', { type: 'department', id: dept1Id })).toBe(
        true
      );

      // Department 2 - only has read
      expect(hasPermission('content:courses:read', { type: 'department', id: dept2Id })).toBe(
        true
      );
      expect(hasPermission('content:courses:create', { type: 'department', id: dept2Id })).toBe(
        false
      );
    });

    it('should check permissions in specific department (learner)', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'learner' as UserType,
        allUserTypes: ['learner'],
        defaultDashboard: 'learner',
        globalRoles: [],
        learnerRoles: {
          departmentRoles: [
            {
              departmentId: dept1Id,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'course-taker',
                  displayName: 'Course Taker',
                  scopeType: 'department',
                  scopeId: dept1Id,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:read', 'content:lessons:read'],
                },
              ],
            },
          ],
        },
        allPermissions: ['content:courses:read', 'content:lessons:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('content:lessons:read', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('content:courses:create', { type: 'department', id: dept1Id })).toBe(
        false
      );
    });

    it('should return false for non-existent department', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        staffRoles: {
          departmentRoles: [
            {
              departmentId: dept1Id,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'instructor',
                  displayName: 'Instructor',
                  scopeType: 'department',
                  scopeId: dept1Id,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:read'],
                },
              ],
            },
          ],
        },
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(
        hasPermission('content:courses:read', { type: 'department', id: 'dept-999' })
      ).toBe(false);
    });

    it('should support wildcards in department-scoped permissions', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        staffRoles: {
          departmentRoles: [
            {
              departmentId: dept1Id,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'content-admin',
                  displayName: 'Content Admin',
                  scopeType: 'department',
                  scopeId: dept1Id,
                  scopeName: 'Department 1',
                  permissions: ['content:*'], // Wildcard for all content permissions
                },
              ],
            },
          ],
        },
        allPermissions: ['content:*'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('content:courses:read', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('content:courses:create', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('content:lessons:manage', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('grades:own:edit', { type: 'department', id: dept1Id })).toBe(false); // Different domain
    });

    it('should prioritize system:* over department scoping', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'global-admin' as UserType,
        allUserTypes: ['global-admin'],
        defaultDashboard: 'admin',
        globalRoles: [],
        allPermissions: ['system:*'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      // Even with department scope, system:* grants everything
      expect(hasPermission('content:courses:read', { type: 'department', id: dept1Id })).toBe(
        true
      );
      expect(hasPermission('anything:at:all', { type: 'department', id: 'any-dept' })).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasAnyPermission } = useAuthStore.getState();

      expect(
        hasAnyPermission(['content:courses:read', 'content:courses:create', 'content:courses:delete'])
      ).toBe(true);
    });

    it('should return false if user has none of the specified permissions', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasAnyPermission } = useAuthStore.getState();

      expect(hasAnyPermission(['content:courses:create', 'content:courses:delete'])).toBe(false);
    });

    it('should work with department scope', () => {
      const deptId = 'dept-001';
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        staffRoles: {
          departmentRoles: [
            {
              departmentId: deptId,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'instructor',
                  displayName: 'Instructor',
                  scopeType: 'department',
                  scopeId: deptId,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:read'],
                },
              ],
            },
          ],
        },
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasAnyPermission } = useAuthStore.getState();

      expect(
        hasAnyPermission(['content:courses:read', 'content:courses:create'], {
          type: 'department',
          id: deptId,
        })
      ).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read', 'content:courses:create', 'content:courses:delete'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasAllPermissions } = useAuthStore.getState();

      expect(
        hasAllPermissions(['content:courses:read', 'content:courses:create'])
      ).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasAllPermissions } = useAuthStore.getState();

      expect(
        hasAllPermissions(['content:courses:read', 'content:courses:create'])
      ).toBe(false);
    });

    it('should work with department scope', () => {
      const deptId = 'dept-001';
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        staffRoles: {
          departmentRoles: [
            {
              departmentId: deptId,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'instructor',
                  displayName: 'Instructor',
                  scopeType: 'department',
                  scopeId: deptId,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:read', 'content:courses:create'],
                },
              ],
            },
          ],
        },
        allPermissions: ['content:courses:read', 'content:courses:create'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasAllPermissions } = useAuthStore.getState();

      expect(
        hasAllPermissions(['content:courses:read', 'content:courses:create'], {
          type: 'department',
          id: deptId,
        })
      ).toBe(true);

      expect(
        hasAllPermissions(['content:courses:read', 'content:courses:delete'], {
          type: 'department',
          id: deptId,
        })
      ).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions array', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'learner' as UserType,
        allUserTypes: ['learner'],
        defaultDashboard: 'learner',
        globalRoles: [],
        allPermissions: [],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore.getState();

      expect(hasPermission('content:courses:read')).toBe(false);
      expect(hasAnyPermission(['content:courses:read'])).toBe(false);
      expect(hasAllPermissions(['content:courses:read'])).toBe(false);
    });

    it('should handle scope without id', () => {
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      // Scope without ID should return false
      expect(hasPermission('content:courses:read', { type: 'department', id: '' })).toBe(false);
    });

    it('should handle both staff and learner roles', () => {
      const deptId = 'dept-001';
      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff' as UserType,
        allUserTypes: ['staff', 'learner'],
        defaultDashboard: 'staff',
        globalRoles: [],
        staffRoles: {
          departmentRoles: [
            {
              departmentId: deptId,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'instructor',
                  displayName: 'Instructor',
                  scopeType: 'department',
                  scopeId: deptId,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:create'],
                },
              ],
            },
          ],
        },
        learnerRoles: {
          departmentRoles: [
            {
              departmentId: deptId,
              departmentName: 'Department 1',
              isPrimary: true,
              roles: [
                {
                  role: 'course-taker',
                  displayName: 'Course Taker',
                  scopeType: 'department',
                  scopeId: deptId,
                  scopeName: 'Department 1',
                  permissions: ['content:courses:read'],
                },
              ],
            },
          ],
        },
        allPermissions: ['content:courses:read', 'content:courses:create'],
      };

      useAuthStore.setState({ roleHierarchy });
      const { hasPermission } = useAuthStore.getState();

      // Should have both staff and learner permissions
      expect(hasPermission('content:courses:read', { type: 'department', id: deptId })).toBe(
        true
      );
      expect(hasPermission('content:courses:create', { type: 'department', id: deptId })).toBe(
        true
      );
    });
  });
});
