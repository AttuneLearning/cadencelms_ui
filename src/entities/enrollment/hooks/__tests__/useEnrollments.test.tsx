/**
 * Tests for Enrollment React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  useEnrollments,
  useEnrollment,
  useEnrollInProgram,
  useEnrollInCourse,
  useEnrollInClass,
  useWithdraw,
  useUpdateEnrollmentStatus,
  useMyEnrollments,
  useProgramEnrollments,
  useCourseEnrollments,
  useClassEnrollments,
} from '../useEnrollments';
import {
  mockEnrollmentListItems,
  mockEnrollmentDetail,
  mockProgramEnrollment,
  mockCourseEnrollment,
  mockClassEnrollment,
} from '@/test/mocks/data/enrollments';
import type { EnrollmentsListResponse } from '../../model/types';

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Enrollment Hooks', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // QUERY HOOKS
  // =====================

  describe('useEnrollments', () => {
    it('should fetch list of enrollments', async () => {
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
        http.get(`${baseUrl}/api/v2/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useEnrollments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.enrollments).toHaveLength(mockEnrollmentListItems.length);
    });

    it('should fetch enrollments with filters', async () => {
      const filters = { status: 'active' as const, page: 1, limit: 10 };
      const mockResponse: EnrollmentsListResponse = {
        enrollments: mockEnrollmentListItems.filter((e) => e.status === 'active'),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/enrollments`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useEnrollments(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.enrollments.every((e) => e.status === 'active')).toBe(true);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/enrollments`, () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useEnrollments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useEnrollment', () => {
    it('should fetch single enrollment by ID', async () => {
      const enrollmentId = 'enrollment-1';

      server.use(
        http.get(`${baseUrl}/api/v2/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockEnrollmentDetail,
          });
        })
      );

      const { result } = renderHook(() => useEnrollment(enrollmentId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockEnrollmentDetail);
      expect(result.current.data?.progress.moduleProgress).toBeDefined();
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useEnrollment(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useMyEnrollments', () => {
    it('should fetch current user enrollments', async () => {
      const mockResponse: EnrollmentsListResponse = {
        enrollments: mockEnrollmentListItems.slice(0, 2),
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/api/v2/enrollments`, ({ request }) => {
          const url = new URL(request.url);
          // In real implementation, would check for learner=current or similar
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useMyEnrollments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.enrollments).toHaveLength(2);
    });
  });

  describe('useProgramEnrollments', () => {
    it('should fetch enrollments for a program', async () => {
      const programId = 'program-1';

      server.use(
        http.get(`${baseUrl}/api/v2/enrollments/program/${programId}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              program: {
                id: programId,
                name: 'Computer Science Degree',
                code: 'CS-BSCS',
              },
              enrollments: [mockEnrollmentListItems[1]],
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
            },
          });
        })
      );

      const { result } = renderHook(() => useProgramEnrollments(programId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.program.id).toBe(programId);
      expect(result.current.data?.stats).toBeDefined();
    });
  });

  describe('useCourseEnrollments', () => {
    it('should fetch enrollments for a course', async () => {
      const courseId = 'course-1';

      server.use(
        http.get(`${baseUrl}/api/v2/enrollments/course/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              course: {
                id: courseId,
                title: 'Advanced JavaScript Programming',
                code: 'CS301',
              },
              enrollments: [mockEnrollmentListItems[0]],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
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
            },
          });
        })
      );

      const { result } = renderHook(() => useCourseEnrollments(courseId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.course.id).toBe(courseId);
      expect(result.current.data?.stats.averageScore).toBeDefined();
    });
  });

  describe('useClassEnrollments', () => {
    it('should fetch enrollments for a class', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/api/v2/enrollments/class/${classId}`, () => {
          return HttpResponse.json({
            success: true,
            data: {
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
              enrollments: [mockEnrollmentListItems[2]],
              pagination: {
                page: 1,
                limit: 30,
                total: 1,
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
            },
          });
        })
      );

      const { result } = renderHook(() => useClassEnrollments(classId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.class.id).toBe(classId);
      expect(result.current.data?.stats.capacity).toBeDefined();
      expect(result.current.data?.stats.averageAttendance).toBeDefined();
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useEnrollInProgram', () => {
    it('should enroll in program', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/enrollments/program`, () => {
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

      const { result } = renderHook(() => useEnrollInProgram(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-1',
        programId: 'program-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProgramEnrollment);
    });

    it('should handle enrollment error', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/enrollments/program`, () => {
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

      const { result } = renderHook(() => useEnrollInProgram(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-1',
        programId: 'program-1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useEnrollInCourse', () => {
    it('should enroll in course', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/enrollments/course`, () => {
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

      const { result } = renderHook(() => useEnrollInCourse(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-1',
        courseId: 'course-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCourseEnrollment);
    });
  });

  describe('useEnrollInClass', () => {
    it('should enroll in class', async () => {
      server.use(
        http.post(`${baseUrl}/api/v2/enrollments/class`, () => {
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

      const { result } = renderHook(() => useEnrollInClass(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-2',
        classId: 'class-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockClassEnrollment);
    });
  });

  describe('useUpdateEnrollmentStatus', () => {
    it('should update enrollment status', async () => {
      const enrollmentId = 'enrollment-1';

      server.use(
        http.patch(`${baseUrl}/api/v2/enrollments/${enrollmentId}/status`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Enrollment status updated successfully',
            data: {
              id: enrollmentId,
              status: 'completed',
              completedAt: '2026-01-08T15:30:00.000Z',
              withdrawnAt: null,
              grade: {
                score: 92.5,
                letter: 'A-',
                passed: true,
                gradedAt: '2026-01-08T15:30:00.000Z',
                gradedBy: {
                  id: 'instructor-1',
                  firstName: 'Jane',
                  lastName: 'Smith',
                },
              },
              updatedAt: '2026-01-08T15:30:00.000Z',
            },
          });
        })
      );

      const { result } = renderHook(() => useUpdateEnrollmentStatus(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: enrollmentId,
        payload: {
          status: 'completed',
          grade: {
            score: 92.5,
            letter: 'A-',
            passed: true,
          },
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('completed');
      expect(result.current.data?.grade.passed).toBe(true);
    });
  });

  describe('useWithdraw', () => {
    it('should withdraw from enrollment', async () => {
      const enrollmentId = 'enrollment-1';

      server.use(
        http.delete(`${baseUrl}/api/v2/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Successfully withdrawn from enrollment',
            data: {
              id: enrollmentId,
              status: 'withdrawn',
              withdrawnAt: '2026-01-08T16:00:00.000Z',
              finalGrade: {
                score: 65.0,
                letter: 'D',
              },
            },
          });
        })
      );

      const { result } = renderHook(() => useWithdraw(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: enrollmentId,
        reason: 'Schedule conflict',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.status).toBe('withdrawn');
    });

    it('should handle already completed error', async () => {
      const enrollmentId = 'enrollment-3';

      server.use(
        http.delete(`${baseUrl}/api/v2/enrollments/${enrollmentId}`, () => {
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

      const { result } = renderHook(() => useWithdraw(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: enrollmentId,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
