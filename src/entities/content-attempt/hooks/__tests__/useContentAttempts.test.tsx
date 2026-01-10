/**
 * Tests for Content Attempt React Query Hooks
 * Tests all hooks including basic functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  useContentAttempts,
  useContentAttempt,
  useStartContentAttempt,
  useUpdateContentAttempt,
  useCompleteContentAttempt,
} from '../useContentAttempts';
import type { ContentAttempt, ListAttemptsResponse } from '../../model/types';

// Helper to create wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useContentAttempts hooks', () => {
  const baseUrl = env.apiBaseUrl;

  const mockAttempt: ContentAttempt = {
    id: 'attempt-1',
    contentId: 'content-1',
    content: {
      id: 'content-1',
      title: 'Safety Training',
      type: 'scorm',
    },
    learnerId: 'learner-1',
    enrollmentId: 'enrollment-1',
    attemptNumber: 1,
    status: 'in-progress',
    progressPercent: 65,
    score: null,
    scoreRaw: 78,
    scoreMin: 0,
    scoreMax: 100,
    scoreScaled: 0.78,
    timeSpentSeconds: 1820,
    totalTime: 1820,
    sessionTime: 450,
    startedAt: '2026-01-08T10:00:00.000Z',
    lastAccessedAt: '2026-01-08T10:30:00.000Z',
    completedAt: null,
    scormVersion: '1.2',
    location: 'page-5',
    suspendData: 'bookmark=page5',
    hasScormData: true,
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-01-08T10:30:00.000Z',
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // useContentAttempts
  // =====================

  describe('useContentAttempts', () => {
    it('should fetch list of attempts', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useContentAttempts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.attempts).toHaveLength(1);
      expect(result.current.data?.attempts[0].id).toBe('attempt-1');
    });

    it('should filter by enrollmentId and contentId', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/api/v2/content-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(
        () =>
          useContentAttempts({
            enrollmentId: 'enrollment-1',
            contentId: 'content-1',
          }),
        {
          wrapper: createWrapper(),
        }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(capturedParams?.get('enrollmentId')).toBe('enrollment-1');
      expect(capturedParams?.get('contentId')).toBe('content-1');
    });
  });

  // =====================
  // useContentAttempt
  // =====================

  describe('useContentAttempt', () => {
    it('should fetch single attempt by id', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/content-attempts/attempt-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAttempt,
          });
        })
      );

      const { result } = renderHook(() => useContentAttempt('attempt-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe('attempt-1');
      expect(result.current.data?.status).toBe('in-progress');
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useContentAttempt(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  // =====================
  // useStartContentAttempt
  // =====================

  describe('useStartContentAttempt', () => {
    it('should create a new attempt', async () => {
      const newAttempt = {
        ...mockAttempt,
        status: 'started' as const,
        progressPercent: 0,
        launchUrl: '/scorm/content-1/launch?attempt=attempt-1',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content-attempts`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.contentId).toBe('content-1');

          return HttpResponse.json({
            success: true,
            data: newAttempt,
          });
        })
      );

      const { result } = renderHook(() => useStartContentAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        contentId: 'content-1',
        enrollmentId: 'enrollment-1',
        scormVersion: '1.2',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('started');
      expect(result.current.data?.launchUrl).toBeTruthy();
    });

    it('should handle error when attempt already exists', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/content-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Active attempt already exists',
            },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useStartContentAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        contentId: 'content-1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // =====================
  // useUpdateContentAttempt
  // =====================

  describe('useUpdateContentAttempt', () => {
    it('should update attempt progress', async () => {
      const updatedData = {
        id: 'attempt-1',
        status: 'in-progress' as const,
        progressPercent: 75,
        score: null,
        timeSpentSeconds: 2120,
        lastAccessedAt: '2026-01-08T10:35:00.000Z',
        completedAt: null,
        updatedAt: '2026-01-08T10:35:00.000Z',
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/content-attempts/attempt-1`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.progressPercent).toBe(75);

          return HttpResponse.json({
            success: true,
            data: updatedData,
          });
        })
      );

      const { result } = renderHook(() => useUpdateContentAttempt(0), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        attemptId: 'attempt-1',
        data: {
          progressPercent: 75,
          timeSpentSeconds: 300,
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.progressPercent).toBe(75);
    });
  });

  // =====================
  // useCompleteContentAttempt
  // =====================

  describe('useCompleteContentAttempt', () => {
    it('should complete attempt with passing score', async () => {
      const completedData = {
        id: 'attempt-1',
        status: 'passed' as const,
        progressPercent: 100,
        score: 92,
        scoreRaw: 92,
        scoreScaled: 0.92,
        passed: true,
        timeSpentSeconds: 2300,
        completedAt: '2026-01-08T10:40:00.000Z',
        certificate: null,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content-attempts/attempt-1/complete`, async ({ request }) => {
          const body = (await request.json()) as Record<string, unknown>;
          expect(body.passed).toBe(true);

          return HttpResponse.json({
            success: true,
            data: completedData,
          });
        })
      );

      const { result } = renderHook(() => useCompleteContentAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        attemptId: 'attempt-1',
        data: {
          score: 92,
          passed: true,
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('passed');
      expect(result.current.data?.progressPercent).toBe(100);
    });
  });
});
