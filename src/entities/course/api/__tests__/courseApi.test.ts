/**
 * Tests for Course API Client
 * Tests all 14 course management endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  patchCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  archiveCourse,
  unarchiveCourse,
  duplicateCourse,
  exportCourse,
  moveDepartment,
  assignProgram,
} from '../courseApi';
import type { CoursesListResponse } from '../../model/types';
import {
  mockCourseListItems,
  mockPublishedCourse,
  mockDraftCourse,
  mockArchivedCourse,
  mockCreateCoursePayload,
  mockUpdateCoursePayload,
  mockCourseStatusResponse,
  mockDuplicateCourseResponse,
  mockExportCourseResponse,
  createMockCourse,
  mockDepartments,
  mockPrograms,
} from '@/test/mocks/data/courses';

describe('courseApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // LIST COURSES
  // =====================

  describe('listCourses', () => {
    it('should fetch paginated list of courses without filters', async () => {
      const mockResponse: CoursesListResponse = {
        courses: mockCourseListItems,
        pagination: {
          page: 1,
          limit: 20,
          total: mockCourseListItems.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses();

      expect(result).toEqual(mockResponse);
      expect(result.courses).toHaveLength(mockCourseListItems.length);
    });

    it('should fetch courses with pagination params', async () => {
      const mockResponse: CoursesListResponse = {
        courses: mockCourseListItems.slice(0, 2),
        pagination: {
          page: 1,
          limit: 2,
          total: mockCourseListItems.length,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/courses`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ page: 1, limit: 2 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('2');
    });

    it('should filter courses by department', async () => {
      const filteredCourses = mockCourseListItems.filter(
        (c) => c.department.id === 'dept-1'
      );

      const mockResponse: CoursesListResponse = {
        courses: filteredCourses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredCourses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ department: 'dept-1' });

      expect(result.courses).toHaveLength(filteredCourses.length);
      expect(result.courses.every((c) => c.department.id === 'dept-1')).toBe(true);
    });

    it('should filter courses by program', async () => {
      const filteredCourses = mockCourseListItems.filter(
        (c) => c.program?.id === 'prog-1'
      );

      const mockResponse: CoursesListResponse = {
        courses: filteredCourses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredCourses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ program: 'prog-1' });

      expect(result.courses).toHaveLength(filteredCourses.length);
      expect(result.courses.every((c) => c.program?.id === 'prog-1')).toBe(true);
    });

    it('should filter courses by status', async () => {
      const filteredCourses = mockCourseListItems.filter((c) => c.status === 'published');

      const mockResponse: CoursesListResponse = {
        courses: filteredCourses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredCourses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ status: 'published' });

      expect(result.courses).toHaveLength(filteredCourses.length);
      expect(result.courses.every((c) => c.status === 'published')).toBe(true);
    });

    it('should search courses by text', async () => {
      const filteredCourses = mockCourseListItems.filter((c) =>
        c.title.toLowerCase().includes('web')
      );

      const mockResponse: CoursesListResponse = {
        courses: filteredCourses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredCourses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ search: 'web' });

      expect(result.courses).toHaveLength(filteredCourses.length);
    });

    it('should filter courses by instructor', async () => {
      const filteredCourses = mockCourseListItems.filter((c) =>
        c.instructors.some((i) => i.id === 'inst-1')
      );

      const mockResponse: CoursesListResponse = {
        courses: filteredCourses,
        pagination: {
          page: 1,
          limit: 20,
          total: filteredCourses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ instructor: 'inst-1' });

      expect(result.courses).toHaveLength(filteredCourses.length);
    });

    it('should sort courses', async () => {
      const sortedCourses = [...mockCourseListItems].sort((a, b) =>
        a.title.localeCompare(b.title)
      );

      const mockResponse: CoursesListResponse = {
        courses: sortedCourses,
        pagination: {
          page: 1,
          limit: 20,
          total: sortedCourses.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses({ sort: 'title:asc' });

      expect(result.courses).toEqual(sortedCourses);
    });

    it('should handle empty course list', async () => {
      const mockResponse: CoursesListResponse = {
        courses: [],
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
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCourses();

      expect(result.courses).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/courses`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listCourses()).rejects.toThrow();
    });
  });

  // =====================
  // GET COURSE
  // =====================

  describe('getCourse', () => {
    it('should fetch single course by ID', async () => {
      const courseId = 'course-1';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockPublishedCourse,
          });
        })
      );

      const result = await getCourse(courseId);

      expect(result).toEqual(mockPublishedCourse);
      expect(result.id).toBe(courseId);
    });

    it('should fetch draft course with no modules', async () => {
      const courseId = 'course-3';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDraftCourse,
          });
        })
      );

      const result = await getCourse(courseId);

      expect(result).toEqual(mockDraftCourse);
      expect(result.status).toBe('draft');
      expect(result.modules).toHaveLength(0);
    });

    it('should fetch archived course', async () => {
      const courseId = 'course-4';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockArchivedCourse,
          });
        })
      );

      const result = await getCourse(courseId);

      expect(result).toEqual(mockArchivedCourse);
      expect(result.status).toBe('archived');
      expect(result.archivedAt).not.toBeNull();
    });

    it('should handle course not found error', async () => {
      const courseId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(getCourse(courseId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const courseId = 'course-1';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // CREATE COURSE
  // =====================

  describe('createCourse', () => {
    it('should create new course', async () => {
      const newCourse = createMockCourse({
        title: mockCreateCoursePayload.title,
        code: mockCreateCoursePayload.code,
        description: mockCreateCoursePayload.description,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/courses`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              data: newCourse,
            },
            { status: 201 }
          );
        })
      );

      const result = await createCourse(mockCreateCoursePayload);

      expect(result).toEqual(newCourse);
      expect(capturedRequestBody).toMatchObject({
        title: mockCreateCoursePayload.title,
        code: mockCreateCoursePayload.code,
        description: mockCreateCoursePayload.description,
        department: mockCreateCoursePayload.department,
      });
    });

    it('should create course with minimal required fields', async () => {
      const minimalPayload = {
        title: 'Minimal Course',
        code: 'MIN101',
        department: 'dept-1',
      };

      const newCourse = createMockCourse({
        title: minimalPayload.title,
        code: minimalPayload.code,
        department: { id: 'dept-1', name: 'Computer Science' },
      });

      server.use(
        http.post(`${baseUrl}/courses`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: newCourse,
            },
            { status: 201 }
          );
        })
      );

      const result = await createCourse(minimalPayload);

      expect(result.title).toBe(minimalPayload.title);
      expect(result.code).toBe(minimalPayload.code);
    });

    it('should handle validation errors for course code', async () => {
      const invalidPayload = {
        ...mockCreateCoursePayload,
        code: 'invalid-code',
      };

      server.use(
        http.post(`${baseUrl}/courses`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                code: ['Course code must match pattern: ^[A-Z]{2,4}[0-9]{3}$'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createCourse(invalidPayload)).rejects.toThrow();
    });

    it('should handle duplicate course code error', async () => {
      server.use(
        http.post(`${baseUrl}/courses`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course code already exists' },
            { status: 409 }
          );
        })
      );

      await expect(createCourse(mockCreateCoursePayload)).rejects.toThrow();
    });

    it('should handle missing required fields', async () => {
      const invalidPayload = {
        title: 'Test Course',
        // Missing code and department
      } as any;

      server.use(
        http.post(`${baseUrl}/courses`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation failed',
              errors: {
                code: ['Course code is required'],
                department: ['Department is required'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createCourse(invalidPayload)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE COURSE (PUT)
  // =====================

  describe('updateCourse', () => {
    it('should update existing course with full payload', async () => {
      const courseId = 'course-1';
      const updatedCourse = createMockCourse({
        id: courseId,
        title: mockUpdateCoursePayload.title,
        code: mockUpdateCoursePayload.code,
        description: mockUpdateCoursePayload.description,
        department: { id: 'dept-2', name: 'Mathematics' },
        program: { id: 'prog-2', name: 'Master of Business Administration' },
        credits: mockUpdateCoursePayload.credits,
        duration: mockUpdateCoursePayload.duration,
        settings: mockUpdateCoursePayload.settings ? {
          allowSelfEnrollment: mockUpdateCoursePayload.settings.allowSelfEnrollment ?? false,
          passingScore: mockUpdateCoursePayload.settings.passingScore ?? 70,
          maxAttempts: mockUpdateCoursePayload.settings.maxAttempts ?? 3,
          certificateEnabled: mockUpdateCoursePayload.settings.certificateEnabled ?? false,
        } : undefined,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.put(`${baseUrl}/courses/${courseId}`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: updatedCourse,
          });
        })
      );

      const result = await updateCourse(courseId, mockUpdateCoursePayload);

      expect(result).toEqual(updatedCourse);
      expect(capturedRequestBody).toEqual(mockUpdateCoursePayload);
    });

    it('should handle course not found error', async () => {
      const courseId = 'non-existent';

      server.use(
        http.put(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(updateCourse(courseId, mockUpdateCoursePayload)).rejects.toThrow();
    });
  });

  // =====================
  // PATCH COURSE (PATCH)
  // =====================

  describe('patchCourse', () => {
    it('should partially update course', async () => {
      const courseId = 'course-1';
      const partialUpdate = { title: 'Partially Updated Title' };
      const updatedCourse = { ...mockPublishedCourse, title: partialUpdate.title };

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedCourse,
          });
        })
      );

      const result = await patchCourse(courseId, partialUpdate);

      expect(result.title).toBe(partialUpdate.title);
      expect(result.code).toBe(mockPublishedCourse.code); // Unchanged
    });

    it('should update only course settings', async () => {
      const courseId = 'course-1';
      const settingsUpdate = {
        settings: {
          allowSelfEnrollment: false,
        },
      };

      const updatedCourse = {
        ...mockPublishedCourse,
        settings: {
          ...mockPublishedCourse.settings,
          allowSelfEnrollment: false,
        },
      };

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedCourse,
          });
        })
      );

      const result = await patchCourse(courseId, settingsUpdate);

      expect(result.settings.allowSelfEnrollment).toBe(false);
    });

    it('should handle course not found error', async () => {
      const courseId = 'non-existent';

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(patchCourse(courseId, { title: 'Test' })).rejects.toThrow();
    });
  });

  // =====================
  // DELETE COURSE
  // =====================

  describe('deleteCourse', () => {
    it('should delete course by ID', async () => {
      const courseId = 'course-1';
      let deleteCalled = false;

      server.use(
        http.delete(`${baseUrl}/courses/${courseId}`, () => {
          deleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      await deleteCourse(courseId);

      expect(deleteCalled).toBe(true);
    });

    it('should handle course not found error', async () => {
      const courseId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteCourse(courseId)).rejects.toThrow();
    });

    it('should handle course with enrollments error', async () => {
      const courseId = 'course-1';

      server.use(
        http.delete(`${baseUrl}/courses/${courseId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete course with active enrollments',
            },
            { status: 409 }
          );
        })
      );

      await expect(deleteCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // PUBLISH COURSE
  // =====================

  describe('publishCourse', () => {
    it('should publish draft course', async () => {
      const courseId = 'course-3';
      const publishResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'published' as const,
        publishedAt: new Date().toISOString(),
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/publish`, () => {
          return HttpResponse.json({
            success: true,
            data: publishResponse,
          });
        })
      );

      const result = await publishCourse(courseId);

      expect(result.status).toBe('published');
      expect(result.publishedAt).not.toBeNull();
    });

    it('should publish course with custom publishedAt date', async () => {
      const courseId = 'course-3';
      const customDate = '2026-02-01T00:00:00Z';
      const publishResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'published' as const,
        publishedAt: customDate,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/publish`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: publishResponse,
          });
        })
      );

      const result = await publishCourse(courseId, { publishedAt: customDate });

      expect(result.publishedAt).toBe(customDate);
      expect(capturedRequestBody.publishedAt).toBe(customDate);
    });

    it('should handle course without modules error', async () => {
      const courseId = 'course-3';

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/publish`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot publish course without modules',
            },
            { status: 400 }
          );
        })
      );

      await expect(publishCourse(courseId)).rejects.toThrow();
    });

    it('should handle already published course', async () => {
      const courseId = 'course-1';

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/publish`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course is already published',
            },
            { status: 409 }
          );
        })
      );

      await expect(publishCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // UNPUBLISH COURSE
  // =====================

  describe('unpublishCourse', () => {
    it('should unpublish published course', async () => {
      const courseId = 'course-1';
      const unpublishResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'draft' as const,
        publishedAt: null,
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/unpublish`, () => {
          return HttpResponse.json({
            success: true,
            data: unpublishResponse,
          });
        })
      );

      const result = await unpublishCourse(courseId);

      expect(result.status).toBe('draft');
      expect(result.publishedAt).toBeNull();
    });

    it('should unpublish with reason', async () => {
      const courseId = 'course-1';
      const reason = 'Content needs to be updated';
      const unpublishResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'draft' as const,
        publishedAt: null,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/unpublish`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: unpublishResponse,
          });
        })
      );

      const result = await unpublishCourse(courseId, { reason });

      expect(result.status).toBe('draft');
      expect(capturedRequestBody.reason).toBe(reason);
    });

    it('should handle already draft course', async () => {
      const courseId = 'course-3';

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/unpublish`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course is already in draft status',
            },
            { status: 409 }
          );
        })
      );

      await expect(unpublishCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // ARCHIVE COURSE
  // =====================

  describe('archiveCourse', () => {
    it('should archive published course', async () => {
      const courseId = 'course-1';
      const archiveResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'archived' as const,
        archivedAt: new Date().toISOString(),
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/archive`, () => {
          return HttpResponse.json({
            success: true,
            data: archiveResponse,
          });
        })
      );

      const result = await archiveCourse(courseId);

      expect(result.status).toBe('archived');
      expect(result.archivedAt).not.toBeNull();
    });

    it('should archive with reason and custom date', async () => {
      const courseId = 'course-1';
      const customDate = '2026-06-01T00:00:00Z';
      const reason = 'Course content is outdated';
      const archiveResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'archived' as const,
        archivedAt: customDate,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/archive`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: archiveResponse,
          });
        })
      );

      const result = await archiveCourse(courseId, { reason, archivedAt: customDate });

      expect(result.archivedAt).toBe(customDate);
      expect(capturedRequestBody.reason).toBe(reason);
      expect(capturedRequestBody.archivedAt).toBe(customDate);
    });

    it('should handle already archived course', async () => {
      const courseId = 'course-4';

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/archive`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course is already archived',
            },
            { status: 409 }
          );
        })
      );

      await expect(archiveCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // UNARCHIVE COURSE
  // =====================

  describe('unarchiveCourse', () => {
    it('should unarchive archived course', async () => {
      const courseId = 'course-4';
      const unarchiveResponse = {
        ...mockCourseStatusResponse,
        id: courseId,
        status: 'draft' as const,
        archivedAt: null,
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/unarchive`, () => {
          return HttpResponse.json({
            success: true,
            data: unarchiveResponse,
          });
        })
      );

      const result = await unarchiveCourse(courseId);

      expect(result.status).toBe('draft');
      expect(result.archivedAt).toBeNull();
    });

    it('should handle not archived course', async () => {
      const courseId = 'course-1';

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/unarchive`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course is not archived',
            },
            { status: 409 }
          );
        })
      );

      await expect(unarchiveCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // DUPLICATE COURSE
  // =====================

  describe('duplicateCourse', () => {
    it('should duplicate course with new code', async () => {
      const courseId = 'course-1';
      const duplicatePayload = {
        newCode: 'WEB102',
        includeModules: true,
        includeSettings: true,
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/duplicate`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDuplicateCourseResponse,
          });
        })
      );

      const result = await duplicateCourse(courseId, duplicatePayload);

      expect(result).toEqual(mockDuplicateCourseResponse);
      expect(result.code).toBe('WEB102');
      expect(result.sourceCourseId).toBe(courseId);
    });

    it('should duplicate course with custom title', async () => {
      const courseId = 'course-1';
      const duplicatePayload = {
        newCode: 'WEB102',
        newTitle: 'Web Development Part 2',
        includeModules: false,
        includeSettings: false,
      };

      const customResponse = {
        ...mockDuplicateCourseResponse,
        title: 'Web Development Part 2',
        moduleCount: 0,
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/duplicate`, () => {
          return HttpResponse.json({
            success: true,
            data: customResponse,
          });
        })
      );

      const result = await duplicateCourse(courseId, duplicatePayload);

      expect(result.title).toBe('Web Development Part 2');
      expect(result.moduleCount).toBe(0);
    });

    it('should duplicate to different department and program', async () => {
      const courseId = 'course-1';
      const duplicatePayload = {
        newCode: 'CS102',
        targetDepartment: 'dept-2',
        targetProgram: 'prog-2',
        includeModules: true,
        includeSettings: true,
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/duplicate`, () => {
          return HttpResponse.json({
            success: true,
            data: mockDuplicateCourseResponse,
          });
        })
      );

      const result = await duplicateCourse(courseId, duplicatePayload);

      expect(result.id).not.toBe(courseId);
      expect(result.sourceCourseId).toBe(courseId);
    });

    it('should handle duplicate code error', async () => {
      const courseId = 'course-1';
      const duplicatePayload = {
        newCode: 'WEB101', // Same as original
        includeModules: true,
      };

      server.use(
        http.post(`${baseUrl}/courses/${courseId}/duplicate`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course code already exists',
            },
            { status: 409 }
          );
        })
      );

      await expect(duplicateCourse(courseId, duplicatePayload)).rejects.toThrow();
    });
  });

  // =====================
  // EXPORT COURSE
  // =====================

  describe('exportCourse', () => {
    it('should export course in default format', async () => {
      const courseId = 'course-1';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}/export`, () => {
          return HttpResponse.json({
            success: true,
            data: mockExportCourseResponse,
          });
        })
      );

      const result = await exportCourse(courseId);

      expect(result).toEqual(mockExportCourseResponse);
      expect(result.downloadUrl).toBeTruthy();
      expect(result.filename).toBeTruthy();
    });

    it('should export course in SCORM 1.2 format', async () => {
      const courseId = 'course-1';
      const scormResponse = {
        ...mockExportCourseResponse,
        format: 'scorm1.2' as const,
        filename: 'WEB101-scorm1.2.zip',
      };

      server.use(
        http.get(`${baseUrl}/courses/${courseId}/export`, () => {
          return HttpResponse.json({
            success: true,
            data: scormResponse,
          });
        })
      );

      const result = await exportCourse(courseId, 'scorm1.2');

      expect(result.format).toBe('scorm1.2');
    });

    it('should export course in PDF format', async () => {
      const courseId = 'course-1';
      const pdfResponse = {
        ...mockExportCourseResponse,
        format: 'pdf' as const,
        filename: 'WEB101-export.pdf',
      };

      server.use(
        http.get(`${baseUrl}/courses/${courseId}/export`, () => {
          return HttpResponse.json({
            success: true,
            data: pdfResponse,
          });
        })
      );

      const result = await exportCourse(courseId, 'pdf');

      expect(result.format).toBe('pdf');
    });

    it('should export course with custom options', async () => {
      const courseId = 'course-1';
      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/courses/${courseId}/export`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockExportCourseResponse,
          });
        })
      );

      await exportCourse(courseId, 'json', false, false);

      expect(capturedParams!.get('format')).toBe('json');
      expect(capturedParams!.get('includeModules')).toBe('false');
      expect(capturedParams!.get('includeAssessments')).toBe('false');
    });

    it('should handle export error', async () => {
      const courseId = 'course-1';

      server.use(
        http.get(`${baseUrl}/courses/${courseId}/export`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Export failed',
            },
            { status: 500 }
          );
        })
      );

      await expect(exportCourse(courseId)).rejects.toThrow();
    });
  });

  // =====================
  // MOVE DEPARTMENT
  // =====================

  describe('moveDepartment', () => {
    it('should move course to different department', async () => {
      const courseId = 'course-1';
      const newDepartment = mockDepartments[1];
      const moveResponse = {
        id: courseId,
        department: newDepartment,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}/department`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: moveResponse,
          });
        })
      );

      const result = await moveDepartment(courseId, { department: newDepartment.id });

      expect(result.department.id).toBe(newDepartment.id);
      expect(capturedRequestBody.department).toBe(newDepartment.id);
    });

    it('should handle invalid department error', async () => {
      const courseId = 'course-1';

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}/department`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Department not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(moveDepartment(courseId, { department: 'invalid-dept' })).rejects.toThrow();
    });
  });

  // =====================
  // ASSIGN PROGRAM
  // =====================

  describe('assignProgram', () => {
    it('should assign course to program', async () => {
      const courseId = 'course-3';
      const newProgram = mockPrograms[0];
      const assignResponse = {
        id: courseId,
        program: newProgram,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}/program`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({
            success: true,
            data: assignResponse,
          });
        })
      );

      const result = await assignProgram(courseId, { program: newProgram.id });

      expect(result.program?.id).toBe(newProgram.id);
      expect(capturedRequestBody.program).toBe(newProgram.id);
    });

    it('should unassign program from course', async () => {
      const courseId = 'course-1';
      const unassignResponse = {
        id: courseId,
        program: null,
      };

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}/program`, () => {
          return HttpResponse.json({
            success: true,
            data: unassignResponse,
          });
        })
      );

      const result = await assignProgram(courseId, { program: null });

      expect(result.program).toBeNull();
    });

    it('should handle invalid program error', async () => {
      const courseId = 'course-1';

      server.use(
        http.patch(`${baseUrl}/courses/${courseId}/program`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Program not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(assignProgram(courseId, { program: 'invalid-prog' })).rejects.toThrow();
    });
  });
});
