/**
 * Tests for Content Attempt API Client
 * Tests all content attempt tracking endpoints following TDD approach
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { contentAttemptApi } from '../contentAttemptApi';
import type {
  ContentAttempt,
  ListAttemptsResponse,
  CreateAttemptResponse,
  UpdateAttemptResponse,
  CompleteAttemptResponse,
  ScormCmiData,
  UpdateCmiDataResponse,
  SuspendAttemptResponse,
  ResumeAttemptResponse,
  DeleteAttemptResponse,
} from '../../model/types';

describe('contentAttemptApi', () => {
  const baseUrl = env.apiFullUrl;

  // Mock data
  const mockAttempt: ContentAttempt = {
    id: 'attempt-1',
    contentId: 'content-1',
    content: {
      id: 'content-1',
      title: 'Safety Training Module 1',
      type: 'scorm',
      description: 'Introduction to workplace safety',
      duration: 45,
    },
    learnerId: 'learner-1',
    learner: {
      id: 'learner-1',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    },
    enrollmentId: 'enrollment-1',
    enrollment: {
      id: 'enrollment-1',
      courseId: 'course-1',
      courseTitle: 'Workplace Safety Fundamentals',
    },
    attemptNumber: 1,
    status: 'in-progress',
    progressPercent: 65,
    score: null,
    scoreRaw: 78,
    scoreMin: 0,
    scoreMax: 100,
    scoreScaled: 0.78,
    completionStatus: 'incomplete',
    successStatus: 'unknown',
    timeSpentSeconds: 1820,
    totalTime: 1820,
    sessionTime: 450,
    startedAt: '2026-01-08T10:00:00.000Z',
    lastAccessedAt: '2026-01-08T10:30:00.000Z',
    completedAt: null,
    scormVersion: '1.2',
    location: 'page-5',
    suspendData: 'bookmark=page5;completed=false',
    cmiData: {
      'cmi.core.lesson_status': 'incomplete',
      'cmi.core.score.raw': '78',
      'cmi.core.lesson_location': 'page-5',
    },
    hasScormData: true,
    createdAt: '2026-01-08T10:00:00.000Z',
    updatedAt: '2026-01-08T10:30:00.000Z',
  };

  const mockVideoAttempt: ContentAttempt = {
    id: 'attempt-2',
    contentId: 'content-2',
    content: {
      id: 'content-2',
      title: 'Introduction to React',
      type: 'video',
      duration: 30,
    },
    learnerId: 'learner-1',
    enrollmentId: 'enrollment-1',
    attemptNumber: 1,
    status: 'in-progress',
    progressPercent: 45,
    score: null,
    scoreRaw: null,
    scoreMin: null,
    scoreMax: null,
    scoreScaled: null,
    timeSpentSeconds: 810,
    totalTime: 810,
    sessionTime: 810,
    startedAt: '2026-01-09T09:00:00.000Z',
    lastAccessedAt: '2026-01-09T09:13:30.000Z',
    completedAt: null,
    scormVersion: null,
    location: '810',
    suspendData: null,
    hasScormData: false,
    createdAt: '2026-01-09T09:00:00.000Z',
    updatedAt: '2026-01-09T09:13:30.000Z',
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST ATTEMPTS
  // =====================

  describe('listAttempts', () => {
    it('should fetch paginated list of attempts without filters', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt, mockVideoAttempt],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/content-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.listAttempts();

      expect(result).toEqual(mockResponse);
      expect(result.attempts).toHaveLength(2);
    });

    it('should filter attempts by contentId', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt],
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
        http.get(`${baseUrl}/content-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.listAttempts({ contentId: 'content-1' });

      expect(result.attempts).toHaveLength(1);
      expect(capturedParams!.get('contentId')).toBe('content-1');
    });

    it('should filter attempts by enrollmentId', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt, mockVideoAttempt],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/content-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await contentAttemptApi.listAttempts({ enrollmentId: 'enrollment-1' });

      expect(capturedParams!.get('enrollmentId')).toBe('enrollment-1');
    });

    it('should filter attempts by status', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt],
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
        http.get(`${baseUrl}/content-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await contentAttemptApi.listAttempts({ status: 'in-progress' });

      expect(capturedParams!.get('status')).toBe('in-progress');
    });

    it('should handle pagination params', async () => {
      const mockResponse: ListAttemptsResponse = {
        attempts: [mockAttempt],
        pagination: {
          page: 2,
          limit: 10,
          total: 15,
          totalPages: 2,
          hasNext: false,
          hasPrev: true,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/content-attempts`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await contentAttemptApi.listAttempts({ page: 2, limit: 10 });

      expect(capturedParams!.get('page')).toBe('2');
      expect(capturedParams!.get('limit')).toBe('10');
    });

    it('should handle error response', async () => {
      server.use(
        http.get(`${baseUrl}/content-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Failed to fetch attempts',
            },
            { status: 500 }
          );
        })
      );

      await expect(contentAttemptApi.listAttempts()).rejects.toThrow();
    });
  });

  // =====================
  // GET ATTEMPT BY ID
  // =====================

  describe('getAttemptById', () => {
    it('should fetch attempt by id', async () => {
      server.use(
        http.get(`${baseUrl}/content-attempts/attempt-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockAttempt,
          });
        })
      );

      const result = await contentAttemptApi.getAttemptById('attempt-1');

      expect(result).toEqual(mockAttempt);
      expect(result.id).toBe('attempt-1');
    });

    it('should include CMI data when requested', async () => {
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/content-attempts/attempt-1`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockAttempt,
          });
        })
      );

      await contentAttemptApi.getAttemptById('attempt-1', true);

      expect(capturedParams!.get('includeCmi')).toBe('true');
    });

    it('should handle not found error', async () => {
      server.use(
        http.get(`${baseUrl}/content-attempts/invalid-id`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Attempt not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(contentAttemptApi.getAttemptById('invalid-id')).rejects.toThrow();
    });
  });

  // =====================
  // CREATE ATTEMPT
  // =====================

  describe('createAttempt', () => {
    it('should create a new SCORM attempt', async () => {
      const createData = {
        contentId: 'content-1',
        enrollmentId: 'enrollment-1',
        scormVersion: '1.2' as const,
      };

      const mockResponse: CreateAttemptResponse = {
        ...mockAttempt,
        status: 'started',
        progressPercent: 0,
        timeSpentSeconds: 0,
        launchUrl: '/scorm/content-1/launch?attempt=attempt-1',
      };

      server.use(
        http.post(`${baseUrl}/content-attempts`, async ({ request }) => {
          const body = (await request.json()) as typeof createData;
          expect(body.contentId).toBe('content-1');
          expect(body.scormVersion).toBe('1.2');

          return HttpResponse.json({
            success: true,
            message: 'Content attempt created successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.createAttempt(createData);

      expect(result.id).toBe('attempt-1');
      expect(result.status).toBe('started');
      expect(result.launchUrl).toBeTruthy();
    });

    it('should create a video attempt without SCORM version', async () => {
      const createData = {
        contentId: 'content-2',
        enrollmentId: 'enrollment-1',
      };

      const mockResponse: CreateAttemptResponse = {
        ...mockVideoAttempt,
        status: 'started',
        progressPercent: 0,
        timeSpentSeconds: 0,
        launchUrl: null,
      };

      server.use(
        http.post(`${baseUrl}/content-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.createAttempt(createData);

      expect(result.scormVersion).toBeNull();
    });

    it('should handle attempt already exists error', async () => {
      server.use(
        http.post(`${baseUrl}/content-attempts`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Active attempt already exists',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        contentAttemptApi.createAttempt({ contentId: 'content-1' })
      ).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE ATTEMPT
  // =====================

  describe('updateAttempt', () => {
    it('should update attempt progress', async () => {
      const updateData = {
        status: 'in-progress' as const,
        progressPercent: 75,
        timeSpentSeconds: 300,
        location: 'page-6',
      };

      const mockResponse: UpdateAttemptResponse = {
        id: 'attempt-1',
        status: 'in-progress',
        progressPercent: 75,
        score: null,
        timeSpentSeconds: 2120,
        lastAccessedAt: '2026-01-08T10:35:00.000Z',
        completedAt: null,
        updatedAt: '2026-01-08T10:35:00.000Z',
      };

      server.use(
        http.patch(`${baseUrl}/content-attempts/attempt-1`, async ({ request }) => {
          const body = (await request.json()) as typeof updateData;
          expect(body.progressPercent).toBe(75);

          return HttpResponse.json({
            success: true,
            message: 'Attempt updated successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.updateAttempt('attempt-1', updateData);

      expect(result.progressPercent).toBe(75);
      expect(result.timeSpentSeconds).toBe(2120);
    });

    it('should update attempt with suspend data', async () => {
      const updateData = {
        suspendData: 'bookmark=page7;quiz1Complete=true',
        location: 'page-7',
      };

      const mockResponse: UpdateAttemptResponse = {
        id: 'attempt-1',
        status: 'in-progress',
        progressPercent: 75,
        score: null,
        timeSpentSeconds: 2120,
        lastAccessedAt: '2026-01-08T10:40:00.000Z',
        completedAt: null,
        updatedAt: '2026-01-08T10:40:00.000Z',
      };

      server.use(
        http.patch(`${baseUrl}/content-attempts/attempt-1`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await contentAttemptApi.updateAttempt('attempt-1', updateData);
    });

    it('should handle invalid state error', async () => {
      server.use(
        http.patch(`${baseUrl}/content-attempts/attempt-1`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot update completed attempt',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        contentAttemptApi.updateAttempt('attempt-1', { status: 'completed' })
      ).rejects.toThrow();
    });
  });

  // =====================
  // COMPLETE ATTEMPT
  // =====================

  describe('completeAttempt', () => {
    it('should complete attempt with passing score', async () => {
      const completeData = {
        score: 92,
        scoreRaw: 92,
        scoreScaled: 0.92,
        passed: true,
        timeSpentSeconds: 180,
      };

      const mockResponse: CompleteAttemptResponse = {
        id: 'attempt-1',
        status: 'passed',
        progressPercent: 100,
        score: 92,
        scoreRaw: 92,
        scoreScaled: 0.92,
        passed: true,
        timeSpentSeconds: 2300,
        completedAt: '2026-01-08T10:40:00.000Z',
        certificate: null,
      };

      server.use(
        http.post(`${baseUrl}/content-attempts/attempt-1/complete`, async ({ request }) => {
          const body = (await request.json()) as typeof completeData;
          expect(body.passed).toBe(true);
          expect(body.score).toBe(92);

          return HttpResponse.json({
            success: true,
            message: 'Content attempt completed successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.completeAttempt('attempt-1', completeData);

      expect(result.status).toBe('passed');
      expect(result.progressPercent).toBe(100);
      expect(result.passed).toBe(true);
    });

    it('should complete attempt with failing score', async () => {
      const completeData = {
        score: 55,
        passed: false,
      };

      const mockResponse: CompleteAttemptResponse = {
        id: 'attempt-1',
        status: 'failed',
        progressPercent: 100,
        score: 55,
        scoreRaw: 55,
        scoreScaled: 0.55,
        passed: false,
        timeSpentSeconds: 2300,
        completedAt: '2026-01-08T10:40:00.000Z',
        certificate: null,
      };

      server.use(
        http.post(`${baseUrl}/content-attempts/attempt-1/complete`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.completeAttempt('attempt-1', completeData);

      expect(result.status).toBe('failed');
      expect(result.passed).toBe(false);
    });

    it('should handle already completed error', async () => {
      server.use(
        http.post(`${baseUrl}/content-attempts/attempt-1/complete`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Attempt already completed',
            },
            { status: 409 }
          );
        })
      );

      await expect(contentAttemptApi.completeAttempt('attempt-1', {})).rejects.toThrow();
    });
  });

  // =====================
  // GET CMI DATA
  // =====================

  describe('getCmiData', () => {
    it('should fetch SCORM CMI data', async () => {
      const mockCmiData: ScormCmiData = {
        attemptId: 'attempt-1',
        scormVersion: '1.2',
        cmiData: {
          'cmi.core.student_id': 'learner-1',
          'cmi.core.student_name': 'Smith, Jane',
          'cmi.core.lesson_status': 'incomplete',
          'cmi.core.lesson_location': 'page-6',
          'cmi.core.score.raw': '78',
          'cmi.suspend_data': 'bookmark=page6;completed=false',
        },
        lastUpdated: '2026-01-08T10:35:00.000Z',
      };

      server.use(
        http.get(`${baseUrl}/content-attempts/attempt-1/cmi`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCmiData,
          });
        })
      );

      const result = await contentAttemptApi.getCmiData('attempt-1');

      expect(result.attemptId).toBe('attempt-1');
      expect(result.scormVersion).toBe('1.2');
      expect(result.cmiData['cmi.core.lesson_status']).toBe('incomplete');
    });

    it('should handle not found error for non-SCORM content', async () => {
      server.use(
        http.get(`${baseUrl}/content-attempts/attempt-2/cmi`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Attempt not found or no CMI data',
            },
            { status: 404 }
          );
        })
      );

      await expect(contentAttemptApi.getCmiData('attempt-2')).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE CMI DATA
  // =====================

  describe('updateCmiData', () => {
    it('should update SCORM CMI data', async () => {
      const updateData = {
        cmiData: {
          'cmi.core.lesson_status': 'incomplete',
          'cmi.core.lesson_location': 'page-7',
          'cmi.core.score.raw': '85',
          'cmi.suspend_data': 'bookmark=page7;completed=false',
        },
        autoCommit: true,
      };

      const mockResponse: UpdateCmiDataResponse = {
        attemptId: 'attempt-1',
        updatedFields: [
          'cmi.core.lesson_status',
          'cmi.core.lesson_location',
          'cmi.core.score.raw',
          'cmi.suspend_data',
        ],
        lastUpdated: '2026-01-08T10:40:00.000Z',
      };

      server.use(
        http.put(`${baseUrl}/content-attempts/attempt-1/cmi`, async ({ request }) => {
          const body = (await request.json()) as typeof updateData;
          expect(body.cmiData['cmi.core.lesson_location']).toBe('page-7');

          return HttpResponse.json({
            success: true,
            message: 'CMI data updated successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.updateCmiData('attempt-1', updateData);

      expect(result.updatedFields).toHaveLength(4);
      expect(result.attemptId).toBe('attempt-1');
    });

    it('should handle read-only field error', async () => {
      server.use(
        http.put(`${baseUrl}/content-attempts/attempt-1/cmi`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot update read-only CMI field',
            },
            { status: 409 }
          );
        })
      );

      await expect(
        contentAttemptApi.updateCmiData('attempt-1', {
          cmiData: { 'cmi.core.student_id': 'new-id' },
        })
      ).rejects.toThrow();
    });
  });

  // =====================
  // SUSPEND ATTEMPT
  // =====================

  describe('suspendAttempt', () => {
    it('should suspend an attempt', async () => {
      const suspendData = {
        suspendData: 'bookmark=page7;quiz1Complete=true;score=85',
        location: 'page-7',
        sessionTime: 300,
      };

      const mockResponse: SuspendAttemptResponse = {
        id: 'attempt-1',
        status: 'suspended',
        suspendData: 'bookmark=page7;quiz1Complete=true;score=85',
        location: 'page-7',
        timeSpentSeconds: 2600,
        lastAccessedAt: '2026-01-08T10:45:00.000Z',
      };

      server.use(
        http.post(`${baseUrl}/content-attempts/attempt-1/suspend`, async ({ request }) => {
          const body = (await request.json()) as typeof suspendData;
          expect(body.location).toBe('page-7');

          return HttpResponse.json({
            success: true,
            message: 'Attempt suspended successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.suspendAttempt('attempt-1', suspendData);

      expect(result.status).toBe('suspended');
      expect(result.suspendData).toBeTruthy();
    });
  });

  // =====================
  // RESUME ATTEMPT
  // =====================

  describe('resumeAttempt', () => {
    it('should resume a suspended attempt', async () => {
      const mockResponse: ResumeAttemptResponse = {
        id: 'attempt-1',
        status: 'in-progress',
        suspendData: 'bookmark=page7;quiz1Complete=true;score=85',
        location: 'page-7',
        cmiData: {
          'cmi.core.lesson_status': 'incomplete',
          'cmi.core.lesson_location': 'page-7',
          'cmi.suspend_data': 'bookmark=page7;quiz1Complete=true;score=85',
        },
        launchUrl: '/scorm/content-1/launch?attempt=attempt-1',
        lastAccessedAt: '2026-01-08T11:00:00.000Z',
      };

      server.use(
        http.post(`${baseUrl}/content-attempts/attempt-1/resume`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Attempt resumed successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.resumeAttempt('attempt-1');

      expect(result.status).toBe('in-progress');
      expect(result.suspendData).toBeTruthy();
      expect(result.cmiData).toBeDefined();
    });

    it('should handle invalid state error', async () => {
      server.use(
        http.post(`${baseUrl}/content-attempts/attempt-1/resume`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Attempt is not suspended',
            },
            { status: 409 }
          );
        })
      );

      await expect(contentAttemptApi.resumeAttempt('attempt-1')).rejects.toThrow();
    });
  });

  // =====================
  // DELETE ATTEMPT
  // =====================

  describe('deleteAttempt', () => {
    it('should delete an attempt (soft delete)', async () => {
      const mockResponse: DeleteAttemptResponse = {
        id: 'attempt-1',
        deleted: true,
        deletedAt: '2026-01-09T12:00:00.000Z',
      };

      server.use(
        http.delete(`${baseUrl}/content-attempts/attempt-1`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Attempt deleted successfully',
            data: mockResponse,
          });
        })
      );

      const result = await contentAttemptApi.deleteAttempt('attempt-1');

      expect(result.deleted).toBe(true);
      expect(result.id).toBe('attempt-1');
    });

    it('should delete an attempt permanently', async () => {
      const mockResponse: DeleteAttemptResponse = {
        id: 'attempt-1',
        deleted: true,
        deletedAt: '2026-01-09T12:00:00.000Z',
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.delete(`${baseUrl}/content-attempts/attempt-1`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await contentAttemptApi.deleteAttempt('attempt-1', true);

      expect(capturedParams!.get('permanent')).toBe('true');
    });

    it('should handle forbidden error', async () => {
      server.use(
        http.delete(`${baseUrl}/content-attempts/attempt-1`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Insufficient permissions to delete attempts',
            },
            { status: 403 }
          );
        })
      );

      await expect(contentAttemptApi.deleteAttempt('attempt-1')).rejects.toThrow();
    });
  });
});
