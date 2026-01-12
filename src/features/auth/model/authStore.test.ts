/**
 * Auth Store Tests - Phase 3 (Track F)
 * Version: 2.1.0
 * Date: 2026-01-11
 *
 * Tests for authStore with UserTypeObject[] and display map building
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useAuthStore } from './authStore';
import * as authApi from '@/entities/auth/api/authApi';
import * as tokenStorage from '@/shared/utils/tokenStorage';
import type { LoginResponse, MyRolesResponse, UserTypeObject } from '@/shared/types/auth';

// Mock the API and storage modules
vi.mock('@/entities/auth/api/authApi');
vi.mock('@/shared/utils/tokenStorage');

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(null);
      expect(state.user).toBe(null);
      expect(state.roleHierarchy).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('Login with UserTypeObject[]', () => {
    it('should handle login with UserTypeObject[] and build display maps', async () => {
      const mockLoginResponse: LoginResponse = {
        success: true,
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            lastLogin: null,
            createdAt: '2026-01-11T00:00:00Z',
          },
          session: {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
          userTypes: [
            { _id: 'staff', displayAs: 'Staff Member' },
            { _id: 'learner', displayAs: 'Student' },
          ] as UserTypeObject[],
          defaultDashboard: 'staff' as const,
          canEscalateToAdmin: false,
          departmentMemberships: [
            {
              departmentId: 'dept1',
              departmentName: 'Computer Science',
              departmentSlug: 'cs',
              roles: ['instructor', 'content-admin'],
              accessRights: ['dept:cs:course:create', 'dept:cs:content:edit'],
              isPrimary: true,
              isActive: true,
              joinedAt: '2026-01-01T00:00:00Z',
            },
          ],
          allAccessRights: ['dept:cs:course:create', 'dept:cs:content:edit'],
          lastSelectedDepartment: 'dept1',
        },
      };

      vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

      await useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'password',
      });

      const state = useAuthStore.getState();

      // Verify authentication state
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);

      // Verify user object has UserType[] keys (not UserTypeObject[])
      expect(state.user?.userTypes).toEqual(['staff', 'learner']);
      expect(state.user?.email).toBe('test@example.com');

      // Verify roleHierarchy has display maps
      expect(state.roleHierarchy?.userTypeDisplayMap).toEqual({
        staff: 'Staff Member',
        learner: 'Student',
      });

      // Verify display maps include roles
      expect(state.roleHierarchy?.roleDisplayMap).toBeDefined();
      expect(state.roleHierarchy?.roleDisplayMap?.instructor).toBeDefined();

      // Verify tokens were stored
      expect(tokenStorage.setAccessToken).toHaveBeenCalled();
      expect(tokenStorage.setRefreshToken).toHaveBeenCalled();
    });

    it('should handle login with fallback when roles are strings', async () => {
      const mockLoginResponse: LoginResponse = {
        success: true,
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            lastLogin: null,
            createdAt: '2026-01-11T00:00:00Z',
          },
          session: {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
          userTypes: [
            { _id: 'learner', displayAs: 'Learner' },
          ] as UserTypeObject[],
          defaultDashboard: 'learner' as const,
          canEscalateToAdmin: false,
          departmentMemberships: [
            {
              departmentId: 'dept1',
              departmentName: 'Computer Science',
              departmentSlug: 'cs',
              roles: ['course-taker'], // String format
              accessRights: ['dept:cs:course:view'],
              isPrimary: true,
              isActive: true,
              joinedAt: '2026-01-01T00:00:00Z',
            },
          ],
          allAccessRights: ['dept:cs:course:view'],
          lastSelectedDepartment: 'dept1',
        },
      };

      vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

      await useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'password',
      });

      const state = useAuthStore.getState();

      // Should still work with string roles
      expect(state.isAuthenticated).toBe(true);
      expect(state.roleHierarchy?.roleDisplayMap).toBeDefined();
      expect(state.roleHierarchy?.roleDisplayMap?.['course-taker']).toBeDefined();
    });

    it('should handle login error', async () => {
      vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        useAuthStore.getState().login({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should extract correct primary user type', async () => {
      const mockLoginResponse: LoginResponse = {
        success: true,
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            lastLogin: null,
            createdAt: '2026-01-11T00:00:00Z',
          },
          session: {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
          userTypes: [
            { _id: 'staff', displayAs: 'Staff' },
            { _id: 'learner', displayAs: 'Learner' },
          ] as UserTypeObject[],
          defaultDashboard: 'staff' as const,
          canEscalateToAdmin: false,
          departmentMemberships: [],
          allAccessRights: [],
          lastSelectedDepartment: null,
        },
      };

      vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

      await useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'password',
      });

      const state = useAuthStore.getState();

      // Primary user type should be first in array
      expect(state.roleHierarchy?.primaryUserType).toBe('staff');
      expect(state.roleHierarchy?.allUserTypes).toEqual(['staff', 'learner']);
    });
  });

  describe('Initialize Auth with UserTypeObject[]', () => {
    it('should restore session and build display maps from token', async () => {
      const mockAccessToken = {
        value: 'stored-token',
        type: 'Bearer' as const,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };

      const mockUserResponse: MyRolesResponse = {
        success: true,
        data: {
          userTypes: [
            { _id: 'staff', displayAs: 'Staff Member' },
          ] as UserTypeObject[],
          defaultDashboard: 'staff' as const,
          canEscalateToAdmin: false,
          departmentMemberships: [
            {
              departmentId: 'dept1',
              departmentName: 'Computer Science',
              departmentSlug: 'cs',
              roles: ['instructor'],
              accessRights: ['dept:cs:course:create'],
              isPrimary: true,
              isActive: true,
              joinedAt: '2026-01-01T00:00:00Z',
            },
          ],
          allAccessRights: ['dept:cs:course:create'],
          lastSelectedDepartment: 'dept1',
          adminRoles: null,
        },
      };

      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(mockAccessToken);
      vi.mocked(authApi.getCurrentUser).mockResolvedValue(mockUserResponse);

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();

      // Verify session was restored
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.userTypes).toEqual(['staff']);

      // Verify display maps were built
      expect(state.roleHierarchy?.userTypeDisplayMap).toEqual({
        staff: 'Staff Member',
      });
      expect(state.roleHierarchy?.roleDisplayMap).toBeDefined();
    });

    it('should not initialize if no token found', async () => {
      vi.mocked(tokenStorage.getAccessToken).mockReturnValue(null);

      await useAuthStore.getState().initializeAuth();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(authApi.getCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('Logout', () => {
    it('should clear state on logout', async () => {
      // Set authenticated state
      useAuthStore.setState({
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        user: {
          _id: 'user123',
          email: 'test@example.com',
          userTypes: ['staff'],
          defaultDashboard: 'staff',
          isActive: true,
          createdAt: '2026-01-11',
          updatedAt: '2026-01-11',
        },
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff'],
          defaultDashboard: 'staff',
          globalRoles: [],
          allPermissions: [],
          userTypeDisplayMap: { staff: 'Staff' },
          roleDisplayMap: {},
        },
        isAuthenticated: true,
      });

      vi.mocked(authApi.logout).mockResolvedValue();

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBe(null);
      expect(state.user).toBe(null);
      expect(state.roleHierarchy).toBe(null);
      expect(tokenStorage.clearAllTokens).toHaveBeenCalled();
    });

    it('should clear state even if API call fails', async () => {
      useAuthStore.setState({
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isAuthenticated: true,
      });

      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.accessToken).toBe(null);
    });
  });

  describe('Permission Checking', () => {
    beforeEach(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff'],
          defaultDashboard: 'staff',
          globalRoles: [],
          staffRoles: {
            departmentRoles: [
              {
                departmentId: 'dept1',
                departmentName: 'CS',
                isPrimary: true,
                roles: [
                  {
                    role: 'instructor',
                    displayName: 'Instructor',
                    scopeType: 'department',
                    scopeId: 'dept1',
                    scopeName: 'CS',
                    permissions: ['dept:cs:course:create', 'dept:cs:course:edit'],
                  },
                ],
              },
            ],
          },
          allPermissions: ['dept:cs:course:create', 'dept:cs:course:edit'],
        },
      });
    });

    it('should check permission without scope', () => {
      const hasPermission = useAuthStore.getState().hasPermission('dept:cs:course:create');
      expect(hasPermission).toBe(true);
    });

    it('should check permission with department scope', () => {
      const hasPermission = useAuthStore.getState().hasPermission(
        'dept:cs:course:create',
        { type: 'department', id: 'dept1' }
      );
      expect(hasPermission).toBe(true);
    });

    it('should return false for missing permission', () => {
      const hasPermission = useAuthStore.getState().hasPermission('dept:cs:admin:all');
      expect(hasPermission).toBe(false);
    });

    it('should check any permission', () => {
      const hasAny = useAuthStore.getState().hasAnyPermission([
        'dept:cs:course:delete',
        'dept:cs:course:create',
      ]);
      expect(hasAny).toBe(true);
    });

    it('should check all permissions', () => {
      const hasAll = useAuthStore.getState().hasAllPermissions([
        'dept:cs:course:create',
        'dept:cs:course:edit',
      ]);
      expect(hasAll).toBe(true);
    });

    it('should handle wildcard permission', () => {
      useAuthStore.setState({
        isAuthenticated: true,
        roleHierarchy: {
          primaryUserType: 'global-admin',
          allUserTypes: ['global-admin'],
          defaultDashboard: 'admin',
          globalRoles: [],
          allPermissions: ['system:*'],
        },
      });

      const hasPermission = useAuthStore.getState().hasPermission('anything:anywhere:action');
      expect(hasPermission).toBe(true);
    });
  });

  describe('Role Checking', () => {
    beforeEach(() => {
      useAuthStore.setState({
        isAuthenticated: true,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff'],
          defaultDashboard: 'staff',
          globalRoles: [],
          staffRoles: {
            departmentRoles: [
              {
                departmentId: 'dept1',
                departmentName: 'CS',
                isPrimary: true,
                roles: [
                  {
                    role: 'instructor',
                    displayName: 'Instructor',
                    scopeType: 'department',
                    scopeId: 'dept1',
                    scopeName: 'CS',
                    permissions: [],
                  },
                ],
              },
            ],
          },
          allPermissions: [],
        },
      });
    });

    it('should check department role', () => {
      const hasRole = useAuthStore.getState().hasRole('instructor', 'dept1');
      expect(hasRole).toBe(true);
    });

    it('should return false for role in different department', () => {
      const hasRole = useAuthStore.getState().hasRole('instructor', 'dept2');
      expect(hasRole).toBe(false);
    });

    it('should return false for non-existent role', () => {
      const hasRole = useAuthStore.getState().hasRole('department-admin', 'dept1');
      expect(hasRole).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      useAuthStore.setState({ error: 'Some error' });

      useAuthStore.getState().clearError();

      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should handle invalid login response format', async () => {
      vi.mocked(authApi.login).mockResolvedValue({ success: false } as any);

      await expect(
        useAuthStore.getState().login({
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Invalid login response format');

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  describe('Display Maps', () => {
    it('should build display maps with multiple roles', async () => {
      const mockLoginResponse: LoginResponse = {
        success: true,
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            isActive: true,
            lastLogin: null,
            createdAt: '2026-01-11T00:00:00Z',
          },
          session: {
            accessToken: 'token123',
            refreshToken: 'refresh123',
            expiresIn: 3600,
            tokenType: 'Bearer',
          },
          userTypes: [
            { _id: 'staff', displayAs: 'Faculty' },
            { _id: 'learner', displayAs: 'Student' },
          ] as UserTypeObject[],
          defaultDashboard: 'staff' as const,
          canEscalateToAdmin: false,
          departmentMemberships: [
            {
              departmentId: 'dept1',
              departmentName: 'CS',
              departmentSlug: 'cs',
              roles: ['instructor', 'content-admin', 'course-taker'],
              accessRights: [],
              isPrimary: true,
              isActive: true,
              joinedAt: '2026-01-01T00:00:00Z',
            },
          ],
          allAccessRights: [],
          lastSelectedDepartment: 'dept1',
        },
      };

      vi.mocked(authApi.login).mockResolvedValue(mockLoginResponse);

      await useAuthStore.getState().login({
        email: 'test@example.com',
        password: 'password',
      });

      const state = useAuthStore.getState();

      // Verify user type display map
      expect(state.roleHierarchy?.userTypeDisplayMap).toEqual({
        staff: 'Faculty',
        learner: 'Student',
      });

      // Verify role display map has all roles
      expect(state.roleHierarchy?.roleDisplayMap).toBeDefined();
      expect(Object.keys(state.roleHierarchy?.roleDisplayMap || {}).length).toBeGreaterThan(0);
    });
  });
});
