/**
 * usePersonData Hook Tests - Phase 2
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Tests for usePersonData hook that extracts person data from auth store
 * Following TDD approach - tests written FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePersonData } from '../usePersonData';
import { useAuthStore } from '../../model/authStore';
import { mockPersonWithAllFields, mockPersonMinimal } from '@/test/fixtures/person.fixtures';
import type { User } from '@/shared/types/auth';

describe('usePersonData Hook', () => {
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

  describe('Basic Functionality', () => {
    it('should return null when user is not authenticated', () => {
      const { result } = renderHook(() => usePersonData());

      expect(result.current).toBeNull();
    });

    it('should return null when user has no person data', () => {
      const user: User = {
        _id: 'user123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => usePersonData());

      expect(result.current).toBeNull();
    });

    it('should return person data when available', () => {
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

      const { result } = renderHook(() => usePersonData());

      expect(result.current).toBeDefined();
      expect(result.current?.firstName).toBe('Jane');
      expect(result.current?.lastName).toBe('Smith');
      expect(result.current?.preferredFirstName).toBe('Janey');
    });

    it('should return minimal person data correctly', () => {
      const user: User = {
        _id: 'user456',
        email: 'john.doe@test.com',
        person: mockPersonMinimal,
        userTypes: ['staff'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => usePersonData());

      expect(result.current).toBeDefined();
      expect(result.current?.firstName).toBe('John');
      expect(result.current?.lastName).toBe('Doe');
      expect(result.current?.preferredFirstName).toBeNull();
      expect(result.current?.phones).toEqual([]);
    });
  });

  describe('Reactivity', () => {
    it('should update when user changes', () => {
      const { result, rerender } = renderHook(() => usePersonData());

      expect(result.current).toBeNull();

      // Update store with user
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
      rerender();

      expect(result.current).toBeDefined();
      expect(result.current?.firstName).toBe('Jane');
    });

    it('should return null after logout', () => {
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

      const { result, rerender } = renderHook(() => usePersonData());

      expect(result.current).toBeDefined();

      // Logout
      useAuthStore.setState({ user: null, isAuthenticated: false });
      rerender();

      expect(result.current).toBeNull();
    });
  });

  describe('Memoization', () => {
    it('should return same reference when person data has not changed', () => {
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

      const { result, rerender } = renderHook(() => usePersonData());

      const firstResult = result.current;

      // Update unrelated state
      useAuthStore.setState({ isLoading: true });
      rerender();

      const secondResult = result.current;

      // Should be same reference (memoized)
      expect(firstResult).toBe(secondResult);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user gracefully', () => {
      useAuthStore.setState({ user: undefined as any });

      const { result } = renderHook(() => usePersonData());

      expect(result.current).toBeNull();
    });

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

      const { result } = renderHook(() => usePersonData());

      expect(result.current).toBeNull();
    });
  });
});
