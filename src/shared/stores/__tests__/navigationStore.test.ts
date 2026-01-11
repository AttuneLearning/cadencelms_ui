/**
 * Navigation Store Tests
 * Version: 2.1.0 (Contract Alignment - Track B)
 * Date: 2026-01-11
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  useNavigationStore,
  getLastAccessedDepartment,
  isDepartmentSelected,
  getCurrentDepartmentId,
} from '../navigationStore';
import { authApi } from '@/entities/auth/api/authApi';

// Mock the authApi
vi.mock('@/entities/auth/api/authApi', () => ({
  authApi: {
    switchDepartment: vi.fn(),
  },
}));

describe('NavigationStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useNavigationStore.getState();
    store.clearDepartmentSelection();
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

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useNavigationStore.getState();

      expect(state.selectedDepartmentId).toBeNull();
      expect(state.lastAccessedDepartments).toEqual({});
      expect(state.isSidebarOpen).toBe(false);
      expect(state.currentDepartmentRoles).toEqual([]);
      expect(state.currentDepartmentAccessRights).toEqual([]);
      expect(state.currentDepartmentName).toBeNull();
      expect(state.isSwitchingDepartment).toBe(false);
      expect(state.switchDepartmentError).toBeNull();
    });
  });

  describe('setSelectedDepartment', () => {
    it('should set department ID', () => {
      const store = useNavigationStore.getState();
      store.setSelectedDepartment('dept-123');

      const state = useNavigationStore.getState();
      expect(state.selectedDepartmentId).toBe('dept-123');
    });

    it('should clear department ID when set to null', () => {
      const store = useNavigationStore.getState();
      store.setSelectedDepartment('dept-123');
      store.setSelectedDepartment(null);

      const state = useNavigationStore.getState();
      expect(state.selectedDepartmentId).toBeNull();
    });
  });

  describe('rememberDepartment', () => {
    it('should remember department for user', () => {
      const store = useNavigationStore.getState();
      store.rememberDepartment('user-123', 'dept-456');

      const state = useNavigationStore.getState();
      expect(state.lastAccessedDepartments['user-123']).toBe('dept-456');
    });

    it('should update remembered department for same user', () => {
      const store = useNavigationStore.getState();
      store.rememberDepartment('user-123', 'dept-456');
      store.rememberDepartment('user-123', 'dept-789');

      const state = useNavigationStore.getState();
      expect(state.lastAccessedDepartments['user-123']).toBe('dept-789');
    });

    it('should remember departments for multiple users', () => {
      const store = useNavigationStore.getState();
      store.rememberDepartment('user-1', 'dept-1');
      store.rememberDepartment('user-2', 'dept-2');

      const state = useNavigationStore.getState();
      expect(state.lastAccessedDepartments['user-1']).toBe('dept-1');
      expect(state.lastAccessedDepartments['user-2']).toBe('dept-2');
    });
  });

  describe('clearDepartmentSelection', () => {
    it('should clear department selection', () => {
      const store = useNavigationStore.getState();
      store.setSelectedDepartment('dept-123');
      store.clearDepartmentSelection();

      const state = useNavigationStore.getState();
      expect(state.selectedDepartmentId).toBeNull();
    });

    it('should clear all department-related state', () => {
      // Set up some state
      useNavigationStore.setState({
        selectedDepartmentId: 'dept-123',
        currentDepartmentRoles: ['instructor', 'content-admin'],
        currentDepartmentAccessRights: ['content:courses:read', 'content:courses:manage'],
        currentDepartmentName: 'Test Department',
        switchDepartmentError: 'Some error',
      });

      const store = useNavigationStore.getState();
      store.clearDepartmentSelection();

      const state = useNavigationStore.getState();
      expect(state.selectedDepartmentId).toBeNull();
      expect(state.currentDepartmentRoles).toEqual([]);
      expect(state.currentDepartmentAccessRights).toEqual([]);
      expect(state.currentDepartmentName).toBeNull();
      expect(state.switchDepartmentError).toBeNull();
    });
  });

  describe('sidebar state', () => {
    it('should toggle sidebar', () => {
      const store = useNavigationStore.getState();

      expect(store.isSidebarOpen).toBe(false);

      store.toggleSidebar();
      expect(useNavigationStore.getState().isSidebarOpen).toBe(true);

      store.toggleSidebar();
      expect(useNavigationStore.getState().isSidebarOpen).toBe(false);
    });

    it('should set sidebar open state explicitly', () => {
      const store = useNavigationStore.getState();

      store.setSidebarOpen(true);
      expect(useNavigationStore.getState().isSidebarOpen).toBe(true);

      store.setSidebarOpen(false);
      expect(useNavigationStore.getState().isSidebarOpen).toBe(false);
    });
  });

  describe('switchDepartment', () => {
    it('should successfully switch departments', async () => {
      // Mock API response
      const mockResponse = {
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-123',
            departmentName: 'Psychology Department',
            departmentSlug: 'psychology',
            roles: ['instructor', 'content-admin'],
            accessRights: ['content:courses:read', 'content:courses:manage', 'grades:own-classes:manage'],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      };

      vi.mocked(authApi.switchDepartment).mockResolvedValue(mockResponse);

      const store = useNavigationStore.getState();
      await store.switchDepartment('dept-123');

      const state = useNavigationStore.getState();

      // Verify API was called
      expect(authApi.switchDepartment).toHaveBeenCalledWith({ departmentId: 'dept-123' });

      // Verify state was updated
      expect(state.selectedDepartmentId).toBe('dept-123');
      expect(state.currentDepartmentRoles).toEqual(['instructor', 'content-admin']);
      expect(state.currentDepartmentAccessRights).toEqual([
        'content:courses:read',
        'content:courses:manage',
        'grades:own-classes:manage',
      ]);
      expect(state.currentDepartmentName).toBe('Psychology Department');
      expect(state.isSwitchingDepartment).toBe(false);
      expect(state.switchDepartmentError).toBeNull();
    });

    it('should set loading state during switch', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(authApi.switchDepartment).mockReturnValue(promise as any);

      const store = useNavigationStore.getState();
      const switchPromise = store.switchDepartment('dept-123');

      // Check loading state immediately
      const loadingState = useNavigationStore.getState();
      expect(loadingState.isSwitchingDepartment).toBe(true);
      expect(loadingState.switchDepartmentError).toBeNull();

      // Resolve the promise
      resolvePromise!({
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-123',
            departmentName: 'Test Dept',
            departmentSlug: 'test',
            roles: [],
            accessRights: [],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      });

      await switchPromise;

      // Check loading state after completion
      const finalState = useNavigationStore.getState();
      expect(finalState.isSwitchingDepartment).toBe(false);
    });

    it('should handle API errors', async () => {
      const mockError = new Error('Department not found');
      vi.mocked(authApi.switchDepartment).mockRejectedValue(mockError);

      const store = useNavigationStore.getState();

      await expect(store.switchDepartment('invalid-dept')).rejects.toThrow('Department not found');

      const state = useNavigationStore.getState();
      expect(state.isSwitchingDepartment).toBe(false);
      expect(state.switchDepartmentError).toBe('Department not found');
      expect(state.selectedDepartmentId).toBeNull(); // Should not update on error
    });

    it('should clear previous error on new switch attempt', async () => {
      // First attempt fails
      vi.mocked(authApi.switchDepartment).mockRejectedValueOnce(new Error('First error'));
      const store = useNavigationStore.getState();

      try {
        await store.switchDepartment('dept-1');
      } catch (error) {
        // Expected to fail
      }

      expect(useNavigationStore.getState().switchDepartmentError).toBe('First error');

      // Second attempt succeeds
      vi.mocked(authApi.switchDepartment).mockResolvedValueOnce({
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-2',
            departmentName: 'Test Dept',
            departmentSlug: 'test',
            roles: ['instructor'],
            accessRights: ['content:courses:read'],
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      });

      await store.switchDepartment('dept-2');

      const state = useNavigationStore.getState();
      expect(state.switchDepartmentError).toBeNull();
      expect(state.selectedDepartmentId).toBe('dept-2');
    });

    it('should cache roles and access rights from API response', async () => {
      const mockRoles = ['instructor', 'content-admin', 'department-admin'];
      const mockAccessRights = [
        'content:courses:read',
        'content:courses:manage',
        'content:lessons:manage',
        'grades:own-classes:manage',
        'staff:department:manage',
      ];

      vi.mocked(authApi.switchDepartment).mockResolvedValue({
        success: true,
        data: {
          currentDepartment: {
            departmentId: 'dept-456',
            departmentName: 'Business Studies',
            departmentSlug: 'business',
            roles: mockRoles,
            accessRights: mockAccessRights,
          },
          childDepartments: [],
          isDirectMember: true,
          inheritedFrom: null,
        },
      });

      const store = useNavigationStore.getState();
      await store.switchDepartment('dept-456');

      const state = useNavigationStore.getState();
      expect(state.currentDepartmentRoles).toEqual(mockRoles);
      expect(state.currentDepartmentAccessRights).toEqual(mockAccessRights);
      expect(state.currentDepartmentName).toBe('Business Studies');
    });
  });

  describe('utility functions', () => {
    it('getLastAccessedDepartment should return department for user', () => {
      const store = useNavigationStore.getState();
      store.rememberDepartment('user-123', 'dept-456');

      const deptId = getLastAccessedDepartment('user-123');

      expect(deptId).toBe('dept-456');
    });

    it('getLastAccessedDepartment should return null for unknown user', () => {
      const deptId = getLastAccessedDepartment('unknown-user');

      expect(deptId).toBeNull();
    });

    it('isDepartmentSelected should return false initially', () => {
      expect(isDepartmentSelected()).toBe(false);
    });

    it('isDepartmentSelected should return true when department is selected', () => {
      const store = useNavigationStore.getState();
      store.setSelectedDepartment('dept-123');

      expect(isDepartmentSelected()).toBe(true);
    });

    it('getCurrentDepartmentId should return current department', () => {
      const store = useNavigationStore.getState();
      store.setSelectedDepartment('dept-789');

      expect(getCurrentDepartmentId()).toBe('dept-789');
    });

    it('getCurrentDepartmentId should return null when no department selected', () => {
      expect(getCurrentDepartmentId()).toBeNull();
    });
  });

  describe('integration with auth logout', () => {
    it('should be callable from external stores', () => {
      // Simulate what authStore does on logout
      const store = useNavigationStore.getState();

      // Set up some state
      store.setSelectedDepartment('dept-123');
      useNavigationStore.setState({
        currentDepartmentRoles: ['instructor'],
        currentDepartmentAccessRights: ['content:courses:read'],
        currentDepartmentName: 'Test Dept',
      });

      // Call clearDepartmentSelection as authStore does
      useNavigationStore.getState().clearDepartmentSelection();

      // Verify all state cleared
      const state = useNavigationStore.getState();
      expect(state.selectedDepartmentId).toBeNull();
      expect(state.currentDepartmentRoles).toEqual([]);
      expect(state.currentDepartmentAccessRights).toEqual([]);
      expect(state.currentDepartmentName).toBeNull();
    });
  });
});
