import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import { server } from '@/test/mocks/server';
import { renderHook } from '@/test/utils/renderHook';
import {
  ASSESSMENT_ATTEMPT_KEYS,
  useAssessmentAttempt,
  useStartAssessmentAttempt,
  useSaveAssessmentResponses,
  useSubmitAssessmentAttempt,
  useAssessmentAttemptResult,
  useMyAssessmentAttemptHistory,
} from '../useAssessmentAttempts';
import {
  mockStartedAttempt,
  mockStartExamAttemptResponse,
  mockSubmitAnswersResponse,
  mockSubmitExamResponse,
  mockExamResult,
  mockExamAttemptListItems,
} from '@/test/mocks/data/examAttempts';

describe('useAssessmentAttempts hooks', () => {
  const baseUrl = env.apiFullUrl;
  const assessmentId = 'assessment-1';
  const attemptId = 'attempt-1';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
    vi.restoreAllMocks();
  });

  it('fetches assessment attempt detail', async () => {
    server.use(
      http.get(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}`, () => {
        return HttpResponse.json({
          data: {
            ...mockStartedAttempt,
            id: attemptId,
            examId: assessmentId,
          },
        });
      })
    );

    const { result } = renderHook(() => useAssessmentAttempt(assessmentId, attemptId));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(attemptId);
  });

  it('does not fetch attempt detail when ids are missing', () => {
    const { result } = renderHook(() => useAssessmentAttempt('', ''));
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });

  it('starts assessment attempt and seeds detail cache', async () => {
    server.use(
      http.post(`${baseUrl}/assessments/${assessmentId}/attempts/start`, () => {
        return HttpResponse.json({
          data: {
            ...mockStartExamAttemptResponse,
            id: attemptId,
            examId: assessmentId,
          },
        });
      })
    );

    const { result, queryClient } = renderHook(() => useStartAssessmentAttempt(assessmentId));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({
        enrollmentId: 'enrollment-1',
        learningUnitId: 'lu-1',
      });
    });

    const cached = queryClient.getQueryData(
      ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId)
    ) as { id: string } | undefined;
    expect(cached?.id).toBe(attemptId);
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ASSESSMENT_ATTEMPT_KEYS.myHistory(assessmentId),
    });
  });

  it('optimistically updates answer state on save and invalidates detail', async () => {
    server.use(
      http.get(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}`, () => {
        return HttpResponse.json({
          data: {
            ...mockStartedAttempt,
            id: attemptId,
            examId: assessmentId,
            questions: mockStartedAttempt.questions.map((question) => ({
              ...question,
              hasAnswer: false,
            })),
          },
        });
      }),
      http.put(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}/save`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 75));
        return HttpResponse.json({
          data: {
            ...mockSubmitAnswersResponse,
            attemptId,
          },
        });
      })
    );

    const detailHook = renderHook(() =>
      useAssessmentAttempt(assessmentId, attemptId)
    );
    await waitFor(() => expect(detailHook.result.current.isSuccess).toBe(true));

    const { result, queryClient } = renderHook(() =>
      useSaveAssessmentResponses(assessmentId)
    , { queryClient: detailHook.queryClient });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    act(() => {
      result.current.mutate({
        attemptId,
        data: {
          responses: [{ questionId: 'q-1', response: 'Computer-Based Training' }],
        },
      });
    });

    await waitFor(() => {
      expect(setQueryDataSpy).toHaveBeenCalledWith(
        ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId),
        expect.any(Function)
      );
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId),
    });
  });

  it('invalidates detail/result/history on submit', async () => {
    server.use(
      http.post(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}/submit`, () => {
        return HttpResponse.json({
          data: {
            ...mockSubmitExamResponse,
            attemptId,
          },
        });
      })
    );

    const { result, queryClient } = renderHook(() =>
      useSubmitAssessmentAttempt(assessmentId)
    );
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({
        attemptId,
        data: { confirmSubmit: true },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ASSESSMENT_ATTEMPT_KEYS.result(assessmentId, attemptId),
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ASSESSMENT_ATTEMPT_KEYS.myHistory(assessmentId),
    });
  });

  it('fetches assessment result and learner history', async () => {
    server.use(
      http.get(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}`, () => {
        return HttpResponse.json({
          data: {
            ...mockExamResult,
            attemptId,
          },
        });
      }),
      http.get(`${baseUrl}/assessments/${assessmentId}/attempts/my`, () => {
        return HttpResponse.json({
          data: {
            attempts: mockExamAttemptListItems,
            pagination: {
              page: 1,
              limit: 20,
              total: mockExamAttemptListItems.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );

    const resultQuery = renderHook(() =>
      useAssessmentAttemptResult(assessmentId, attemptId)
    );
    const historyQuery = renderHook(() =>
      useMyAssessmentAttemptHistory(assessmentId)
    );

    await waitFor(() => expect(resultQuery.result.current.isSuccess).toBe(true));
    await waitFor(() => expect(historyQuery.result.current.isSuccess).toBe(true));

    expect(resultQuery.result.current.data?.attemptId).toBe(attemptId);
    expect(historyQuery.result.current.data?.attempts).toHaveLength(
      mockExamAttemptListItems.length
    );
  });
});
