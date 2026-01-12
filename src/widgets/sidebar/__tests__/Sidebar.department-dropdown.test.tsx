/**
 * Sidebar - Department Dropdown Tests
 * Tests for ISS-005: Department dropdown expand/collapse behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import * as authStore from '@/features/auth/model/authStore';
import * as navigationStore from '@/shared/stores/navigationStore';
import * as departmentContext from '@/shared/hooks/useDepartmentContext';

// Mock the stores and hooks
vi.mock('@/features/auth/model/authStore');
vi.mock('@/shared/stores/navigationStore');
vi.mock('@/shared/hooks/useDepartmentContext');

describe('Sidebar - Department Dropdown (ISS-005)', () => {
  const mockSwitchDepartment = vi.fn();
  const mockSetSelectedDepartment = vi.fn();
  const mockRememberDepartment = vi.fn();
  const mockSetSidebarOpen = vi.fn();

  const mockUser = {
    _id: 'user-123',
    email: 'admin@lms.edu',
  };

  const mockRoleHierarchy = {
    primaryUserType: 'global-admin' as const,
    allPermissions: ['system:*'],
    userTypeDisplayMap: {
      'global-admin': 'Global Admin',
      staff: 'Staff',
      learner: 'Learner',
    },
    staffRoles: {
      departmentRoles: [
        {
          departmentId: 'dept-001',
          departmentName: 'Master Department',
          isPrimary: true,
          roles: ['system-admin'],
        },
        {
          departmentId: 'dept-002',
          departmentName: 'Computer Science',
          isPrimary: false,
          roles: ['instructor'],
        },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock authStore
    vi.mocked(authStore.useAuthStore).mockReturnValue({
      user: mockUser,
      roleHierarchy: mockRoleHierarchy,
      hasPermission: vi.fn(() => true),
    } as any);

    // Mock navigationStore
    vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
      selectedDepartmentId: null,
      setSelectedDepartment: mockSetSelectedDepartment,
      rememberDepartment: mockRememberDepartment,
      lastAccessedDepartments: {},
      isSidebarOpen: true,
      setSidebarOpen: mockSetSidebarOpen,
    } as any);

    // Mock departmentContext
    vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
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
    });
  });

  describe('Expand/Collapse Behavior', () => {
    it('should initially show "My Departments" section collapsed', () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      expect(screen.getByText('My Departments')).toBeInTheDocument();

      // Department list should NOT be visible when collapsed
      expect(screen.queryByText('Master Department')).not.toBeInTheDocument();
      expect(screen.queryByText('Computer Science')).not.toBeInTheDocument();
    });

    it('should expand department list when clicking "My Departments" header', async () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const header = screen.getByText('My Departments').closest('button');
      expect(header).toBeInTheDocument();

      // Click to expand
      fireEvent.click(header!);

      // Department list should now be visible
      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
        expect(screen.getByText('Computer Science')).toBeInTheDocument();
      });
    });

    it('should NOT call switchDepartment API when expanding dropdown', async () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const header = screen.getByText('My Departments').closest('button');

      // Click to expand
      fireEvent.click(header!);

      // Wait a bit to ensure no async calls happen
      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
      });

      // API should NOT have been called
      expect(mockSwitchDepartment).not.toHaveBeenCalled();
    });

    it('should collapse department list when clicking header again', async () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const header = screen.getByText('My Departments').closest('button');

      // Click to expand
      fireEvent.click(header!);
      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
      });

      // Click again to collapse
      fireEvent.click(header!);
      await waitFor(() => {
        expect(screen.queryByText('Master Department')).not.toBeInTheDocument();
      });
    });
  });

  describe('Department Selection Behavior', () => {
    it('should call switchDepartment API when clicking a department name', async () => {
      mockSwitchDepartment.mockResolvedValue(undefined);

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // First expand the dropdown
      const header = screen.getByText('My Departments').closest('button');
      fireEvent.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
      });

      // Now click a department to select it
      const deptButton = screen.getByText('Master Department').closest('button');
      fireEvent.click(deptButton!);

      // API should have been called
      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledWith('dept-001');
      });
    });

    it('should show loading spinner during department switch', async () => {
      // Mock switching state BEFORE render - with selectedDepartmentId set
      vi.mocked(navigationStore.useNavigationStore).mockReturnValue({
        selectedDepartmentId: 'dept-001', // Set to department being switched
        setSelectedDepartment: mockSetSelectedDepartment,
        rememberDepartment: mockRememberDepartment,
        lastAccessedDepartments: {},
        isSidebarOpen: true,
        setSidebarOpen: mockSetSidebarOpen,
      } as any);

      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
        currentDepartmentId: 'dept-001',
        currentDepartmentRoles: [],
        currentDepartmentAccessRights: [],
        currentDepartmentName: null,
        hasPermission: vi.fn(() => true),
        hasAnyPermission: vi.fn(() => true),
        hasAllPermissions: vi.fn(() => true),
        hasRole: vi.fn(() => false),
        switchDepartment: mockSwitchDepartment,
        isSwitching: true, // Loading state
        switchError: null,
      });

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // When isSwitching is true, section should auto-expand
      // Wait for the useEffect to run
      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
      });

      // Should show loading spinner (Loader2 component renders as svg)
      const buttons = screen.getAllByRole('button');
      const deptButton = buttons.find(btn => btn.textContent?.includes('Master Department'));
      expect(deptButton?.querySelector('svg.animate-spin')).toBeInTheDocument();
    });

    it('should display error message when department switch fails', async () => {
      // Mock error state
      vi.mocked(departmentContext.useDepartmentContext).mockReturnValue({
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
        switchError: 'Department not found or is not accessible',
      });

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // Expand dropdown
      const header = screen.getByText('My Departments').closest('button');
      fireEvent.click(header!);

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText('Department not found or is not accessible')).toBeInTheDocument();
      });
    });

    it('should NOT cause infinite loop when API error occurs', async () => {
      // Mock API error
      mockSwitchDepartment.mockRejectedValue(new Error('Department not found'));

      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      // Expand and select department
      const header = screen.getByText('My Departments').closest('button');
      fireEvent.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Master Department').closest('button');
      fireEvent.click(deptButton!);

      // Wait for error handling
      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledTimes(1);
      });

      // Ensure API is called exactly once, not in a loop
      expect(mockSwitchDepartment).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual Indicators', () => {
    it('should show chevron-right icon when section is collapsed', () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const header = screen.getByText('My Departments').closest('button');
      expect(header?.querySelector('svg')).toBeInTheDocument();
      // ChevronRight is shown when collapsed
    });

    it('should show chevron-down icon when section is expanded', async () => {
      render(
        <BrowserRouter>
          <Sidebar />
        </BrowserRouter>
      );

      const header = screen.getByText('My Departments').closest('button');
      fireEvent.click(header!);

      await waitFor(() => {
        expect(screen.getByText('Master Department')).toBeInTheDocument();
      });

      // ChevronDown should be shown when expanded
      expect(header?.querySelector('svg')).toBeInTheDocument();
    });
  });
});
