/**
 * useDisplayName Hook Tests - Phase 2
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Tests for useDisplayName hook that gets formatted display name
 * Following TDD approach - tests written FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDisplayName } from '../useDisplayName';
import { useAuthStore } from '../../model/authStore';
import { mockPersonWithAllFields, mockPersonMinimal } from '@/test/fixtures/person.fixtures';
import type { User } from '@/shared/types/auth';
import type { IPerson } from '@/shared/types/person';

describe('useDisplayName Hook', () => {
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
    it('should return empty string when user is not authenticated', () => {
      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('');
    });

    it('should return display name from person data when available', () => {
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

      const { result } = renderHook(() => useDisplayName());

      // Should use preferred name if available
      expect(result.current).toBe('Janey Smith');
    });

    it('should use legal name when preferred name is not set', () => {
      const personWithoutPreferred: IPerson = {
        ...mockPersonMinimal,
        firstName: 'John',
        lastName: 'Doe',
        preferredFirstName: null,
        preferredLastName: null,
      };

      const user: User = {
        _id: 'user456',
        email: 'john.doe@test.com',
        person: personWithoutPreferred,
        userTypes: ['staff'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('John Doe');
    });

    it('should fallback to deprecated firstName/lastName when person data is not available', () => {
      const user: User = {
        _id: 'user789',
        email: 'old.user@test.com',
        firstName: 'Old',
        lastName: 'User',
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Old User');
    });

    it('should return empty string when no name data is available', () => {
      const user: User = {
        _id: 'user999',
        email: 'no.name@test.com',
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('');
    });
  });

  describe('Preferred Name Priority', () => {
    it('should use preferred first name and legal last name', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'Jonathan',
        lastName: 'Smith',
        preferredFirstName: 'Jon',
        preferredLastName: null,
      };

      const user: User = {
        _id: 'user111',
        email: 'jon.smith@test.com',
        person,
        userTypes: ['staff'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Jon Smith');
    });

    it('should use legal first name and preferred last name', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'Jane',
        lastName: 'Johnson',
        preferredFirstName: null,
        preferredLastName: 'Smith-Johnson',
      };

      const user: User = {
        _id: 'user222',
        email: 'jane.sj@test.com',
        person,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Jane Smith-Johnson');
    });

    it('should use both preferred names when available', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'Alexander',
        lastName: 'Johnson',
        preferredFirstName: 'Alex',
        preferredLastName: 'Smith',
      };

      const user: User = {
        _id: 'user333',
        email: 'alex.smith@test.com',
        person,
        userTypes: ['staff'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Alex Smith');
    });
  });

  describe('Reactivity', () => {
    it('should update when user changes', () => {
      const { result, rerender } = renderHook(() => useDisplayName());

      expect(result.current).toBe('');

      // Update with user
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

      expect(result.current).toBe('Janey Smith');
    });

    it('should return empty string after logout', () => {
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

      const { result, rerender } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Janey Smith');

      // Logout
      useAuthStore.setState({ user: null, isAuthenticated: false });
      rerender();

      expect(result.current).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace-only names', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: '   ',
        lastName: '   ',
        preferredFirstName: null,
        preferredLastName: null,
      };

      const user: User = {
        _id: 'user444',
        email: 'whitespace@test.com',
        person,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('');
    });

    it('should handle only first name available', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: 'Madonna',
        lastName: '',
        preferredFirstName: null,
        preferredLastName: null,
      };

      const user: User = {
        _id: 'user555',
        email: 'madonna@test.com',
        person,
        userTypes: ['staff'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Madonna');
    });

    it('should handle only last name available', () => {
      const person: IPerson = {
        ...mockPersonMinimal,
        firstName: '',
        lastName: 'Cher',
        preferredFirstName: null,
        preferredLastName: null,
      };

      const user: User = {
        _id: 'user666',
        email: 'cher@test.com',
        person,
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      };

      useAuthStore.setState({ user, isAuthenticated: true });

      const { result } = renderHook(() => useDisplayName());

      expect(result.current).toBe('Cher');
    });
  });

  describe('Memoization', () => {
    it('should return same value when user has not changed', () => {
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

      const { result, rerender } = renderHook(() => useDisplayName());

      const firstResult = result.current;

      // Update unrelated state
      useAuthStore.setState({ isLoading: true });
      rerender();

      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
    });
  });
});
