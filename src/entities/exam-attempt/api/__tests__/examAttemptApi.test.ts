/**
 * Tests for Exam Attempt API Client
 * Tests all exam attempt endpoints following TDD approach
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listExamAttempts,
  getExamAttempt,
  gradeExam,
  listAttemptsByExam,
} from '../examAttemptApi';
import {
  mockExamAttemptListItems,
  mockStartedAttempt,
  mockGradedAttempt,
  mockExamAttemptsByExamResponse,
} from '@/test/mocks/data/examAttempts';
import type {
  ExamAttemptsListResponse,
  GradeExamRequest,
} from '../../model/types';

describe('examAttemptApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST EXAM ATTEMPTS
  // =====================

  describe('listExamAttempts', () => {
    it('should fetch paginated list of exam attempts', async () => {
      const mockResponse: ExamAttemptsListResponse = {
        attempts: mockExamAttemptListItems,
        pagination: {
          page: 1,
          limit: 10,
          total: mockExamAttemptListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/assessment-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExamAttempts();

      expect(result).toEqual(mockResponse);
      expect(result.attempts).toHaveLength(mockExamAttemptListItems.length);
    });

    it('should fetch attempts with pagination params', async () => {
      const mockResponse: ExamAttemptsListResponse = {
        attempts: [mockExamAttemptListItems[0]],
        pagination: {
          page: 1,
          limit: 1,
          total: mockExamAttemptListItems.length,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExamAttempts({ page: 1, limit: 1 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('1');
    });

    it('should filter attempts by examId', async () => {
      const examId = 'exam-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
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

      await listExamAttempts({ examId });

      expect(capturedParams!.get('assessmentId')).toBe(examId);
    });

    it('should filter attempts by status', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: {
              attempts: [mockExamAttemptListItems[0]],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      await listExamAttempts({ status: 'graded' });

      expect(capturedParams!.get('status')).toBe('graded');
    });

    it('should handle error response', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Failed to fetch exam attempts',
            },
            { status: 500 }
          );
        })
      );

      await expect(listExamAttempts()).rejects.toThrow();
    });
  });

  // =====================
  // GET EXAM ATTEMPT
  // =====================

  describe('getExamAttempt', () => {
    it('should fetch started exam attempt by id', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts/${mockStartedAttempt.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockStartedAttempt,
          });
        })
      );

      const result = await getExamAttempt(mockStartedAttempt.id);

      expect(result.id).toBe(mockStartedAttempt.id);
      expect(result.status).toBe('started');
      expect(result.questions).toBeDefined();
    });

    it('should fetch graded exam attempt by id', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts/${mockGradedAttempt.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGradedAttempt,
          });
        })
      );

      const result = await getExamAttempt(mockGradedAttempt.id);

      expect(result.id).toBe(mockGradedAttempt.id);
      expect(result.status).toBe('graded');
      expect(result.score).toBe(85);
      expect(result.gradedBy).toBeDefined();
    });

    it('should handle attempt not found error', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts/non-existent-id`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Exam attempt not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(getExamAttempt('non-existent-id')).rejects.toThrow();
    });
  });

  // =====================
  // GRADE EXAM (MANUAL)
  // =====================

  describe('gradeExam', () => {
    it('should manually grade exam attempt', async () => {
      const attemptId = 'attempt-1';
      const request: GradeExamRequest = {
        questionGrades: [
          {
            questionIndex: 2,
            questionId: 'q-3',
            scoreEarned: 12,
            feedback: 'Good answer, but could include more detail.',
          },
        ],
        overallFeedback: 'Great job overall!',
        notifyLearner: true,
      };

      const mockResponse = {
        attemptId: 'attempt-1',
        status: 'graded' as const,
        scoring: {
          rawScore: 88,
          maxScore: 100,
          percentageScore: 88,
          passed: true,
        },
        questionGrades: [
          {
            questionIndex: 2,
            questionId: 'q-3',
            scoreEarned: 12,
            pointsPossible: 15,
            feedback: 'Good answer, but could include more detail.',
            gradedAt: '2026-01-09T10:30:00.000Z',
            gradedBy: 'instructor-1',
          },
        ],
        notification: {
          requested: true,
          deferred: false,
          notifiedAt: '2026-01-09T10:31:00.000Z',
        },
      };

      server.use(
        http.post(`${baseUrl}/assessment-attempts/${attemptId}/grade`, async ({ request: req }) => {
          const body = await req.json() as GradeExamRequest;
          expect(body).toEqual(request);

          return HttpResponse.json({
            success: true,
            message: 'Exam attempt graded successfully',
            data: mockResponse,
          });
        })
      );

      const result = await gradeExam(attemptId, request);

      expect(result.status).toBe('graded');
      expect(result.score).toBe(88);
      expect(result.maxScore).toBe(100);
      expect(result.percentage).toBe(88);
      expect(result.questionGrades[0].questionIndex).toBe(2);
      expect(result.questionGrades[0].maxPoints).toBe(15);
      expect(result.notification?.requested).toBe(true);
    });

    it('should handle not submitted error', async () => {
      server.use(
        http.post(`${baseUrl}/assessment-attempts/attempt-1/grade`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot grade attempt that has not been submitted',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        gradeExam('attempt-1', {
          questionGrades: [{ questionIndex: 0, scoreEarned: 0 }],
        })
      ).rejects.toThrow();
    });

    it('should handle forbidden error', async () => {
      server.use(
        http.post(`${baseUrl}/assessment-attempts/attempt-1/grade`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Insufficient permissions to grade this attempt',
            },
            { status: 403 }
          );
        })
      );

      await expect(
        gradeExam('attempt-1', {
          questionGrades: [{ questionIndex: 0, scoreEarned: 0 }],
        })
      ).rejects.toThrow();
    });
  });

  // =====================
  // LIST ATTEMPTS BY EXAM
  // =====================

  describe('listAttemptsByExam', () => {
    it('should fetch all attempts for an exam', async () => {
      const examId = 'exam-1';

      server.use(
        http.get(`${baseUrl}/assessment-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExamAttemptsByExamResponse,
          });
        })
      );

      const result = await listAttemptsByExam(examId);

      expect(result.examId).toBe(examId);
      expect(result.attempts).toHaveLength(mockExamAttemptsByExamResponse.attempts.length);
      expect(result.statistics).toBeDefined();
      expect(result.attempts).toBeDefined();
    });

    it('should filter attempts by status', async () => {
      const examId = 'exam-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockExamAttemptsByExamResponse,
          });
        })
      );

      await listAttemptsByExam(examId, { status: 'submitted' });

      expect(capturedParams!.get('status')).toBe('submitted');
      expect(capturedParams!.get('assessmentId')).toBe(examId);
    });

    it('should handle exam not found error', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts`, ({ request }) => {
          const url = new URL(request.url);
          if (url.searchParams.get('assessmentId') !== 'non-existent-id') {
            return HttpResponse.json({
              success: true,
              data: mockExamAttemptsByExamResponse,
            });
          }
          return HttpResponse.json(
            {
              success: false,
              message: 'Exam not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(listAttemptsByExam('non-existent-id')).rejects.toThrow();
    });
  });
});
