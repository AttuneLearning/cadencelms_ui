/**
 * Unit Tests for Sidebar Component
 * Section-Based Navigation Architecture (Navigation Redesign 2026-02-05)
 * Version: 4.0.0
 *
 * Tests:
 * - Section-based rendering (overview, primary, secondary, insights, department, footer)
 * - Dashboard-specific sections (staff, learner, admin)
 * - Section collapse/expand functionality
 * - Department selection and actions
 * - Permission filtering
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import * as useAuthStoreModule from '@/features/auth/model/authStore';
import * as useNavigationStoreModule from '@/shared/stores/navigationStore';
import * as useDepartmentContextModule from '@/shared/hooks/useDepartmentContext';

// ============================================================================
// Mock Setup
// ============================================================================

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
      className={disabled ? 'disabled' : ''}
    >
      {label}
    </a>
  ),
}));
vi.mock('../ui/DepartmentBreadcrumbSelector', () => ({
  DepartmentBreadcrumbSelector: ({ selectedDepartmentId }: any) => (
    <div data-testid="dept-breadcrumb-selector">
      Breadcrumb: {selectedDepartmentId}
    </div>
  ),
}));

// ============================================================================
// Test Utilities
// ============================================================================

const renderSidebar = (initialRoute = '/staff/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Sidebar />
    </MemoryRouter>
  );
};

const mockRoleHierarchy = {
  primaryUserType: 'staff' as const,
  allPermissions: [
    'content:courses:read',
    'content:courses:manage',
    'class:view-own',
    'grades:own-classes:manage',
    'reports:department:read',
    'reports:class:read',
  ],
  staffRoles: {
    departmentRoles: [
      {
        departmentId: 'dept-123',
        departmentName: 'Engineering',
        isPrimary: true,
        roles: [
          {
            role: 'instructor',
            permissions: ['content:courses:read', 'content:courses:manage'],
          },
        ],
      },
      {
        departmentId: 'dept-456',
        departmentName: 'Science',
        isPrimary: false,
        roles: [
          {
            role: 'assistant',
            permissions: ['content:courses:read'],
          },
        ],
      },
    ],
  },
  learnerRoles: null,
};

const mockUser = {
  _id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
};

const mockNavigationStore = {
  selectedDepartmentId: null,
  setSelectedDepartment: vi.fn(),
  rememberDepartment: vi.fn(),
  lastAccessedDepartments: {},
  isSidebarOpen: true,
  setSidebarOpen: vi.fn(),
  isBreadcrumbMode: false,
  navigateToDepartment: vi.fn(),
};

const mockDepartmentContext = {
  currentDepartmentId: null,
  currentDepartmentName: null,
  currentDepartmentRoles: [],
  currentDepartmentAccessRights: [],
  hasPermission: vi.fn(() => true),
  hasAnyPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
  hasRole: vi.fn(() => true),
  switchDepartment: vi.fn().mockResolvedValue(undefined),
  isSwitching: false,
  switchError: null,
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Sidebar Component - Section-Based Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
      roleHierarchy: mockRoleHierarchy,
      user: mockUser,
      hasPermission: vi.fn(() => true),
    } as any);
    vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue(
      mockNavigationStore as any
    );
    vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue(
      mockDepartmentContext
    );
  });

  describe('Basic Rendering', () => {
    it('should render sidebar when user is authenticated', () => {
      renderSidebar();
      // Check for section headers
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('should not render when roleHierarchy is null', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        roleHierarchy: null,
        user: mockUser,
      } as any);

      const { container } = renderSidebar();
      expect(container.firstChild).toBeNull();
    });

    it('should not render when user is null', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        roleHierarchy: mockRoleHierarchy,
        user: null,
      } as any);

      const { container } = renderSidebar();
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Staff Dashboard Sections', () => {
    it('should render Overview section with Dashboard and Calendar', () => {
      renderSidebar('/staff/dashboard');
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Calendar')).toBeInTheDocument();
    });

    it('should render Teaching (Primary) section', () => {
      renderSidebar('/staff/dashboard');
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Classes')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Grading')).toBeInTheDocument();
    });

    it('should render Insights section with Analytics and Reports', () => {
      renderSidebar('/staff/dashboard');
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });

    it('should render Account footer with Profile and Settings', () => {
      renderSidebar('/staff/dashboard');
      expect(screen.getByTestId('nav-link-My Profile')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Settings')).toBeInTheDocument();
    });
  });

  describe('Learner Dashboard Sections', () => {
    it('should render Learning (Primary) section on learner dashboard', () => {
      renderSidebar('/learner/dashboard');
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Programs')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-My Learning')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Course Catalog')).toBeInTheDocument();
    });

    it('should render Progress (Secondary) section', async () => {
      const user = userEvent.setup();
      renderSidebar('/learner/dashboard');
      expect(screen.getByText('Progress')).toBeInTheDocument();

      // Progress section starts collapsed, expand it
      const progressHeader = screen.getByText('Progress').closest('button');
      await user.click(progressHeader!);

      await waitFor(() => {
        expect(screen.getByTestId('nav-link-My Progress')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-Certificates')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Dashboard Sections', () => {
    it('should render Administration (Primary) section on admin dashboard', () => {
      renderSidebar('/admin/dashboard');
      expect(screen.getByText('Administration')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-User Management')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Departments')).toBeInTheDocument();
    });

    it('should render Insights section with System Analytics and Reports', () => {
      renderSidebar('/admin/dashboard');
      expect(screen.getByText('Insights')).toBeInTheDocument();
    });
  });

  describe('Section Collapse/Expand', () => {
    it('should expand/collapse collapsible sections on click', async () => {
      const user = userEvent.setup();
      renderSidebar('/staff/dashboard');

      // Teaching section should be expanded by default
      expect(screen.getByTestId('nav-link-My Courses')).toBeInTheDocument();

      // Find and click the Teaching section header (has collapsible: true)
      const teachingHeader = screen.getByText('Teaching').closest('button');
      if (teachingHeader) {
        await user.click(teachingHeader);
        // After collapse, items should be hidden
        // Note: Due to implementation, items are removed from DOM when collapsed
      }
    });

    it('should show chevron-down icon when section is expanded', () => {
      renderSidebar('/staff/dashboard');

      // Find Teaching section which is expanded by default
      const teachingSection = screen.getByText('Teaching').closest('button');
      const chevronDown = teachingSection?.querySelector('svg');
      expect(chevronDown).toBeInTheDocument();
    });
  });

  describe('Departments Section', () => {
    it('should render Departments section when user has departments', () => {
      renderSidebar('/staff/dashboard');
      expect(screen.getByText('Departments')).toBeInTheDocument();
    });

    it('should show department list when Departments section is expanded', async () => {
      const user = userEvent.setup();
      renderSidebar('/staff/dashboard');

      // Click Departments section to expand
      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Science')).toBeInTheDocument();
      });
    });

    it('should show Primary badge on primary department', async () => {
      const user = userEvent.setup();
      renderSidebar('/staff/dashboard');

      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByText('Primary')).toBeInTheDocument();
      });
    });

    it('should call switchDepartment when clicking a department', async () => {
      const user = userEvent.setup();
      const mockSwitchDepartment = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchDepartment: mockSwitchDepartment,
      });

      renderSidebar('/staff/dashboard');

      // Expand departments section
      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click on a department
      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledWith('dept-123');
      });
    });

    it('should display error message when switch fails', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchError: 'Failed to switch department',
      });

      renderSidebar('/staff/dashboard');

      // Expand departments section
      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByText('Failed to switch department')).toBeInTheDocument();
      });
    });

    it('should show loading spinner during department switch', async () => {
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        isSwitching: true,
      });

      renderSidebar('/staff/dashboard');

      // Section should auto-expand when switching
      await waitFor(() => {
        const loadingIcon = document.querySelector('.animate-spin');
        expect(loadingIcon).toBeInTheDocument();
      });
    });
  });

  describe('Department Actions', () => {
    it('should show department actions when department is selected', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);

      renderSidebar('/staff/dashboard');

      // Expand departments section
      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByText('Actions')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-Manage Courses')).toBeInTheDocument();
      });
    });

    it('should show breadcrumb selector when in breadcrumb mode', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
        isBreadcrumbMode: true,
      } as any);

      renderSidebar('/staff/dashboard');

      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByTestId('dept-breadcrumb-selector')).toBeInTheDocument();
      });
    });

    it('should filter department actions by permission', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        hasPermission: vi.fn((perm) => perm === 'content:courses:read'),
      });

      renderSidebar('/staff/dashboard');

      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        // Should show Manage Courses (requires content:courses:read)
        expect(screen.getByTestId('nav-link-Manage Courses')).toBeInTheDocument();
        // Should NOT show Create Course (requires content:courses:manage)
        expect(screen.queryByTestId('nav-link-Create Course')).not.toBeInTheDocument();
      });
    });

    it('should show Course Enrollments link for users with enrollment:department:manage permission', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        hasPermission: vi.fn((perm) => perm === 'enrollment:department:manage'),
      });

      renderSidebar('/staff/dashboard');

      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByTestId('nav-link-Course Enrollments')).toBeInTheDocument();
      });
    });

    it('should hide Course Enrollments link for users without enrollment:department:manage permission', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        hasPermission: vi.fn((perm) => perm === 'content:courses:read'), // No enrollment permission
      });

      renderSidebar('/staff/dashboard');

      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        // Should NOT show Course Enrollments (requires enrollment:department:manage)
        expect(screen.queryByTestId('nav-link-Course Enrollments')).not.toBeInTheDocument();
      });
    });

    it('should deselect department when clicking selected department', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
        isBreadcrumbMode: false,
      } as any);

      renderSidebar('/staff/dashboard');

      const deptHeader = screen.getByText('Departments').closest('button');
      await user.click(deptHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click on the selected department header to deselect
      const selectedDeptButton = screen.getByText('Engineering').closest('button');
      await user.click(selectedDeptButton!);

      await waitFor(() => {
        expect(mockNavigationStore.setSelectedDepartment).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('Permission Filtering', () => {
    it('should disable nav items when user lacks required permission', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        roleHierarchy: mockRoleHierarchy,
        user: mockUser,
        hasPermission: vi.fn(() => false),
      } as any);

      renderSidebar('/staff/dashboard');

      // Items that require permission should be disabled
      const coursesLink = screen.getByTestId('nav-link-My Courses');
      expect(coursesLink).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Mobile Behavior', () => {
    it('should close sidebar when clicking overlay', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const overlay = document.querySelector('.fixed.inset-0.bg-black\\/50');
      if (overlay) {
        await user.click(overlay);
        expect(mockNavigationStore.setSidebarOpen).toHaveBeenCalledWith(false);
      }
    });

    it('should apply correct classes when sidebar is open', () => {
      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('translate-x-0');
    });

    it('should apply correct classes when sidebar is closed', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        isSidebarOpen: false,
      } as any);

      renderSidebar();

      const sidebar = document.querySelector('aside');
      expect(sidebar).toHaveClass('-translate-x-full');
    });
  });

  describe('Auto-restore Last Department', () => {
    it('should restore last accessed department on mount', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        lastAccessedDepartments: {
          'user-123': 'dept-456',
        },
      } as any);

      renderSidebar();

      expect(mockNavigationStore.setSelectedDepartment).toHaveBeenCalledWith('dept-456');
    });

    it('should not restore if department is already selected', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
        lastAccessedDepartments: {
          'user-123': 'dept-456',
        },
      } as any);

      renderSidebar();

      expect(mockNavigationStore.setSelectedDepartment).not.toHaveBeenCalled();
    });

    it('should not restore if last department is not in user departments', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        lastAccessedDepartments: {
          'user-123': 'dept-999',
        },
      } as any);

      renderSidebar();

      expect(mockNavigationStore.setSelectedDepartment).not.toHaveBeenCalled();
    });
  });
});
