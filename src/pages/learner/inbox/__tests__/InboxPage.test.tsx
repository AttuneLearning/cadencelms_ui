/**
 * InboxPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { InboxPage } from '../InboxPage';
import * as messageEntity from '@/entities/message';
import type { MessagesListResponse, MessageListItem } from '@/entities/message';

// Mock the entity hooks
vi.mock('@/entities/message', async () => {
  const actual = await vi.importActual('@/entities/message');
  return {
    ...actual,
    useMessages: vi.fn(),
    useUnreadCount: vi.fn(),
    useMarkAsRead: vi.fn(),
    useArchiveMessages: vi.fn(),
    useDeleteMessage: vi.fn(),
  };
});

// Mock the ComposeMessageDialog
vi.mock('@/features/messaging', () => ({
  ComposeMessageDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="compose-dialog">Compose Dialog</div> : null,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const mockMessages: MessageListItem[] = [
  {
    id: 'msg-1',
    type: 'direct',
    subject: 'Welcome to the course',
    preview: 'This is a welcome message from your instructor...',
    sender: {
      id: 'staff-1',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Instructor',
    },
    status: 'unread',
    isImportant: true,
    createdAt: new Date().toISOString(),
    readAt: null,
  },
  {
    id: 'msg-2',
    type: 'announcement',
    subject: 'Class cancelled tomorrow',
    preview: 'Due to unforeseen circumstances, class is cancelled...',
    sender: {
      id: 'staff-2',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'Department Head',
    },
    status: 'read',
    isImportant: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readAt: new Date().toISOString(),
  },
  {
    id: 'msg-3',
    type: 'reminder',
    subject: 'Assignment due tomorrow',
    preview: 'Remember to submit your assignment by tomorrow...',
    sender: {
      id: 'system',
      firstName: 'System',
      lastName: 'Notification',
    },
    status: 'unread',
    isImportant: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    readAt: null,
  },
];

const mockMessagesResponse: MessagesListResponse = {
  messages: mockMessages,
  pagination: {
    page: 1,
    limit: 50,
    total: 3,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
  unreadCount: 2,
};

describe('InboxPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    vi.mocked(messageEntity.useMessages).mockReturnValue({
      data: mockMessagesResponse,
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(messageEntity.useUnreadCount).mockReturnValue({
      data: { total: 2, byType: { direct: 1, announcement: 0, reminder: 1, system: 0 } },
      isLoading: false,
      error: null,
    } as any);

    vi.mocked(messageEntity.useMarkAsRead).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ updatedCount: 1, messageIds: ['msg-1'] }),
      isPending: false,
    } as any);

    vi.mocked(messageEntity.useArchiveMessages).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({ archivedCount: 1, messageIds: ['msg-1'] }),
      isPending: false,
    } as any);

    vi.mocked(messageEntity.useDeleteMessage).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    } as any);
  });

  it('renders inbox page with header and tabs', () => {
    render(<InboxPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('2 unread messages')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /compose/i })).toBeInTheDocument();

    // Check tabs
    expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /announcements/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /reminders/i })).toBeInTheDocument();
  });

  it('displays list of messages', () => {
    render(<InboxPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Welcome to the course')).toBeInTheDocument();
    expect(screen.getByText('Class cancelled tomorrow')).toBeInTheDocument();
    expect(screen.getByText('Assignment due tomorrow')).toBeInTheDocument();
  });

  it('shows unread badge for unread messages', () => {
    render(<InboxPage />, { wrapper: createWrapper() });

    const unreadBadges = screen.getAllByText('New');
    expect(unreadBadges).toHaveLength(2); // msg-1 and msg-3 are unread
  });

  it('shows important badge for important messages', () => {
    render(<InboxPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Important')).toBeInTheDocument();
  });

  it('filters messages by tab', async () => {
    const user = userEvent.setup();
    render(<InboxPage />, { wrapper: createWrapper() });

    // Clear previous mock calls
    vi.clearAllMocks();

    // Click on Messages tab
    const messagesTab = screen.getByRole('tab', { name: /messages/i });
    await user.click(messagesTab);

    // Wait for re-render and check that useMessages was called with the new filter
    await waitFor(() => {
      const calls = vi.mocked(messageEntity.useMessages).mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall[0]).toMatchObject({ type: 'direct' });
    });
  });

  it('opens compose dialog when compose button is clicked', async () => {
    const user = userEvent.setup();
    render(<InboxPage />, { wrapper: createWrapper() });

    const composeButton = screen.getByRole('button', { name: /compose/i });
    await user.click(composeButton);

    expect(screen.getByTestId('compose-dialog')).toBeInTheDocument();
  });

  it('allows searching messages', async () => {
    const user = userEvent.setup();
    render(<InboxPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search messages/i);

    // Clear previous calls before typing
    vi.clearAllMocks();

    await user.type(searchInput, 'assignment');

    // Wait for the search to trigger
    await waitFor(() => {
      const calls = vi.mocked(messageEntity.useMessages).mock.calls;
      const hasSearchCall = calls.some(call => call[0]?.search === 'assignment');
      expect(hasSearchCall).toBe(true);
    });
  });

  it('shows loading state', () => {
    vi.mocked(messageEntity.useMessages).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    // Check for loader by class or just verify content is not shown
    expect(screen.queryByText('Welcome to the course')).not.toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(messageEntity.useMessages).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load messages'),
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to Load Messages')).toBeInTheDocument();
    expect(screen.getByText('Failed to load messages')).toBeInTheDocument();
  });

  it('shows empty state when no messages', () => {
    vi.mocked(messageEntity.useMessages).mockReturnValue({
      data: {
        messages: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        unreadCount: 0,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Inbox Empty')).toBeInTheDocument();
    expect(screen.getByText(/you have no messages/i)).toBeInTheDocument();
  });

  it('shows empty state for specific tab', async () => {
    const user = userEvent.setup();

    vi.mocked(messageEntity.useMessages).mockReturnValue({
      data: {
        messages: [],
        pagination: {
          page: 1,
          limit: 50,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        unreadCount: 0,
      },
      isLoading: false,
      error: null,
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    const announcementsTab = screen.getByRole('tab', { name: /announcements/i });
    await user.click(announcementsTab);

    expect(screen.getByText('No Announcements')).toBeInTheDocument();
  });

  it('allows selecting messages', async () => {
    const user = userEvent.setup();
    render(<InboxPage />, { wrapper: createWrapper() });

    const checkboxes = screen.getAllByRole('checkbox');
    // First checkbox is "Select all", second is first message
    await user.click(checkboxes[1]);

    expect(screen.getByText('1 selected')).toBeInTheDocument();
  });

  it('allows bulk mark as read', async () => {
    const user = userEvent.setup();
    const mockMarkAsRead = vi.fn().mockResolvedValue({ updatedCount: 1, messageIds: ['msg-1'] });

    vi.mocked(messageEntity.useMarkAsRead).mockReturnValue({
      mutateAsync: mockMarkAsRead,
      isPending: false,
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Select first message

    const markReadButton = screen.getByRole('button', { name: /mark read/i });
    await user.click(markReadButton);

    await waitFor(() => {
      expect(mockMarkAsRead).toHaveBeenCalledWith({ messageIds: ['msg-1'] });
    });
  });

  it('allows bulk archive', async () => {
    const user = userEvent.setup();
    const mockArchive = vi.fn().mockResolvedValue({ archivedCount: 1, messageIds: ['msg-1'] });

    vi.mocked(messageEntity.useArchiveMessages).mockReturnValue({
      mutateAsync: mockArchive,
      isPending: false,
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Select first message

    const archiveButton = screen.getByRole('button', { name: /archive/i });
    await user.click(archiveButton);

    await waitFor(() => {
      expect(mockArchive).toHaveBeenCalledWith({ messageIds: ['msg-1'] });
    });
  });

  it('allows bulk delete', async () => {
    const user = userEvent.setup();
    const mockDelete = vi.fn().mockResolvedValue(undefined);

    vi.mocked(messageEntity.useDeleteMessage).mockReturnValue({
      mutateAsync: mockDelete,
      isPending: false,
    } as any);

    render(<InboxPage />, { wrapper: createWrapper() });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // Select first message

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith('msg-1');
    });
  });
});
