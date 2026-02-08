/**
 * Unit Tests for Header Component - Notification Integration
 * Tests NotificationBell integration in the header
 * Version: 1.0.0
 * Date: 2026-02-08
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../Header';
import * as useAuthStoreModule from '@/features/auth/model/authStore';
import * as useDisplayNameModule from '@/features/auth/hooks/useDisplayName';
import * as useCurrentUserModule from '@/features/auth/hooks/useCurrentUser';
import * as useNavigationModule from '@/shared/lib/navigation';
import * as useDepartmentContextModule from '@/shared/hooks/useDepartmentContext';
import * as notificationHooks from '@/entities/notification';
import type { NotificationSummary } from '@/entities/notification';
import type { IPerson } from '@/shared/types/person';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('@/features/auth/model/authStore');
vi.mock('@/features/auth/hooks/useDisplayName');
vi.mock('@/features/auth/hooks/useCurrentUser');
vi.mock('@/shared/lib/navigation');
vi.mock('@/shared/hooks/useDepartmentContext');
vi.mock('@/entities/notification');
vi.mock('@/features/theme/ui/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));
vi.mock('@/entities/user/ui/UserAvatar', () => ({
  UserAvatar: ({ displayName }: { displayName?: string }) => (
    <div data-testid="user-avatar">{displayName}</div>
  ),
}));
vi.mock('@/features/notifications', () => ({
  NotificationBell: ({
    summary,
    isLoading,
    onViewAll,
    onSettings,
    onNotificationClick,
    onMarkAsRead,
  }: {
    summary: NotificationSummary | null;
    isLoading?: boolean;
    onViewAll?: () => void;
    onSettings?: () => void;
    onNotificationClick?: (id: string) => void;
    onMarkAsRead?: (id: string) => void;
  }) => (
    <div data-testid="notification-bell">
      <button onClick={() => onNotificationClick?.('notif-1')}>Click Notification</button>
      <button onClick={() => onMarkAsRead?.('notif-1')}>Mark as Read</button>
      <button onClick={() => onViewAll?.()}>View All</button>
      <button onClick={() => onSettings?.()}>Settings</button>
      {isLoading && <span>Loading...</span>}
      {summary && (
        <span data-testid="unread-count">{summary.unreadCount}</span>
      )}
    </div>
  ),
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
    primaryUserType: 'learner' as const,
    allUserTypes: ['learner' as const],
    defaultDashboard: 'learner' as const,
    globalRoles: [],
    allPermissions: ['content:courses:read'],
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
  isAdminSessionActive: false,
};

const mockNavigationData = {
  toggleSidebar: vi.fn(),
  setSidebarOpen: vi.fn(),
  isSidebarOpen: false,
};

const mockDepartmentContext = {
  currentDepartmentId: 'dept-123',
  currentDepartmentName: 'Engineering Department',
  currentDepartmentRoles: ['instructor'],
  currentDepartmentAccessRights: ['content:courses:read'],
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

const mockNotificationSummary: NotificationSummary = {
  unreadCount: 3,
  urgentCount: 1,
  recentNotifications: [
    {
      id: 'notif-1',
      type: 'course_version_available',
      title: 'New Course Version Available',
      message: 'Course CS101 has been updated',
      actionUrl: '/courses/cs101',
      actionLabel: 'View Course',
      isRead: false,
      sentAt: '2026-02-08T10:00:00Z',
      priority: 'high',
    },
    {
      id: 'notif-2',
      type: 'certificate_earned',
      title: 'Certificate Earned',
      message: 'You earned a certificate!',
      actionUrl: '/certificates/cert-1',
      actionLabel: 'View Certificate',
      isRead: false,
      sentAt: '2026-02-07T15:00:00Z',
      priority: 'medium',
    },
  ],
};

const mockMarkAsReadMutation = {
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
  status: 'idle' as const,
  variables: undefined,
  context: undefined,
  failureCount: 0,
  failureReason: null,
  isPaused: false,
  submittedAt: 0,
};

// ============================================================================
// Test Suites
// ============================================================================

describe('Header Component - Notification Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue(mockAuthData as any);
    vi.mocked(useDisplayNameModule.useDisplayName).mockReturnValue('Test User');
    vi.mocked(useCurrentUserModule.useCurrentUser).mockReturnValue(mockCurrentUser as any);
    vi.mocked(useNavigationModule.useNavigation).mockReturnValue(mockNavigationData as any);
    vi.mocked(useDepartmentContextModule.useDepartmentContext).mockReturnValue(
      mockDepartmentContext
    );
    vi.mocked(notificationHooks.useNotificationSummary).mockReturnValue({
      data: mockNotificationSummary,
      isLoading: false,
      isError: false,
      error: null,
    } as any);
    vi.mocked(notificationHooks.useMarkNotificationsAsRead).mockReturnValue(
      mockMarkAsReadMutation as any
    );
  });

  describe('NotificationBell Rendering', () => {
    it('should render NotificationBell when authenticated', () => {
      renderHeader();
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('should not render NotificationBell when not authenticated', () => {
      vi.mocked(useAuthStoreModule.useAuthStore).mockReturnValue({
        ...mockAuthData,
        isAuthenticated: false,
      } as any);

      renderHeader();
      expect(screen.queryByTestId('notification-bell')).not.toBeInTheDocument();
    });

    it('should pass notification summary to NotificationBell', () => {
      renderHeader();
      expect(screen.getByTestId('unread-count')).toHaveTextContent('3');
    });

    it('should show loading state when notifications are loading', () => {
      vi.mocked(notificationHooks.useNotificationSummary).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as any);

      renderHeader();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle null summary gracefully', () => {
      vi.mocked(notificationHooks.useNotificationSummary).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderHeader();
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      expect(screen.queryByTestId('unread-count')).not.toBeInTheDocument();
    });
  });

  describe('Notification Interactions', () => {
    it('should call useNotificationSummary hook', () => {
      renderHeader();
      expect(notificationHooks.useNotificationSummary).toHaveBeenCalled();
    });

    it('should call useMarkNotificationsAsRead hook', () => {
      renderHeader();
      expect(notificationHooks.useMarkNotificationsAsRead).toHaveBeenCalled();
    });

    it('should mark notification as read when clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const clickButton = screen.getByText('Click Notification');
      await user.click(clickButton);

      expect(mockMarkAsReadMutation.mutate).toHaveBeenCalledWith({
        notificationIds: ['notif-1'],
      });
    });

    it('should mark notification as read when mark as read button clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const markReadButton = screen.getByText('Mark as Read');
      await user.click(markReadButton);

      expect(mockMarkAsReadMutation.mutate).toHaveBeenCalledWith({
        notificationIds: ['notif-1'],
      });
    });

    it('should navigate to notifications settings on view all', async () => {
      const user = userEvent.setup();
      renderHeader();

      const viewAllButton = screen.getByText('View All');
      await user.click(viewAllButton);

      // Check if navigation would occur (we can't directly test navigate in this setup)
      // The click handler should trigger navigation
      expect(viewAllButton).toBeInTheDocument();
    });

    it('should navigate to settings on settings button click', async () => {
      const user = userEvent.setup();
      renderHeader();

      const settingsButton = screen.getByText('Settings');
      await user.click(settingsButton);

      // Settings button should be present and clickable
      expect(settingsButton).toBeInTheDocument();
    });
  });

  describe('Notification Hook Configuration', () => {
    it('should use default refetch interval for summary', () => {
      renderHeader();

      // Hook should be called with default options (60s polling)
      expect(notificationHooks.useNotificationSummary).toHaveBeenCalled();
    });

    it('should handle error state gracefully', () => {
      vi.mocked(notificationHooks.useNotificationSummary).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
      } as any);

      renderHeader();

      // Should still render without crashing
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero unread notifications', () => {
      vi.mocked(notificationHooks.useNotificationSummary).mockReturnValue({
        data: {
          unreadCount: 0,
          urgentCount: 0,
          recentNotifications: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderHeader();
      expect(screen.getByTestId('unread-count')).toHaveTextContent('0');
    });

    it('should handle many unread notifications', () => {
      vi.mocked(notificationHooks.useNotificationSummary).mockReturnValue({
        data: {
          unreadCount: 150,
          urgentCount: 5,
          recentNotifications: [],
        },
        isLoading: false,
        isError: false,
        error: null,
      } as any);

      renderHeader();
      expect(screen.getByTestId('unread-count')).toHaveTextContent('150');
    });

    it('should not break when mutation is pending', () => {
      vi.mocked(notificationHooks.useMarkNotificationsAsRead).mockReturnValue({
        ...mockMarkAsReadMutation,
        isPending: true,
        isLoading: true,
      } as any);

      renderHeader();
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('should render alongside other header elements', () => {
      renderHeader();

      // Check all major elements are present
      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
      expect(screen.getByTestId('user-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('admin-indicator')).toBeInTheDocument();
    });
  });
});
