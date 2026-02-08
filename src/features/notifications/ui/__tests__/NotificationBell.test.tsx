/**
 * NotificationBell Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import type { NotificationSummary, NotificationListItem } from '@/entities/notification';

// Mock NotificationItem to simplify testing the bell
vi.mock('../NotificationItem', () => ({
  NotificationItem: ({ notification, onClick, onMarkAsRead }: any) => (
    <div data-testid={`notification-${notification.id}`} onClick={onClick}>
      <span>{notification.title}</span>
      <button onClick={(e) => { e.stopPropagation(); onMarkAsRead?.(); }}>
        Mark read
      </button>
    </div>
  ),
}));

const mockNotifications: NotificationListItem[] = [
  {
    id: 'notif-1',
    type: 'certificate_earned',
    title: 'Certificate Earned',
    message: 'You earned a certificate',
    actionUrl: '/certificates/cert-1',
    actionLabel: 'View Certificate',
    isRead: false,
    sentAt: '2024-06-15T10:00:00Z',
    priority: 'medium',
  },
  {
    id: 'notif-2',
    type: 'access_expiring_soon',
    title: 'Access Expiring Soon',
    message: 'Your access expires in 7 days',
    actionUrl: null,
    actionLabel: null,
    isRead: true,
    sentAt: '2024-06-14T09:00:00Z',
    priority: 'high',
  },
  {
    id: 'notif-3',
    type: 'course_version_available',
    title: 'New Course Version',
    message: 'A new version of React 101 is available',
    actionUrl: '/courses/react-101',
    actionLabel: 'View Course',
    isRead: false,
    sentAt: '2024-06-13T08:00:00Z',
    priority: 'low',
  },
];

const mockSummaryWithUnread: NotificationSummary = {
  unreadCount: 5,
  urgentCount: 0,
  recentNotifications: mockNotifications,
};

const mockSummaryEmpty: NotificationSummary = {
  unreadCount: 0,
  urgentCount: 0,
  recentNotifications: [],
};

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders bell button', () => {
    render(<NotificationBell summary={null} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows unread count badge when there are unread notifications', () => {
    render(<NotificationBell summary={mockSummaryWithUnread} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows 99+ when unread count exceeds 99', () => {
    const summary: NotificationSummary = {
      unreadCount: 150,
      urgentCount: 0,
      recentNotifications: [],
    };

    render(<NotificationBell summary={summary} />);

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not show badge when there are no unread notifications', () => {
    render(<NotificationBell summary={mockSummaryEmpty} />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows popover with notifications on click', () => {
    render(<NotificationBell summary={mockSummaryWithUnread} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Certificate Earned')).toBeInTheDocument();
    expect(screen.getByText('Access Expiring Soon')).toBeInTheDocument();
    expect(screen.getByText('New Course Version')).toBeInTheDocument();
  });

  it('shows loading state in popover', () => {
    render(<NotificationBell summary={null} isLoading={true} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationBell summary={mockSummaryEmpty} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('shows empty state when summary is null', () => {
    render(<NotificationBell summary={null} />);

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  it('calls onNotificationClick when a notification is clicked', () => {
    const mockOnNotificationClick = vi.fn();

    render(
      <NotificationBell
        summary={mockSummaryWithUnread}
        onNotificationClick={mockOnNotificationClick}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByTestId('notification-notif-1'));

    expect(mockOnNotificationClick).toHaveBeenCalledWith('notif-1', '/certificates/cert-1');
  });

  it('calls onMarkAsRead when mark read is triggered', () => {
    const mockOnMarkAsRead = vi.fn();

    render(
      <NotificationBell
        summary={mockSummaryWithUnread}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    const markReadButtons = screen.getAllByText('Mark read');
    fireEvent.click(markReadButtons[0]);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('notif-1');
  });

  it('shows View All Notifications button and calls onViewAll', () => {
    const mockOnViewAll = vi.fn();

    render(
      <NotificationBell
        summary={mockSummaryWithUnread}
        onViewAll={mockOnViewAll}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    const viewAllButton = screen.getByRole('button', { name: /view all notifications/i });
    expect(viewAllButton).toBeInTheDocument();

    fireEvent.click(viewAllButton);
    expect(mockOnViewAll).toHaveBeenCalled();
  });

  it('shows settings button when onSettings provided', () => {
    const mockOnSettings = vi.fn();

    render(
      <NotificationBell
        summary={mockSummaryWithUnread}
        onSettings={mockOnSettings}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    // Settings button is the small gear icon button inside the popover header
    const buttons = screen.getAllByRole('button');
    // Find the settings button (it should be inside the popover)
    const settingsButton = buttons.find(btn =>
      btn.classList.contains('h-8') && btn.classList.contains('w-8')
    );
    expect(settingsButton).toBeDefined();
  });

  it('does not show settings button when onSettings not provided', () => {
    render(<NotificationBell summary={mockSummaryWithUnread} />);

    fireEvent.click(screen.getByRole('button'));

    // All buttons: the trigger, view all, and the mark read buttons from notification items
    // Settings button should not be present
    const buttons = screen.getAllByRole('button');
    const settingsButton = buttons.find(btn =>
      btn.classList.contains('h-8') && btn.classList.contains('w-8')
    );
    expect(settingsButton).toBeUndefined();
  });
});
