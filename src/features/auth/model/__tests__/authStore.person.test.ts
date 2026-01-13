/**
 * Auth Store Person Data Tests - Phase 2
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Tests for Person v2.0 data integration in authStore
 * Testing state management of person data
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import type { User, RoleHierarchy, AccessToken } from '@/shared/types/auth';
import { mockPersonWithAllFields, mockPersonMinimal } from '@/test/fixtures/person.fixtures';

describe('AuthStore - Person Data Integration (Phase 2)', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isAdminSessionActive: false,
      adminSessionExpiry: null,
    });
  });

  describe('User State with Person Data', () => {
    it('should store person data in user state', () => {
      const user: User = {
        _id: 'user123',
        email: 'jane.smith@university.edu',
        person: mockPersonWithAllFields,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { user: storedUser } = useAuthStore.getState();

      expect(storedUser).toBeDefined();
      expect(storedUser?.person).toBeDefined();
      expect(storedUser?.person?.firstName).toBe('Jane');
      expect(storedUser?.person?.lastName).toBe('Smith');
      expect(storedUser?.person?.preferredFirstName).toBe('Janey');
      expect(storedUser?.person?.emails).toHaveLength(2);
      expect(storedUser?.person?.phones).toHaveLength(2);
    });

    it('should support user without person data (backward compatibility)', () => {
      const user: User = {
        _id: 'user123',
        email: 'john.doe@university.edu',
        firstName: 'John',
        lastName: 'Doe',
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { user: storedUser } = useAuthStore.getState();

      expect(storedUser).toBeDefined();
      expect(storedUser?.firstName).toBe('John');
      expect(storedUser?.lastName).toBe('Doe');
      expect(storedUser?.person).toBeUndefined();
    });

    it('should handle minimal person data correctly', () => {
      const user: User = {
        _id: 'user456',
        email: 'minimal@test.com',
        person: mockPersonMinimal,
        userTypes: ['staff'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { user: storedUser } = useAuthStore.getState();

      expect(storedUser?.person).toBeDefined();
      expect(storedUser?.person?.firstName).toBe('John');
      expect(storedUser?.person?.lastName).toBe('Doe');
      expect(storedUser?.person?.preferredFirstName).toBeNull();
      expect(storedUser?.person?.phones).toEqual([]);
    });

    it('should support both deprecated and new fields during migration', () => {
      const user: User = {
        _id: 'user789',
        email: 'test@university.edu',
        firstName: 'TestFirst',
        lastName: 'TestLast',
        person: mockPersonWithAllFields,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { user: storedUser } = useAuthStore.getState();

      // Both old and new fields should be present
      expect(storedUser?.firstName).toBe('TestFirst');
      expect(storedUser?.lastName).toBe('TestLast');
      expect(storedUser?.person?.firstName).toBe('Jane');
      expect(storedUser?.person?.lastName).toBe('Smith');
    });
  });

  describe('Person Data with Role Hierarchy', () => {
    it('should maintain person data alongside role hierarchy', () => {
      const user: User = {
        _id: 'user123',
        email: 'jane.smith@university.edu',
        person: mockPersonWithAllFields,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'learner',
        allUserTypes: ['learner'],
        defaultDashboard: 'learner',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      useAuthStore.setState({
        user,
        roleHierarchy,
        isAuthenticated: true,
      });

      const state = useAuthStore.getState();

      expect(state.user?.person).toBeDefined();
      expect(state.roleHierarchy).toBeDefined();
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('Person Data with Access Token', () => {
    it('should maintain person data alongside access token', () => {
      const user: User = {
        _id: 'user123',
        email: 'jane.smith@university.edu',
        person: mockPersonWithAllFields,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const accessToken: AccessToken = {
        value: 'token123',
        type: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };

      useAuthStore.setState({
        user,
        accessToken,
        isAuthenticated: true,
      });

      const state = useAuthStore.getState();

      expect(state.user?.person).toBeDefined();
      expect(state.accessToken?.value).toBe('token123');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('Person Data Cleanup', () => {
    it('should clear person data when user is set to null', () => {
      // Set initial state with person data
      const user: User = {
        _id: 'user123',
        email: 'jane.smith@university.edu',
        person: mockPersonWithAllFields,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      expect(useAuthStore.getState().user?.person).toBeDefined();

      // Clear user
      useAuthStore.setState({ user: null, isAuthenticated: false });

      const { user: clearedUser } = useAuthStore.getState();

      expect(clearedUser).toBeNull();
    });

    it('should handle state reset with all fields', () => {
      // Set full authenticated state with person data
      const user: User = {
        _id: 'user123',
        email: 'jane.smith@university.edu',
        person: mockPersonWithAllFields,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      const roleHierarchy: RoleHierarchy = {
        primaryUserType: 'learner',
        allUserTypes: ['learner'],
        defaultDashboard: 'learner',
        globalRoles: [],
        allPermissions: ['content:courses:read'],
      };

      const accessToken: AccessToken = {
        value: 'token123',
        type: 'Bearer',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      };

      useAuthStore.setState({
        user,
        roleHierarchy,
        accessToken,
        isAuthenticated: true,
      });

      // Full reset (simulating logout)
      useAuthStore.setState({
        accessToken: null,
        user: null,
        roleHierarchy: null,
        isAuthenticated: false,
      });

      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.roleHierarchy).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null person field', () => {
      const user: User = {
        _id: 'user123',
        email: 'test@example.com',
        person: null as any,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { user: storedUser } = useAuthStore.getState();

      expect(storedUser?.person).toBeNull();
    });

    it('should handle undefined person field', () => {
      const user: User = {
        _id: 'user123',
        email: 'test@example.com',
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { user: storedUser } = useAuthStore.getState();

      expect(storedUser?.person).toBeUndefined();
    });
  });
});
