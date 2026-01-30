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
  startExamAttempt,
  submitAnswers,
  submitExam,
  getExamResults,
  gradeExam,
  listAttemptsByExam,
} from '../examAttemptApi';
import {
  mockExamAttemptListItems,
  mockStartedAttempt,
  mockGradedAttempt,
  mockStartExamAttemptResponse,
  mockSubmitAnswersResponse,
  mockSubmitExamResponse,
  mockExamResult,
  mockExamAttemptsByExamResponse,
} from '@/test/mocks/data/examAttempts';
import type {
  ExamAttemptsListResponse,
  StartExamAttemptRequest,
  SubmitAnswersRequest,
  SubmitExamRequest,
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
        http.get(`${baseUrl}/exam-attempts`, () => {
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
        http.get(`${baseUrl}/exam-attempts`, ({ request }) => {
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
        http.get(`${baseUrl}/exam-attempts`, ({ request }) => {
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

      expect(capturedParams!.get('examId')).toBe(examId);
    });

    it('should filter attempts by status', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/exam-attempts`, ({ request }) => {
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
        http.get(`${baseUrl}/exam-attempts`, () => {
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
        http.get(`${baseUrl}/exam-attempts/${mockStartedAttempt.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockStartedAttempt,
          });
        })
      );

      const result = await getExamAttempt(mockStartedAttempt.id);

      expect(result).toEqual(mockStartedAttempt);
      expect(result.status).toBe('started');
      expect(result.questions).toBeDefined();
    });

    it('should fetch graded exam attempt by id', async () => {
      server.use(
        http.get(`${baseUrl}/exam-attempts/${mockGradedAttempt.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockGradedAttempt,
          });
        })
      );

      const result = await getExamAttempt(mockGradedAttempt.id);

      expect(result).toEqual(mockGradedAttempt);
      expect(result.status).toBe('graded');
      expect(result.score).toBe(85);
      expect(result.gradedBy).toBeDefined();
    });

    it('should handle attempt not found error', async () => {
      server.use(
        http.get(`${baseUrl}/exam-attempts/non-existent-id`, () => {
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
  // START EXAM ATTEMPT
  // =====================

  describe('startExamAttempt', () => {
    it('should start a new exam attempt', async () => {
      const request: StartExamAttemptRequest = {
        examId: 'exam-1',
      };

      server.use(
        http.post(`${baseUrl}/exam-attempts`, async ({ request: req }) => {
          const body = await req.json() as StartExamAttemptRequest;
          expect(body).toEqual(request);

          return HttpResponse.json({
            success: true,
            message: 'Exam attempt started successfully',
            data: mockStartExamAttemptResponse,
          });
        })
      );

      const result = await startExamAttempt(request);

      expect(result).toEqual(mockStartExamAttemptResponse);
      expect(result.status).toBe('started');
      expect(result.questions).toHaveLength(3);
      expect(result.remainingTime).toBe(1800);
    });

    it('should handle active attempt exists error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot start new attempt while another is in progress',
            },
            { status: 409 }
          );
        })
      );

      await expect(startExamAttempt({ examId: 'exam-1' })).rejects.toThrow();
    });

    it('should handle max attempts reached error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Maximum number of attempts reached',
            },
            { status: 409 }
          );
        })
      );

      await expect(startExamAttempt({ examId: 'exam-1' })).rejects.toThrow();
    });
  });

  // =====================
  // SUBMIT ANSWERS
  // =====================

  describe('submitAnswers', () => {
    it('should submit answers for questions', async () => {
      const attemptId = 'attempt-1';
      const request: SubmitAnswersRequest = {
        answers: [
          { questionId: 'q-1', answer: 'Computer-Based Training' },
          { questionId: 'q-2', answer: 'true' },
        ],
      };

      server.use(
        http.post(`${baseUrl}/exam-attempts/${attemptId}/answers`, async ({ request: req }) => {
          const body = await req.json() as SubmitAnswersRequest;
          expect(body).toEqual(request);

          return HttpResponse.json({
            success: true,
            message: 'Answers saved successfully',
            data: mockSubmitAnswersResponse,
          });
        })
      );

      const result = await submitAnswers(attemptId, request);

      expect(result).toEqual(mockSubmitAnswersResponse);
      expect(result.status).toBe('in_progress');
      expect(result.updatedAnswers).toHaveLength(2);
    });

    it('should handle time expired error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts/attempt-1/answers`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Time limit exceeded, attempt auto-submitted',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        submitAnswers('attempt-1', { answers: [{ questionId: 'q-1', answer: 'test' }] })
      ).rejects.toThrow();
    });

    it('should handle attempt closed error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts/attempt-1/answers`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot submit answers to completed attempt',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        submitAnswers('attempt-1', { answers: [{ questionId: 'q-1', answer: 'test' }] })
      ).rejects.toThrow();
    });
  });

  // =====================
  // SUBMIT EXAM
  // =====================

  describe('submitExam', () => {
    it('should submit exam for grading', async () => {
      const attemptId = 'attempt-1';
      const request: SubmitExamRequest = {
        confirmSubmit: true,
      };

      server.use(
        http.post(`${baseUrl}/exam-attempts/${attemptId}/submit`, async ({ request: req }) => {
          const body = await req.json() as SubmitExamRequest;
          expect(body).toEqual(request);

          return HttpResponse.json({
            success: true,
            message: 'Exam submitted successfully',
            data: mockSubmitExamResponse,
          });
        })
      );

      const result = await submitExam(attemptId, request);

      expect(result).toEqual(mockSubmitExamResponse);
      expect(result.status).toBe('graded');
      expect(result.autoGraded).toBe(true);
      expect(result.correctCount).toBe(9);
    });

    it('should submit exam without confirmation flag', async () => {
      const attemptId = 'attempt-1';

      server.use(
        http.post(`${baseUrl}/exam-attempts/${attemptId}/submit`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Exam submitted successfully',
            data: mockSubmitExamResponse,
          });
        })
      );

      const result = await submitExam(attemptId);

      expect(result).toEqual(mockSubmitExamResponse);
    });

    it('should handle already submitted error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts/attempt-1/submit`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Exam attempt already submitted',
            },
            { status: 409 }
          );
        })
      );

      await expect(submitExam('attempt-1')).rejects.toThrow();
    });
  });

  // =====================
  // GET EXAM RESULTS
  // =====================

  describe('getExamResults', () => {
    it('should fetch exam results with feedback', async () => {
      const attemptId = 'attempt-3';

      server.use(
        http.get(`${baseUrl}/exam-attempts/${attemptId}/results`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExamResult,
          });
        })
      );

      const result = await getExamResults(attemptId);

      expect(result).toEqual(mockExamResult);
      expect(result.status).toBe('graded');
      expect(result.summary).toBeDefined();
      expect(result.questionResults).toBeDefined();
      expect(result.allowReview).toBe(true);
    });

    it('should handle not graded error', async () => {
      server.use(
        http.get(`${baseUrl}/exam-attempts/attempt-1/results`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Attempt has not been graded yet',
            },
            { status: 409 }
          );
        })
      );

      await expect(getExamResults('attempt-1')).rejects.toThrow();
    });

    it('should handle review not allowed error', async () => {
      server.use(
        http.get(`${baseUrl}/exam-attempts/attempt-1/results`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Review not allowed for this exam',
            },
            { status: 409 }
          );
        })
      );

      await expect(getExamResults('attempt-1')).rejects.toThrow();
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
        score: 88,
        maxScore: 100,
        percentage: 88,
        passed: true,
        gradeLetter: 'B+',
        gradedAt: '2026-01-09T10:30:00.000Z',
        gradedBy: {
          id: 'instructor-1',
          firstName: 'John',
          lastName: 'Doe',
        },
        questionGrades: [
          {
            questionId: 'q-3',
            scoreEarned: 12,
            maxPoints: 15,
            feedback: 'Good answer, but could include more detail.',
          },
        ],
      };

      server.use(
        http.post(`${baseUrl}/exam-attempts/${attemptId}/grade`, async ({ request: req }) => {
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

      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('graded');
      expect(result.gradedBy).toBeDefined();
    });

    it('should handle not submitted error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts/attempt-1/grade`, () => {
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
        gradeExam('attempt-1', { questionGrades: [] })
      ).rejects.toThrow();
    });

    it('should handle forbidden error', async () => {
      server.use(
        http.post(`${baseUrl}/exam-attempts/attempt-1/grade`, () => {
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
        gradeExam('attempt-1', { questionGrades: [] })
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
        http.get(`${baseUrl}/exam-attempts/exam/${examId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExamAttemptsByExamResponse,
          });
        })
      );

      const result = await listAttemptsByExam(examId);

      expect(result).toEqual(mockExamAttemptsByExamResponse);
      expect(result.statistics).toBeDefined();
      expect(result.attempts).toBeDefined();
    });

    it('should filter attempts by status', async () => {
      const examId = 'exam-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/exam-attempts/exam/${examId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockExamAttemptsByExamResponse,
          });
        })
      );

      await listAttemptsByExam(examId, { status: 'submitted' });

      expect(capturedParams!.get('status')).toBe('submitted');
    });

    it('should handle exam not found error', async () => {
      server.use(
        http.get(`${baseUrl}/exam-attempts/exam/non-existent-id`, () => {
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
