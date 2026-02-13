import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import { server } from '@/test/mocks/server';
import {
  startAssessmentAttempt,
  getAssessmentAttempt,
  saveAssessmentResponses,
  submitAssessmentAttempt,
  getAssessmentAttemptResult,
  listMyAssessmentAttempts,
} from '../assessmentAttemptApi';
import {
  mockStartedAttempt,
  mockSubmitAnswersResponse,
  mockSubmitExamResponse,
  mockExamResult,
  mockExamAttemptListItems,
  mockStartExamAttemptResponse,
} from '@/test/mocks/data/examAttempts';

describe('assessmentAttemptApi', () => {
  const baseUrl = env.apiFullUrl;
  const assessmentId = 'assessment-1';
  const attemptId = 'attempt-1';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('starts a canonical assessment attempt', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post(`${baseUrl}/assessments/${assessmentId}/attempts/start`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            ...mockStartExamAttemptResponse,
            id: attemptId,
            examId: assessmentId,
          },
        });
      })
    );

    const result = await startAssessmentAttempt(assessmentId, {
      enrollmentId: 'enrollment-1',
      learningUnitId: 'lu-1',
    });

    expect(capturedBody).toEqual({
      enrollmentId: 'enrollment-1',
      learningUnitId: 'lu-1',
    });
    expect(result.id).toBe(attemptId);
    expect(result.examId).toBe(assessmentId);
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

    const result = await getAssessmentAttempt(assessmentId, attemptId);
    expect(result.id).toBe(attemptId);
    expect(result.examId).toBe(assessmentId);
    expect(result.questions.length).toBeGreaterThan(0);
  });

  it('saves assessment responses', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.put(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}/save`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            ...mockSubmitAnswersResponse,
            attemptId,
          },
        });
      })
    );

    const result = await saveAssessmentResponses(assessmentId, attemptId, {
      responses: [
        {
          questionId: 'q-1',
          response: 'Computer-Based Training',
        },
      ],
    });

    expect(capturedBody).toEqual({
      responses: [{ questionId: 'q-1', response: 'Computer-Based Training' }],
    });
    expect(result.attemptId).toBe(attemptId);
  });

  it('submits with default confirm payload when omitted', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}/submit`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            ...mockSubmitExamResponse,
            attemptId,
          },
        });
      })
    );

    const result = await submitAssessmentAttempt(assessmentId, attemptId);

    expect(capturedBody).toEqual({ confirmSubmit: true });
    expect(result.attemptId).toBe(attemptId);
  });

  it('fetches assessment result from canonical detail route', async () => {
    server.use(
      http.get(`${baseUrl}/assessments/${assessmentId}/attempts/${attemptId}`, () => {
        return HttpResponse.json({
          data: {
            ...mockExamResult,
            attemptId,
          },
        });
      })
    );

    const result = await getAssessmentAttemptResult(assessmentId, attemptId);
    expect(result.attemptId).toBe(attemptId);
    expect(result.summary.totalQuestions).toBeGreaterThan(0);
  });

  it('lists learner attempt history for an assessment', async () => {
    server.use(
      http.get(`${baseUrl}/assessments/${assessmentId}/attempts/my`, () => {
        return HttpResponse.json({
          data: {
            attempts: mockExamAttemptListItems.map((attempt) => ({
              ...attempt,
              examId: assessmentId,
            })),
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

    const result = await listMyAssessmentAttempts(assessmentId);
    expect(result.attempts).toHaveLength(mockExamAttemptListItems.length);
    expect(result.attempts[0].examId).toBe(assessmentId);
  });
});
