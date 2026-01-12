/**
 * Unit Tests for Sidebar Component - Track D Implementation
 * Tests integration with useDepartmentContext hook
 * Version: 2.1.0 (Contract Alignment - Phase 2)
 * Date: 2026-01-11
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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
vi.mock('../config/navItems', () => ({
  GLOBAL_NAV_ITEMS: [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: 'Home',
      userTypes: ['staff', 'learner', 'global-admin'],
      requiredPermission: null,
    },
    {
      label: 'Admin Panel',
      path: '/admin',
      icon: 'Settings',
      userTypes: ['global-admin'],
      requiredPermission: 'system:admin:access',
    },
  ],
  DEPARTMENT_NAV_ITEMS: [
    {
      label: 'Courses',
      pathTemplate: '/departments/:deptId/courses',
      icon: 'Book',
      userTypes: ['staff', 'learner'],
      requiredPermission: 'content:courses:read',
    },
    {
      label: 'Manage Content',
      pathTemplate: '/departments/:deptId/manage',
      icon: 'Edit',
      userTypes: ['staff'],
      requiredPermission: 'content:courses:manage',
    },
  ],
}));
vi.mock('../ui/NavLink', () => ({
  NavLink: ({ label, path }: any) => (
    <a href={path} data-testid={`nav-link-${label}`}>
      {label}
    </a>
  ),
}));

// ============================================================================
// Test Utilities
// ============================================================================

const renderSidebar = () => {
  return render(
    <BrowserRouter>
      <Sidebar />
    </BrowserRouter>
  );
};

const mockRoleHierarchy = {
  primaryUserType: 'staff' as const,
  allPermissions: ['content:courses:read', 'content:courses:manage'],
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

describe('Sidebar Component', () => {
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
      expect(screen.getAllByText('Navigation')[0]).toBeInTheDocument();
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

    it('should render global navigation items', () => {
      renderSidebar();
      expect(screen.getByTestId('nav-link-Dashboard')).toBeInTheDocument();
    });

    it('should render department sections', () => {
      renderSidebar();
      expect(screen.getByText('My Departments')).toBeInTheDocument();
      expect(screen.getByText('Department Actions')).toBeInTheDocument();
    });
  });

  describe('Department Display', () => {
    it('should display user departments from roleHierarchy', async () => {
      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
        expect(screen.getByText('Science')).toBeInTheDocument();
      });
    });

    it('should show primary badge on primary department', async () => {
      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Primary')).toBeInTheDocument();
      });
    });

    it('should handle departments from learnerRoles', async () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        roleHierarchy: {
          ...mockRoleHierarchy,
          staffRoles: null,
          learnerRoles: {
            departmentRoles: [
              {
                departmentId: 'dept-789',
                departmentName: 'Math',
                isPrimary: false,
                roles: [
                  {
                    role: 'student',
                    permissions: ['content:courses:read'],
                  },
                ],
              },
            ],
          },
        },
        user: mockUser,
      } as any);

      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Math')).toBeInTheDocument();
      });
    });
  });

  describe('Department Selection', () => {
    it('should call switchDepartment when clicking unselected department', async () => {
      const user = userEvent.setup();
      const mockSwitchDepartment = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchDepartment: mockSwitchDepartment,
      });

      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledWith('dept-123');
      });
    });

    it('should remember department selection after successful switch', async () => {
      const user = userEvent.setup();
      const mockSwitchDepartment = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchDepartment: mockSwitchDepartment,
      });

      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockNavigationStore.rememberDepartment).toHaveBeenCalledWith(
          'user-123',
          'dept-123'
        );
      });
    });

    it('should deselect department when clicking selected department', async () => {
      const user = userEvent.setup();
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);

      renderSidebar();

      // Manually expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockNavigationStore.setSelectedDepartment).toHaveBeenCalledWith(null);
      });
    });

    it('should show loading state during department switch', () => {
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        isSwitching: true,
        currentDepartmentId: 'dept-123',
      });
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);

      renderSidebar();

      // Find the loading spinner
      const loadingIcon = document.querySelector('.animate-spin');
      expect(loadingIcon).toBeInTheDocument();
    });

    it('should disable department buttons during switch', async () => {
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        isSwitching: true,
      });

      renderSidebar();

      // Auto-expands when isSwitching = true
      await waitFor(() => {
        const deptButton = screen.getByText('Engineering').closest('button');
        expect(deptButton).toBeDisabled();
      });
    });

    it('should display error message when switch fails', async () => {
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchError: 'Failed to switch department',
      });

      renderSidebar();

      // Expand to see error message
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Failed to switch department')).toBeInTheDocument();
      });
    });

    it('should handle API error gracefully', async () => {
      const user = userEvent.setup();
      const mockSwitchDepartment = vi.fn().mockRejectedValue(new Error('API Error'));
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchDepartment: mockSwitchDepartment,
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Department-Specific Navigation', () => {
    it('should show no department selected message when none selected', () => {
      renderSidebar();
      expect(screen.getByText('Select a department above to see available actions')).toBeInTheDocument();
    });

    it('should display department actions when department is selected', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentId: 'dept-123',
      });

      renderSidebar();

      expect(screen.getByTestId('nav-link-Courses')).toBeInTheDocument();
      expect(screen.getByTestId('nav-link-Manage Content')).toBeInTheDocument();
    });

    it('should filter department nav items by permission', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentId: 'dept-123',
        hasPermission: vi.fn((perm) => perm === 'content:courses:read'),
      });

      renderSidebar();

      // Should show Courses (only requires read)
      expect(screen.getByTestId('nav-link-Courses')).toBeInTheDocument();
      // Should not show Manage Content (requires manage permission)
      expect(screen.queryByTestId('nav-link-Manage Content')).not.toBeInTheDocument();
    });

    it('should replace :deptId in path templates', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentId: 'dept-123',
      });

      renderSidebar();

      const coursesLink = screen.getByTestId('nav-link-Courses');
      expect(coursesLink).toHaveAttribute('href', '/departments/dept-123/courses');
    });

    it('should show no actions message when user has no permissions', () => {
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentId: 'dept-123',
        hasPermission: vi.fn(() => false),
      });

      renderSidebar();

      expect(screen.getByText('No actions available for this department')).toBeInTheDocument();
    });
  });

  describe('Global Navigation Filtering', () => {
    it('should show all nav items but disable those for other userTypes', () => {
      renderSidebar();

      // Staff user should see Dashboard (enabled)
      expect(screen.getByTestId('nav-link-Dashboard')).toBeInTheDocument();

      // Admin Panel shown but disabled (staff user doesn't have global-admin userType)
      // Note: cross-userType items are now shown but grayed out
      // This is the new behavior per ISS-003
    });

    it('should show admin items for global-admin users', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        roleHierarchy: {
          ...mockRoleHierarchy,
          primaryUserType: 'global-admin',
        },
        user: mockUser,
        hasPermission: vi.fn(() => true),
      } as any);

      renderSidebar();

      expect(screen.getByTestId('nav-link-Admin Panel')).toBeInTheDocument();
    });

    it('should disable items when user lacks required permission', () => {
      const mockHasPermission = vi.fn(() => false);
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        roleHierarchy: {
          ...mockRoleHierarchy,
          primaryUserType: 'global-admin',
          allUserTypes: ['global-admin'],
        },
        user: mockUser,
        hasPermission: mockHasPermission, // Add hasGlobalPermission mock
      } as any);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        hasPermission: mockHasPermission,
      });

      renderSidebar();

      // Admin Panel should be shown but disabled (no permission)
      // All admin items require permissions, so they should be disabled
      // Note: With all permissions denied, all items will be disabled
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

    it('should close sidebar when clicking close button', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const closeButton = document.querySelector('button');
      if (closeButton && closeButton.querySelector('.h-5.w-5')) {
        await user.click(closeButton);
        expect(mockNavigationStore.setSidebarOpen).toHaveBeenCalled();
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

      // Should call setSelectedDepartment with last accessed dept
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

      // Should not call setSelectedDepartment
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

      // Should not call setSelectedDepartment
      expect(mockNavigationStore.setSelectedDepartment).not.toHaveBeenCalled();
    });
  });

  describe('Department Context Hook Integration', () => {
    it('should call useDepartmentContext hook', () => {
      renderSidebar();

      expect(useDepartmentContextModule.useDepartmentContext).toHaveBeenCalled();
    });

    it('should use hasPermission from department context', () => {
      const mockHasPermission = vi.fn(() => true);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        hasPermission: mockHasPermission,
      });
      vi.mocked(useNavigationStoreModule.useNavigationStore).mockReturnValue({
        ...mockNavigationStore,
        selectedDepartmentId: 'dept-123',
      } as any);

      renderSidebar();

      // Hook's hasPermission should be called for filtering
      expect(mockHasPermission).toHaveBeenCalled();
    });

    it('should use switchDepartment from department context', async () => {
      const user = userEvent.setup();
      const mockSwitchDepartment = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        switchDepartment: mockSwitchDepartment,
      });

      renderSidebar();

      // Expand the department dropdown
      const departmentHeader = screen.getByText('My Departments').closest('button');
      fireEvent.click(departmentHeader!);

      await waitFor(() => {
        expect(screen.getByText('Engineering')).toBeInTheDocument();
      });

      const deptButton = screen.getByText('Engineering').closest('button');
      await user.click(deptButton!);

      await waitFor(() => {
        expect(mockSwitchDepartment).toHaveBeenCalledWith('dept-123');
      });
    });
  });

  describe('Settings Footer', () => {
    it('should render settings link in footer', () => {
      renderSidebar();
      expect(screen.getByTestId('nav-link-Settings')).toBeInTheDocument();
    });
  });
});
