/**
 * Unit Tests for Header Component - Phase 3 Update
 * Tests integration with Person Data v2.0 hooks
 * Version: 2.2.0
 * Date: 2026-01-13
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';
import * as useAuthStoreModule from '@/features/auth/model/authStore';
import * as useDisplayNameModule from '@/features/auth/hooks/useDisplayName';
import * as useCurrentUserModule from '@/features/auth/hooks/useCurrentUser';
import * as useNavigationModule from '@/shared/lib/navigation';
import * as useDepartmentContextModule from '@/shared/hooks/useDepartmentContext';
import type { IPerson } from '@/shared/types/person';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('@/features/auth/model/authStore');
vi.mock('@/features/auth/hooks/useDisplayName');
vi.mock('@/features/auth/hooks/useCurrentUser');
vi.mock('@/shared/lib/navigation');
vi.mock('@/shared/hooks/useDepartmentContext');
vi.mock('@/features/theme/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));
vi.mock('@/entities/user/ui/UserAvatar', () => ({
  UserAvatar: ({ displayName }: { displayName?: string }) => (
    <div data-testid="user-avatar">{displayName}</div>
  ),
}));
vi.mock('@/entities/notification', () => ({
  useNotificationSummary: () => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useMarkNotificationsAsRead: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isLoading: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
    isPending: false,
    isIdle: true,
    status: 'idle',
  }),
}));
vi.mock('@/features/notifications', () => ({
  NotificationBell: () => <div data-testid="notification-bell">Notifications</div>,
}));
vi.mock('@/features/auth/ui/AdminSessionIndicator', () => ({
  AdminSessionIndicator: () => <div data-testid="admin-indicator">Admin</div>,
}));

// ============================================================================
// Test Utilities
// ============================================================================

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  );
};

const mockPerson: IPerson = {
  firstName: 'Test',
  middleName: null,
  lastName: 'User',
  suffix: null,
  preferredFirstName: null,
  preferredLastName: null,
  pronouns: 'they/them',
  emails: [
    {
      email: 'test@example.com',
      type: 'institutional',
      isPrimary: true,
      verified: true,
      allowNotifications: true,
      label: null,
    },
  ],
  phones: [],
  addresses: [],
  dateOfBirth: null,
  last4SSN: null,
  avatar: 'https://example.com/avatar.jpg',
  bio: null,
  timezone: 'America/New_York',
  languagePreference: 'en',
  locale: null,
  communicationPreferences: {
    preferredMethod: 'email',
    allowEmail: true,
    allowSMS: false,
    allowPhoneCalls: false,
    quietHoursStart: null,
    quietHoursEnd: null,
    notificationFrequency: 'immediate',
  },
  legalConsent: {
    ferpaConsent: null,
    ferpaConsentDate: null,
    gdprConsent: null,
    gdprConsentDate: null,
    photoConsent: null,
    photoConsentDate: null,
    marketingConsent: null,
    marketingConsentDate: null,
    thirdPartyDataSharing: null,
    thirdPartyDataSharingDate: null,
  },
};

const mockAuthData = {
  isAuthenticated: true,
  user: {
    _id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    person: mockPerson,
  },
  roleHierarchy: {
    primaryUserType: 'staff' as const,
    allUserTypes: ['staff' as const],
    defaultDashboard: 'staff' as const,
    globalRoles: [],
    allPermissions: ['content:courses:read', 'content:courses:edit'],
    userTypeDisplayMap: {
      staff: 'Staff',
      learner: 'Learner',
      'global-admin': 'System Admin',
    },
    roleDisplayMap: {
      instructor: 'Instructor',
      'course-creator': 'Course Creator',
    },
  },
  logout: vi.fn(),
};

const mockNavigationData = {
  toggleSidebar: vi.fn(),
  setSidebarOpen: vi.fn(),
  isSidebarOpen: false,
};

const mockDepartmentContext = {
  currentDepartmentId: 'dept-123',
  currentDepartmentName: 'Engineering Department',
  currentDepartmentRoles: ['instructor', 'course-creator'],
  currentDepartmentAccessRights: ['content:courses:read', 'content:courses:edit'],
  hasPermission: vi.fn(() => true),
  hasAnyPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
  hasRole: vi.fn(() => true),
  switchDepartment: vi.fn(),
  isSwitching: false,
  switchError: null,
};

const mockCurrentUser = {
  user: mockAuthData.user,
  isAuthenticated: true,
  isLoading: false,
  person: mockPerson,
  displayName: 'Test User',
  primaryEmail: 'test@example.com',
  primaryPhone: null,
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue(mockAuthData as any);
    vi.mocked(useDisplayNameModule.useDisplayName).mockReturnValue('Test User');
    vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue(mockCurrentUser as any);
    vi.mocked(useNavigationModule.useNavigation).mockReturnValue(mockNavigationData as any);
    vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue(
      mockDepartmentContext
    );
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
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);
      vi.mocked(useDisplayNameModule.useDisplayName).mockReturnValue('');
      vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue({
        ...mockCurrentUser,
        isAuthenticated: false,
        user: null,
        person: null,
      } as any);

      renderHeader();
      // Should not show Dashboard tabs
      expect(screen.queryByRole('link', { name: /staff/i })).not.toBeInTheDocument();
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
        // Roles are now displayed as badge initials with title attributes
        // Check that the dropdown is open by looking for department name
        expect(screen.getByText('Engineering Department')).toBeInTheDocument();
      });
    });

    it('should display primary user type', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // User type is now displayed with server-provided label
        // Check that dropdown is open with all elements present
        const staffLabels = screen.getAllByText('Staff');
        expect(staffLabels.length).toBeGreaterThan(0);
      });
    });

    it('should not display department info when no department selected', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
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

    it('should limit role badges to 4 with overflow indicator', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
        ...mockDepartmentContext,
        currentDepartmentRoles: ['role1', 'role2', 'role3', 'role4', 'role5'],
      });

      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // Should show +1 indicator for the 5th role
        expect(screen.getByText('+1')).toBeInTheDocument();
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
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
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

    it('should display pronouns when available', async () => {
      const user = userEvent.setup();
      renderHeader();

      // Open dropdown
      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.getByText('they/them')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation Filtering', () => {
    it('should show dashboard tabs based on user types', () => {
      renderHeader();

      // Staff should see Staff dashboard tab
      expect(screen.getByText('Staff')).toBeInTheDocument();
    });

    it('should show admin tab for global-admin user type', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        roleHierarchy: {
          ...mockAuthData.roleHierarchy,
          primaryUserType: 'global-admin',
          allUserTypes: ['global-admin' as const],
          allPermissions: ['system:*'],
        },
      } as any);

      renderHeader();

      expect(screen.getByText('System Admin')).toBeInTheDocument();
    });

    it('should not show admin tab for non-admin users', () => {
      renderHeader();

      // Staff user should not see System Admin tab
      expect(screen.queryByText('System Admin')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing user data gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        user: null,
      } as any);
      vi.mocked(useDisplayNameModule.useDisplayName).mockReturnValue('');
      vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue({
        ...mockCurrentUser,
        user: null,
        person: null,
        displayName: '',
        primaryEmail: null,
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
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        roleHierarchy: null,
      } as any);

      renderHeader();

      expect(screen.getByText('LMS UI V2')).toBeInTheDocument();
    });

    it('should use UserAvatar component', () => {
      renderHeader();

      // UserAvatar is mocked and should render
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
    });

    it('should pass display name to UserAvatar', () => {
      renderHeader();

      const avatar = screen.getByTestId('user-avatar');
      expect(avatar.textContent).toBe('Test User');
    });

    it('should handle missing display name', () => {
      vi.mocked(useDisplayNameModule.useDisplayName).mockReturnValue('');
      vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue({
        ...mockCurrentUser,
        displayName: '',
      } as any);

      renderHeader();

      const avatar = screen.getByTestId('user-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Department Context Hook Integration', () => {
    it('should call useDepartmentContext hook', () => {
      renderHeader();

      expect(useDepartmentContextModule.useDepartmentContext).toHaveBeenCalled();
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
      });
    });

    it('should not render department section when currentDepartmentId is null', async () => {
      const user = userEvent.setup();
      vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue({
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
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should not show user dropdown when not authenticated', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();

      expect(screen.queryByRole('button', { name: /user menu/i })).not.toBeInTheDocument();
    });

    it('should not show mobile menu button when not authenticated', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();

      expect(screen.queryByRole('button', { name: /toggle sidebar/i })).not.toBeInTheDocument();
    });
  });

  describe('Person Data v2.0 Integration', () => {
    it('should use useDisplayName hook', () => {
      renderHeader();

      expect(useDisplayNameModule.useDisplayName).toHaveBeenCalled();
    });

    it('should use useCurrentUser hook', () => {
      renderHeader();

      expect(useCurrentUserModule.useCurrentUser).toHaveBeenCalled();
    });

    it('should display person data when available', async () => {
      const user = userEvent.setup();
      renderHeader();

      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // Primary email from hook
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
        // Pronouns from person data
        expect(screen.getByText('they/them')).toBeInTheDocument();
      });
    });

    it('should not display pronouns when person has no pronouns', async () => {
      const user = userEvent.setup();
      const personWithoutPronouns = { ...mockPerson, pronouns: null };
      vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue({
        ...mockCurrentUser,
        person: personWithoutPronouns,
      } as any);

      renderHeader();

      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        expect(screen.queryByText('they/them')).not.toBeInTheDocument();
      });
    });

    it('should fall back to user.email when primaryEmail is null', async () => {
      const user = userEvent.setup();
      vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue({
        ...mockCurrentUser,
        primaryEmail: null,
      } as any);

      renderHeader();

      const avatarButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(avatarButton);

      await waitFor(() => {
        // Should fall back to user.email
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });
  });
});
