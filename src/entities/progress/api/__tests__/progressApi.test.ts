/**
 * Tests for Progress API Client
 * Tests all progress tracking endpoints from progress.contract.ts v1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  getProgramProgress,
  getCourseProgress,
  getClassProgress,
  getLearnerProgress,
  getLearnerProgramProgress,
  updateProgress,
  getProgressSummary,
  getDetailedProgressReport,
} from '../progressApi';
import {
  mockProgramProgress,
  mockCourseProgress,
  mockClassProgress,
  mockLearnerProgress,
  mockProgressSummary,
  mockDetailedProgressReport,
  mockUpdateProgressResponse,
} from '@/test/mocks/data/progress';

describe('progressApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // GET PROGRAM PROGRESS
  // =====================

  describe('getProgramProgress', () => {
    it('should fetch program progress for current user', async () => {
      const programId = '507f1f77bcf86cd799439015';

      server.use(
        http.get(`${baseUrl}/progress/program/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockProgramProgress,
          });
        })
      );

      const result = await getProgramProgress(programId);

      expect(result).toEqual(mockProgramProgress);
      expect(result.programId).toBe(programId);
      expect(result.levelProgress).toHaveLength(2);
      expect(result.courseProgress).toHaveLength(2);
      expect(result.milestones).toHaveLength(3);
    });

    it('should fetch program progress for specific learner', async () => {
      const programId = '507f1f77bcf86cd799439015';
      const learnerId = '507f1f77bcf86cd799439030';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/progress/program/${programId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockProgramProgress,
          });
        })
      );

      const result = await getProgramProgress(programId, learnerId);

      expect(result).toEqual(mockProgramProgress);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('learnerId')).toBe(learnerId);
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/progress/program/${programId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(getProgramProgress(programId)).rejects.toThrow();
    });

    it('should handle enrollment not found error', async () => {
      const programId = '507f1f77bcf86cd799439015';

      server.use(
        http.get(`${baseUrl}/progress/program/${programId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Learner not enrolled in this program' },
            { status: 404 }
          );
        })
      );

      await expect(getProgramProgress(programId)).rejects.toThrow();
    });
  });

  // =====================
  // GET COURSE PROGRESS
  // =====================

  describe('getCourseProgress', () => {
    it('should fetch detailed course progress', async () => {
      const courseId = '507f1f77bcf86cd799439018';

      server.use(
        http.get(`${baseUrl}/progress/course/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCourseProgress,
          });
        })
      );

      const result = await getCourseProgress(courseId);

      expect(result).toEqual(mockCourseProgress);
      expect(result.courseId).toBe(courseId);
      expect(result.moduleProgress).toHaveLength(5);
      expect(result.assessments).toHaveLength(3);
      expect(result.activityLog).toHaveLength(3);
    });

    it('should fetch course progress with learner ID', async () => {
      const courseId = '507f1f77bcf86cd799439018';
      const learnerId = '507f1f77bcf86cd799439030';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/progress/course/${courseId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockCourseProgress,
          });
        })
      );

      const result = await getCourseProgress(courseId, learnerId);

      expect(result).toEqual(mockCourseProgress);
      expect(capturedParams!.get('learnerId')).toBe(learnerId);
    });

    it('should handle course not found error', async () => {
      const courseId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/progress/course/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(getCourseProgress(courseId)).rejects.toThrow();
    });

    it('should calculate progress percentage correctly', async () => {
      const courseId = '507f1f77bcf86cd799439018';

      server.use(
        http.get(`${baseUrl}/progress/course/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCourseProgress,
          });
        })
      );

      const result = await getCourseProgress(courseId);

      expect(result.overallProgress.completionPercent).toBe(65);
      expect(result.overallProgress.modulesCompleted).toBe(3);
      expect(result.overallProgress.modulesTotal).toBe(5);
    });
  });

  // =====================
  // GET CLASS PROGRESS
  // =====================

  describe('getClassProgress', () => {
    it('should fetch class progress with attendance', async () => {
      const classId = '507f1f77bcf86cd799439020';

      server.use(
        http.get(`${baseUrl}/progress/class/${classId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockClassProgress,
          });
        })
      );

      const result = await getClassProgress(classId);

      expect(result).toEqual(mockClassProgress);
      expect(result.classId).toBe(classId);
      expect(result.attendance.sessions).toHaveLength(3);
      expect(result.assignments).toHaveLength(2);
      expect(result.attendance.attendanceRate).toBe(0.8);
    });

    it('should fetch class progress for specific learner', async () => {
      const classId = '507f1f77bcf86cd799439020';
      const learnerId = '507f1f77bcf86cd799439030';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/progress/class/${classId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockClassProgress,
          });
        })
      );

      const result = await getClassProgress(classId, learnerId);

      expect(result).toEqual(mockClassProgress);
      expect(capturedParams!.get('learnerId')).toBe(learnerId);
    });

    it('should handle class not found error', async () => {
      const classId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/progress/class/${classId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      await expect(getClassProgress(classId)).rejects.toThrow();
    });
  });

  // =====================
  // GET LEARNER PROGRESS
  // =====================

  describe('getLearnerProgress', () => {
    it('should fetch comprehensive learner progress', async () => {
      const learnerId = '507f1f77bcf86cd799439030';

      server.use(
        http.get(`${baseUrl}/progress/learner/${learnerId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockLearnerProgress,
          });
        })
      );

      const result = await getLearnerProgress(learnerId);

      expect(result).toEqual(mockLearnerProgress);
      expect(result.learnerId).toBe(learnerId);
      expect(result.programProgress).toHaveLength(2);
      expect(result.courseProgress).toHaveLength(2);
      expect(result.recentActivity).toHaveLength(3);
      expect(result.achievements).toHaveLength(3);
    });

    it('should include summary statistics', async () => {
      const learnerId = '507f1f77bcf86cd799439030';

      server.use(
        http.get(`${baseUrl}/progress/learner/${learnerId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockLearnerProgress,
          });
        })
      );

      const result = await getLearnerProgress(learnerId);

      expect(result.summary.programsEnrolled).toBe(2);
      expect(result.summary.coursesCompleted).toBe(4);
      expect(result.summary.averageScore).toBe(82);
      expect(result.summary.currentStreak).toBe(5);
    });

    it('should handle learner not found error', async () => {
      const learnerId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/progress/learner/${learnerId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Learner not found' },
            { status: 404 }
          );
        })
      );

      await expect(getLearnerProgress(learnerId)).rejects.toThrow();
    });
  });

  // =====================
  // GET LEARNER PROGRAM PROGRESS
  // =====================

  describe('getLearnerProgramProgress', () => {
    it('should fetch specific learner program progress', async () => {
      const learnerId = '507f1f77bcf86cd799439030';
      const programId = '507f1f77bcf86cd799439015';

      server.use(
        http.get(`${baseUrl}/progress/learner/${learnerId}/program/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockProgramProgress,
          });
        })
      );

      const result = await getLearnerProgramProgress(learnerId, programId);

      expect(result).toEqual(mockProgramProgress);
      expect(result.programId).toBe(programId);
      expect(result.learnerId).toBe(learnerId);
    });

    it('should handle unauthorized access', async () => {
      const learnerId = '507f1f77bcf86cd799439030';
      const programId = '507f1f77bcf86cd799439015';

      server.use(
        http.get(`${baseUrl}/progress/learner/${learnerId}/program/${programId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 403 }
          );
        })
      );

      await expect(getLearnerProgramProgress(learnerId, programId)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE PROGRESS
  // =====================

  describe('updateProgress', () => {
    it('should mark module as complete', async () => {
      const payload = {
        learnerId: '507f1f77bcf86cd799439030',
        enrollmentId: '507f1f77bcf86cd799439090',
        moduleId: '507f1f77bcf86cd799439042',
        action: 'mark_complete' as const,
        reason: 'Student completed work offline, manually verified by instructor',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/progress/update`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            message: 'Progress updated successfully',
            data: mockUpdateProgressResponse,
          });
        })
      );

      const result = await updateProgress(payload);

      expect(result).toEqual(mockUpdateProgressResponse);
      expect(capturedRequestBody.action).toBe('mark_complete');
      expect(capturedRequestBody.reason).toBe(payload.reason);
    });

    it('should override score', async () => {
      const payload = {
        learnerId: '507f1f77bcf86cd799439030',
        enrollmentId: '507f1f77bcf86cd799439090',
        moduleId: '507f1f77bcf86cd799439042',
        action: 'override_score' as const,
        score: 95,
        reason: 'Manual grade adjustment after review',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/progress/update`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            message: 'Progress updated successfully',
            data: {
              ...mockUpdateProgressResponse,
              action: 'override_score',
              newScore: 95,
            },
          });
        })
      );

      const result = await updateProgress(payload);

      expect(result.action).toBe('override_score');
      expect(result.newScore).toBe(95);
      expect(capturedRequestBody.score).toBe(95);
    });

    it('should send notification to learner by default', async () => {
      const payload = {
        learnerId: '507f1f77bcf86cd799439030',
        enrollmentId: '507f1f77bcf86cd799439090',
        action: 'mark_complete' as const,
        reason: 'Progress update',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/progress/update`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            message: 'Progress updated successfully',
            data: mockUpdateProgressResponse,
          });
        })
      );

      await updateProgress(payload);

      expect(capturedRequestBody.notifyLearner).toBe(true);
    });

    it('should handle validation errors', async () => {
      const payload = {
        learnerId: '507f1f77bcf86cd799439030',
        enrollmentId: '507f1f77bcf86cd799439090',
        action: 'override_score' as const,
        reason: 'Too short', // Less than 10 chars
      };

      server.use(
        http.post(`${baseUrl}/progress/update`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                reason: ['Reason must be at least 10 characters'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(updateProgress(payload)).rejects.toThrow();
    });

    it('should handle insufficient permissions', async () => {
      const payload = {
        learnerId: '507f1f77bcf86cd799439030',
        enrollmentId: '507f1f77bcf86cd799439090',
        action: 'mark_complete' as const,
        reason: 'Progress update',
      };

      server.use(
        http.post(`${baseUrl}/progress/update`, () => {
          return HttpResponse.json(
            { success: false, message: 'Insufficient permissions to update progress' },
            { status: 403 }
          );
        })
      );

      await expect(updateProgress(payload)).rejects.toThrow();
    });
  });

  // =====================
  // GET PROGRESS SUMMARY
  // =====================

  describe('getProgressSummary', () => {
    it('should fetch progress summary with filters', async () => {
      const filters = {
        programId: '507f1f77bcf86cd799439015',
        status: 'in_progress' as const,
        minProgress: 50,
        page: 1,
        limit: 50,
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/progress/reports/summary`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockProgressSummary,
          });
        })
      );

      const result = await getProgressSummary(filters);

      expect(result).toEqual(mockProgressSummary);
      expect(capturedParams!.get('programId')).toBe(filters.programId);
      expect(capturedParams!.get('status')).toBe(filters.status);
      expect(capturedParams!.get('minProgress')).toBe('50');
    });

    it('should fetch summary without filters', async () => {
      server.use(
        http.get(`${baseUrl}/progress/reports/summary`, () => {
          return HttpResponse.json({
            success: true,
            data: mockProgressSummary,
          });
        })
      );

      const result = await getProgressSummary();

      expect(result).toEqual(mockProgressSummary);
      expect(result.summary.totalLearners).toBe(45);
      expect(result.summary.averageProgress).toBe(68);
    });

    it('should include pagination information', async () => {
      server.use(
        http.get(`${baseUrl}/progress/reports/summary`, () => {
          return HttpResponse.json({
            success: true,
            data: mockProgressSummary,
          });
        })
      );

      const result = await getProgressSummary();

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(45);
      expect(result.pagination.hasNext).toBe(false);
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get(`${baseUrl}/progress/reports/summary`, () => {
          return HttpResponse.json(
            { success: false, message: 'Insufficient permissions to view reports' },
            { status: 403 }
          );
        })
      );

      await expect(getProgressSummary()).rejects.toThrow();
    });
  });

  // =====================
  // GET DETAILED PROGRESS REPORT
  // =====================

  describe('getDetailedProgressReport', () => {
    it('should fetch detailed progress report', async () => {
      const filters = {
        courseId: '507f1f77bcf86cd799439018',
        format: 'json' as const,
        includeModules: true,
        includeAssessments: true,
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/progress/reports/detailed`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockDetailedProgressReport,
          });
        })
      );

      const result = await getDetailedProgressReport(filters);

      expect(result).toEqual(mockDetailedProgressReport);
      expect(capturedParams!.get('courseId')).toBe(filters.courseId);
      expect(capturedParams!.get('format')).toBe(filters.format);
      expect(capturedParams!.get('includeModules')).toBe('true');
    });

    it('should include report metadata', async () => {
      server.use(
        http.get(`${baseUrl}/progress/reports/detailed`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDetailedProgressReport,
          });
        })
      );

      const result = await getDetailedProgressReport();

      expect(result.reportId).toBe('RPT-2026-01-08-123456');
      expect(result.generatedAt).toBeTruthy();
      expect(result.generatedBy.name).toBeTruthy();
    });

    it('should include learner details with modules and assessments', async () => {
      server.use(
        http.get(`${baseUrl}/progress/reports/detailed`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDetailedProgressReport,
          });
        })
      );

      const result = await getDetailedProgressReport({ includeModules: true, includeAssessments: true });

      expect(result.learnerDetails).toHaveLength(1);
      expect(result.learnerDetails[0].moduleProgress).toHaveLength(5);
      expect(result.learnerDetails[0].assessmentResults).toHaveLength(1);
    });

    it('should support CSV export format', async () => {
      const filters = {
        courseId: '507f1f77bcf86cd799439018',
        format: 'csv' as const,
      };

      server.use(
        http.get(`${baseUrl}/progress/reports/detailed`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockDetailedProgressReport,
              downloadUrl: 'https://cdn.example.com/reports/progress-report.csv',
            },
          });
        })
      );

      const result = await getDetailedProgressReport(filters);

      expect(result.downloadUrl).toBeTruthy();
      expect(result.downloadUrl).toContain('.csv');
    });

    it('should support XLSX export format', async () => {
      const filters = {
        courseId: '507f1f77bcf86cd799439018',
        format: 'xlsx' as const,
      };

      server.use(
        http.get(`${baseUrl}/progress/reports/detailed`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockDetailedProgressReport,
              downloadUrl: 'https://cdn.example.com/reports/progress-report.xlsx',
            },
          });
        })
      );

      const result = await getDetailedProgressReport(filters);

      expect(result.downloadUrl).toBeTruthy();
      expect(result.downloadUrl).toContain('.xlsx');
    });

    it('should handle validation errors', async () => {
      server.use(
        http.get(`${baseUrl}/progress/reports/detailed`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid filter parameters',
            },
            { status: 400 }
          );
        })
      );

      await expect(getDetailedProgressReport({ format: 'invalid' as any })).rejects.toThrow();
    });
  });
});
