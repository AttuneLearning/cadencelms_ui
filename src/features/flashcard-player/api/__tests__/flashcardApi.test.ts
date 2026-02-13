import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import { server } from '@/test/mocks/server';
import {
  getConfig,
  getSession,
  getProgress,
  getPendingRetentionChecks,
  getRetentionCheck,
  getRetentionCheckHistory,
  getActiveRemediations,
  recordResult,
  resetProgress,
  submitRetentionCheck,
  updateConfig,
} from '../flashcardApi';

describe('flashcardApi', () => {
  const baseUrl = env.apiFullUrl;
  const courseId = 'course-1';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('gets canonical flashcard config', async () => {
    server.use(
      http.get(`${baseUrl}/courses/${courseId}/flashcard-config`, () =>
        HttpResponse.json({
          success: true,
          data: {
            courseId,
            enabled: true,
            flashcardsPerCheck: 3,
            failureThreshold: 2,
            checkFrequency: 'every_module',
            checkFrequencyValue: null,
            selectionMethod: 'random',
            requireContentReview: true,
            requireFinalRetake: false,
            includeOnlyCompletedModules: true,
            createdAt: '2026-02-13T10:00:00.000Z',
            updatedAt: '2026-02-13T10:00:00.000Z',
          },
        })
      )
    );

    const result = await getConfig(courseId);
    expect(result.flashcardsPerCheck).toBe(3);
    expect(result.checkFrequency).toBe('every_module');
  });

  it('updates canonical flashcard config', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.put(`${baseUrl}/courses/${courseId}/flashcard-config`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: {
            courseId,
            enabled: true,
            flashcardsPerCheck: 5,
            failureThreshold: 2,
            checkFrequency: 'every_n_modules',
            checkFrequencyValue: 2,
            selectionMethod: 'sm2_priority',
            requireContentReview: true,
            requireFinalRetake: true,
            includeOnlyCompletedModules: true,
            createdAt: '2026-02-13T10:00:00.000Z',
            updatedAt: '2026-02-13T11:00:00.000Z',
          },
        });
      })
    );

    const result = await updateConfig(courseId, {
      flashcardsPerCheck: 5,
      checkFrequency: 'every_n_modules',
      checkFrequencyValue: 2,
      selectionMethod: 'sm2_priority',
    });

    expect(capturedBody).toEqual({
      flashcardsPerCheck: 5,
      checkFrequency: 'every_n_modules',
      checkFrequencyValue: 2,
      selectionMethod: 'sm2_priority',
    });
    expect(result.selectionMethod).toBe('sm2_priority');
  });

  it('gets flashcard session with canonical learning-unit provenance fields', async () => {
    let capturedSessionSize: string | null = null;
    let capturedModuleId: string | null = null;

    server.use(
      http.get(`${baseUrl}/courses/${courseId}/flashcard-session`, ({ request }) => {
        const url = new URL(request.url);
        capturedSessionSize = url.searchParams.get('sessionSize');
        capturedModuleId = url.searchParams.get('moduleId');

        return HttpResponse.json({
          success: true,
          data: {
            courseId,
            moduleId: 'module-1',
            sessionSize: 10,
            cards: [
              {
                questionId: 'question-1',
                promptIndex: 0,
                learningUnitId: 'learning-unit-1',
                learningUnitQuestionId: 'luq-1',
                sourceModuleId: 'module-1',
                front: { text: 'Front prompt' },
                back: { text: 'Back answer' },
                progress: {
                  timesCorrect: 3,
                  timesIncorrect: 1,
                  lastReviewed: '2026-02-13T09:00:00.000Z',
                  mastered: false,
                },
              },
            ],
            stats: {
              totalCards: 12,
              dueCards: 4,
              masteredCards: 5,
              newCards: 3,
            },
          },
        });
      })
    );

    const result = await getSession(courseId, { moduleId: 'module-1', sessionSize: 10 });

    expect(capturedSessionSize).toBe('10');
    expect(capturedModuleId).toBe('module-1');
    expect(result.cards[0].learningUnitId).toBe('learning-unit-1');
    expect(result.cards[0].learningUnitQuestionId).toBe('luq-1');
  });

  it('records flashcard result on canonical route', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post(`${baseUrl}/courses/${courseId}/flashcard-result`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: {
            questionId: 'question-1',
            promptIndex: 0,
            isCorrect: true,
            newInterval: 6,
            nextReviewDate: '2026-02-20T10:00:00.000Z',
            mastered: true,
            masteredAt: '2026-02-13T10:00:00.000Z',
          },
        });
      })
    );

    const result = await recordResult(courseId, {
      questionId: 'question-1',
      promptIndex: 0,
      isCorrect: true,
      quality: 5,
    });

    expect(capturedBody).toEqual({
      questionId: 'question-1',
      promptIndex: 0,
      isCorrect: true,
      quality: 5,
    });
    expect(result.mastered).toBe(true);
  });

  it('gets and resets flashcard progress on canonical route', async () => {
    let capturedModuleId: string | null = null;
    let capturedResetModuleId: string | null = null;
    let capturedLearnerId: string | null = null;

    server.use(
      http.get(`${baseUrl}/courses/${courseId}/flashcard-progress`, ({ request }) => {
        const url = new URL(request.url);
        capturedModuleId = url.searchParams.get('moduleId');
        return HttpResponse.json({
          success: true,
          data: {
            courseId,
            learnerId: 'learner-1',
            summary: {
              totalCards: 20,
              masteredCards: 8,
              masteryPercentage: 40,
              cardsNeedingReview: 5,
              averageEaseFactor: 2.4,
            },
            byModule: [],
            recentActivity: {
              lastReviewDate: '2026-02-13T08:00:00.000Z',
              cardsReviewedToday: 6,
              streakDays: 4,
            },
          },
        });
      }),
      http.delete(`${baseUrl}/courses/${courseId}/flashcard-progress`, ({ request }) => {
        const url = new URL(request.url);
        capturedResetModuleId = url.searchParams.get('moduleId');
        capturedLearnerId = url.searchParams.get('learnerId');
        return HttpResponse.json({
          success: true,
          data: {
            cardsReset: 7,
          },
        });
      })
    );

    const progress = await getProgress(courseId, 'module-1');
    const reset = await resetProgress(courseId, { moduleId: 'module-1', learnerId: 'learner-1' });

    expect(capturedModuleId).toBe('module-1');
    expect(progress.summary.totalCards).toBe(20);
    expect(capturedResetModuleId).toBe('module-1');
    expect(capturedLearnerId).toBe('learner-1');
    expect(reset.cardsReset).toBe(7);
  });

  it('gets pending retention checks and specific check details', async () => {
    server.use(
      http.get(`${baseUrl}/courses/${courseId}/retention-checks/pending`, () =>
        HttpResponse.json({
          success: true,
          data: {
            pendingChecks: [
              {
                checkId: 'check-1',
                sourceModuleId: 'module-1',
                sourceModuleName: 'Intro',
                cardCount: 3,
                triggeredAt: '2026-02-13T10:00:00.000Z',
                isBlocking: true,
              },
            ],
            totalPending: 1,
          },
        })
      ),
      http.get(`${baseUrl}/courses/${courseId}/retention-checks/check-1`, () =>
        HttpResponse.json({
          success: true,
          data: {
            checkId: 'check-1',
            sourceModuleId: 'module-1',
            failureThreshold: 2,
            startedAt: '2026-02-13T10:00:00.000Z',
            cards: [
              {
                questionId: 'question-1',
                promptIndex: 0,
                learningUnitId: 'learning-unit-1',
                learningUnitQuestionId: 'luq-1',
                sourceModuleId: 'module-1',
                front: { text: 'Front prompt' },
                back: { text: 'Back answer' },
              },
            ],
          },
        })
      )
    );

    const pending = await getPendingRetentionChecks(courseId);
    const check = await getRetentionCheck(courseId, 'check-1');

    expect(pending.totalPending).toBe(1);
    expect(check.cards[0].learningUnitQuestionId).toBe('luq-1');
  });

  it('submits retention check answers and gets history', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    let capturedPage: string | null = null;

    server.use(
      http.post(`${baseUrl}/courses/${courseId}/retention-checks/check-1/submit`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          data: {
            checkId: 'check-1',
            sourceModuleId: 'module-1',
            passed: true,
            correctCount: 3,
            incorrectCount: 0,
            failureThreshold: 2,
            remediationRequired: false,
            remediation: null,
          },
        });
      }),
      http.get(`${baseUrl}/courses/${courseId}/retention-checks/history`, ({ request }) => {
        const url = new URL(request.url);
        capturedPage = url.searchParams.get('page');
        return HttpResponse.json({
          success: true,
          data: {
            history: [
              {
                checkId: 'check-1',
                sourceModuleId: 'module-1',
                completedAt: '2026-02-13T10:10:00.000Z',
                passed: true,
                correctCount: 3,
                incorrectCount: 0,
                remediationRequired: false,
                remediationStatus: null,
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 1,
              totalPages: 1,
            },
          },
        });
      })
    );

    const submit = await submitRetentionCheck(courseId, 'check-1', {
      answers: [
        { questionId: 'question-1', promptIndex: 0, correct: true, quality: 4 },
      ],
    });
    const history = await getRetentionCheckHistory(courseId, { page: 1, limit: 20 });

    expect(capturedBody).toEqual({
      answers: [{ questionId: 'question-1', promptIndex: 0, correct: true, quality: 4 }],
    });
    expect(submit.passed).toBe(true);
    expect(capturedPage).toBe('1');
    expect(history.history).toHaveLength(1);
  });

  it('gets active remediations', async () => {
    server.use(
      http.get(`${baseUrl}/courses/${courseId}/remediations/active`, () =>
        HttpResponse.json({
          success: true,
          data: {
            remediations: [
              {
                remediationId: 'remediation-1',
                moduleId: 'module-1',
                moduleName: 'Intro',
                triggeredAt: '2026-02-13T10:00:00.000Z',
                triggeredByCheckId: 'check-1',
                status: 'pending',
                requireContentReview: true,
                requireFinalRetake: true,
                contentReviewedAt: null,
                finalRetakenAt: null,
              },
            ],
            totalActive: 1,
            isBlocking: true,
          },
        })
      )
    );

    const result = await getActiveRemediations(courseId);
    expect(result.totalActive).toBe(1);
    expect(result.remediations[0].status).toBe('pending');
  });
});

