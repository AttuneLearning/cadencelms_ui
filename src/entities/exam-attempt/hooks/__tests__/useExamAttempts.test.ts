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
  useStartExamAttempt,
  useSaveAnswer,
  useSubmitExamAttempt,
  useExamAttemptResult,
  useExamAttemptHistory,
} from '../useExamAttempts';
import {
  mockExamAttemptListItems,
  mockStartedAttempt,
  mockGradedAttempt,
  mockStartExamAttemptResponse,
  mockSubmitAnswersResponse,
  mockSubmitExamResponse,
  mockExamResult,
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
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('useExamAttempts', () => {
    it('should fetch list of exam attempts', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/exam-attempts`, () => {
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
        http.get(`${baseUrl}/api/v2/exam-attempts`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('examId')).toBe('exam-1');

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
        http.get(`${baseUrl}/api/v2/exam-attempts/${mockStartedAttempt.id}`, () => {
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

      expect(result.current.data).toEqual(mockStartedAttempt);
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useExamAttempt(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useStartExamAttempt', () => {
    it('should start a new exam attempt', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/exam-attempts`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Exam attempt started successfully',
            data: mockStartExamAttemptResponse,
          });
        })
      );

      const { result } = renderHook(() => useStartExamAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ examId: 'exam-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockStartExamAttemptResponse);
    });

    it('should handle error when starting attempt', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/exam-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot start new attempt while another is in progress',
            },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useStartExamAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ examId: 'exam-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useSaveAnswer', () => {
    it('should save answer with optimistic update', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/exam-attempts/attempt-1/answers`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Answers saved successfully',
            data: mockSubmitAnswersResponse,
          });
        })
      );

      const { result } = renderHook(() => useSaveAnswer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        attemptId: 'attempt-1',
        answers: [{ questionId: 'q-1', answer: 'Computer-Based Training' }],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSubmitAnswersResponse);
    });
  });

  describe('useSubmitExamAttempt', () => {
    it('should submit exam attempt', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/exam-attempts/attempt-1/submit`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Exam submitted successfully',
            data: mockSubmitExamResponse,
          });
        })
      );

      const { result } = renderHook(() => useSubmitExamAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ attemptId: 'attempt-1' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSubmitExamResponse);
    });

    it('should handle already submitted error', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/exam-attempts/attempt-1/submit`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Exam attempt already submitted',
            },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useSubmitExamAttempt(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ attemptId: 'attempt-1' });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useExamAttemptResult', () => {
    it('should fetch exam results', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/exam-attempts/${mockGradedAttempt.id}/results`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExamResult,
          });
        })
      );

      const { result } = renderHook(() => useExamAttemptResult(mockGradedAttempt.id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockExamResult);
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useExamAttemptResult(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useExamAttemptHistory', () => {
    it('should fetch attempt history for exam', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/exam-attempts`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('examId')).toBe('exam-1');
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
