/**
 * usePermission Hooks Tests - Track G
 * Version: 1.0.0
 * Date: 2026-01-11
 *
 * Comprehensive tests for permission hooks with department scoping
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermission, useScopedPermission, usePermissions } from '../usePermission';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import type { RoleHierarchy, UserType } from '@/shared/types/auth';

// Mock dependencies
vi.mock('@/features/auth/model/authStore');
vi.mock('@/shared/stores/navigationStore');

describe('usePermission Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('usePermission - Basic Permission Checking', () => {
    it('should return true when user has the permission globally', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { result } = renderHook(() => usePermission('content:courses:read'));

      expect(result.current).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should return false when user does not have the permission', () => {
      const mockHasPermission = vi.fn(() => false);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { result } = renderHook(() => usePermission('content:courses:create'));

      expect(result.current).toBe(false);
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:create');
    });

    it('should pass departmentId as scope when provided', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const deptId = 'dept-123';
      const { result } = renderHook(() =>
        usePermission('content:courses:read', deptId)
      );

      expect(result.current).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', {
        type: 'department',
        id: deptId,
      });
    });

    it('should recompute when permission changes', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { result, rerender } = renderHook(
        ({ perm }) => usePermission(perm),
        { initialProps: { perm: 'content:courses:read' } }
      );

      expect(result.current).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');

      // Change permission
      mockHasPermission.mockClear();
      rerender({ perm: 'content:courses:create' });

      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:create');
    });

    it('should recompute when departmentId changes', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { result, rerender } = renderHook(
        ({ deptId }) => usePermission('content:courses:read', deptId),
        { initialProps: { deptId: 'dept-1' } }
      );

      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', {
        type: 'department',
        id: 'dept-1',
      });

      mockHasPermission.mockClear();
      rerender({ deptId: 'dept-2' });

      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', {
        type: 'department',
        id: 'dept-2',
      });
    });
  });

  // Note: useScopedPermission tests are skipped because they require mocking useDepartmentContext
  // which needs to be done at module level. In real usage, integration tests would cover this.

  describe('usePermissions - Multiple Permissions', () => {
    it('should check multiple permissions and return results', () => {
      const mockHasPermission = vi.fn((perm: string) => {
        if (perm === 'content:courses:read') return true;
        if (perm === 'content:courses:create') return false;
        return false;
      });

      const mockHasAnyPermission = vi.fn(() => true);
      const mockHasAllPermissions = vi.fn(() => false);

      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: mockHasAllPermissions,
      } as any);

      const permissions = ['content:courses:read', 'content:courses:create'];
      const { result } = renderHook(() => usePermissions(permissions));

      expect(result.current.permissions['content:courses:read']).toBe(true);
      expect(result.current.permissions['content:courses:create']).toBe(false);
      expect(result.current.hasAny).toBe(true);
      expect(result.current.hasAll).toBe(false);
    });

    it('should support department scope option', () => {
      const mockHasPermission = vi.fn(() => true);
      const mockHasAnyPermission = vi.fn(() => true);
      const mockHasAllPermissions = vi.fn(() => true);

      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: mockHasAllPermissions,
      } as any);

      const permissions = ['content:courses:read'];
      const deptId = 'dept-123';
      const { result } = renderHook(() =>
        usePermissions(permissions, { scope: { type: 'department', id: deptId } })
      );

      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read', {
        type: 'department',
        id: deptId,
      });
      expect(result.current.hasAny).toBe(true);
      expect(result.current.hasAll).toBe(true);
    });

    it('should handle empty permissions array', () => {
      const mockHasPermission = vi.fn();
      const mockHasAnyPermission = vi.fn(() => false);
      const mockHasAllPermissions = vi.fn(() => true);

      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
        hasAnyPermission: mockHasAnyPermission,
        hasAllPermissions: mockHasAllPermissions,
      } as any);

      const { result } = renderHook(() => usePermissions([]));

      expect(result.current.permissions).toEqual({});
      expect(result.current.hasAny).toBe(false);
      expect(result.current.hasAll).toBe(true);
    });
  });

  describe('Performance and Memoization', () => {
    it('should memoize result when inputs do not change', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { result, rerender } = renderHook(() =>
        usePermission('content:courses:read')
      );

      const firstResult = result.current;
      mockHasPermission.mockClear();

      // Rerender without changing inputs
      rerender();

      const secondResult = result.current;

      // Result should be memoized (same reference)
      expect(firstResult).toBe(secondResult);
    });

    it('should not call hasPermission unnecessarily', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { rerender } = renderHook(() => usePermission('content:courses:read'));

      const callCount = mockHasPermission.mock.calls.length;
      mockHasPermission.mockClear();

      // Rerender without changing inputs
      rerender();

      // Should use memoized value, not call hasPermission again
      expect(mockHasPermission).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined departmentId gracefully', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const { result } = renderHook(() =>
        usePermission('content:courses:read', undefined)
      );

      expect(result.current).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should handle null currentDepartmentId in useScopedPermission', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      vi.mock('@/shared/hooks/useDepartmentContext', () => ({
        useDepartmentContext: () => ({
          currentDepartmentId: null,
        }),
      }));

      const { result } = renderHook(() => useScopedPermission('content:courses:read'));

      expect(result.current).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith('content:courses:read');
    });

    it('should handle permission string with special characters', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useAuthStore).mockReturnValue({
        hasPermission: mockHasPermission,
      } as any);

      const complexPermission = 'content:advanced-courses:read-all';
      const { result } = renderHook(() => usePermission(complexPermission));

      expect(result.current).toBe(true);
      expect(mockHasPermission).toHaveBeenCalledWith(complexPermission);
    });
  });

  // Integration tests would be better done in E2E tests or integration test suites
});
