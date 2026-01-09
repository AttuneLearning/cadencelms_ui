/**
 * Tests for Exercise API Client
 * Tests all 10 exercise management endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  getExerciseQuestions,
  addExerciseQuestion,
  bulkAddExerciseQuestions,
  removeExerciseQuestion,
  reorderExerciseQuestions,
  publishExercise,
  unpublishExercise,
  archiveExercise,
} from '../exerciseApi';
import type { ExercisesListResponse } from '../../model/types';
import {
  mockExerciseListItems,
  mockPublishedQuiz,
  mockPublishedExam,
  mockDraftQuiz,
  mockArchivedQuiz,
  mockCreateExercisePayload,
  mockUpdateExercisePayload,
  mockQuestions,
  mockAddQuestionPayload,
  mockBulkAddQuestionsPayload,
  mockAddQuestionResponse,
  mockBulkAddQuestionsResponse,
  mockBulkAddQuestionsWithErrorsResponse,
  mockRemoveQuestionResponse,
  mockReorderQuestionsResponse,
  mockExerciseQuestionsResponse,
  createMockExercise,
} from '@/test/mocks/data/exercises';

describe('exerciseApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST EXERCISES
  // =====================

  describe('listExercises', () => {
    it('should fetch paginated list of exercises without filters', async () => {
      const mockResponse: ExercisesListResponse = {
        exercises: mockExerciseListItems,
        pagination: {
          page: 1,
          limit: 20,
          total: mockExerciseListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises();

      expect(result).toEqual(mockResponse);
      expect(result.exercises).toHaveLength(mockExerciseListItems.length);
    });

    it('should fetch exercises with pagination params', async () => {
      const mockResponse: ExercisesListResponse = {
        exercises: mockExerciseListItems.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockExerciseListItems.length,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should filter exercises by type', async () => {
      const filteredExercises = mockExerciseListItems.filter((e) => e.type === 'quiz');

      const mockResponse: ExercisesListResponse = {
        exercises: filteredExercises,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredExercises.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ type: 'quiz' });

      expect(result.exercises).toHaveLength(filteredExercises.length);
      expect(result.exercises.every((e) => e.type === 'quiz')).toBe(true);
    });

    it('should filter exercises by department', async () => {
      const filteredExercises = mockExerciseListItems.filter((e) => e.department === 'dept-1');

      const mockResponse: ExercisesListResponse = {
        exercises: filteredExercises,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredExercises.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ department: 'dept-1' });

      expect(result.exercises).toHaveLength(filteredExercises.length);
    });

    it('should filter exercises by difficulty', async () => {
      const filteredExercises = mockExerciseListItems.filter((e) => e.difficulty === 'easy');

      const mockResponse: ExercisesListResponse = {
        exercises: filteredExercises,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredExercises.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ difficulty: 'easy' });

      expect(result.exercises).toHaveLength(filteredExercises.length);
      expect(result.exercises.every((e) => e.difficulty === 'easy')).toBe(true);
    });

    it('should filter exercises by status', async () => {
      const filteredExercises = mockExerciseListItems.filter((e) => e.status === 'published');

      const mockResponse: ExercisesListResponse = {
        exercises: filteredExercises,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredExercises.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ status: 'published' });

      expect(result.exercises).toHaveLength(filteredExercises.length);
      expect(result.exercises.every((e) => e.status === 'published')).toBe(true);
    });

    it('should search exercises by text', async () => {
      const filteredExercises = mockExerciseListItems.filter((e) =>
        e.title.toLowerCase().includes('javascript')
      );

      const mockResponse: ExercisesListResponse = {
        exercises: filteredExercises,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredExercises.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ search: 'javascript' });

      expect(result.exercises).toHaveLength(filteredExercises.length);
    });

    it('should sort exercises', async () => {
      const sortedExercises = [...mockExerciseListItems].sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      const mockResponse: ExercisesListResponse = {
        exercises: sortedExercises,
        pagination: {
          page: 1,
          limit: 20,
          total: sortedExercises.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises({ sort: 'title:asc' });

      expect(result.exercises).toEqual(sortedExercises);
    });

    it('should handle empty exercise list', async () => {
      const mockResponse: ExercisesListResponse = {
        exercises: [],
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
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listExercises();

      expect(result.exercises).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listExercises()).rejects.toThrow();
    });
  });

  // =====================
  // GET EXERCISE
  // =====================

  describe('getExercise', () => {
    it('should fetch single exercise by ID', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockPublishedQuiz,
          });
        })
      );

      const result = await getExercise(exerciseId);

      expect(result).toEqual(mockPublishedQuiz);
      expect(result.id).toBe(exerciseId);
    });

    it('should fetch quiz exercise', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockPublishedQuiz,
          });
        })
      );

      const result = await getExercise(exerciseId);

      expect(result.type).toBe('quiz');
      expect(result.status).toBe('published');
    });

    it('should fetch exam exercise', async () => {
      const exerciseId = 'ex-2';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockPublishedExam,
          });
        })
      );

      const result = await getExercise(exerciseId);

      expect(result.type).toBe('exam');
      expect(result.showFeedback).toBe(false);
      expect(result.allowReview).toBe(false);
    });

    it('should fetch draft exercise', async () => {
      const exerciseId = 'ex-5';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDraftQuiz,
          });
        })
      );

      const result = await getExercise(exerciseId);

      expect(result.status).toBe('draft');
      expect(result.questionCount).toBe(0);
    });

    it('should fetch archived exercise', async () => {
      const exerciseId = 'ex-6';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockArchivedQuiz,
          });
        })
      );

      const result = await getExercise(exerciseId);

      expect(result.status).toBe('archived');
    });

    it('should handle exercise not found error', async () => {
      const exerciseId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Exercise not found' },
            { status: 404 }
          );
        })
      );

      await expect(getExercise(exerciseId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getExercise(exerciseId)).rejects.toThrow();
    });
  });

  // =====================
  // CREATE EXERCISE
  // =====================

  describe('createExercise', () => {
    it('should create new exercise', async () => {
      const newExercise = createMockExercise({
        title: mockCreateExercisePayload.title,
        description: mockCreateExercisePayload.description,
        type: mockCreateExercisePayload.type,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              data: newExercise,
            },
            { status: 201 }
          );
        })
      );

      const result = await createExercise(mockCreateExercisePayload);

      expect(result).toEqual(newExercise);
      expect(capturedRequestBody).toMatchObject({
        title: mockCreateExercisePayload.title,
        description: mockCreateExercisePayload.description,
        type: mockCreateExercisePayload.type,
        department: mockCreateExercisePayload.department,
      });
    });

    it('should create exercise with minimal required fields', async () => {
      const minimalPayload = {
        title: 'Minimal Exercise',
        type: 'quiz' as const,
        department: 'dept-1',
      };

      const newExercise = createMockExercise({
        title: minimalPayload.title,
        type: minimalPayload.type,
      });

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: newExercise,
            },
            { status: 201 }
          );
        })
      );

      const result = await createExercise(minimalPayload);

      expect(result.title).toBe(minimalPayload.title);
      expect(result.type).toBe(minimalPayload.type);
    });

    it('should create exam exercise with strict settings', async () => {
      const examPayload = {
        title: 'Final Exam',
        type: 'exam' as const,
        department: 'dept-1',
        difficulty: 'hard' as const,
        timeLimit: 7200,
        passingScore: 80,
        shuffleQuestions: true,
        showFeedback: false,
        allowReview: false,
      };

      const newExercise = createMockExercise(examPayload);

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: newExercise,
            },
            { status: 201 }
          );
        })
      );

      const result = await createExercise(examPayload);

      expect(result.type).toBe('exam');
      expect(result.showFeedback).toBe(false);
      expect(result.allowReview).toBe(false);
    });

    it('should handle validation errors', async () => {
      const invalidPayload = {
        ...mockCreateExercisePayload,
        passingScore: 150, // Invalid: > 100
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                passingScore: ['Passing score must be between 0 and 100'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createExercise(invalidPayload)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const invalidPayload = {
        title: 'Test Exercise',
        // Missing type and department
      } as any;

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                type: ['Exercise type is required'],
                department: ['Department is required'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createExercise(invalidPayload)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE EXERCISE
  // =====================

  describe('updateExercise', () => {
    it('should update existing exercise', async () => {
      const exerciseId = 'ex-1';
      const updatedExercise = createMockExercise({
        id: exerciseId,
        title: mockUpdateExercisePayload.title,
        description: mockUpdateExercisePayload.description,
        difficulty: mockUpdateExercisePayload.difficulty,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: updatedExercise,
          });
        })
      );

      const result = await updateExercise(exerciseId, mockUpdateExercisePayload);

      expect(result).toEqual(updatedExercise);
      expect(capturedRequestBody).toEqual(mockUpdateExercisePayload);
    });

    it('should update exercise status', async () => {
      const exerciseId = 'ex-1';
      const statusUpdate = { status: 'archived' as const };
      const updatedExercise = { ...mockPublishedQuiz, status: 'archived' as const };

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedExercise,
          });
        })
      );

      const result = await updateExercise(exerciseId, statusUpdate);

      expect(result.status).toBe('archived');
    });

    it('should handle exercise not found error', async () => {
      const exerciseId = 'non-existent';

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Exercise not found' },
            { status: 404 }
          );
        })
      );

      await expect(updateExercise(exerciseId, mockUpdateExercisePayload)).rejects.toThrow();
    });
  });

  // =====================
  // DELETE EXERCISE
  // =====================

  describe('deleteExercise', () => {
    it('should delete exercise by ID', async () => {
      const exerciseId = 'ex-1';
      let deleteCalled = false;

      server.use(
        http.delete(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          deleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await deleteExercise(exerciseId);

      expect(deleteCalled).toBe(true);
    });

    it('should handle exercise not found error', async () => {
      const exerciseId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Exercise not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteExercise(exerciseId)).rejects.toThrow();
    });

    it('should handle exercise in use error', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.delete(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete exercise that is in use',
            },
            { status: 409 }
          );
        })
      );

      await expect(deleteExercise(exerciseId)).rejects.toThrow();
    });
  });

  // =====================
  // GET EXERCISE QUESTIONS
  // =====================

  describe('getExerciseQuestions', () => {
    it('should fetch questions for exercise', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExerciseQuestionsResponse,
          });
        })
      );

      const result = await getExerciseQuestions(exerciseId);

      expect(result).toEqual(mockExerciseQuestionsResponse);
      expect(result.questions).toHaveLength(mockQuestions.length);
    });

    it('should fetch questions without answers', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/ex-1/questions`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: {
              ...mockExerciseQuestionsResponse,
              questions: mockQuestions.map((q) => ({ ...q, correctAnswer: undefined })),
            },
          });
        })
      );

      await getExerciseQuestions('ex-1', { includeAnswers: false });

      expect(capturedParams!.get('includeAnswers')).toBe('false');
    });

    it('should handle empty question list', async () => {
      const exerciseId = 'ex-5';
      const emptyResponse = {
        exerciseId,
        exerciseTitle: 'New Quiz',
        questionCount: 0,
        totalPoints: 0,
        questions: [],
      };

      server.use(
        http.get(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: emptyResponse,
          });
        })
      );

      const result = await getExerciseQuestions(exerciseId);

      expect(result.questions).toHaveLength(0);
      expect(result.questionCount).toBe(0);
    });
  });

  // =====================
  // ADD QUESTION
  // =====================

  describe('addExerciseQuestion', () => {
    it('should add question to exercise', async () => {
      const exerciseId = 'ex-1';

      let capturedRequestBody: any = null;

      server.use(
        http.post(
          `${baseUrl}/api/v2/content/exercises/${exerciseId}/questions`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: mockAddQuestionResponse,
            });
          }
        )
      );

      const result = await addExerciseQuestion(exerciseId, mockAddQuestionPayload);

      expect(result).toEqual(mockAddQuestionResponse);
      expect(result.question.questionText).toBe(mockAddQuestionPayload.questionText);
      expect(result.updatedTotals.questionCount).toBe(6);
      expect(capturedRequestBody).toEqual(mockAddQuestionPayload);
    });

    it('should add multiple choice question', async () => {
      const exerciseId = 'ex-1';
      const mcQuestion = {
        questionText: 'What is 2 + 2?',
        questionType: 'multiple_choice' as const,
        options: ['3', '4', '5', '6'],
        correctAnswer: '4',
        points: 5,
        difficulty: 'easy' as const,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockAddQuestionResponse,
              question: {
                ...mockAddQuestionResponse.question,
                ...mcQuestion,
                id: 'q-new',
              },
            },
          });
        })
      );

      const result = await addExerciseQuestion(exerciseId, mcQuestion);

      expect(result.question.questionType).toBe('multiple_choice');
      expect(result.question.options).toHaveLength(4);
    });

    it('should add true/false question', async () => {
      const exerciseId = 'ex-1';
      const tfQuestion = {
        questionText: 'The sky is blue',
        questionType: 'true_false' as const,
        correctAnswer: 'true',
        points: 5,
        difficulty: 'easy' as const,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockAddQuestionResponse,
              question: {
                ...mockAddQuestionResponse.question,
                ...tfQuestion,
                id: 'q-new',
              },
            },
          });
        })
      );

      const result = await addExerciseQuestion(exerciseId, tfQuestion);

      expect(result.question.questionType).toBe('true_false');
    });

    it('should handle validation error', async () => {
      const exerciseId = 'ex-1';
      const invalidQuestion = {
        questionText: '',
        questionType: 'multiple_choice' as const,
        points: -5,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                questionText: ['Question text is required'],
                points: ['Points must be positive'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(addExerciseQuestion(exerciseId, invalidQuestion as any)).rejects.toThrow();
    });
  });

  // =====================
  // BULK ADD QUESTIONS
  // =====================

  describe('bulkAddExerciseQuestions', () => {
    it('should bulk add questions to exercise', async () => {
      const exerciseId = 'ex-1';

      let capturedRequestBody: any = null;

      server.use(
        http.post(
          `${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/bulk`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: mockBulkAddQuestionsResponse,
            });
          }
        )
      );

      const result = await bulkAddExerciseQuestions(exerciseId, mockBulkAddQuestionsPayload);

      expect(result).toEqual(mockBulkAddQuestionsResponse);
      expect(result.added).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(capturedRequestBody).toEqual(mockBulkAddQuestionsPayload);
    });

    it('should bulk add with append mode', async () => {
      const exerciseId = 'ex-1';
      const payload = {
        ...mockBulkAddQuestionsPayload,
        mode: 'append' as const,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBulkAddQuestionsResponse,
          });
        })
      );

      const result = await bulkAddExerciseQuestions(exerciseId, payload);

      expect(result.added).toBeGreaterThan(0);
    });

    it('should bulk add with replace mode', async () => {
      const exerciseId = 'ex-1';
      const payload = {
        ...mockBulkAddQuestionsPayload,
        mode: 'replace' as const,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBulkAddQuestionsResponse,
          });
        })
      );

      const result = await bulkAddExerciseQuestions(exerciseId, payload);

      expect(result.added).toBe(3);
    });

    it('should handle partial success with errors', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.post(`${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/bulk`, () => {
          return HttpResponse.json({
            success: true,
            data: mockBulkAddQuestionsWithErrorsResponse,
          });
        })
      );

      const result = await bulkAddExerciseQuestions(exerciseId, mockBulkAddQuestionsPayload);

      expect(result.added).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
    });
  });

  // =====================
  // REMOVE QUESTION
  // =====================

  describe('removeExerciseQuestion', () => {
    it('should remove question from exercise', async () => {
      const exerciseId = 'ex-1';
      const questionId = 'q-3';

      server.use(
        http.delete(
          `${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/${questionId}`,
          () => {
            return HttpResponse.json({
              success: true,
              data: mockRemoveQuestionResponse,
            });
          }
        )
      );

      const result = await removeExerciseQuestion(exerciseId, questionId);

      expect(result).toEqual(mockRemoveQuestionResponse);
      expect(result.removedQuestionId).toBe(questionId);
      expect(result.updatedTotals.questionCount).toBe(4);
    });

    it('should handle question not found error', async () => {
      const exerciseId = 'ex-1';
      const questionId = 'non-existent';

      server.use(
        http.delete(
          `${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/${questionId}`,
          () => {
            return HttpResponse.json(
              { success: false, message: 'Question not found' },
              { status: 404 }
            );
          }
        )
      );

      await expect(removeExerciseQuestion(exerciseId, questionId)).rejects.toThrow();
    });
  });

  // =====================
  // REORDER QUESTIONS
  // =====================

  describe('reorderExerciseQuestions', () => {
    it('should reorder questions in exercise', async () => {
      const exerciseId = 'ex-1';
      const payload = {
        questionIds: ['q-2', 'q-1', 'q-4', 'q-3', 'q-5'],
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(
          `${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/reorder`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: mockReorderQuestionsResponse,
            });
          }
        )
      );

      const result = await reorderExerciseQuestions(exerciseId, payload);

      expect(result).toEqual(mockReorderQuestionsResponse);
      expect(result.updatedOrder).toHaveLength(5);
      expect(result.updatedOrder[0].questionId).toBe('q-2');
      expect(capturedRequestBody).toEqual(payload);
    });

    it('should handle invalid question IDs', async () => {
      const exerciseId = 'ex-1';
      const payload = {
        questionIds: ['q-1', 'invalid-id'],
      };

      server.use(
        http.patch(
          `${baseUrl}/api/v2/content/exercises/${exerciseId}/questions/reorder`,
          () => {
            return HttpResponse.json(
              { success: false, message: 'Invalid question IDs provided' },
              { status: 400 }
            );
          }
        )
      );

      await expect(reorderExerciseQuestions(exerciseId, payload)).rejects.toThrow();
    });
  });

  // =====================
  // PUBLISH EXERCISE
  // =====================

  describe('publishExercise', () => {
    it('should publish draft exercise', async () => {
      const exerciseId = 'ex-5';
      const publishedExercise = { ...mockDraftQuiz, status: 'published' as const };

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: publishedExercise,
          });
        })
      );

      const result = await publishExercise(exerciseId);

      expect(result.status).toBe('published');
    });

    it('should handle already published exercise', async () => {
      const exerciseId = 'ex-1';

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Exercise is already published' },
            { status: 409 }
          );
        })
      );

      await expect(publishExercise(exerciseId)).rejects.toThrow();
    });
  });

  // =====================
  // UNPUBLISH EXERCISE
  // =====================

  describe('unpublishExercise', () => {
    it('should unpublish published exercise', async () => {
      const exerciseId = 'ex-1';
      const unpublishedExercise = { ...mockPublishedQuiz, status: 'draft' as const };

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: unpublishedExercise,
          });
        })
      );

      const result = await unpublishExercise(exerciseId);

      expect(result.status).toBe('draft');
    });
  });

  // =====================
  // ARCHIVE EXERCISE
  // =====================

  describe('archiveExercise', () => {
    it('should archive published exercise', async () => {
      const exerciseId = 'ex-1';
      const archivedExercise = { ...mockPublishedQuiz, status: 'archived' as const };

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: archivedExercise,
          });
        })
      );

      const result = await archiveExercise(exerciseId);

      expect(result.status).toBe('archived');
    });

    it('should handle already archived exercise', async () => {
      const exerciseId = 'ex-6';

      server.use(
        http.put(`${baseUrl}/api/v2/content/exercises/${exerciseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Exercise is already archived' },
            { status: 409 }
          );
        })
      );

      await expect(archiveExercise(exerciseId)).rejects.toThrow();
    });
  });
});
