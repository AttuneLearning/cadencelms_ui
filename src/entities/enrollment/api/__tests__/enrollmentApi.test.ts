/**
 * Tests for Enrollment API Client
 * Tests all enrollment management endpoints from enrollments.contract.ts v1.0.0
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listEnrollments,
  getEnrollment,
  enrollInProgram,
  enrollInCourse,
  enrollInClass,
  updateEnrollmentStatus,
  withdrawFromEnrollment,
  listProgramEnrollments,
  listCourseEnrollments,
  listClassEnrollments,
} from '../enrollmentApi';
import type {
  EnrollmentsListResponse,
  ProgramEnrollmentsResponse,
  CourseEnrollmentsResponse,
  ClassEnrollmentsResponse,
} from '../../model/types';
import {
  mockEnrollmentListItems,
  mockEnrollmentDetail,
  mockProgramEnrollment,
  mockCourseEnrollment,
  mockClassEnrollment,
  mockLearners,
  mockDepartments,
  mockCompletedGrade,
  createMockEnrollment,
  createMockEnrollmentWithProgress,
} from '@/test/mocks/data/enrollments';

describe('enrollmentApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST ENROLLMENTS
  // =====================

  describe('listEnrollments', () => {
    it('should fetch paginated list of enrollments without filters', async () => {
      const mockResponse: EnrollmentsListResponse = {
        enrollments: mockEnrollmentListItems,
        pagination: {
          page: 1,
          limit: 10,
          total: mockEnrollmentListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listEnrollments();

      expect(result).toEqual(mockResponse);
      expect(result.enrollments).toHaveLength(mockEnrollmentListItems.length);
    });

    it('should fetch enrollments with pagination params', async () => {
      const mockResponse: EnrollmentsListResponse = {
        enrollments: mockEnrollmentListItems.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockEnrollmentListItems.length,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/enrollments`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listEnrollments({ page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should filter enrollments by learner', async () => {
      const filteredEnrollments = mockEnrollmentListItems.filter(
        (e) => e.learner.id === 'learner-1'
      );

      const mockResponse: EnrollmentsListResponse = {
        enrollments: filteredEnrollments,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredEnrollments.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listEnrollments({ learner: 'learner-1' });

      expect(result.enrollments).toHaveLength(filteredEnrollments.length);
      expect(result.enrollments.every((e) => e.learner.id === 'learner-1')).toBe(true);
    });

    it('should filter enrollments by status', async () => {
      const filteredEnrollments = mockEnrollmentListItems.filter(
        (e) => e.status === 'active'
      );

      const mockResponse: EnrollmentsListResponse = {
        enrollments: filteredEnrollments,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredEnrollments.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listEnrollments({ status: 'active' });

      expect(result.enrollments).toHaveLength(filteredEnrollments.length);
      expect(result.enrollments.every((e) => e.status === 'active')).toBe(true);
    });

    it('should filter enrollments by type', async () => {
      const filteredEnrollments = mockEnrollmentListItems.filter(
        (e) => e.type === 'course'
      );

      const mockResponse: EnrollmentsListResponse = {
        enrollments: filteredEnrollments,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredEnrollments.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listEnrollments({ type: 'course' });

      expect(result.enrollments.every((e) => e.type === 'course')).toBe(true);
    });

    it('should filter enrollments by course', async () => {
      const filteredEnrollments = mockEnrollmentListItems.filter(
        (e) => e.target.id === 'course-1'
      );

      const mockResponse: EnrollmentsListResponse = {
        enrollments: filteredEnrollments,
        pagination: {
          page: 1,
          limit: 10,
          total: filteredEnrollments.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listEnrollments({ course: 'course-1' });

      expect(result.enrollments.every((e) => e.target.id === 'course-1')).toBe(true);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/enrollments`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listEnrollments()).rejects.toThrow();
    });
  });

  // =====================
  // GET ENROLLMENT
  // =====================

  describe('getEnrollment', () => {
    it('should fetch single enrollment by ID', async () => {
      const enrollmentId = 'enrollment-1';

      server.use(
        http.get(`${baseUrl}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockEnrollmentDetail,
          });
        })
      );

      const result = await getEnrollment(enrollmentId);

      expect(result).toEqual(mockEnrollmentDetail);
      expect(result.id).toBe(enrollmentId);
      expect(result.progress.moduleProgress).toBeDefined();
    });

    it('should handle enrollment not found error', async () => {
      const enrollmentId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Enrollment not found' },
            { status: 404 }
          );
        })
      );

      await expect(getEnrollment(enrollmentId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const enrollmentId = 'enrollment-1';

      server.use(
        http.get(`${baseUrl}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getEnrollment(enrollmentId)).rejects.toThrow();
    });
  });

  // =====================
  // ENROLL IN PROGRAM
  // =====================

  describe('enrollInProgram', () => {
    it('should enroll learner in program', async () => {
      const payload = {
        learnerId: 'learner-1',
        programId: 'program-1',
        expiresAt: '2029-06-01T23:59:59.000Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/enrollments/program`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              message: 'Successfully enrolled in program',
              data: { enrollment: mockProgramEnrollment },
            },
            { status: 201 }
          );
        })
      );

      const result = await enrollInProgram(payload);

      expect(result).toEqual(mockProgramEnrollment);
      expect(capturedRequestBody).toMatchObject({
        learnerId: payload.learnerId,
        programId: payload.programId,
        expiresAt: payload.expiresAt,
      });
    });

    it('should handle already enrolled error', async () => {
      const payload = {
        learnerId: 'learner-1',
        programId: 'program-1',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/program`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Learner already enrolled in this program',
              code: 'ALREADY_ENROLLED',
            },
            { status: 409 }
          );
        })
      );

      await expect(enrollInProgram(payload)).rejects.toThrow();
    });

    it('should handle prerequisites not met error', async () => {
      const payload = {
        learnerId: 'learner-1',
        programId: 'program-2',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/program`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Prerequisites not completed',
              code: 'PREREQUISITES_NOT_MET',
            },
            { status: 422 }
          );
        })
      );

      await expect(enrollInProgram(payload)).rejects.toThrow();
    });

    it('should handle program not found error', async () => {
      const payload = {
        learnerId: 'learner-1',
        programId: 'non-existent',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/program`, () => {
          return HttpResponse.json(
            { success: false, message: 'Program or learner not found' },
            { status: 404 }
          );
        })
      );

      await expect(enrollInProgram(payload)).rejects.toThrow();
    });
  });

  // =====================
  // ENROLL IN COURSE
  // =====================

  describe('enrollInCourse', () => {
    it('should enroll learner in course', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
        expiresAt: '2026-12-31T23:59:59.000Z',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/course`, () => {
          return HttpResponse.json(
            {
              success: true,
              message: 'Successfully enrolled in course',
              data: { enrollment: mockCourseEnrollment },
            },
            { status: 201 }
          );
        })
      );

      const result = await enrollInCourse(payload);

      expect(result).toEqual(mockCourseEnrollment);
      expect(result.type).toBe('course');
    });

    it('should handle already enrolled error', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/course`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Learner already enrolled in this course',
              code: 'ALREADY_ENROLLED',
            },
            { status: 409 }
          );
        })
      );

      await expect(enrollInCourse(payload)).rejects.toThrow();
    });

    it('should handle prerequisites not met error', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-2',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/course`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course prerequisites not completed',
              code: 'PREREQUISITES_NOT_MET',
            },
            { status: 422 }
          );
        })
      );

      await expect(enrollInCourse(payload)).rejects.toThrow();
    });
  });

  // =====================
  // ENROLL IN CLASS
  // =====================

  describe('enrollInClass', () => {
    it('should enroll learner in class', async () => {
      const payload = {
        learnerId: 'learner-2',
        classId: 'class-1',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/class`, () => {
          return HttpResponse.json(
            {
              success: true,
              message: 'Successfully enrolled in class',
              data: { enrollment: mockClassEnrollment },
            },
            { status: 201 }
          );
        })
      );

      const result = await enrollInClass(payload);

      expect(result).toEqual(mockClassEnrollment);
      expect(result.type).toBe('class');
    });

    it('should handle class full error', async () => {
      const payload = {
        learnerId: 'learner-3',
        classId: 'class-1',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/class`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Class has reached maximum capacity',
              code: 'CLASS_FULL',
            },
            { status: 422 }
          );
        })
      );

      await expect(enrollInClass(payload)).rejects.toThrow();
    });

    it('should handle class started error', async () => {
      const payload = {
        learnerId: 'learner-3',
        classId: 'class-1',
      };

      server.use(
        http.post(`${baseUrl}/enrollments/class`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Class has already started',
              code: 'CLASS_STARTED',
            },
            { status: 422 }
          );
        })
      );

      await expect(enrollInClass(payload)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE ENROLLMENT STATUS
  // =====================

  describe('updateEnrollmentStatus', () => {
    it('should update enrollment status to completed', async () => {
      const enrollmentId = 'enrollment-1';
      const payload = {
        status: 'completed' as const,
        grade: {
          score: 92.5,
          letter: 'A-',
          passed: true,
        },
        reason: 'Course completed successfully',
      };

      const updateResponse = {
        id: enrollmentId,
        status: 'completed' as const,
        completedAt: '2026-01-08T15:30:00.000Z',
        withdrawnAt: null,
        grade: mockCompletedGrade,
        updatedAt: '2026-01-08T15:30:00.000Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(
          `${baseUrl}/enrollments/${enrollmentId}/status`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              message: 'Enrollment status updated successfully',
              data: updateResponse,
            });
          }
        )
      );

      const result = await updateEnrollmentStatus(enrollmentId, payload);

      expect(result).toEqual(updateResponse);
      expect(result.status).toBe('completed');
      expect(result.grade.passed).toBe(true);
      expect(capturedRequestBody.status).toBe('completed');
      expect(capturedRequestBody.grade).toMatchObject(payload.grade);
    });

    it('should update enrollment status to suspended', async () => {
      const enrollmentId = 'enrollment-1';
      const payload = {
        status: 'suspended' as const,
        reason: 'Payment overdue',
      };

      const updateResponse = {
        id: enrollmentId,
        status: 'suspended' as const,
        completedAt: null,
        withdrawnAt: null,
        grade: mockCompletedGrade,
        updatedAt: '2026-01-08T15:30:00.000Z',
      };

      server.use(
        http.patch(`${baseUrl}/enrollments/${enrollmentId}/status`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Enrollment status updated successfully',
            data: updateResponse,
          });
        })
      );

      const result = await updateEnrollmentStatus(enrollmentId, payload);

      expect(result.status).toBe('suspended');
    });

    it('should handle invalid status transition error', async () => {
      const enrollmentId = 'enrollment-3'; // Already completed
      const payload = {
        status: 'active' as const,
      };

      server.use(
        http.patch(`${baseUrl}/enrollments/${enrollmentId}/status`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Invalid status transition',
              code: 'INVALID_TRANSITION',
            },
            { status: 422 }
          );
        })
      );

      await expect(updateEnrollmentStatus(enrollmentId, payload)).rejects.toThrow();
    });

    it('should handle enrollment not found error', async () => {
      const enrollmentId = 'non-existent';
      const payload = {
        status: 'completed' as const,
      };

      server.use(
        http.patch(`${baseUrl}/enrollments/${enrollmentId}/status`, () => {
          return HttpResponse.json(
            { success: false, message: 'Enrollment not found' },
            { status: 404 }
          );
        })
      );

      await expect(updateEnrollmentStatus(enrollmentId, payload)).rejects.toThrow();
    });
  });

  // =====================
  // WITHDRAW FROM ENROLLMENT
  // =====================

  describe('withdrawFromEnrollment', () => {
    it('should withdraw from enrollment', async () => {
      const enrollmentId = 'enrollment-1';
      const payload = {
        reason: 'Schedule conflict',
      };

      const withdrawResponse = {
        id: enrollmentId,
        status: 'withdrawn' as const,
        withdrawnAt: '2026-01-08T16:00:00.000Z',
        finalGrade: {
          score: 65.0,
          letter: 'D',
        },
      };

      let capturedRequestBody: any = null;

      server.use(
        http.delete(`${baseUrl}/enrollments/${enrollmentId}`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            message: 'Successfully withdrawn from enrollment',
            data: withdrawResponse,
          });
        })
      );

      const result = await withdrawFromEnrollment(enrollmentId, payload);

      expect(result).toEqual(withdrawResponse);
      expect(result.status).toBe('withdrawn');
      expect(capturedRequestBody.reason).toBe(payload.reason);
    });

    it('should withdraw without reason', async () => {
      const enrollmentId = 'enrollment-1';

      const withdrawResponse = {
        id: enrollmentId,
        status: 'withdrawn' as const,
        withdrawnAt: '2026-01-08T16:00:00.000Z',
        finalGrade: {
          score: 65.0,
          letter: 'D',
        },
      };

      server.use(
        http.delete(`${baseUrl}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Successfully withdrawn from enrollment',
            data: withdrawResponse,
          });
        })
      );

      const result = await withdrawFromEnrollment(enrollmentId);

      expect(result.status).toBe('withdrawn');
    });

    it('should handle already completed error', async () => {
      const enrollmentId = 'enrollment-3';

      server.use(
        http.delete(`${baseUrl}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot withdraw from completed enrollment',
              code: 'ALREADY_COMPLETED',
            },
            { status: 422 }
          );
        })
      );

      await expect(withdrawFromEnrollment(enrollmentId)).rejects.toThrow();
    });

    it('should handle already withdrawn error', async () => {
      const enrollmentId = 'enrollment-4';

      server.use(
        http.delete(`${baseUrl}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Enrollment already withdrawn',
              code: 'ALREADY_WITHDRAWN',
            },
            { status: 422 }
          );
        })
      );

      await expect(withdrawFromEnrollment(enrollmentId)).rejects.toThrow();
    });
  });

  // =====================
  // LIST PROGRAM ENROLLMENTS
  // =====================

  describe('listProgramEnrollments', () => {
    it('should list enrollments for a program', async () => {
      const programId = 'program-1';

      const mockResponse: ProgramEnrollmentsResponse = {
        program: {
          id: programId,
          name: 'Computer Science Degree',
          code: 'CS-BSCS',
        },
        enrollments: [
          {
            id: 'enrollment-2',
            learner: mockLearners[0],
            status: 'active',
            enrolledAt: '2025-09-01T00:00:00.000Z',
            completedAt: null,
            progress: {
              percentage: 35,
              completedItems: 14,
              totalItems: 40,
            },
            grade: {
              score: 88.5,
              letter: 'B+',
              passed: null,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        stats: {
          total: 50,
          active: 45,
          completed: 3,
          withdrawn: 2,
          averageProgress: 42.5,
          completionRate: 6.0,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments/program/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listProgramEnrollments(programId);

      expect(result).toEqual(mockResponse);
      expect(result.program.id).toBe(programId);
      expect(result.stats).toBeDefined();
    });

    it('should handle program not found error', async () => {
      const programId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/enrollments/program/${programId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Program not found' },
            { status: 404 }
          );
        })
      );

      await expect(listProgramEnrollments(programId)).rejects.toThrow();
    });
  });

  // =====================
  // LIST COURSE ENROLLMENTS
  // =====================

  describe('listCourseEnrollments', () => {
    it('should list enrollments for a course', async () => {
      const courseId = 'course-1';

      const mockResponse: CourseEnrollmentsResponse = {
        course: {
          id: courseId,
          title: 'Advanced JavaScript Programming',
          code: 'CS301',
        },
        enrollments: [
          {
            id: 'enrollment-1',
            learner: mockLearners[0],
            status: 'active',
            enrolledAt: '2026-01-01T00:00:00.000Z',
            completedAt: null,
            progress: {
              percentage: 65,
              completedItems: 8,
              totalItems: 12,
              lastActivityAt: '2026-01-08T10:30:00.000Z',
            },
            grade: {
              score: 87.5,
              letter: 'B+',
              passed: null,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 32,
          totalPages: 4,
          hasNext: true,
          hasPrev: false,
        },
        stats: {
          total: 35,
          active: 32,
          completed: 2,
          withdrawn: 1,
          averageProgress: 58.5,
          completionRate: 5.7,
          averageScore: 82.3,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments/course/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourseEnrollments(courseId);

      expect(result).toEqual(mockResponse);
      expect(result.course.id).toBe(courseId);
      expect(result.stats.averageScore).toBeDefined();
    });

    it('should handle course not found error', async () => {
      const courseId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/enrollments/course/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(listCourseEnrollments(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // LIST CLASS ENROLLMENTS
  // =====================

  describe('listClassEnrollments', () => {
    it('should list enrollments for a class', async () => {
      const classId = 'class-1';

      const mockResponse: ClassEnrollmentsResponse = {
        class: {
          id: classId,
          name: 'JavaScript - Spring 2026',
          course: {
            id: 'course-1',
            title: 'Advanced JavaScript Programming',
            code: 'CS301',
          },
          schedule: {
            startDate: '2026-01-15T00:00:00.000Z',
            endDate: '2026-05-15T23:59:59.000Z',
            capacity: 30,
          },
        },
        enrollments: [
          {
            id: 'enrollment-6',
            learner: mockLearners[1],
            status: 'active',
            enrolledAt: '2026-01-08T00:00:00.000Z',
            completedAt: null,
            progress: {
              percentage: 45,
              completedItems: 5,
              totalItems: 12,
              lastActivityAt: '2026-01-08T10:30:00.000Z',
            },
            grade: {
              score: 85.0,
              letter: 'B',
              passed: null,
            },
            attendance: {
              sessionsAttended: 8,
              totalSessions: 10,
              attendanceRate: 80.0,
            },
          },
        ],
        pagination: {
          page: 1,
          limit: 30,
          total: 25,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
        stats: {
          total: 25,
          active: 25,
          completed: 0,
          withdrawn: 0,
          capacity: 30,
          seatsAvailable: 5,
          averageProgress: 52.3,
          completionRate: 0,
          averageScore: 83.5,
          averageAttendance: 85.2,
        },
      };

      server.use(
        http.get(`${baseUrl}/enrollments/class/${classId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listClassEnrollments(classId);

      expect(result).toEqual(mockResponse);
      expect(result.class.id).toBe(classId);
      expect(result.stats.capacity).toBeDefined();
      expect(result.stats.seatsAvailable).toBeDefined();
      expect(result.stats.averageAttendance).toBeDefined();
    });

    it('should handle class not found error', async () => {
      const classId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/enrollments/class/${classId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      await expect(listClassEnrollments(classId)).rejects.toThrow();
    });
  });
});
