/**
 * Tests for Class API Client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getClassRoster,
  addLearnersToClass,
  removeLearnerFromClass,
  getClassProgress,
  getClassEnrollments,
} from '../classApi';
import type { ClassesListResponse, EnrollmentResult } from '../../model/types';
import {
  mockClasses,
  mockFullClass,
  mockCreateClassPayload,
  mockClassRoster,
  mockClassProgress,
  mockClassEnrollmentsResponse,
  mockEnrollmentResult,
  mockEnrollmentResultWithErrors,
  mockDeleteClassResponse,
  mockDropEnrollmentResponse,
  createMockClass,
} from '@/test/mocks/data/classes';

describe('classApi', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('listClasses', () => {
    it('should fetch paginated list of classes without filters', async () => {
      const mockResponse: ClassesListResponse = {
        classes: mockClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: mockClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/classes`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses();

      expect(result).toEqual(mockResponse);
      expect(result.classes).toHaveLength(mockClasses.length);
    });

    it('should fetch classes with pagination params', async () => {
      const mockResponse: ClassesListResponse = {
        classes: mockClasses.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockClasses.length,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should fetch classes with status filter', async () => {
      const filteredClasses = mockClasses.filter((c) => c.status === 'active');

      const mockResponse: ClassesListResponse = {
        classes: filteredClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ status: 'active' });

      expect(result.classes).toHaveLength(filteredClasses.length);
      expect(result.classes.every((c) => c.status === 'active')).toBe(true);
      expect(capturedParams!.get('status')).toBe('active');
    });

    it('should fetch classes with course filter', async () => {
      const filteredClasses = mockClasses.filter((c) => c.course.id === 'course-1');

      const mockResponse: ClassesListResponse = {
        classes: filteredClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ course: 'course-1' });

      expect(result.classes).toHaveLength(filteredClasses.length);
      expect(capturedParams!.get('course')).toBe('course-1');
    });

    it('should fetch classes with program filter', async () => {
      const mockResponse: ClassesListResponse = {
        classes: mockClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: mockClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ program: 'program-1' });

      expect(result.classes).toBeDefined();
      expect(capturedParams!.get('program')).toBe('program-1');
    });

    it('should fetch classes with instructor filter', async () => {
      const filteredClasses = mockClasses.filter((c) =>
        c.instructors.some((i) => i.id === 'instructor-1')
      );

      const mockResponse: ClassesListResponse = {
        classes: filteredClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ instructor: 'instructor-1' });

      expect(result.classes).toHaveLength(filteredClasses.length);
      expect(capturedParams!.get('instructor')).toBe('instructor-1');
    });

    it('should fetch classes with term filter', async () => {
      const filteredClasses = mockClasses.filter(
        (c) => c.academicTerm?.id === 'term-1'
      );

      const mockResponse: ClassesListResponse = {
        classes: filteredClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ term: 'term-1' });

      expect(result.classes).toHaveLength(filteredClasses.length);
      expect(capturedParams!.get('term')).toBe('term-1');
    });

    it('should fetch classes with search query', async () => {
      const searchTerm = 'Introduction';
      const filteredClasses = mockClasses.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const mockResponse: ClassesListResponse = {
        classes: filteredClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ search: searchTerm });

      expect(result.classes).toHaveLength(filteredClasses.length);
      expect(capturedParams!.get('search')).toBe(searchTerm);
    });

    it('should fetch classes with department filter', async () => {
      const mockResponse: ClassesListResponse = {
        classes: mockClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: mockClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ department: 'dept-1' });

      expect(result.classes).toBeDefined();
      expect(capturedParams!.get('department')).toBe('dept-1');
    });

    it('should fetch classes with sort parameter', async () => {
      const mockResponse: ClassesListResponse = {
        classes: mockClasses,
        pagination: {
          page: 1,
          limit: 20,
          total: mockClasses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses({ sort: '-startDate' });

      expect(result.classes).toBeDefined();
      expect(capturedParams!.get('sort')).toBe('-startDate');
    });

    it('should handle empty class list', async () => {
      const mockResponse: ClassesListResponse = {
        classes: [],
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
        http.get(`${baseUrl}/classes`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      const result = await listClasses();

      expect(result.classes).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/classes`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listClasses()).rejects.toThrow();
    });
  });

  describe('getClass', () => {
    it('should fetch single class by ID', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json({ success: true, data: mockFullClass });
        })
      );

      const result = await getClass(classId);

      expect(result).toEqual(mockFullClass);
      expect(result.id).toBe(classId);
    });

    it('should return full class details including course description', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json({ success: true, data: mockFullClass });
        })
      );

      const result = await getClass(classId);

      expect(result.course.description).toBeDefined();
      expect(result.course.credits).toBeDefined();
      expect(result.academicTerm?.startDate).toBeDefined();
      expect(result.academicTerm?.endDate).toBeDefined();
    });

    it('should handle class not found error', async () => {
      const classId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json(
            { message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      await expect(getClass(classId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getClass(classId)).rejects.toThrow();
    });
  });

  describe('createClass', () => {
    it('should create new class', async () => {
      const newClass = createMockClass({
        name: mockCreateClassPayload.name,
        course: {
          id: mockCreateClassPayload.course,
          title: 'Test Course',
          code: 'TEST101',
        },
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/classes`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            { success: true, data: newClass, message: 'Class created successfully' },
            { status: 201 }
          );
        })
      );

      const result = await createClass(mockCreateClassPayload);

      expect(result).toEqual(newClass);
      expect(capturedRequestBody).toMatchObject({
        name: mockCreateClassPayload.name,
        course: mockCreateClassPayload.course,
        program: mockCreateClassPayload.program,
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        ...mockCreateClassPayload,
        capacity: -1, // Invalid capacity
      };

      server.use(
        http.post(`${baseUrl}/classes`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                capacity: ['Capacity must be a positive number'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createClass(invalidData)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const invalidData = {
        name: 'Test Class',
      } as any;

      server.use(
        http.post(`${baseUrl}/classes`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                course: ['Course is required'],
                program: ['Program is required'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createClass(invalidData)).rejects.toThrow();
    });

    it('should handle date validation errors', async () => {
      const invalidData = {
        ...mockCreateClassPayload,
        startDate: '2026-05-01T00:00:00Z',
        endDate: '2026-01-01T00:00:00Z', // End before start
      };

      server.use(
        http.post(`${baseUrl}/classes`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                endDate: ['End date must be after start date'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createClass(invalidData)).rejects.toThrow();
    });
  });

  describe('updateClass', () => {
    it('should update existing class', async () => {
      const classId = 'class-1';
      const updatePayload = {
        name: 'Updated Class Name',
        capacity: 35,
      };
      const updatedClass = {
        ...mockFullClass,
        ...updatePayload,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/classes/${classId}`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true, data: updatedClass, message: 'Class updated successfully',
          });
        })
      );

      const result = await updateClass(classId, updatePayload);

      expect(result).toEqual(updatedClass);
      expect(capturedRequestBody).toEqual(updatePayload);
    });

    it('should handle partial updates', async () => {
      const classId = 'class-1';
      const partialUpdate = { capacity: 40 };
      const updatedClass = { ...mockFullClass, capacity: 40 };

      server.use(
        http.put(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json({
            success: true, data: updatedClass, message: 'Class updated successfully',
          });
        })
      );

      const result = await updateClass(classId, partialUpdate);

      expect(result.capacity).toBe(40);
      expect(result.name).toBe(mockFullClass.name);
    });

    it('should handle class not found error', async () => {
      const classId = 'non-existent';

      server.use(
        http.put(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json(
            { message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      await expect(updateClass(classId, { name: 'Test' })).rejects.toThrow();
    });

    it('should update class status', async () => {
      const classId = 'class-1';
      const updatePayload = { status: 'completed' as const };
      const updatedClass = { ...mockFullClass, status: 'completed' as const };

      server.use(
        http.put(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json({
            success: true, data: updatedClass, message: 'Class updated successfully',
          });
        })
      );

      const result = await updateClass(classId, updatePayload);

      expect(result.status).toBe('completed');
    });
  });

  describe('deleteClass', () => {
    it('should delete class by ID', async () => {
      const classId = 'class-1';

      server.use(
        http.delete(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json({
            success: true, data: mockDeleteClassResponse, message: 'Class deleted successfully',
          });
        })
      );

      const result = await deleteClass(classId);

      expect(result).toEqual(mockDeleteClassResponse);
      expect(result.deleted).toBe(true);
    });

    it('should delete class with force parameter', async () => {
      const classId = 'class-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.delete(`${baseUrl}/classes/${classId}`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true, data: mockDeleteClassResponse, message: 'Class deleted successfully',
          });
        })
      );

      const result = await deleteClass(classId, true);

      expect(result.deleted).toBe(true);
      expect(capturedParams!.get('force')).toBe('true');
    });

    it('should handle class not found error', async () => {
      const classId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json(
            { message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteClass(classId)).rejects.toThrow();
    });

    it('should handle classes with enrollments without force flag', async () => {
      const classId = 'class-1';

      server.use(
        http.delete(`${baseUrl}/classes/${classId}`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete class with active enrollments' },
            { status: 400 }
          );
        })
      );

      await expect(deleteClass(classId)).rejects.toThrow();
    });
  });

  describe('getClassRoster', () => {
    it('should fetch class roster', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/roster`, () => {
          return HttpResponse.json({ success: true, data: mockClassRoster });
        })
      );

      const result = await getClassRoster(classId);

      expect(result).toEqual(mockClassRoster);
      expect(result.roster).toHaveLength(mockClassRoster.roster.length);
    });

    it('should fetch roster with progress data', async () => {
      const classId = 'class-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes/${classId}/roster`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockClassRoster });
        })
      );

      const result = await getClassRoster(classId, { includeProgress: true });

      expect(result.roster[0].progress).toBeDefined();
      expect(result.roster[0].progress?.completionPercent).toBeDefined();
      expect(capturedParams!.get('includeProgress')).toBe('true');
    });

    it('should fetch roster with attendance data', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/roster`, () => {
          return HttpResponse.json({ success: true, data: mockClassRoster });
        })
      );

      const result = await getClassRoster(classId);

      expect(result.roster[0].attendance).toBeDefined();
      expect(result.roster[0].attendance?.sessionsAttended).toBeDefined();
      expect(result.roster[0].attendance?.totalSessions).toBeDefined();
      expect(result.roster[0].attendance?.attendanceRate).toBeDefined();
    });

    it('should filter roster by enrollment status', async () => {
      const classId = 'class-1';
      let capturedParams: URLSearchParams | null = null;

      const activeRoster = {
        ...mockClassRoster,
        roster: mockClassRoster.roster.filter((r) => r.status === 'active'),
      };

      server.use(
        http.get(`${baseUrl}/classes/${classId}/roster`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: activeRoster });
        })
      );

      const result = await getClassRoster(classId, { status: 'active' });

      expect(result.roster.every((r) => r.status === 'active')).toBe(true);
      expect(capturedParams!.get('status')).toBe('active');
    });

    it('should handle empty roster', async () => {
      const classId = 'class-1';
      const emptyRoster = {
        ...mockClassRoster,
        totalEnrolled: 0,
        roster: [],
      };

      server.use(
        http.get(`${baseUrl}/classes/${classId}/roster`, () => {
          return HttpResponse.json({ success: true, data: emptyRoster });
        })
      );

      const result = await getClassRoster(classId);

      expect(result.roster).toHaveLength(0);
      expect(result.totalEnrolled).toBe(0);
    });
  });

  describe('addLearnersToClass', () => {
    it('should enroll learners in class', async () => {
      const classId = 'class-1';
      const payload = {
        learnerIds: ['learner-4'],
        enrolledAt: '2026-01-08T15:00:00Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/classes/${classId}/enrollments`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true, data: mockEnrollmentResult, message: 'Learners enrolled successfully',
          });
        })
      );

      const result = await addLearnersToClass(classId, payload);

      expect(result).toEqual(mockEnrollmentResult);
      expect(result.successCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(capturedRequestBody).toEqual(payload);
    });

    it('should handle enrollment with errors', async () => {
      const classId = 'class-1';
      const payload = {
        learnerIds: ['learner-5', 'learner-6'],
      };

      server.use(
        http.post(`${baseUrl}/classes/${classId}/enrollments`, () => {
          return HttpResponse.json({
            success: true, data: mockEnrollmentResultWithErrors, message: 'Enrollment completed with errors',
          });
        })
      );

      const result = await addLearnersToClass(classId, payload);

      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].reason).toBe('Class is full');
    });

    it('should handle capacity validation', async () => {
      const classId = 'class-6'; // Full class
      const payload = {
        learnerIds: ['learner-7'],
      };

      server.use(
        http.post(`${baseUrl}/classes/${classId}/enrollments`, () => {
          return HttpResponse.json(
            { message: 'Class is at full capacity' },
            { status: 400 }
          );
        })
      );

      await expect(addLearnersToClass(classId, payload)).rejects.toThrow();
    });

    it('should handle duplicate enrollment', async () => {
      const classId = 'class-1';
      const payload = {
        learnerIds: ['learner-1'], // Already enrolled
      };

      const duplicateError: EnrollmentResult = {
        classId: 'class-1',
        enrollments: [],
        successCount: 0,
        failedCount: 1,
        errors: [
          {
            learnerId: 'learner-1',
            reason: 'Learner already enrolled',
          },
        ],
      };

      server.use(
        http.post(`${baseUrl}/classes/${classId}/enrollments`, () => {
          return HttpResponse.json({
            success: true, data: duplicateError, message: 'Enrollment completed with errors',
          });
        })
      );

      const result = await addLearnersToClass(classId, payload);

      expect(result.successCount).toBe(0);
      expect(result.errors[0].reason).toBe('Learner already enrolled');
    });
  });

  describe('removeLearnerFromClass', () => {
    it('should remove learner from class', async () => {
      const classId = 'class-1';
      const enrollmentId = 'enrollment-1';

      server.use(
        http.delete(`${baseUrl}/classes/${classId}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json({
            success: true, data: mockDropEnrollmentResponse, message: 'Learner removed successfully',
          });
        })
      );

      const result = await removeLearnerFromClass(classId, enrollmentId);

      expect(result).toEqual(mockDropEnrollmentResponse);
      expect(result.status).toBe('withdrawn');
      expect(result.withdrawnAt).toBeDefined();
    });

    it('should remove learner with reason', async () => {
      const classId = 'class-1';
      const enrollmentId = 'enrollment-1';
      const reason = 'Medical leave';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.delete(
          `${baseUrl}/classes/${classId}/enrollments/${enrollmentId}`,
          ({ request }) => {
            capturedParams = new URL(request.url).searchParams;
            return HttpResponse.json({
              success: true, data: mockDropEnrollmentResponse, message: 'Learner removed successfully',
            });
          }
        )
      );

      const result = await removeLearnerFromClass(classId, enrollmentId, reason);

      expect(result.status).toBe('withdrawn');
      expect(capturedParams!.get('reason')).toBe(reason);
    });

    it('should handle enrollment not found error', async () => {
      const classId = 'class-1';
      const enrollmentId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/classes/${classId}/enrollments/${enrollmentId}`, () => {
          return HttpResponse.json(
            { message: 'Enrollment not found' },
            { status: 404 }
          );
        })
      );

      await expect(removeLearnerFromClass(classId, enrollmentId)).rejects.toThrow();
    });
  });

  describe('getClassProgress', () => {
    it('should fetch class progress summary', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/progress`, () => {
          return HttpResponse.json({ success: true, data: mockClassProgress });
        })
      );

      const result = await getClassProgress(classId);

      expect(result).toEqual(mockClassProgress);
      expect(result.totalLearners).toBe(25);
      expect(result.averageProgress).toBe(62.5);
      expect(result.averageScore).toBe(84.5);
    });

    it('should include module progress breakdown', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/progress`, () => {
          return HttpResponse.json({ success: true, data: mockClassProgress });
        })
      );

      const result = await getClassProgress(classId);

      expect(result.byModule).toHaveLength(3);
      expect(result.byModule[0].completedCount).toBeDefined();
      expect(result.byModule[0].averageScore).toBeDefined();
    });

    it('should include progress distribution', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/progress`, () => {
          return HttpResponse.json({ success: true, data: mockClassProgress });
        })
      );

      const result = await getClassProgress(classId);

      expect(result.progressDistribution).toBeDefined();
      expect(result.progressDistribution['0-25']).toBe(3);
      expect(result.progressDistribution['76-100']).toBe(9);
    });

    it('should include score distribution', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/progress`, () => {
          return HttpResponse.json({ success: true, data: mockClassProgress });
        })
      );

      const result = await getClassProgress(classId);

      expect(result.scoreDistribution).toBeDefined();
      expect(result.scoreDistribution['A (90-100)']).toBe(8);
      expect(result.scoreDistribution['B (80-89)']).toBe(10);
    });

    it('should handle class with no progress data', async () => {
      const classId = 'class-3'; // Upcoming class
      const emptyProgress = {
        ...mockClassProgress,
        classId: 'class-3',
        totalLearners: 5,
        activeEnrollments: 5,
        averageProgress: 0,
        averageScore: 0,
        completedCount: 0,
        inProgressCount: 0,
        notStartedCount: 5,
      };

      server.use(
        http.get(`${baseUrl}/classes/${classId}/progress`, () => {
          return HttpResponse.json({ success: true, data: emptyProgress });
        })
      );

      const result = await getClassProgress(classId);

      expect(result.averageProgress).toBe(0);
      expect(result.notStartedCount).toBe(5);
    });
  });

  describe('getClassEnrollments', () => {
    it('should fetch class enrollments list', async () => {
      const classId = 'class-1';

      server.use(
        http.get(`${baseUrl}/classes/${classId}/enrollments`, () => {
          return HttpResponse.json({ success: true, data: mockClassEnrollmentsResponse });
        })
      );

      const result = await getClassEnrollments(classId);

      expect(result).toEqual(mockClassEnrollmentsResponse);
      expect(result.enrollments).toHaveLength(3);
    });

    it('should fetch enrollments with pagination', async () => {
      const classId = 'class-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/classes/${classId}/enrollments`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: mockClassEnrollmentsResponse });
        })
      );

      const result = await getClassEnrollments(classId, { page: 1, limit: 10 });

      expect(result.pagination).toBeDefined();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('10');
    });

    it('should filter enrollments by status', async () => {
      const classId = 'class-1';
      let capturedParams: URLSearchParams | null = null;

      const activeEnrollments = {
        ...mockClassEnrollmentsResponse,
        enrollments: mockClassEnrollmentsResponse.enrollments.filter(
          (e) => e.status === 'active'
        ),
      };

      server.use(
        http.get(`${baseUrl}/classes/${classId}/enrollments`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ success: true, data: activeEnrollments });
        })
      );

      const result = await getClassEnrollments(classId, { status: 'active' });

      expect(result.enrollments.every((e) => e.status === 'active')).toBe(true);
      expect(capturedParams!.get('status')).toBe('active');
    });

    it('should handle empty enrollments list', async () => {
      const classId = 'class-5'; // Cancelled class
      const emptyResponse = {
        classId: 'class-5',
        enrollments: [],
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
        http.get(`${baseUrl}/classes/${classId}/enrollments`, () => {
          return HttpResponse.json({ success: true, data: emptyResponse });
        })
      );

      const result = await getClassEnrollments(classId);

      expect(result.enrollments).toHaveLength(0);
    });
  });
});
