/**
 * Sidebar - Cross-UserType Link Tests (ISS-003)
 * Tests for graying out/enabling links based on user's available userTypes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import * as authStore from '@/features/auth/model/authStore';
import * as navigationStore from '@/shared/stores/navigationStore';
import * as departmentContext from '@/shared/hooks/useDepartmentContext';

// Mock the stores and hooks
vi.mock('@/features/auth/model/authStore');
vi.mock('@/shared/stores/navigationStore');
vi.mock('@/shared/hooks/useDepartmentContext');

describe('Sidebar - Cross-UserType Links (ISS-003)', () => {
  const mockSetSelectedDepartment = vi.fn();
  const mockRememberDepartment = vi.fn();
  const mockSetSidebarOpen = vi.fn();

  const mockUser = {
    _id: 'user-123',
    email: 'admin@lms.edu',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
      selectedDepartmentId: null,
      setSelectedDepartment: mockSetSelectedDepartment,
      rememberDepartment: mockRememberDepartment,
      lastAccessedDepartments: {},
      isSidebarOpen: true,
      setSidebarOpen: mockSetSidebarOpen,
    } as any);

    vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
      currentDepartmentId: null,
      currentDepartmentRoles: [],
      currentDepartmentAccessRights: [],
      currentDepartmentName: null,
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
      hasRole: vi.fn(() => false),
      switchDepartment: vi.fn(),
      isSwitching: false,
      switchError: null,
    });
  });

  describe('My Progress Link - Staff Dashboard', () => {
    it('should show "My Progress" link grayed out when user does NOT have learner userType', () => {
      // Staff-only user (no learner userType)
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff'], // No learner
          allPermissions: ['dashboard:view-own'],
          userTypeDisplayMap: {
            staff: 'Staff',
          },
          staffRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-123',
                departmentName: 'Engineering',
                isPrimary: true,
                roles: ['instructor'],
              },
            ],
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // Link should be present
      const progressLink = screen.getByText('My Progress');
      expect(progressLink).toBeInTheDocument();

      // Link should be disabled (not a link, or has disabled styling)
      const linkElement = progressLink.closest('div') || progressLink.closest('button');
      expect(linkElement).toHaveClass('opacity-50');
      expect(linkElement).toHaveClass('cursor-not-allowed');

      // Should not be clickable
      expect(linkElement?.tagName).not.toBe('A');
    });

    it('should show "My Progress" link enabled when user HAS learner userType', () => {
      // Multi-userType user (staff + learner)
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff', 'learner'], // Has learner
          allPermissions: ['dashboard:view-own', 'dashboard:view-my-progress'],
          userTypeDisplayMap: {
            staff: 'Staff',
            learner: 'Learner',
          },
          staffRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-123',
                departmentName: 'Engineering',
                isPrimary: true,
                roles: ['instructor'],
              },
            ],
          },
          learnerRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-456',
                departmentName: 'Math',
                isPrimary: false,
                roles: ['student'],
              },
            ],
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // Link should be present and enabled
      const progressLink = screen.getByText('My Progress');
      expect(progressLink).toBeInTheDocument();

      // Should be an actual link
      const linkElement = progressLink.closest('a');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', '/learner/progress');

      // Should NOT have disabled styling
      expect(linkElement).not.toHaveClass('opacity-50');
      expect(linkElement).not.toHaveClass('cursor-not-allowed');
    });
  });

  describe('My Progress Link - Admin Dashboard', () => {
    it('should show "My Progress" link grayed out when admin does NOT have learner userType', () => {
      // Admin-only user (no learner userType)
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'global-admin',
          allUserTypes: ['global-admin'], // No learner
          allPermissions: ['system:*'],
          userTypeDisplayMap: {
            'global-admin': 'Global Admin',
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // Link should be present but disabled
      const progressLink = screen.getByText('My Progress');
      expect(progressLink).toBeInTheDocument();

      const linkElement = progressLink.closest('div') || progressLink.closest('button');
      expect(linkElement).toHaveClass('opacity-50');
      expect(linkElement).toHaveClass('cursor-not-allowed');
    });

    it('should show "My Progress" link enabled when admin HAS learner userType', () => {
      // Multi-userType user (admin + learner)
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'global-admin',
          allUserTypes: ['global-admin', 'learner'], // Has learner
          allPermissions: ['system:*', 'dashboard:view-my-progress'],
          userTypeDisplayMap: {
            'global-admin': 'Global Admin',
            learner: 'Learner',
          },
          learnerRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-789',
                departmentName: 'Science',
                isPrimary: false,
                roles: ['student'],
              },
            ],
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // Link should be enabled
      const progressLink = screen.getByText('My Progress');
      expect(progressLink).toBeInTheDocument();

      const linkElement = progressLink.closest('a');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', '/learner/progress');
    });
  });

  describe('My Progress Link - Learner Dashboard', () => {
    it('should show "My Progress" link enabled on learner dashboard', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'learner',
          allUserTypes: ['learner'],
          allPermissions: ['dashboard:view-my-progress'],
          userTypeDisplayMap: {
            learner: 'Learner',
          },
          learnerRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-789',
                departmentName: 'Science',
                isPrimary: true,
                roles: ['student'],
              },
            ],
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const progressLink = screen.getByText('My Progress');
      expect(progressLink).toBeInTheDocument();

      const linkElement = progressLink.closest('a');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', '/learner/progress');
    });
  });

  describe('Permission Checking', () => {
    it('should gray out "My Progress" even if user has learner userType but lacks permission', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff', 'learner'],
          allPermissions: ['dashboard:view-own'], // Missing dashboard:view-my-progress
          userTypeDisplayMap: {
            staff: 'Staff',
            learner: 'Learner',
          },
          staffRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-123',
                departmentName: 'Engineering',
                isPrimary: true,
                roles: ['instructor'],
              },
            ],
          },
          learnerRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-456',
                departmentName: 'Math',
                isPrimary: false,
                roles: ['student'],
              },
            ],
          },
        },
        hasPermission: vi.fn((perm) => perm !== 'dashboard:view-my-progress'),
      } as any);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const progressLink = screen.getByText('My Progress');
      expect(progressLink).toBeInTheDocument();

      // Should be disabled due to missing permission
      const linkElement = progressLink.closest('div') || progressLink.closest('button');
      expect(linkElement).toHaveClass('opacity-50');
      expect(linkElement).toHaveClass('cursor-not-allowed');
    });
  });
});
