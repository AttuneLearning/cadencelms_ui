/**
 * Tests for Exam Attempt React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  useExamAttempts,
  useExamAttempt,
  useExamAttemptHistory,
} from '../useExamAttempts';
import {
  mockExamAttemptListItems,
  mockStartedAttempt,
} from '@/test/mocks/data/examAttempts';
import { createElement, type ReactNode } from 'react';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }

  return Wrapper;
};

describe('useExamAttempts hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('useExamAttempts', () => {
    it('should fetch list of exam attempts', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              attempts: mockExamAttemptListItems,
              pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      const { result } = renderHook(() => useExamAttempts(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.attempts).toHaveLength(2);
      expect(result.current.data?.attempts[0]).toEqual(mockExamAttemptListItems[0]);
    });

    it('should filter by examId', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('assessmentId')).toBe('exam-1');

          return HttpResponse.json({
            success: true,
            data: {
              attempts: mockExamAttemptListItems,
              pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      const { result } = renderHook(() => useExamAttempts({ examId: 'exam-1' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useExamAttempt', () => {
    it('should fetch single exam attempt', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts/${mockStartedAttempt.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockStartedAttempt,
          });
        })
      );

      const { result } = renderHook(() => useExamAttempt(mockStartedAttempt.id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe(mockStartedAttempt.id);
      expect(result.current.data?.status).toBe(mockStartedAttempt.status);
      expect(result.current.data?.questions).toBeDefined();
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useExamAttempt(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useExamAttemptHistory', () => {
    it('should fetch attempt history for exam', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('assessmentId')).toBe('exam-1');
          expect(url.searchParams.get('status')).toBe('graded');

          return HttpResponse.json({
            success: true,
            data: {
              attempts: mockExamAttemptListItems,
              pagination: {
                page: 1,
                limit: 10,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      const { result } = renderHook(() => useExamAttemptHistory('exam-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.attempts).toHaveLength(2);
    });
  });
});
