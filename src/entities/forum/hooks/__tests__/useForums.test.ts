/**
 * Tests for Forum React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  useThreads,
  useCourseThreads,
  useThread,
  useCreateThread,
  useUpdateThread,
  useDeleteThread,
  useCreateReply,
  useUpdateReply,
  useDeleteReply,
} from '../useForums';
import type {
  ThreadsListResponse,
  ThreadDetailResponse,
  ForumThread,
  ForumReply,
  ForumThreadListItem,
} from '../../model/types';

describe('Forum Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Mock data
  const mockThreadListItem: ForumThreadListItem = {
    id: 'thread-1',
    courseId: 'course-1',
    title: 'How to solve exercise 3?',
    author: {
      id: 'user-1',
      firstName: 'Jane',
      lastName: 'Smith',
    },
    isPinned: false,
    isLocked: false,
    replyCount: 2,
    lastReplyAt: '2026-02-08T10:00:00Z',
    createdAt: '2026-02-07T08:00:00Z',
  };

  const mockThread: ForumThread = {
    id: 'thread-1',
    courseId: 'course-1',
    title: 'How to solve exercise 3?',
    body: 'I am stuck on exercise 3. Can anyone help?',
    author: {
      id: 'user-1',
      firstName: 'Jane',
      lastName: 'Smith',
    },
    isPinned: false,
    isLocked: false,
    replyCount: 2,
    lastReplyAt: '2026-02-08T10:00:00Z',
    createdAt: '2026-02-07T08:00:00Z',
    updatedAt: '2026-02-07T08:00:00Z',
  };

  const mockReply: ForumReply = {
    id: 'reply-1',
    threadId: 'thread-1',
    body: 'Try checking the documentation for chapter 3.',
    author: {
      id: 'user-2',
      firstName: 'Bob',
      lastName: 'Jones',
    },
    isInstructorAnswer: false,
    parentReplyId: null,
    createdAt: '2026-02-08T09:00:00Z',
    updatedAt: '2026-02-08T09:00:00Z',
  };

  const mockThreadsListResponse: ThreadsListResponse = {
    threads: [mockThreadListItem],
    pagination: {
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  const mockThreadDetailResponse: ThreadDetailResponse = {
    thread: mockThread,
    replies: [mockReply],
  };

  // =====================
  // QUERY HOOKS
  // =====================

  describe('useThreads', () => {
    it('should fetch threads list', async () => {
      server.use(
        http.get(`${baseUrl}/forum/threads`, () => {
          return HttpResponse.json({
            success: true,
            data: mockThreadsListResponse,
          });
        })
      );

      const { result } = renderHook(() => useThreads());

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockThreadsListResponse);
      expect(result.current.data?.threads).toHaveLength(1);
    });

    it('should fetch threads with filters', async () => {
      server.use(
        http.get(`${baseUrl}/forum/threads`, () => {
          return HttpResponse.json({
            success: true,
            data: mockThreadsListResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useThreads({ courseId: 'course-1', sort: 'newest' })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.threads).toHaveLength(1);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/forum/threads`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useThreads());

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useCourseThreads', () => {
    it('should fetch threads for a specific course', async () => {
      server.use(
        http.get(`${baseUrl}/forum/threads`, () => {
          return HttpResponse.json({
            success: true,
            data: mockThreadsListResponse,
          });
        })
      );

      const { result } = renderHook(() => useCourseThreads('course-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.threads).toHaveLength(1);
    });

    it('should not fetch when courseId is empty', () => {
      const { result } = renderHook(() => useCourseThreads(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  describe('useThread', () => {
    it('should fetch single thread with replies', async () => {
      server.use(
        http.get(`${baseUrl}/forum/threads/thread-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockThreadDetailResponse,
          });
        })
      );

      const { result } = renderHook(() => useThread('thread-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.thread).toEqual(mockThread);
      expect(result.current.data?.replies).toHaveLength(1);
    });

    it('should not fetch when threadId is empty', () => {
      const { result } = renderHook(() => useThread(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });
  });

  // =====================
  // MUTATION HOOKS - THREADS
  // =====================

  describe('useCreateThread', () => {
    it('should create a new thread', async () => {
      server.use(
        http.post(`${baseUrl}/forum/threads`, () => {
          return HttpResponse.json({
            success: true,
            data: { thread: mockThread },
          });
        })
      );

      const { result } = renderHook(() => useCreateThread());

      act(() => {
        result.current.mutate({
          courseId: 'course-1',
          title: 'How to solve exercise 3?',
          body: 'I am stuck on exercise 3.',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockThread);
    });
  });

  describe('useUpdateThread', () => {
    it('should update a thread', async () => {
      const updatedThread = { ...mockThread, title: 'Updated title' };

      server.use(
        http.patch(`${baseUrl}/forum/threads/thread-1`, () => {
          return HttpResponse.json({
            success: true,
            data: { thread: updatedThread },
          });
        })
      );

      const { result } = renderHook(() => useUpdateThread());

      act(() => {
        result.current.mutate({
          id: 'thread-1',
          payload: { title: 'Updated title' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.title).toBe('Updated title');
    });
  });

  describe('useDeleteThread', () => {
    it('should delete a thread', async () => {
      server.use(
        http.delete(`${baseUrl}/forum/threads/thread-1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useDeleteThread());

      act(() => {
        result.current.mutate('thread-1');
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  // =====================
  // MUTATION HOOKS - REPLIES
  // =====================

  describe('useCreateReply', () => {
    it('should create a new reply', async () => {
      server.use(
        http.post(`${baseUrl}/forum/replies`, () => {
          return HttpResponse.json({
            success: true,
            data: { reply: mockReply },
          });
        })
      );

      const { result } = renderHook(() => useCreateReply());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          body: 'Try checking the documentation for chapter 3.',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReply);
    });
  });

  describe('useUpdateReply', () => {
    it('should update a reply', async () => {
      const updatedReply = { ...mockReply, body: 'Updated reply body' };

      server.use(
        http.patch(`${baseUrl}/forum/replies/reply-1`, () => {
          return HttpResponse.json({
            success: true,
            data: { reply: updatedReply },
          });
        })
      );

      const { result } = renderHook(() => useUpdateReply());

      act(() => {
        result.current.mutate({
          id: 'reply-1',
          payload: { body: 'Updated reply body' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.body).toBe('Updated reply body');
    });
  });

  describe('useDeleteReply', () => {
    it('should delete a reply', async () => {
      server.use(
        http.delete(`${baseUrl}/forum/replies/reply-1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useDeleteReply());

      act(() => {
        result.current.mutate({ id: 'reply-1', threadId: 'thread-1' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
