/**
 * Unit Tests for Header Component - Track D Implementation
 * Tests integration with useDepartmentContext hook
 * Version: 2.1.0 (Contract Alignment - Phase 2)
 * Date: 2026-01-11
 * Updated: 2026-01-13 (Phase 3 - Fixed mocking)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../Header';
import {
  renderWithProviders,
  createMockAuthStore,
  createMockNavigation,
  createMockDepartmentContext,
  createMockStaffUser,
  createMockStaffRoleHierarchy,
} from '@/test/utils';

// ============================================================================
// Mock Setup
// ============================================================================

// Mock the actual hooks used by Header component
vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: vi.fn(),
}));

vi.mock('@/shared/lib/navigation', () => ({
  useNavigation: vi.fn(),
}));

vi.mock('@/shared/hooks', () => ({
  useDepartmentContext: vi.fn(),
}));

vi.mock('@/features/theme/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Import mocked modules
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigation } from '@/shared/lib/navigation';
import { useDepartmentContext } from '@/shared/hooks';

// ============================================================================
// Test Utilities
// ============================================================================

const renderHeader = () => {
  return renderWithProviders(<Header />);
};

// Create base mock data
const mockUser = createMockStaffUser({
  _id: 'user-123',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
});

const mockRoleHierarchy = createMockStaffRoleHierarchy({
  primaryUserType: 'staff',
  allUserTypes: ['staff'],
  allPermissions: ['content:courses:read', 'content:courses:edit'],
});

const mockAuthData = createMockAuthStore({
  isAuthenticated: true,
  user: mockUser,
  roleHierarchy: mockRoleHierarchy,
});

const mockNavigationData = createMockNavigation({
  isSidebarOpen: false,
});

const mockDepartmentContext = createMockDepartmentContext({
  currentDepartmentId: 'dept-123',
  currentDepartmentName: 'Engineering Department',
  currentDepartmentRoles: ['instructor', 'course-creator'],
  currentDepartmentAccessRights: ['content:courses:read', 'content:courses:edit'],
});

// ============================================================================
// Test Suites
// ============================================================================

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStore).mockReturnValue(mockAuthData as any);
    vi.mocked(useNavigation).mockReturnValue(mockNavigationData as any);
    vi.mocked(useDepartmentContext).mockReturnValue(mockDepartmentContext);
  });

  describe('Basic Rendering', () => {
    it('should render the header with logo', () => {
      renderHeader();
      expect(screen.getByText('LMS UI V2')).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      renderHeader();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should not render desktop navigation items when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();
      // Should not show Dashboard and Courses links
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Courses')).not.toBeInTheDocument();
    });
  });

  describe('Department Context Display', () => {
    it('should display current department name in user dropdown', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('Engineering Department')).toBeInTheDocument();
      });
    });

    it('should display current department roles as badges', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('instructor')).toBeInTheDocument();
        expect(screen.getByText('course-creator')).toBeInTheDocument();
      });
    });

    it('should display primary user type', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // Component uses displayAs from userTypeDisplayMap, so "staff" becomes "Staff"
        expect(screen.getByText('Staff')).toBeInTheDocument();
      });
    });

    it('should not display department info when no department selected', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentId: null,
        currentDepartmentName: null,
        currentDepartmentRoles: [],
      });

      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.queryByText('Engineering Department')).not.toBeInTheDocument();
      });
    });

    it('should limit role badges to 3 with overflow indicator', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentRoles: ['role1', 'role2', 'role3', 'role4', 'role5'],
      });

      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('role1')).toBeInTheDocument();
        expect(screen.getByText('role2')).toBeInTheDocument();
        expect(screen.getByText('role3')).toBeInTheDocument();
        expect(screen.getByText('+2')).toBeInTheDocument();
        expect(screen.queryByText('role4')).not.toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should toggle sidebar when menu button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const menuButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(menuButton);

      expect(mockNavigationData.toggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should call logout and navigate on logout click', async () => {
      const user = userEvent.setup();
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        logout: mockLogout,
      } as any);

      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      // Click logout
      const logoutButton = await screen.findByText('Log out');
      await user.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
      });
    });

    it('should display user email in dropdown', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Filtering', () => {
    it('should filter nav items based on primary user type', () => {
      renderHeader();

      // Staff should see Dashboard and Courses
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should show admin link for global-admin user type', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        user: {
          ...mockUser,
          userTypes: ['global-admin'],
        },
        roleHierarchy: {
          ...mockRoleHierarchy,
          primaryUserType: 'global-admin',
          allPermissions: ['system:*'],
        },
      } as any);

      renderHeader();

      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should not show admin link for non-admin users', () => {
      renderHeader();

      // Staff user should not see Admin link
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user data gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        user: null,
      } as any);

      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument();
      });
    });

    it('should handle missing roleHierarchy gracefully', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        roleHierarchy: null,
      } as any);

      renderHeader();

      expect(screen.getByText('LMS UI V2')).toBeInTheDocument();
    });

    it('should display user initials in avatar', async () => {
      const user = userEvent.setup();
      renderHeader();

      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      // Avatar should show 'T' from test@example.com
      expect(avatarButton.textContent).toContain('T');
    });

    it('should default to "U" when no email available', async () => {
      const user = userEvent.setup();
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        user: {
          ...mockUser,
          email: '',
        },
      } as any);

      renderHeader();

      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      expect(avatarButton.textContent).toContain('U');
    });
  });

  describe('Department Context Hook Integration', () => {
    it('should call useDepartmentContext hook', () => {
      renderHeader();

      expect(useDepartmentContext).toHaveBeenCalled();
    });

    it('should use department context for display', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // Verify department name is displayed
        expect(screen.getByText('Engineering Department')).toBeInTheDocument();
        // Verify roles are displayed
        expect(screen.getByText('instructor')).toBeInTheDocument();
      });
    });

    it('should not render department section when currentDepartmentId is null', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentId: null,
        currentDepartmentName: null,
        currentDepartmentRoles: [],
      });

      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // Department name should not be present
        expect(screen.queryByText('Engineering Department')).not.toBeInTheDocument();
      });
    });
  });

  describe('Unauthenticated State', () => {
    it('should show sign in button when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should not show user dropdown when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();

      expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument();
    });

    it('should not show mobile menu button when not authenticated', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();

      expect(screen.queryByRole('button', { name: /toggle sidebar/i })).not.toBeInTheDocument();
    });
  });
});
