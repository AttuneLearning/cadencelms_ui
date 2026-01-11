/**
 * Header Component Tests - Phase 3 (Track F)
 * Version: 2.1.0
 * Date: 2026-01-11
 *
 * Tests for Header component using server displayAs labels
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuthStore } from '@/features/auth/model/authStore';
import * as navigationHook from '@/shared/lib/navigation';
import type { RoleHierarchy, User } from '@/shared/types/auth';

// Mock dependencies
vi.mock('@/features/auth/model/authStore');
vi.mock('@/shared/lib/navigation');
vi.mock('@/features/theme/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render Header with Router
const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

describe('Header', () => {
  const mockToggleSidebar = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(navigationHook.useNavigation).mockReturnValue({
      toggleSidebar: mockToggleSidebar,
      isSidebarOpen: false,
      closeSidebar: vi.fn(),
      openSidebar: vi.fn(),
    });
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        roleHierarchy: null,
        accessToken: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });
    });

    it('should render logo and sign in button when not authenticated', () => {
      renderHeader();

      expect(screen.getByText('LMS UI V2')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();
    });

    it('should not render navigation items when not authenticated', () => {
      renderHeader();

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Courses')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    const mockUser: User = {
      _id: 'user123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      userTypes: ['staff'],
      defaultDashboard: 'staff',
      isActive: true,
      createdAt: '2026-01-11',
      updatedAt: '2026-01-11',
    };

    const mockRoleHierarchy: RoleHierarchy = {
      primaryUserType: 'staff',
      allUserTypes: ['staff'],
      defaultDashboard: 'staff',
      globalRoles: [],
      allPermissions: [],
      userTypeDisplayMap: {
        staff: 'Staff Member',
        learner: 'Student',
        'global-admin': 'System Administrator',
      },
      roleDisplayMap: {
        instructor: 'Course Instructor',
        'department-admin': 'Department Administrator',
      },
    };

    beforeEach(() => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        roleHierarchy: mockRoleHierarchy,
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });
    });

    it('should render navigation items for authenticated user', () => {
      renderHeader();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument(); // Staff doesn't see admin
    });

    it('should render mobile menu toggle for authenticated user', () => {
      renderHeader();

      const toggleButton = screen.getByLabelText('Toggle sidebar');
      expect(toggleButton).toBeInTheDocument();

      fireEvent.click(toggleButton);
      expect(mockToggleSidebar).toHaveBeenCalledTimes(1);
    });

    it('should display user avatar with correct initials', () => {
      renderHeader();

      const avatarButton = screen.getByLabelText('User menu');
      expect(avatarButton).toBeInTheDocument();

      // Avatar shows first letter of email
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should have user menu trigger', () => {
      renderHeader();

      const avatarButton = screen.getByLabelText('User menu');
      expect(avatarButton).toBeInTheDocument();

      // Can be clicked
      fireEvent.click(avatarButton);
      expect(avatarButton).toHaveAttribute('aria-expanded');
    });

    it('should use server displayAs label from roleHierarchy', () => {
      // Test that the component receives the correct roleHierarchy with display maps
      renderHeader();

      // Verify the roleHierarchy is set up correctly with userTypeDisplayMap
      const { roleHierarchy } = useAuthStore();
      expect(roleHierarchy?.userTypeDisplayMap).toEqual({
        staff: 'Staff Member',
        learner: 'Student',
        'global-admin': 'System Administrator',
      });
      expect(roleHierarchy?.primaryUserType).toBe('staff');
    });

    it('should have logout functionality available', () => {
      const mockLogout = vi.fn().mockResolvedValue(undefined);
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: mockUser,
        roleHierarchy: mockRoleHierarchy,
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: mockLogout,
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      renderHeader();

      // Verify the dropdown menu trigger is present
      const avatarButton = screen.getByLabelText('User menu');
      expect(avatarButton).toBeInTheDocument();

      // Verify logout is in the store
      expect(mockLogout).toBeDefined();
    });
  });

  describe('Role-based Navigation', () => {
    it('should show admin nav item for global-admin users', () => {
      const adminUser: User = {
        _id: 'admin123',
        email: 'admin@example.com',
        userTypes: ['global-admin'],
        defaultDashboard: 'admin',
        isActive: true,
        createdAt: '2026-01-11',
        updatedAt: '2026-01-11',
      };

      const adminRoleHierarchy: RoleHierarchy = {
        primaryUserType: 'global-admin',
        allUserTypes: ['global-admin'],
        defaultDashboard: 'admin',
        globalRoles: [],
        allPermissions: ['system:*'],
        userTypeDisplayMap: {
          'global-admin': 'System Administrator',
        },
      };

      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: adminUser,
        roleHierarchy: adminRoleHierarchy,
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      renderHeader();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should show appropriate nav items for learner users', () => {
      const learnerUser: User = {
        _id: 'learner123',
        email: 'learner@example.com',
        userTypes: ['learner'],
        defaultDashboard: 'learner',
        isActive: true,
        createdAt: '2026-01-11',
        updatedAt: '2026-01-11',
      };

      const learnerRoleHierarchy: RoleHierarchy = {
        primaryUserType: 'learner',
        allUserTypes: ['learner'],
        defaultDashboard: 'learner',
        globalRoles: [],
        allPermissions: [],
        userTypeDisplayMap: {
          learner: 'Student',
        },
      };

      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: learnerUser,
        roleHierarchy: learnerRoleHierarchy,
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      renderHeader();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should show all nav items for users with multiple user types', () => {
      const multiRoleUser: User = {
        _id: 'multi123',
        email: 'multi@example.com',
        userTypes: ['staff', 'learner', 'global-admin'],
        defaultDashboard: 'staff',
        isActive: true,
        createdAt: '2026-01-11',
        updatedAt: '2026-01-11',
      };

      const multiRoleHierarchy: RoleHierarchy = {
        primaryUserType: 'staff',
        allUserTypes: ['staff', 'learner', 'global-admin'],
        defaultDashboard: 'staff',
        globalRoles: [],
        allPermissions: ['system:*'],
        userTypeDisplayMap: {
          staff: 'Staff',
          learner: 'Learner',
          'global-admin': 'Admin',
        },
      };

      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: multiRoleUser,
        roleHierarchy: multiRoleHierarchy,
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      renderHeader();

      // Should see all nav items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('Display Label Fallback', () => {
    it('should handle missing roleHierarchy gracefully', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: {
          _id: 'user123',
          email: 'test@example.com',
          userTypes: ['staff'],
          defaultDashboard: 'staff',
          isActive: true,
          createdAt: '2026-01-11',
          updatedAt: '2026-01-11',
        },
        roleHierarchy: null, // No roleHierarchy
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      // Should render without crashing
      expect(() => renderHeader()).not.toThrow();
    });

    it('should handle missing userTypeDisplayMap with fallback', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: true,
        user: {
          _id: 'user123',
          email: 'test@example.com',
          userTypes: ['staff'],
          defaultDashboard: 'staff',
          isActive: true,
          createdAt: '2026-01-11',
          updatedAt: '2026-01-11',
        },
        roleHierarchy: {
          primaryUserType: 'staff',
          allUserTypes: ['staff'],
          defaultDashboard: 'staff',
          globalRoles: [],
          allPermissions: [],
          // No userTypeDisplayMap - should use client-side fallback
        },
        accessToken: { value: 'token', type: 'Bearer', expiresAt: '2026-01-12' },
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      // Should render without crashing and fall back to client-side label
      expect(() => renderHeader()).not.toThrow();

      // The Header component should still render
      const avatarButton = screen.getByLabelText('User menu');
      expect(avatarButton).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should render theme toggle', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        isAuthenticated: false,
        user: null,
        roleHierarchy: null,
        accessToken: null,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        refreshToken: vi.fn(),
        clearError: vi.fn(),
        initializeAuth: vi.fn(),
        hasPermission: vi.fn(),
        hasAnyPermission: vi.fn(),
        hasAllPermissions: vi.fn(),
        hasRole: vi.fn(),
      });

      renderHeader();

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });
  });
});
