import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { env } from '@/shared/config/env';
import { server } from '@/test/mocks/server';
import {
  getCourseModuleAccessSummary,
  getModuleAccessByEnrollment,
  getModuleAccessByModule,
  markLearningUnitStarted,
  recordModuleAccess,
  updateModuleAccessProgress,
} from '../moduleAccessApi';

describe('moduleAccessApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('records module access on canonical /module-access route', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.post(`${baseUrl}/module-access`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            moduleAccessId: 'ma-1',
            moduleId: 'mod-1',
            learnerId: 'learner-1',
            enrollmentId: 'enr-1',
            courseId: 'course-1',
            firstAccessedAt: '2026-02-13T00:00:00.000Z',
            lastAccessedAt: '2026-02-13T00:00:00.000Z',
            accessCount: 1,
            hasStartedLearningUnit: false,
            status: 'accessed',
            isNewAccess: true,
          },
        });
      })
    );

    const result = await recordModuleAccess('mod-1', {
      enrollmentId: 'enr-1',
      courseId: 'course-1',
    });

    expect(capturedBody).toEqual({
      moduleId: 'mod-1',
      enrollmentId: 'enr-1',
      courseId: 'course-1',
    });
    expect(result.moduleAccessId).toBe('ma-1');
  });

  it('gets module access by enrollment via /module-access query', async () => {
    let capturedEnrollmentId: string | null = null;

    server.use(
      http.get(`${baseUrl}/module-access`, ({ request }) => {
        const url = new URL(request.url);
        capturedEnrollmentId = url.searchParams.get('enrollmentId');
        return HttpResponse.json({
          data: {
            accessRecords: [],
            pagination: {
              page: 1,
              limit: 0,
              total: 0,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      })
    );

    const result = await getModuleAccessByEnrollment('enr-1');
    expect(capturedEnrollmentId).toBe('enr-1');
    expect(result.pagination.total).toBe(0);
  });

  it('gets module analytics by moduleId query on /module-access', async () => {
    let capturedModuleId: string | null = null;
    let capturedStatus: string | null = null;

    server.use(
      http.get(`${baseUrl}/module-access`, ({ request }) => {
        const url = new URL(request.url);
        capturedModuleId = url.searchParams.get('moduleId');
        capturedStatus = url.searchParams.get('status');
        return HttpResponse.json({
          data: {
            accessRecords: [],
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

    const result = await getModuleAccessByModule('mod-1', { status: 'in_progress', limit: 20 });
    expect(capturedModuleId).toBe('mod-1');
    expect(capturedStatus).toBe('in_progress');
    expect(result.pagination.limit).toBe(20);
  });

  it('gets drop-off summary via canonical analytics endpoint', async () => {
    let capturedCourseId: string | null = null;

    server.use(
      http.get(`${baseUrl}/module-access/analytics/drop-off`, ({ request }) => {
        const url = new URL(request.url);
        capturedCourseId = url.searchParams.get('courseId');
        return HttpResponse.json({
          data: {
            courseId: 'course-1',
            metrics: {
              totalModules: 4,
              totalAccess: 20,
              accessedOnly: 3,
              inProgress: 8,
              completed: 9,
              dropOffRate: 0.15,
              dropOffPercentage: 15,
            },
            insights: {
              learnersNotStartingContent: 3,
              learnersStuckInProgress: 8,
              completionRate: 45,
            },
          },
        });
      })
    );

    const result = await getCourseModuleAccessSummary('course-1');
    expect(capturedCourseId).toBe('course-1');
    expect(result.metrics.dropOffPercentage).toBe(15);
  });

  it('marks learning unit started using action update payload', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.put(`${baseUrl}/module-access/ma-1`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            moduleAccessId: 'ma-1',
            moduleId: 'mod-1',
            learnerId: 'learner-1',
            hasStartedLearningUnit: true,
            firstLearningUnitStartedAt: '2026-02-13T00:00:00.000Z',
            learningUnitsCompleted: 0,
            learningUnitsTotal: 5,
            status: 'in_progress',
            completedAt: null,
          },
        });
      })
    );

    const result = await markLearningUnitStarted('ma-1');
    expect(capturedBody).toEqual({ action: 'mark_learning_unit_started' });
    expect(result.hasStartedLearningUnit).toBe(true);
  });

  it('updates progress using canonical action update payload', async () => {
    let capturedBody: Record<string, unknown> | null = null;

    server.use(
      http.put(`${baseUrl}/module-access/ma-1`, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          data: {
            moduleAccessId: 'ma-1',
            moduleId: 'mod-1',
            learnerId: 'learner-1',
            hasStartedLearningUnit: true,
            firstLearningUnitStartedAt: '2026-02-13T00:00:00.000Z',
            learningUnitsCompleted: 2,
            learningUnitsTotal: 5,
            status: 'in_progress',
            completedAt: null,
          },
        });
      })
    );

    const result = await updateModuleAccessProgress('ma-1', {
      learningUnitsCompleted: 2,
      learningUnitsTotal: 5,
    });

    expect(capturedBody).toEqual({
      action: 'update_progress',
      learningUnitsCompleted: 2,
      learningUnitsTotal: 5,
    });
    expect(result.learningUnitsCompleted).toBe(2);
  });
});
