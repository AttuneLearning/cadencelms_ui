/**
 * Tests for ThreadDetailPage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThreadDetailPage } from '../ThreadDetailPage';

// Mock hooks
vi.mock('@/entities/forum');

import { useThread, useCreateReply } from '@/entities/forum';
import type { ForumThread, ForumReply } from '@/entities/forum';

const createMockThread = (): ForumThread => ({
  id: 'thread1',
  courseId: 'course1',
  title: 'How to use React hooks?',
  body: 'I need help understanding React hooks.',
  author: { id: 'user1', firstName: 'John', lastName: 'Doe' },
  isPinned: false,
  isLocked: false,
  replyCount: 2,
  lastReplyAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createMockReply = (id: string, isInstructorAnswer = false): ForumReply => ({
  id,
  threadId: 'thread1',
  body: 'This is a reply',
  author: { id: 'user2', firstName: 'Jane', lastName: 'Smith', role: isInstructorAnswer ? 'Instructor' : undefined },
  isInstructorAnswer,
  parentReplyId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/learner/courses/:courseId/forum/:threadId" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ThreadDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/learner/courses/course1/forum/thread1');
  });

  it('should render thread title and body', () => {
    const thread = createMockThread();

    (useThread as any).mockReturnValue({
      data: { thread, replies: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateReply as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<ThreadDetailPage />, { wrapper: createWrapper() });

    expect(screen.getByText('How to use React hooks?')).toBeInTheDocument();
    expect(screen.getByText('I need help understanding React hooks.')).toBeInTheDocument();
  });

  it('should display replies', () => {
    const thread = createMockThread();
    const replies = [createMockReply('r1'), createMockReply('r2')];

    (useThread as any).mockReturnValue({
      data: { thread, replies },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateReply as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<ThreadDetailPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Replies (2)')).toBeInTheDocument();
  });

  it('should highlight instructor answers', () => {
    const thread = createMockThread();
    const replies = [createMockReply('r1', true)];

    (useThread as any).mockReturnValue({
      data: { thread, replies },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateReply as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<ThreadDetailPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Instructor Answer')).toBeInTheDocument();
  });

  it('should show locked message when thread is locked', () => {
    const thread = { ...createMockThread(), isLocked: true };

    (useThread as any).mockReturnValue({
      data: { thread, replies: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateReply as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<ThreadDetailPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/this thread is locked/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/write your reply/i)).not.toBeInTheDocument();
  });

  it('should allow posting reply when thread is not locked', async () => {
    const user = userEvent.setup();
    const thread = createMockThread();
    const mutateAsync = vi.fn().mockResolvedValue({});

    (useThread as any).mockReturnValue({
      data: { thread, replies: [] },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateReply as any).mockReturnValue({ mutateAsync, isPending: false });

    render(<ThreadDetailPage />, { wrapper: createWrapper() });

    const replyInput = screen.getByPlaceholderText(/write your reply/i);
    const postButton = screen.getByRole('button', { name: /post reply/i });

    await user.type(replyInput, 'This is my reply');
    await user.click(postButton);

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        threadId: 'thread1',
        body: 'This is my reply',
      });
    });
  });

  it('should show loading state', () => {
    (useThread as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateReply as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<ThreadDetailPage />, { wrapper: createWrapper() });

    // Thread details should not be visible while loading
    expect(screen.queryByText('How to use React hooks?')).not.toBeInTheDocument();
  });
});
