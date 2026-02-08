/**
 * Sidebar - Cross-UserType Navigation Tests
 * Navigation Redesign 2026-02-05
 *
 * In the new architecture:
 * - Each dashboard type (staff, learner, admin) has its own sections
 * - No disabled items for wrong user types - items only appear on their relevant dashboard
 * - Dashboard detection is based on URL path
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import * as authStore from '@/features/auth/model/authStore';
import * as navigationStore from '@/shared/stores/navigationStore';
import * as departmentContext from '@/shared/hooks/useDepartmentContext';

// Mock the stores and hooks
vi.mock('@/features/auth/model/authStore');
vi.mock('@/shared/stores/navigationStore');
vi.mock('@/shared/hooks/useDepartmentContext');
vi.mock('@/entities/message', () => ({
  useUnreadCount: () => ({ data: null }),
}));
vi.mock('../ui/NavLink', () => ({
  NavLink: ({ label, path, disabled }: any) => (
    <a
      href={path}
      data-testid={`nav-link-${label}`}
      aria-disabled={disabled}
      className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
    >
      {label}
    </a>
  ),
}));

describe('Sidebar - Dashboard-Specific Navigation', () => {
  const mockSetSelectedDepartment = vi.fn();
  const mockRememberDepartment = vi.fn();
  const mockSetSidebarOpen = vi.fn();

  const mockUser = {
    _id: 'user-123',
    email: 'admin@lms.edu',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
      selectedDepartmentId: null,
      setSelectedDepartment: mockSetSelectedDepartment,
      rememberDepartment: mockRememberDepartment,
      lastAccessedDepartments: {},
      isSidebarOpen: true,
      setSidebarOpen: mockSetSidebarOpen,
      isBreadcrumbMode: false,
      navigateToDepartment: vi.fn(),
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

  const renderSidebar = (route: string) =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <Sidebar />
      </MemoryRouter>
    );

  describe('Staff Dashboard Navigation', () => {
    it('should show Teaching section items on staff dashboard', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allPermissions: ['content:courses:read', 'class:view-own', 'grades:own-classes:manage'],
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

      renderSidebar('/staff/dashboard');

      // Staff-specific items
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Classes')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Grading')).toBeInTheDocument();

      // Should NOT show learner-specific items
      expect(screen.queryByTestId('nav-link-Course Catalog')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-Certificates')).not.toBeInTheDocument();
    });

    it('should NOT show "My Progress" on staff dashboard (learner-only item)', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allPermissions: ['content:courses:read'],
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

      renderSidebar('/staff/dashboard');

      // My Progress should NOT appear on staff dashboard at all
      // (no disabled/grayed out items for wrong dashboard types)
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-My Progress')).not.toBeInTheDocument();
    });
  });

  describe('Learner Dashboard Navigation', () => {
    it('should show Learning section items on learner dashboard', async () => {
      const user = userEvent.setup();
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'learner',
          allPermissions: ['course:view-catalog', 'dashboard:view-my-progress'],
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

      renderSidebar('/learner/dashboard');

      // Learner-specific items
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Programs')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Learning')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Course Catalog')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();

      // Expand Progress section (starts collapsed)
      const progressHeader = screen.getByText('Progress').closest('button');
      await user.click(progressHeader!);

      await waitFor(() => {
        expect(screen.getByTestId('nav-link-My Progress')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-Certificates')).toBeInTheDocument();
      });
    });

    it('should show "My Progress" enabled with proper permission', async () => {
      const user = userEvent.setup();
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'learner',
          allPermissions: ['dashboard:view-my-progress'],
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

      renderSidebar('/learner/dashboard');

      // Expand Progress section
      const progressHeader = screen.getByText('Progress').closest('button');
      await user.click(progressHeader!);

      await waitFor(() => {
        const progressLink = screen.getByTestId('nav-link-My Progress');
        expect(progressLink).toBeInTheDocument();
        expect(progressLink).toHaveAttribute('href', '/learner/progress');
        expect(progressLink).not.toHaveClass('opacity-50');
      });
    });

    it('should show "My Progress" disabled when lacking permission', async () => {
      const user = userEvent.setup();
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'learner',
          allPermissions: [],
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
        hasPermission: vi.fn(() => false),
      } as any);

      renderSidebar('/learner/dashboard');

      // Expand Progress section
      const progressHeader = screen.getByText('Progress').closest('button');
      await user.click(progressHeader!);

      await waitFor(() => {
        const progressLink = screen.getByTestId('nav-link-My Progress');
        expect(progressLink).toBeInTheDocument();
        expect(progressLink).toHaveAttribute('aria-disabled', 'true');
      });
    });

    it('should NOT show staff-only items (Teaching, Grading) on learner dashboard', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'learner',
          allPermissions: [],
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

      renderSidebar('/learner/dashboard');

      expect(screen.queryByText('Teaching')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-Grading')).not.toBeInTheDocument();
    });
  });

  describe('Admin Dashboard Navigation', () => {
    it('should show Administration section items on admin dashboard', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'global-admin',
          allPermissions: ['user:view', 'department:view'],
          staffRoles: {
            departmentRoles: [],
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      renderSidebar('/admin/dashboard');

      // Admin-specific items
      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-User Management')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Departments')).toBeInTheDocument();
    });

    it('should NOT show Teaching or Learning sections on admin dashboard', () => {
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'global-admin',
          allPermissions: ['system:*'],
          staffRoles: {
            departmentRoles: [],
          },
        },
        hasPermission: vi.fn(() => true),
      } as any);

      renderSidebar('/admin/dashboard');

      expect(screen.queryByText('Teaching')).not.toBeInTheDocument();
      expect(screen.queryByText('Learning')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-My Courses')).not.toBeInTheDocument();
      expect(screen.queryByTestId('nav-link-Course Catalog')).not.toBeInTheDocument();
    });
  });

  describe('Multi-Role User Navigation', () => {
    it('should show staff navigation on staff dashboard even for multi-role user', () => {
      // User has both staff and learner roles
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff', 'learner'],
          allPermissions: ['content:courses:read', 'dashboard:view-my-progress'],
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

      renderSidebar('/staff/dashboard');

      // Staff navigation should be shown
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Courses')).toBeInTheDocument();

      // Learner-only items should NOT appear (no cross-dashboard pollution)
      expect(screen.queryByText('Progress')).not.toBeInTheDocument();
    });

    it('should show learner navigation on learner dashboard for multi-role user', async () => {
      const user = userEvent.setup();
      // User has both staff and learner roles
      vi.mocked(authStore.useAuthStore).mockReturnValue({
        user: mockUser,
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff', 'learner'],
          allPermissions: ['content:courses:read', 'dashboard:view-my-progress'],
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

      renderSidebar('/learner/dashboard');

      // Learner navigation should be shown
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();

      // Expand Progress section
      const progressHeader = screen.getByText('Progress').closest('button');
      await user.click(progressHeader!);

      await waitFor(() => {
        expect(screen.getByTestId('nav-link-My Progress')).toBeInTheDocument();
      });

      // Staff-only items should NOT appear
      expect(screen.queryByText('Teaching')).not.toBeInTheDocument();
    });
  });
});
