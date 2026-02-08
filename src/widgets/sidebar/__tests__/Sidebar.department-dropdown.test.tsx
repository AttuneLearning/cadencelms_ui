/**
 * Sidebar - Department Section Tests
 * Navigation Redesign 2026-02-05
 *
 * In the new architecture:
 * - Department section is called "Departments" (not "My Departments")
 * - Section starts collapsed by default
 * - Expanding shows list of user's departments
 * - Selecting a department shows flat list of department actions
 * - Optional breadcrumb mode for hierarchical navigation
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
vi.mock('../ui/NavLink', () => ({
  NavLink: ({ label, path }: any) => (
    <a href={path} data-testid={`nav-link-${label}`}>
      {label}
    </a>
  ),
}));
vi.mock('../ui/DepartmentBreadcrumbSelector', () => ({
  DepartmentBreadcrumbSelector: ({ selectedDepartmentId, onSelectDepartment }: any) => (
    <div data-testid="dept-breadcrumb-selector">
      <span>Breadcrumb: {selectedDepartmentId}</span>
      <button
        data-testid="breadcrumb-select"
        onClick={() => onSelectDepartment('dept-child-1')}
      >
        Select Child
      </button>
    </div>
  ),
}));

describe('Sidebar - Department Section', () => {
  const mockSwitchDepartment = vi.fn();
  const mockSetSelectedDepartment = vi.fn();
  const mockRememberDepartment = vi.fn();
  const mockSetSidebarOpen = vi.fn();
  const mockNavigateToDepartment = vi.fn();

  const mockUser = {
    _id: 'user-123',
    email: 'admin@lms.edu',
  };

  const mockRoleHierarchy = {
    primaryUserType: 'staff' as const,
    allPermissions: ['content:courses:read', 'content:courses:manage'],
    staffRoles: {
      departmentRoles: [
        {
          departmentId: 'dept-001',
          departmentName: 'Engineering',
          isPrimary: true,
          roles: [{ role: 'instructor', permissions: ['content:courses:read'] }],
        },
        {
          departmentId: 'dept-002',
          departmentName: 'Computer Science',
          isPrimary: false,
          roles: [{ role: 'assistant', permissions: ['content:courses:read'] }],
        },
      ],
    },
  };

  const defaultNavigationStore = {
    selectedDepartmentId: null,
    setSelectedDepartment: mockSetSelectedDepartment,
    rememberDepartment: mockRememberDepartment,
    lastAccessedDepartments: {},
    isSidebarOpen: true,
    setSidebarOpen: mockSetSidebarOpen,
    isBreadcrumbMode: false,
    navigateToDepartment: mockNavigateToDepartment,
  };

  const defaultDepartmentContext = {
    currentDepartmentId: null,
    currentDepartmentRoles: [],
    currentDepartmentAccessRights: [],
    currentDepartmentName: null,
    hasPermission: vi.fn(() => true),
    hasAnyPermission: vi.fn(() => true),
    hasAllPermissions: vi.fn(() => true),
    hasRole: vi.fn(() => false),
    switchDepartment: mockSwitchDepartment,
    isSwitching: false,
    switchError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: mockUser,
      roleHierarchy: mockRoleHierarchy,
      hasPermission: vi.fn(() => true),
    } as any);

    vi.mocked(navigationStore.useNavigationStore).mockReturnValue(
      defaultNavigationStore as any
    );

    vi.mocked(departmentContext.useDepartmentContext).mockReturnValue(
      defaultDepartmentContext
    );
  });

  const renderSidebar = (route = '/staff/dashboard') =>
    render(
      <MemoryRouter initialEntries={[route]}>
        <Sidebar />
      </MemoryRouter>
    );

  describe('Expand/Collapse Behavior', () => {
    it('should show "Departments" section header', () => {
      renderSidebar();
      expect(screen.getByText('Departments')).toBeInTheDocument();
    });

    it('should start with Departments section collapsed', () => {
      renderSidebar();
      // Departments list should not be visible initially
      expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
      expect(screen.queryByText('Computer Science')).not.toBeInTheDocument();
    });

    it('should expand department list when clicking header', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });

    it('should NOT call switchDepartment API when expanding section', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      expect(mockSwitchDepartment).not.toHaveBeenCalled();
    });

    it('should collapse department list when clicking header again', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const header = screen.getByText('Departments').closest('button');

      // Expand
      await user.click(header!);
      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Collapse
      await user.click(header!);
      await waitFor(() => {
        expect(screen.queryByText('Engineering')).not.toBeInTheDocument();
      });
    });
  });

  describe('Department Selection', () => {
    it('should call switchDepartment API when clicking a department', async () => {
      const user = userEvent.setup();
      mockSwitchDepartment.mockResolvedValue(undefined);
      renderSidebar();

      // Expand
      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Select department
      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledWith('dept-001');
      });
    });

    it('should remember department selection after successful switch', async () => {
      const user = userEvent.setup();
      mockSwitchDepartment.mockResolvedValue(undefined);
      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockRememberDepartment).toHaveBeenCalledWith('user-123', 'dept-001');
      });
    });

    it('should show Primary badge on primary department', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Primary')).toBeInTheDocument();
      });
    });

    it('should auto-expand section when isSwitching is true', async () => {
      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
        ...defaultDepartmentContext,
        isSwitching: true,
      });

      renderSidebar();

      // Section should auto-expand when switching
      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });
    });
  });

  describe('Department Actions', () => {
    it('should show department actions when department is selected', async () => {
      const user = userEvent.setup();
      vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
        ...defaultNavigationStore,
        selectedDepartmentId: 'dept-001',
      } as any);

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Actions')).toBeInTheDocument();
        expect(screen.getByTestId('nav-link-Manage Courses')).toBeInTheDocument();
      });
    });

    it('should show "No actions available" when user has no permissions', async () => {
      const user = userEvent.setup();
      vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
        ...defaultNavigationStore,
        selectedDepartmentId: 'dept-001',
      } as any);
      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
        ...defaultDepartmentContext,
        hasPermission: vi.fn(() => false),
      });

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('No actions available')).toBeInTheDocument();
      });
    });
  });

  describe('Breadcrumb Mode', () => {
    it('should show breadcrumb selector when in breadcrumb mode', async () => {
      const user = userEvent.setup();
      vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
        ...defaultNavigationStore,
        selectedDepartmentId: 'dept-001',
        isBreadcrumbMode: true,
      } as any);

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByTestId('dept-breadcrumb-selector')).toBeInTheDocument();
      });
    });

    it('should call navigateToDepartment when selecting from breadcrumb', async () => {
      const user = userEvent.setup();
      vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
        ...defaultNavigationStore,
        selectedDepartmentId: 'dept-001',
        isBreadcrumbMode: true,
      } as any);
      mockSwitchDepartment.mockResolvedValue(undefined);

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByTestId('breadcrumb-select')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('breadcrumb-select'));

      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledWith('dept-child-1');
        expect(mockNavigateToDepartment).toHaveBeenCalledWith('dept-child-1');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when switch fails', async () => {
      const user = userEvent.setup();
      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
        ...defaultDepartmentContext,
        switchError: 'Department not found',
      });

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Department not found')).toBeInTheDocument();
      });
    });

    it('should show loading spinner during department switch', async () => {
      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
        ...defaultDepartmentContext,
        isSwitching: true,
      });

      renderSidebar();

      // Section auto-expands when switching
      await waitFor(() => {
        const loadingIcon = document.querySelector('.animate-spin');
        expect(loadingIcon).toBeInTheDocument();
      });
    });

    it('should disable department buttons during switch', async () => {
      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
        ...defaultDepartmentContext,
        isSwitching: true,
      });

      renderSidebar();

      // Section auto-expands when switching
      await waitFor(() => {
        const deptButton = screen.getByText('Engineering').closest('button');
        expect(deptButton).toBeDisabled();
      });
    });

    it('should NOT cause infinite loop when API error occurs', async () => {
      const user = userEvent.setup();
      mockSwitchDepartment.mockRejectedValue(new Error('API Error'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledTimes(1);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Visual Indicators', () => {
    it('should show chevron icon on Departments header', () => {
      renderSidebar();
      const header = screen.getByText('Departments').closest('button');
      expect(header?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Deselection', () => {
    it('should deselect department when clicking selected department button', async () => {
      const user = userEvent.setup();
      vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
        ...defaultNavigationStore,
        selectedDepartmentId: 'dept-001',
        isBreadcrumbMode: false,
      } as any);

      renderSidebar();

      const header = screen.getByText('Departments').closest('button');
      await user.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      // Click the selected department button (not in breadcrumb mode)
      const selectedDeptButton = screen.getByText('Engineering').closest('button');
      await user.click(selectedDeptButton!);

      await waitFor(() => {
        expect(mockSetSelectedDepartment).toHaveBeenCalledWith(null);
      });
    });
  });
});
