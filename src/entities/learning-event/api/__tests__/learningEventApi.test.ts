/**
 * Tests for Learning Event API Client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { learningEventApi } from '../learningEventApi';
import {
  mockLearningEvents,
  mockLearningEventsListResponse,
  mockCreateLearningEventData,
  createMockLearningEvent,
  mockLearnerActivityResponse,
  mockCourseActivityResponse,
  mockClassActivityResponse,
  mockActivityStatsResponse,
  mockBatchCreateEventsResponse,
  mockBatchCreateWithErrorsResponse,
} from '@/test/mocks/data/learningEvents';

describe('learningEventApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('list', () => {
    it('should fetch paginated list of learning events without filters', async () => {
      server.use(
        http.get(`${baseUrl}/learning-events`, () => {
          return HttpResponse.json({
            success: true,
            data: mockLearningEventsListResponse,
          });
        })
      );

      const result = await learningEventApi.list();

      expect(result).toEqual(mockLearningEventsListResponse);
      expect(result.events).toHaveLength(mockLearningEvents.length);
    });

    it('should fetch events with pagination params', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockLearningEventsListResponse,
          });
        })
      );

      await learningEventApi.list({ page: 2, limit: 10 });

      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('2');
      expect(capturedParams!.get('limit')).toBe('10');
    });

    it('should fetch events with learner filter', async () => {
      const learnerId = '507f1f77bcf86cd799439011';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockLearningEventsListResponse,
          });
        })
      );

      await learningEventApi.list({ learner: learnerId });

      expect(capturedParams!.get('learner')).toBe(learnerId);
    });

    it('should fetch events with type filter', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockLearningEventsListResponse,
          });
        })
      );

      await learningEventApi.list({ type: 'content_completed' });

      expect(capturedParams!.get('type')).toBe('content_completed');
    });

    it('should fetch events with date range filters', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockLearningEventsListResponse,
          });
        })
      );

      await learningEventApi.list({
        dateFrom: '2026-01-01T00:00:00.000Z',
        dateTo: '2026-01-08T23:59:59.999Z',
      });

      expect(capturedParams!.get('dateFrom')).toBe('2026-01-01T00:00:00.000Z');
      expect(capturedParams!.get('dateTo')).toBe('2026-01-08T23:59:59.999Z');
    });

    it('should handle empty event list', async () => {
      server.use(
        http.get(`${baseUrl}/learning-events`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              events: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      const result = await learningEventApi.list();

      expect(result.events).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/learning-events`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(learningEventApi.list()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('should fetch single learning event by ID', async () => {
      const eventId = '507f1f77bcf86cd799439020';
      const mockEvent = createMockLearningEvent({ id: eventId });

      server.use(
        http.get(`${baseUrl}/learning-events/${eventId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockEvent,
          });
        })
      );

      const result = await learningEventApi.getById(eventId);

      expect(result).toEqual(mockEvent);
      expect(result.id).toBe(eventId);
    });

    it('should handle event not found error', async () => {
      const eventId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/learning-events/${eventId}`, () => {
          return HttpResponse.json(
            { message: 'Learning event not found' },
            { status: 404 }
          );
        })
      );

      await expect(learningEventApi.getById(eventId)).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create new learning event', async () => {
      const newEvent = createMockLearningEvent({
        id: '507f1f77bcf86cd799439020',
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/learning-events`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              message: 'Learning event created successfully',
              data: newEvent,
            },
            { status: 201 }
          );
        })
      );

      const result = await learningEventApi.create(mockCreateLearningEventData);

      expect(result).toEqual(newEvent);
      expect(capturedRequestBody).toMatchObject({
        type: mockCreateLearningEventData.type,
        learnerId: mockCreateLearningEventData.learnerId,
        score: mockCreateLearningEventData.score,
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ...mockCreateLearningEventData,
        type: 'invalid_type' as any,
      };

      server.use(
        http.post(`${baseUrl}/learning-events`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                type: ['Invalid event type'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(learningEventApi.create(invalidData)).rejects.toThrow();
    });

    it('should handle learner not found error', async () => {
      server.use(
        http.post(`${baseUrl}/learning-events`, () => {
          return HttpResponse.json(
            { message: 'Learner not found' },
            { status: 404 }
          );
        })
      );

      await expect(learningEventApi.create(mockCreateLearningEventData)).rejects.toThrow();
    });
  });

  describe('createBatch', () => {
    it('should create multiple events in batch', async () => {
      const events = [
        mockCreateLearningEventData,
        { ...mockCreateLearningEventData, type: 'module_completed' as const },
      ];

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/learning-events/batch`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              message: 'Batch events created: 2 created, 0 failed',
              data: mockBatchCreateEventsResponse,
            },
            { status: 201 }
          );
        })
      );

      const result = await learningEventApi.createBatch(events);

      expect(result).toEqual(mockBatchCreateEventsResponse);
      expect(result.created).toBe(2);
      expect(result.failed).toBe(0);
      expect(capturedRequestBody.events).toHaveLength(2);
    });

    it('should handle partial batch failure', async () => {
      const events = [
        mockCreateLearningEventData,
        { ...mockCreateLearningEventData, learnerId: 'non-existent' },
      ];

      server.use(
        http.post(`${baseUrl}/learning-events/batch`, () => {
          return HttpResponse.json(
            {
              success: true,
              message: 'Batch events created: 1 created, 1 failed',
              data: mockBatchCreateWithErrorsResponse,
            },
            { status: 201 }
          );
        })
      );

      const result = await learningEventApi.createBatch(events);

      expect(result.created).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].index).toBe(1);
    });

    it('should handle empty batch', async () => {
      server.use(
        http.post(`${baseUrl}/learning-events/batch`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: {
                created: 0,
                failed: 0,
                events: [],
                errors: [],
              },
            },
            { status: 201 }
          );
        })
      );

      const result = await learningEventApi.createBatch([]);

      expect(result.created).toBe(0);
      expect(result.events).toHaveLength(0);
    });

    it('should handle batch size limit error', async () => {
      const events = Array(101).fill(mockCreateLearningEventData);

      server.use(
        http.post(`${baseUrl}/learning-events/batch`, () => {
          return HttpResponse.json(
            { message: 'Batch size exceeds maximum of 100 events' },
            { status: 400 }
          );
        })
      );

      await expect(learningEventApi.createBatch(events)).rejects.toThrow();
    });
  });

  describe('getLearnerActivity', () => {
    it('should fetch learner activity feed', async () => {
      const learnerId = '507f1f77bcf86cd799439011';

      server.use(
        http.get(`${baseUrl}/learning-events/learner/${learnerId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockLearnerActivityResponse,
          });
        })
      );

      const result = await learningEventApi.getLearnerActivity(learnerId);

      expect(result).toEqual(mockLearnerActivityResponse);
      expect(result.learner.id).toBe(learnerId);
      expect(result.summary).toBeDefined();
      expect(result.summary.totalEvents).toBe(45);
    });

    it('should fetch learner activity with filters', async () => {
      const learnerId = '507f1f77bcf86cd799439011';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events/learner/${learnerId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockLearnerActivityResponse,
          });
        })
      );

      await learningEventApi.getLearnerActivity(learnerId, {
        type: 'content_completed',
        page: 2,
      });

      expect(capturedParams!.get('type')).toBe('content_completed');
      expect(capturedParams!.get('page')).toBe('2');
    });

    it('should handle learner not found error', async () => {
      const learnerId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/learning-events/learner/${learnerId}`, () => {
          return HttpResponse.json(
            { message: 'Learner not found' },
            { status: 404 }
          );
        })
      );

      await expect(learningEventApi.getLearnerActivity(learnerId)).rejects.toThrow();
    });
  });

  describe('getCourseActivity', () => {
    it('should fetch course activity feed', async () => {
      const courseId = '507f1f77bcf86cd799439012';

      server.use(
        http.get(`${baseUrl}/learning-events/course/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCourseActivityResponse,
          });
        })
      );

      const result = await learningEventApi.getCourseActivity(courseId);

      expect(result).toEqual(mockCourseActivityResponse);
      expect(result.course.id).toBe(courseId);
      expect(result.summary).toBeDefined();
    });

    it('should fetch course activity with filters', async () => {
      const courseId = '507f1f77bcf86cd799439012';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events/course/${courseId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockCourseActivityResponse,
          });
        })
      );

      await learningEventApi.getCourseActivity(courseId, {
        learner: '507f1f77bcf86cd799439011',
      });

      expect(capturedParams!.get('learner')).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('getClassActivity', () => {
    it('should fetch class activity feed', async () => {
      const classId = '507f1f77bcf86cd799439013';

      server.use(
        http.get(`${baseUrl}/learning-events/class/${classId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockClassActivityResponse,
          });
        })
      );

      const result = await learningEventApi.getClassActivity(classId);

      expect(result).toEqual(mockClassActivityResponse);
      expect(result.class.id).toBe(classId);
      expect(result.summary).toBeDefined();
    });
  });

  describe('getStats', () => {
    it('should fetch activity statistics', async () => {
      server.use(
        http.get(`${baseUrl}/learning-events/stats`, () => {
          return HttpResponse.json({
            success: true,
            data: mockActivityStatsResponse,
          });
        })
      );

      const result = await learningEventApi.getStats();

      expect(result).toEqual(mockActivityStatsResponse);
      expect(result.overall).toBeDefined();
      expect(result.eventsByType).toBeDefined();
      expect(result.completionRates).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.timeline).toBeDefined();
    });

    it('should fetch stats with filters', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/learning-events/stats`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockActivityStatsResponse,
          });
        })
      );

      await learningEventApi.getStats({
        dateFrom: '2026-01-01T00:00:00.000Z',
        dateTo: '2026-01-08T23:59:59.999Z',
        groupBy: 'day',
      });

      expect(capturedParams!.get('dateFrom')).toBe('2026-01-01T00:00:00.000Z');
      expect(capturedParams!.get('dateTo')).toBe('2026-01-08T23:59:59.999Z');
      expect(capturedParams!.get('groupBy')).toBe('day');
    });
  });
});
