/**
 * Tests for Question API Client
 * Tests all 6 question management endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  getQuestions,
  createQuestion,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
} from '../questionApi';
import type { QuestionListResponse, CreateQuestionPayload } from '../../model/types';
import {
  mockQuestions,
  mockQuestionDetails,
  mockCreateQuestionPayload,
  mockUpdateQuestionPayload,
  mockBulkImportQuestions,
  mockBulkImportSuccessResponse,
  mockBulkImportPartialResponse,
  createMockQuestion,
} from '@/test/mocks/data/questions';

describe('questionApi', () => {
  const baseUrl = env.apiBaseUrl;
  const departmentId = 'dept-123';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST QUESTIONS
  // =====================

  describe('getQuestions', () => {
    it('should fetch paginated list of questions without filters', async () => {
      const mockResponse: QuestionListResponse = {
        questions: mockQuestions,
        pagination: {
          page: 1,
          limit: 20,
          total: mockQuestions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId);

      expect(result).toEqual(mockResponse);
      expect(result.questions).toHaveLength(mockQuestions.length);
    });

    it('should fetch questions with pagination params', async () => {
      const mockResponse: QuestionListResponse = {
        questions: mockQuestions.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockQuestions.length,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, ({ request }) => {
          const url = new URL(request.url);
          capturedParams = url.searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId, { page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should fetch questions with question type filter', async () => {
      const multipleChoiceQuestions = mockQuestions.filter(
        (q) => q.questionTypes.includes('multiple_choice')
      );
      const mockResponse: QuestionListResponse = {
        questions: multipleChoiceQuestions,
        pagination: {
          page: 1,
          limit: 20,
          total: multipleChoiceQuestions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, ({ request }) => {
          const url = new URL(request.url);
          capturedParams = url.searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId, { questionType: 'multiple_choice' });

      expect(result.questions).toEqual(multipleChoiceQuestions);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('questionType')).toBe('multiple_choice');
    });

    it('should fetch questions with difficulty filter', async () => {
      const easyQuestions = mockQuestions.filter((q) => q.difficulty === 'easy');
      const mockResponse: QuestionListResponse = {
        questions: easyQuestions,
        pagination: {
          page: 1,
          limit: 20,
          total: easyQuestions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, ({ request }) => {
          const url = new URL(request.url);
          capturedParams = url.searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId, { difficulty: 'easy' });

      expect(result.questions).toEqual(easyQuestions);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('difficulty')).toBe('easy');
    });

    it('should fetch questions with tag filter', async () => {
      const javascriptQuestions = mockQuestions.filter((q) =>
        q.tags.includes('javascript')
      );
      const mockResponse: QuestionListResponse = {
        questions: javascriptQuestions,
        pagination: {
          page: 1,
          limit: 20,
          total: javascriptQuestions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, ({ request }) => {
          const url = new URL(request.url);
          capturedParams = url.searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId, { tag: 'javascript' });

      expect(result.questions).toEqual(javascriptQuestions);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('tag')).toBe('javascript');
    });

    it('should fetch questions with search query', async () => {
      const mockResponse: QuestionListResponse = {
        questions: [mockQuestions[0]],
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
        http.get(`${baseUrl}/departments/${departmentId}/questions`, ({ request }) => {
          const url = new URL(request.url);
          capturedParams = url.searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId, { search: 'JavaScript' });

      expect(result.questions).toHaveLength(1);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('search')).toBe('JavaScript');
    });

    it('should fetch questions with sort parameter', async () => {
      const mockResponse: QuestionListResponse = {
        questions: mockQuestions,
        pagination: {
          page: 1,
          limit: 20,
          total: mockQuestions.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, ({ request }) => {
          const url = new URL(request.url);
          capturedParams = url.searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId, { sort: '-createdAt' });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('sort')).toBe('-createdAt');
    });

    it('should handle empty results', async () => {
      const mockResponse: QuestionListResponse = {
        questions: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await getQuestions(departmentId);

      expect(result.questions).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API errors', async () => {
      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Internal server error',
            },
            { status: 500 }
          );
        })
      );

      await expect(getQuestions(departmentId)).rejects.toThrow();
    });
  });

  // =====================
  // CREATE QUESTION
  // =====================

  describe('createQuestion', () => {
    it('should create a new multiple choice question', async () => {
      const newQuestion = createMockQuestion({
        ...mockCreateQuestionPayload,
        id: 'new-q1',
      });

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: newQuestion,
          });
        })
      );

      const result = await createQuestion(departmentId, mockCreateQuestionPayload);

      expect(result).toEqual(newQuestion);
      expect(result.questionText).toBe(mockCreateQuestionPayload.questionText);
      expect(result.questionTypes[0]).toBe(mockCreateQuestionPayload.questionTypes[0]);
    });

    it('should create a true/false question', async () => {
      const trueFalsePayload: CreateQuestionPayload = {
        questionBankId: 'qb-1',
        questionText: 'Is TypeScript statically typed?',
        questionTypes: ['true_false'],
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        correctAnswer: 'True',
        points: 1,
        difficulty: 'easy' as const,
        tags: ['typescript'],
      };
      const newQuestion = createMockQuestion({
        questionTypes: ['true_false'],
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        correctAnswer: 'True',
        points: 1,
        difficulty: 'easy' as const,
        tags: ['typescript'],
      });

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: newQuestion,
          });
        })
      );

      const result = await createQuestion(departmentId, trueFalsePayload);

      expect(result.questionTypes[0]).toBe('true_false');
      expect(result.options).toHaveLength(2);
    });

    it('should create a short answer question', async () => {
      const shortAnswerPayload: CreateQuestionPayload = {
        questionBankId: 'qb-1',
        questionText: 'What is closure?',
        questionTypes: ['short_answer'],
        correctAnswer: 'A function with access to outer scope',
        points: 2,
        difficulty: 'medium' as const,
        tags: ['javascript'],
      };
      const newQuestion = createMockQuestion({
        questionTypes: ['short_answer'],
        correctAnswer: 'A function with access to outer scope',
        points: 2,
        difficulty: 'medium' as const,
        tags: ['javascript'],
        options: [],
      });

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: newQuestion,
          });
        })
      );

      const result = await createQuestion(departmentId, shortAnswerPayload);

      expect(result.questionTypes[0]).toBe('short_answer');
      expect(result.options).toHaveLength(0);
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Question text is required',
            },
            { status: 400 }
          );
        })
      );

      await expect(
        createQuestion(departmentId, {
          questionBankId: 'qb-1',
          questionText: '',
          questionTypes: ['multiple_choice'],
          points: 1,
        })
      ).rejects.toThrow();
    });
  });

  // =====================
  // GET QUESTION BY ID
  // =====================

  describe('getQuestionById', () => {
    it('should fetch a question by ID', async () => {
      const mockQuestion = mockQuestionDetails[0];

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions/${mockQuestion.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockQuestion,
          });
        })
      );

      const result = await getQuestionById(departmentId, mockQuestion.id);

      expect(result).toEqual(mockQuestion);
      expect(result.id).toBe(mockQuestion.id);
    });

    it('should include usage statistics', async () => {
      const mockQuestion = mockQuestionDetails[0];

      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions/${mockQuestion.id}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockQuestion,
          });
        })
      );

      const result = await getQuestionById(departmentId, mockQuestion.id);

      expect(result.usageCount).toBeDefined();
      expect(result.lastUsed).toBeDefined();
    });

    it('should handle question not found', async () => {
      server.use(
        http.get(`${baseUrl}/departments/${departmentId}/questions/invalid-id`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Question not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(getQuestionById(departmentId, 'invalid-id')).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE QUESTION
  // =====================

  describe('updateQuestion', () => {
    it('should update question information', async () => {
      const questionId = 'q1';
      const updatedQuestion = createMockQuestion({
        id: questionId,
        ...mockUpdateQuestionPayload,
      });

      server.use(
        http.put(`${baseUrl}/departments/${departmentId}/questions/${questionId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedQuestion,
          });
        })
      );

      const result = await updateQuestion(departmentId, questionId, mockUpdateQuestionPayload);

      expect(result).toEqual(updatedQuestion);
      expect(result.questionText).toBe(mockUpdateQuestionPayload.questionText);
    });

    it('should partially update question fields', async () => {
      const questionId = 'q1';
      const partialUpdate = {
        difficulty: 'hard' as const,
        tags: ['advanced', 'javascript'],
      };
      const updatedQuestion = createMockQuestion({
        id: questionId,
        ...partialUpdate,
      });

      server.use(
        http.put(`${baseUrl}/departments/${departmentId}/questions/${questionId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedQuestion,
          });
        })
      );

      const result = await updateQuestion(departmentId, questionId, partialUpdate);

      expect(result.difficulty).toBe('hard');
      expect(result.tags).toEqual(['advanced', 'javascript']);
    });

    it('should update question options', async () => {
      const questionId = 'q1';
      const updatedOptions = [
        { text: 'New option 1', isCorrect: true },
        { text: 'New option 2', isCorrect: false },
        { text: 'New option 3', isCorrect: false },
      ];
      const updatedQuestion = createMockQuestion({
        id: questionId,
        options: updatedOptions,
      });

      server.use(
        http.put(`${baseUrl}/departments/${departmentId}/questions/${questionId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedQuestion,
          });
        })
      );

      const result = await updateQuestion(departmentId, questionId, { options: updatedOptions });

      expect(result.options).toEqual(updatedOptions);
    });

    it('should handle update validation errors', async () => {
      const questionId = 'q1';

      server.use(
        http.put(`${baseUrl}/departments/${departmentId}/questions/${questionId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Points must be greater than 0',
            },
            { status: 400 }
          );
        })
      );

      await expect(updateQuestion(departmentId, questionId, { points: -1 })).rejects.toThrow();
    });
  });

  // =====================
  // DELETE QUESTION
  // =====================

  describe('deleteQuestion', () => {
    it('should delete a question', async () => {
      const questionId = 'q1';

      server.use(
        http.delete(`${baseUrl}/departments/${departmentId}/questions/${questionId}`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Question deleted successfully',
          });
        })
      );

      await expect(deleteQuestion(departmentId, questionId)).resolves.toBeUndefined();
    });

    it('should handle delete of non-existent question', async () => {
      const questionId = 'invalid-id';

      server.use(
        http.delete(`${baseUrl}/departments/${departmentId}/questions/${questionId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Question not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(deleteQuestion(departmentId, questionId)).rejects.toThrow();
    });
  });

  // =====================
  // BULK IMPORT QUESTIONS
  // =====================

  describe('bulkImportQuestions', () => {
    it('should successfully import all questions', async () => {
      const payload = {
        format: 'json' as const,
        questions: mockBulkImportQuestions,
        department: 'Computer Science',
        overwriteExisting: false,
      };

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBulkImportSuccessResponse,
          });
        })
      );

      const result = await bulkImportQuestions(departmentId, payload);

      expect(result).toEqual(mockBulkImportSuccessResponse);
      expect(result.imported).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.results).toHaveLength(3);
    });

    it('should handle partial import with failures', async () => {
      const payload = {
        format: 'json' as const,
        questions: mockBulkImportQuestions,
        department: 'Computer Science',
      };

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBulkImportPartialResponse,
          });
        })
      );

      const result = await bulkImportQuestions(departmentId, payload);

      expect(result.imported).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.results).toHaveLength(3);
      expect(result.results[1].status).toBe('error');
      expect(result.results[1].error).toBe('Duplicate question text found');
    });

    it('should import with overwrite existing enabled', async () => {
      const payload = {
        format: 'json' as const,
        questions: mockBulkImportQuestions,
        overwriteExisting: true,
      };

      const response = {
        imported: 1,
        failed: 0,
        updated: 2,
        results: [
          { index: 0, status: 'success' as const, questionId: 'q-bulk-1', error: null },
          { index: 1, status: 'success' as const, questionId: 'q-existing-1', error: null },
          { index: 2, status: 'success' as const, questionId: 'q-existing-2', error: null },
        ],
      };

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: response,
          });
        })
      );

      const result = await bulkImportQuestions(departmentId, payload);

      expect(result.imported).toBe(1);
      expect(result.updated).toBe(2);
    });

    it('should import questions in CSV format', async () => {
      const payload = {
        format: 'csv' as const,
        questions: mockBulkImportQuestions,
      };

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBulkImportSuccessResponse,
          });
        })
      );

      const result = await bulkImportQuestions(departmentId, payload);

      expect(result.imported).toBe(3);
    });

    it('should handle bulk import validation errors', async () => {
      const payload = {
        format: 'json' as const,
        questions: [],
      };

      server.use(
        http.post(`${baseUrl}/departments/${departmentId}/questions/bulk`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'No questions provided',
            },
            { status: 400 }
          );
        })
      );

      await expect(bulkImportQuestions(departmentId, payload)).rejects.toThrow();
    });
  });
});
