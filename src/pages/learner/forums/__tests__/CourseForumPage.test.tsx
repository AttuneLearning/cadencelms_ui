/**
 * Tests for CourseForumPage
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseForumPage } from '../CourseForumPage';

// Mock hooks
vi.mock('@/entities/forum');

import { useCourseThreads, useCreateThread } from '@/entities/forum';
import type { ForumThreadListItem } from '@/entities/forum';

const createMockThread = (id: string, title: string, overrides?: Partial<ForumThreadListItem>): ForumThreadListItem => ({
  id,
  courseId: 'course1',
  title,
  author: { id: 'user1', firstName: 'John', lastName: 'Doe' },
  isPinned: false,
  isLocked: false,
  replyCount: 0,
  lastReplyAt: null,
  createdAt: new Date().toISOString(),
  ...overrides,
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
          <Route path="/learner/courses/:courseId/forum" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CourseForumPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/learner/courses/course1/forum');
  });

  it('should render page title', () => {
    (useCourseThreads as any).mockReturnValue({
      data: { threads: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateThread as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<CourseForumPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Course Forum')).toBeInTheDocument();
  });

  it('should display thread list', () => {
    const threads = [
      createMockThread('t1', 'Thread 1'),
      createMockThread('t2', 'Thread 2'),
    ];

    (useCourseThreads as any).mockReturnValue({
      data: { threads, pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateThread as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<CourseForumPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Thread 1')).toBeInTheDocument();
    expect(screen.getByText('Thread 2')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    (useCourseThreads as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateThread as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<CourseForumPage />, { wrapper: createWrapper() });

    // Should not show the empty state text
    expect(screen.queryByText('No threads yet')).not.toBeInTheDocument();
  });

  it('should show empty state when no threads', () => {
    (useCourseThreads as any).mockReturnValue({
      data: { threads: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateThread as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<CourseForumPage />, { wrapper: createWrapper() });

    expect(screen.getByText('No threads yet')).toBeInTheDocument();
  });

  it('should open create thread dialog when clicking new thread button', async () => {
    const user = userEvent.setup();

    (useCourseThreads as any).mockReturnValue({
      data: { threads: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateThread as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<CourseForumPage />, { wrapper: createWrapper() });

    const newThreadButton = screen.getByRole('button', { name: /new thread/i });
    await user.click(newThreadButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Thread')).toBeInTheDocument();
    });
  });

  it('should have search input', async () => {
    const user = userEvent.setup();
    const threads = [
      createMockThread('t1', 'React basics'),
      createMockThread('t2', 'Vue tutorial'),
    ];

    (useCourseThreads as any).mockReturnValue({
      data: { threads, pagination: { page: 1, limit: 20, total: 2, totalPages: 1, hasNext: false, hasPrev: false } },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    (useCreateThread as any).mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

    render(<CourseForumPage />, { wrapper: createWrapper() });

    const searchInput = screen.getByPlaceholderText(/search threads/i);
    expect(searchInput).toBeInTheDocument();

    await user.type(searchInput, 'react');
    expect(searchInput).toHaveValue('react');
  });
});
