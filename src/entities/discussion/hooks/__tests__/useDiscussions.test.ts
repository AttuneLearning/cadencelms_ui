/**
 * Tests for Discussion React Query Hooks
 * Covers thread and reply query/mutation hooks (API-ISS-028)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { renderHook } from '@/test/utils/renderHook';
import {
  useThreads,
  useThread,
  useSearchThreads,
  useReplies,
  useCreateThread,
  useUpdateThread,
  useDeleteThread,
  usePinThread,
  useLockThread,
  useCreateReply,
  useUpdateReply,
  useDeleteReply,
  useMarkAsAnswer,
} from '../useDiscussions';
import type {
  DiscussionThread,
  DiscussionReply,
  ListThreadsResponse,
  ListRepliesResponse,
  AuthorRef,
} from '../../model/types';

describe('Discussion Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================
  // MOCK DATA
  // =====================

  const mockAuthor: AuthorRef = {
    _id: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@lms.edu',
  };

  const mockReplyAuthor: AuthorRef = {
    _id: 'user-2',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@lms.edu',
  };

  const mockThread: DiscussionThread = {
    _id: 'thread-1',
    courseId: 'course-1',
    moduleId: 'mod-1',
    lessonId: 'lesson-1',
    authorId: mockAuthor,
    authorType: 'learner',
    title: 'Question about Module 1',
    body: 'I have a question about the first exercise.',
    isPinned: false,
    isLocked: false,
    replyCount: 2,
    lastReplyAt: '2026-02-08T15:00:00Z',
    lastReplyBy: mockReplyAuthor,
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-02-08T10:00:00Z',
  };

  const mockThread2: DiscussionThread = {
    _id: 'thread-2',
    courseId: 'course-1',
    authorId: mockReplyAuthor,
    authorType: 'staff',
    title: 'Welcome to the Course',
    body: 'Please introduce yourselves here.',
    isPinned: true,
    isLocked: false,
    replyCount: 10,
    lastReplyAt: '2026-02-09T08:00:00Z',
    lastReplyBy: mockAuthor,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-02-01T09:00:00Z',
  };

  const mockReply: DiscussionReply = {
    _id: 'reply-1',
    threadId: 'thread-1',
    authorId: mockReplyAuthor,
    authorType: 'staff',
    body: 'Great question! Let me explain...',
    isInstructorAnswer: true,
    isDeleted: false,
    createdAt: '2026-02-08T12:00:00Z',
    updatedAt: '2026-02-08T12:00:00Z',
  };

  const mockReply2: DiscussionReply = {
    _id: 'reply-2',
    threadId: 'thread-1',
    authorId: mockAuthor,
    authorType: 'learner',
    body: 'Thank you, that helps!',
    parentReplyId: 'reply-1',
    isInstructorAnswer: false,
    isDeleted: false,
    createdAt: '2026-02-08T15:00:00Z',
    updatedAt: '2026-02-08T15:00:00Z',
  };

  const mockListThreadsResponse: ListThreadsResponse = {
    threads: [mockThread, mockThread2],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  };

  const mockListRepliesResponse: ListRepliesResponse = {
    replies: [mockReply, mockReply2],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  };

  // =====================
  // QUERY HOOKS - THREADS
  // =====================

  describe('useThreads', () => {
    it('should fetch threads for a course', async () => {
      server.use(
        http.get(`${baseUrl}/courses/course-1/discussions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListThreadsResponse,
          });
        })
      );

      const { result } = renderHook(() => useThreads('course-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockListThreadsResponse);
      expect(result.current.data?.threads).toHaveLength(2);
    });

    it('should fetch threads with params', async () => {
      server.use(
        http.get(`${baseUrl}/courses/course-1/discussions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListThreadsResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useThreads('course-1', { page: 1, limit: 10, moduleId: 'mod-1' })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.threads).toHaveLength(2);
    });

    it('should not fetch when courseId is empty', () => {
      const { result } = renderHook(() => useThreads(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/courses/course-1/discussions`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useThreads('course-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useThread', () => {
    it('should fetch a single thread by id', async () => {
      server.use(
        http.get(`${baseUrl}/discussions/thread-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockThread,
          });
        })
      );

      const { result } = renderHook(() => useThread('thread-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockThread);
      expect(result.current.data?._id).toBe('thread-1');
      expect(result.current.data?.title).toBe('Question about Module 1');
    });

    it('should not fetch when threadId is empty', () => {
      const { result } = renderHook(() => useThread(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/discussions/thread-999`, () => {
          return HttpResponse.json(
            { success: false, message: 'Thread not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useThread('thread-999'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useSearchThreads', () => {
    it('should search threads within a course', async () => {
      const searchResponse: ListThreadsResponse = {
        threads: [mockThread],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses/course-1/discussions/search`, () => {
          return HttpResponse.json({
            success: true,
            data: searchResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useSearchThreads('course-1', { q: 'Module 1' })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.threads).toHaveLength(1);
      expect(result.current.data?.threads[0].title).toBe('Question about Module 1');
    });

    it('should search with pagination params', async () => {
      server.use(
        http.get(`${baseUrl}/courses/course-1/discussions/search`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListThreadsResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useSearchThreads('course-1', { q: 'test', page: 2, limit: 5 })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should not fetch when courseId is empty', () => {
      const { result } = renderHook(() =>
        useSearchThreads('', { q: 'test' })
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should not fetch when query string is empty', () => {
      const { result } = renderHook(() =>
        useSearchThreads('course-1', { q: '' })
      );

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/courses/course-1/discussions/search`, () => {
          return HttpResponse.json(
            { success: false, message: 'Search failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() =>
        useSearchThreads('course-1', { q: 'test' })
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =====================
  // QUERY HOOKS - REPLIES
  // =====================

  describe('useReplies', () => {
    it('should fetch replies for a thread', async () => {
      server.use(
        http.get(`${baseUrl}/discussions/thread-1/replies`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListRepliesResponse,
          });
        })
      );

      const { result } = renderHook(() => useReplies('thread-1'));

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.replies).toHaveLength(2);
      expect(result.current.data?.replies[0]._id).toBe('reply-1');
    });

    it('should fetch replies with pagination params', async () => {
      server.use(
        http.get(`${baseUrl}/discussions/thread-1/replies`, () => {
          return HttpResponse.json({
            success: true,
            data: mockListRepliesResponse,
          });
        })
      );

      const { result } = renderHook(() =>
        useReplies('thread-1', { page: 1, limit: 50 })
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should not fetch when threadId is empty', () => {
      const { result } = renderHook(() => useReplies(''));

      expect(result.current.isPending).toBe(true);
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/discussions/thread-1/replies`, () => {
          return HttpResponse.json(
            { success: false, message: 'Failed' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useReplies('thread-1'));

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =====================
  // MUTATION HOOKS - THREADS
  // =====================

  describe('useCreateThread', () => {
    it('should create a new thread', async () => {
      const newThread: DiscussionThread = {
        ...mockThread,
        _id: 'thread-new',
        title: 'New Discussion',
        body: 'This is a new discussion thread.',
        replyCount: 0,
        lastReplyAt: null,
        lastReplyBy: null,
      };

      server.use(
        http.post(`${baseUrl}/courses/course-1/discussions`, () => {
          return HttpResponse.json({
            success: true,
            data: newThread,
          });
        })
      );

      const { result } = renderHook(() => useCreateThread());

      act(() => {
        result.current.mutate({
          courseId: 'course-1',
          data: {
            title: 'New Discussion',
            body: 'This is a new discussion thread.',
            moduleId: 'mod-1',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newThread);
      expect(result.current.data?._id).toBe('thread-new');
    });

    it('should handle creation error', async () => {
      server.use(
        http.post(`${baseUrl}/courses/course-1/discussions`, () => {
          return HttpResponse.json(
            { success: false, message: 'Validation failed' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useCreateThread());

      act(() => {
        result.current.mutate({
          courseId: 'course-1',
          data: {
            title: '',
            body: '',
          },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateThread', () => {
    it('should update a thread', async () => {
      const updatedThread: DiscussionThread = {
        ...mockThread,
        title: 'Updated Title',
        body: 'Updated body content.',
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/discussions/thread-1`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedThread,
          });
        })
      );

      const { result } = renderHook(() => useUpdateThread());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { title: 'Updated Title', body: 'Updated body content.' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.title).toBe('Updated Title');
      expect(result.current.data?.body).toBe('Updated body content.');
    });

    it('should handle update error', async () => {
      server.use(
        http.put(`${baseUrl}/discussions/thread-1`, () => {
          return HttpResponse.json(
            { success: false, message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useUpdateThread());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { title: 'Nope' },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useDeleteThread', () => {
    it('should delete a thread', async () => {
      server.use(
        http.delete(`${baseUrl}/discussions/thread-1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useDeleteThread());

      act(() => {
        result.current.mutate({ threadId: 'thread-1', courseId: 'course-1' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle delete error', async () => {
      server.use(
        http.delete(`${baseUrl}/discussions/thread-999`, () => {
          return HttpResponse.json(
            { success: false, message: 'Thread not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteThread());

      act(() => {
        result.current.mutate({ threadId: 'thread-999', courseId: 'course-1' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('usePinThread', () => {
    it('should pin a thread', async () => {
      const pinnedThread: DiscussionThread = {
        ...mockThread,
        isPinned: true,
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/discussions/thread-1/pin`, () => {
          return HttpResponse.json({
            success: true,
            data: pinnedThread,
          });
        })
      );

      const { result } = renderHook(() => usePinThread());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { isPinned: true },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isPinned).toBe(true);
    });

    it('should unpin a thread', async () => {
      const unpinnedThread: DiscussionThread = {
        ...mockThread2,
        isPinned: false,
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/discussions/thread-2/pin`, () => {
          return HttpResponse.json({
            success: true,
            data: unpinnedThread,
          });
        })
      );

      const { result } = renderHook(() => usePinThread());

      act(() => {
        result.current.mutate({
          threadId: 'thread-2',
          data: { isPinned: false },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isPinned).toBe(false);
    });
  });

  describe('useLockThread', () => {
    it('should lock a thread', async () => {
      const lockedThread: DiscussionThread = {
        ...mockThread,
        isLocked: true,
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/discussions/thread-1/lock`, () => {
          return HttpResponse.json({
            success: true,
            data: lockedThread,
          });
        })
      );

      const { result } = renderHook(() => useLockThread());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { isLocked: true },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isLocked).toBe(true);
    });

    it('should unlock a thread', async () => {
      const unlockedThread: DiscussionThread = {
        ...mockThread,
        isLocked: false,
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/discussions/thread-1/lock`, () => {
          return HttpResponse.json({
            success: true,
            data: unlockedThread,
          });
        })
      );

      const { result } = renderHook(() => useLockThread());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { isLocked: false },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isLocked).toBe(false);
    });
  });

  // =====================
  // MUTATION HOOKS - REPLIES
  // =====================

  describe('useCreateReply', () => {
    it('should create a reply on a thread', async () => {
      const newReply: DiscussionReply = {
        _id: 'reply-new',
        threadId: 'thread-1',
        authorId: mockAuthor,
        authorType: 'learner',
        body: 'Thanks for the explanation!',
        isInstructorAnswer: false,
        isDeleted: false,
        createdAt: '2026-02-09T10:00:00Z',
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/discussions/thread-1/replies`, () => {
          return HttpResponse.json({
            success: true,
            data: newReply,
          });
        })
      );

      const { result } = renderHook(() => useCreateReply());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { body: 'Thanks for the explanation!' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(newReply);
      expect(result.current.data?._id).toBe('reply-new');
    });

    it('should create a nested reply with parentReplyId', async () => {
      const nestedReply: DiscussionReply = {
        _id: 'reply-nested',
        threadId: 'thread-1',
        authorId: mockReplyAuthor,
        authorType: 'staff',
        body: 'Follow-up reply',
        parentReplyId: 'reply-1',
        isInstructorAnswer: false,
        isDeleted: false,
        createdAt: '2026-02-09T11:00:00Z',
        updatedAt: '2026-02-09T11:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/discussions/thread-1/replies`, () => {
          return HttpResponse.json({
            success: true,
            data: nestedReply,
          });
        })
      );

      const { result } = renderHook(() => useCreateReply());

      act(() => {
        result.current.mutate({
          threadId: 'thread-1',
          data: { body: 'Follow-up reply', parentReplyId: 'reply-1' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.parentReplyId).toBe('reply-1');
    });

    it('should handle creation error', async () => {
      server.use(
        http.post(`${baseUrl}/discussions/thread-locked/replies`, () => {
          return HttpResponse.json(
            { success: false, message: 'Thread is locked' },
            { status: 403 }
          );
        })
      );

      const { result } = renderHook(() => useCreateReply());

      act(() => {
        result.current.mutate({
          threadId: 'thread-locked',
          data: { body: 'Cannot reply' },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useUpdateReply', () => {
    it('should update a reply', async () => {
      const updatedReply: DiscussionReply = {
        ...mockReply,
        body: 'Updated explanation with more detail.',
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/replies/reply-1`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedReply,
          });
        })
      );

      const { result } = renderHook(() => useUpdateReply());

      act(() => {
        result.current.mutate({
          replyId: 'reply-1',
          data: { body: 'Updated explanation with more detail.' },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.body).toBe('Updated explanation with more detail.');
    });

    it('should handle update error', async () => {
      server.use(
        http.put(`${baseUrl}/replies/reply-999`, () => {
          return HttpResponse.json(
            { success: false, message: 'Reply not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useUpdateReply());

      act(() => {
        result.current.mutate({
          replyId: 'reply-999',
          data: { body: 'Nope' },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useDeleteReply', () => {
    it('should delete a reply', async () => {
      server.use(
        http.delete(`${baseUrl}/replies/reply-1`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useDeleteReply());

      act(() => {
        result.current.mutate({ replyId: 'reply-1', threadId: 'thread-1' });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle delete error', async () => {
      server.use(
        http.delete(`${baseUrl}/replies/reply-999`, () => {
          return HttpResponse.json(
            { success: false, message: 'Reply not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteReply());

      act(() => {
        result.current.mutate({ replyId: 'reply-999', threadId: 'thread-1' });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useMarkAsAnswer', () => {
    it('should mark a reply as instructor answer', async () => {
      const markedReply: DiscussionReply = {
        ...mockReply,
        isInstructorAnswer: true,
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/replies/reply-1/mark-answer`, () => {
          return HttpResponse.json({
            success: true,
            data: markedReply,
          });
        })
      );

      const { result } = renderHook(() => useMarkAsAnswer());

      act(() => {
        result.current.mutate({
          replyId: 'reply-1',
          data: { isInstructorAnswer: true },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isInstructorAnswer).toBe(true);
    });

    it('should unmark a reply as instructor answer', async () => {
      const unmarkedReply: DiscussionReply = {
        ...mockReply,
        isInstructorAnswer: false,
        updatedAt: '2026-02-09T10:00:00Z',
      };

      server.use(
        http.put(`${baseUrl}/replies/reply-1/mark-answer`, () => {
          return HttpResponse.json({
            success: true,
            data: unmarkedReply,
          });
        })
      );

      const { result } = renderHook(() => useMarkAsAnswer());

      act(() => {
        result.current.mutate({
          replyId: 'reply-1',
          data: { isInstructorAnswer: false },
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.isInstructorAnswer).toBe(false);
    });

    it('should handle mark-answer error', async () => {
      server.use(
        http.put(`${baseUrl}/replies/reply-999/mark-answer`, () => {
          return HttpResponse.json(
            { success: false, message: 'Forbidden' },
            { status: 403 }
          );
        })
      );

      const { result } = renderHook(() => useMarkAsAnswer());

      act(() => {
        result.current.mutate({
          replyId: 'reply-999',
          data: { isInstructorAnswer: true },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
