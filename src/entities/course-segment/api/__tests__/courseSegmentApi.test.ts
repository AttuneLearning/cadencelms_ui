/**
 * Tests for Course Segment API Client
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listCourseSegments,
  getCourseSegment,
  createCourseSegment,
  updateCourseSegment,
  deleteCourseSegment,
  reorderCourseSegments,
  linkContentToModule,
} from '../courseSegmentApi';
import type {
  CourseSegmentsListResponse,
  ReorderCourseSegmentsResponse,
  DeleteCourseSegmentResponse,
} from '../../model/types';
import {
  mockCourseSegmentsList,
  mockFullCourseSegment,
  mockScormSegment,
  mockCreateCourseSegmentPayload,
  mockUpdateCourseSegmentPayload,
  createMockCourseSegment,
} from '@/test/mocks/data/courseSegments';

describe('courseSegmentApi', () => {
  const baseUrl = env.apiBaseUrl;
  const courseId = 'course-1';
  const moduleId = 'segment-1';

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('listCourseSegments', () => {
    it('should fetch list of course segments without filters', async () => {
      const mockResponse: CourseSegmentsListResponse = {
        courseId: courseId,
        courseTitle: 'Advanced Web Development',
        modules: mockCourseSegmentsList,
        totalModules: mockCourseSegmentsList.length,
      };

      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await listCourseSegments(courseId);

      expect(result).toEqual(mockResponse);
      expect(result.modules).toHaveLength(mockCourseSegmentsList.length);
      expect(result.courseId).toBe(courseId);
    });

    it('should fetch list with includeUnpublished filter', async () => {
      const filteredModules = mockCourseSegmentsList.filter(m => !m.isPublished);
      const mockResponse: CourseSegmentsListResponse = {
        courseId: courseId,
        courseTitle: 'Advanced Web Development',
        modules: filteredModules,
        totalModules: filteredModules.length,
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await listCourseSegments(courseId, {
        includeUnpublished: true,
      });

      expect(result.modules).toHaveLength(filteredModules.length);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('includeUnpublished')).toBe('true');
    });

    it('should fetch list with sort parameter', async () => {
      const mockResponse: CourseSegmentsListResponse = {
        courseId: courseId,
        courseTitle: 'Advanced Web Development',
        modules: mockCourseSegmentsList,
        totalModules: mockCourseSegmentsList.length,
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({ data: mockResponse });
        })
      );

      await listCourseSegments(courseId, { sort: 'title' });

      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('sort')).toBe('title');
    });

    it('should handle empty module list', async () => {
      const mockResponse: CourseSegmentsListResponse = {
        courseId: courseId,
        courseTitle: 'Advanced Web Development',
        modules: [],
        totalModules: 0,
      };

      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json({ data: mockResponse });
        })
      );

      const result = await listCourseSegments(courseId);

      expect(result.modules).toHaveLength(0);
      expect(result.totalModules).toBe(0);
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listCourseSegments(courseId)).rejects.toThrow();
    });

    it('should handle course not found error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json(
            { message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(listCourseSegments(courseId)).rejects.toThrow();
    });
  });

  describe('getCourseSegment', () => {
    it('should fetch single course segment by ID', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json({ data: mockFullCourseSegment });
        })
      );

      const result = await getCourseSegment(courseId, moduleId);

      expect(result).toEqual(mockFullCourseSegment);
      expect(result.id).toBe(moduleId);
      expect(result.courseId).toBe(courseId);
    });

    it('should fetch SCORM segment with complex settings', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules/${mockScormSegment.id}`, () => {
          return HttpResponse.json({ data: mockScormSegment });
        })
      );

      const result = await getCourseSegment(courseId, mockScormSegment.id);

      expect(result).toEqual(mockScormSegment);
      expect(result.type).toBe('scorm');
      expect(result.settings.maxAttempts).toBe(3);
      expect(result.settings.timeLimit).toBe(3600);
    });

    it('should handle module not found error', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json(
            { message: 'Module not found' },
            { status: 404 }
          );
        })
      );

      await expect(getCourseSegment(courseId, moduleId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      server.use(
        http.get(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getCourseSegment(courseId, moduleId)).rejects.toThrow();
    });
  });

  describe('createCourseSegment', () => {
    it('should create new course segment', async () => {
      const newSegment = createMockCourseSegment({
        title: mockCreateCourseSegmentPayload.title,
        type: mockCreateCourseSegmentPayload.type,
        order: mockCreateCourseSegmentPayload.order,
      });

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${courseId}/modules`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json({ data: newSegment }, { status: 201 });
        })
      );

      const result = await createCourseSegment(courseId, mockCreateCourseSegmentPayload);

      expect(result).toEqual(newSegment);
      expect(capturedRequestBody).toMatchObject({
        title: mockCreateCourseSegmentPayload.title,
        order: mockCreateCourseSegmentPayload.order,
        type: mockCreateCourseSegmentPayload.type,
      });
    });

    it('should create segment with all optional fields', async () => {
      const payload = {
        ...mockCreateCourseSegmentPayload,
        description: 'Detailed description',
        passingScore: 85,
        duration: 3600,
        settings: {
          allowMultipleAttempts: true,
          maxAttempts: 5,
          timeLimit: 7200,
          showFeedback: true,
          shuffleQuestions: true,
        },
      };

      const newSegment = createMockCourseSegment(payload);

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json({ data: newSegment }, { status: 201 });
        })
      );

      const result = await createCourseSegment(courseId, payload);

      expect(result).toEqual(newSegment);
    });

    it('should create SCORM segment', async () => {
      const scormPayload: typeof mockCreateCourseSegmentPayload = {
        ...mockCreateCourseSegmentPayload,
        type: 'scorm',
        contentId: 'scorm-package-1',
        passingScore: 80,
      };

      const scormSegment = createMockCourseSegment({
        type: 'scorm',
        contentId: 'scorm-package-1',
        passingScore: 80,
      });

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json({ data: scormSegment }, { status: 201 });
        })
      );

      const result = await createCourseSegment(courseId, scormPayload);

      expect(result.type).toBe('scorm');
      expect(result.contentId).toBe('scorm-package-1');
    });

    it('should handle validation errors', async () => {
      const invalidPayload = {
        ...mockCreateCourseSegmentPayload,
        title: '',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                title: ['Title is required'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(createCourseSegment(courseId, invalidPayload)).rejects.toThrow();
    });

    it('should handle invalid order error', async () => {
      const payloadWithInvalidOrder = {
        ...mockCreateCourseSegmentPayload,
        order: -1,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${courseId}/modules`, () => {
          return HttpResponse.json(
            { message: 'Order must be a positive integer' },
            { status: 400 }
          );
        })
      );

      await expect(
        createCourseSegment(courseId, payloadWithInvalidOrder)
      ).rejects.toThrow();
    });
  });

  describe('updateCourseSegment', () => {
    it('should update existing course segment', async () => {
      const updatedSegment = {
        ...mockFullCourseSegment,
        ...mockUpdateCourseSegmentPayload,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.put(
          `${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({ data: updatedSegment });
          }
        )
      );

      const result = await updateCourseSegment(
        courseId,
        moduleId,
        mockUpdateCourseSegmentPayload
      );

      expect(result).toEqual(updatedSegment);
      expect(capturedRequestBody.title).toBe(mockUpdateCourseSegmentPayload.title);
      expect(capturedRequestBody.isPublished).toBe(true);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { title: 'Updated Title Only' };
      const updatedSegment = { ...mockFullCourseSegment, title: 'Updated Title Only' };

      server.use(
        http.put(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json({ data: updatedSegment });
        })
      );

      const result = await updateCourseSegment(courseId, moduleId, partialUpdate);

      expect(result.title).toBe('Updated Title Only');
    });

    it('should update segment settings', async () => {
      const settingsUpdate = {
        settings: {
          allowMultipleAttempts: true,
          maxAttempts: 10,
          timeLimit: 5400,
          showFeedback: false,
          shuffleQuestions: true,
        },
      };

      const updatedSegment = {
        ...mockFullCourseSegment,
        settings: settingsUpdate.settings,
      };

      server.use(
        http.put(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json({ data: updatedSegment });
        })
      );

      const result = await updateCourseSegment(courseId, moduleId, settingsUpdate);

      expect(result.settings.maxAttempts).toBe(10);
      expect(result.settings.shuffleQuestions).toBe(true);
    });

    it('should update publishing status', async () => {
      const publishUpdate = { isPublished: true };
      const publishedSegment = { ...mockFullCourseSegment, isPublished: true };

      server.use(
        http.put(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json({ data: publishedSegment });
        })
      );

      const result = await updateCourseSegment(courseId, moduleId, publishUpdate);

      expect(result.isPublished).toBe(true);
    });

    it('should handle module not found error', async () => {
      server.use(
        http.put(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json(
            { message: 'Module not found' },
            { status: 404 }
          );
        })
      );

      await expect(
        updateCourseSegment(courseId, moduleId, mockUpdateCourseSegmentPayload)
      ).rejects.toThrow();
    });

    it('should handle validation errors on update', async () => {
      const invalidUpdate = {
        passingScore: 150, // Invalid: over 100
      };

      server.use(
        http.put(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: {
                passingScore: ['Passing score must be between 0 and 100'],
              },
            },
            { status: 400 }
          );
        })
      );

      await expect(
        updateCourseSegment(courseId, moduleId, invalidUpdate)
      ).rejects.toThrow();
    });
  });

  describe('deleteCourseSegment', () => {
    it('should delete course segment by ID', async () => {
      const mockDeleteResponse: DeleteCourseSegmentResponse = {
        id: moduleId,
        title: 'Introduction to TypeScript',
        deletedAt: new Date().toISOString(),
        affectedModules: 0,
        reorderedModules: [],
      };

      let deleteCalled = false;

      server.use(
        http.delete(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          deleteCalled = true;
          return HttpResponse.json({ data: mockDeleteResponse });
        })
      );

      const result = await deleteCourseSegment(courseId, moduleId);

      expect(deleteCalled).toBe(true);
      expect(result.id).toBe(moduleId);
    });

    it('should delete with force parameter', async () => {
      const mockDeleteResponse: DeleteCourseSegmentResponse = {
        id: moduleId,
        title: 'Introduction to TypeScript',
        deletedAt: new Date().toISOString(),
        affectedModules: 2,
        reorderedModules: [
          { id: 'segment-2', title: 'Module 2', oldOrder: 2, newOrder: 1 },
          { id: 'segment-3', title: 'Module 3', oldOrder: 3, newOrder: 2 },
        ],
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.delete(
          `${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`,
          ({ request }) => {
            capturedParams = new URL(request.url).searchParams;
            return HttpResponse.json({ data: mockDeleteResponse });
          }
        )
      );

      const result = await deleteCourseSegment(courseId, moduleId, true);

      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('force')).toBe('true');
      expect(result.affectedModules).toBe(2);
      expect(result.reorderedModules).toHaveLength(2);
    });

    it('should handle cascade delete with reordering', async () => {
      const mockDeleteResponse: DeleteCourseSegmentResponse = {
        id: moduleId,
        title: 'Introduction to TypeScript',
        deletedAt: new Date().toISOString(),
        affectedModules: 3,
        reorderedModules: [
          { id: 'segment-2', title: 'Module 2', oldOrder: 2, newOrder: 1 },
          { id: 'segment-3', title: 'Module 3', oldOrder: 3, newOrder: 2 },
          { id: 'segment-4', title: 'Module 4', oldOrder: 4, newOrder: 3 },
        ],
      };

      server.use(
        http.delete(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json({ data: mockDeleteResponse });
        })
      );

      const result = await deleteCourseSegment(courseId, moduleId, true);

      expect(result.affectedModules).toBe(3);
      expect(result.reorderedModules).toHaveLength(3);
      result.reorderedModules.forEach((module, index) => {
        expect(module.newOrder).toBe(index + 1);
      });
    });

    it('should handle module not found error', async () => {
      server.use(
        http.delete(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json(
            { message: 'Module not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteCourseSegment(courseId, moduleId)).rejects.toThrow();
    });

    it('should handle forbidden deletion error', async () => {
      server.use(
        http.delete(`${baseUrl}/api/v2/courses/${courseId}/modules/${moduleId}`, () => {
          return HttpResponse.json(
            { message: 'Cannot delete module with active enrollments' },
            { status: 403 }
          );
        })
      );

      await expect(deleteCourseSegment(courseId, moduleId)).rejects.toThrow();
    });
  });

  describe('reorderCourseSegments', () => {
    it('should reorder course segments', async () => {
      const moduleIds = ['segment-3', 'segment-1', 'segment-2'];
      const mockReorderResponse: ReorderCourseSegmentsResponse = {
        courseId: courseId,
        modules: [
          { id: 'segment-3', title: 'Module 3', oldOrder: 3, newOrder: 1 },
          { id: 'segment-1', title: 'Module 1', oldOrder: 1, newOrder: 2 },
          { id: 'segment-2', title: 'Module 2', oldOrder: 2, newOrder: 3 },
        ],
        totalReordered: 3,
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(
          `${baseUrl}/api/v2/courses/${courseId}/modules/reorder`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({ data: mockReorderResponse });
          }
        )
      );

      const result = await reorderCourseSegments(courseId, { moduleIds });

      expect(result).toEqual(mockReorderResponse);
      expect(capturedRequestBody).toEqual({ moduleIds });
      expect(result.totalReordered).toBe(3);
    });

    it('should reorder with moduleIds array', async () => {
      const moduleIds = ['segment-2', 'segment-3', 'segment-1', 'segment-4'];
      const mockReorderResponse: ReorderCourseSegmentsResponse = {
        courseId: courseId,
        modules: moduleIds.map((id, index) => ({
          id,
          title: `Module ${index + 1}`,
          oldOrder: parseInt(id.split('-')[1]),
          newOrder: index + 1,
        })),
        totalReordered: 4,
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/courses/${courseId}/modules/reorder`, () => {
          return HttpResponse.json({ data: mockReorderResponse });
        })
      );

      const result = await reorderCourseSegments(courseId, { moduleIds });

      expect(result.modules).toHaveLength(4);
      expect(result.totalReordered).toBe(4);
    });

    it('should handle single module reorder', async () => {
      const moduleIds = ['segment-1'];
      const mockReorderResponse: ReorderCourseSegmentsResponse = {
        courseId: courseId,
        modules: [{ id: 'segment-1', title: 'Module 1', oldOrder: 1, newOrder: 1 }],
        totalReordered: 0, // No actual reordering needed
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/courses/${courseId}/modules/reorder`, () => {
          return HttpResponse.json({ data: mockReorderResponse });
        })
      );

      const result = await reorderCourseSegments(courseId, { moduleIds });

      expect(result.totalReordered).toBe(0);
    });

    it('should handle empty moduleIds array', async () => {
      const mockReorderResponse: ReorderCourseSegmentsResponse = {
        courseId: courseId,
        modules: [],
        totalReordered: 0,
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/courses/${courseId}/modules/reorder`, () => {
          return HttpResponse.json({ data: mockReorderResponse });
        })
      );

      const result = await reorderCourseSegments(courseId, { moduleIds: [] });

      expect(result.modules).toHaveLength(0);
      expect(result.totalReordered).toBe(0);
    });

    it('should handle invalid module ID error', async () => {
      const moduleIds = ['segment-1', 'invalid-id', 'segment-2'];

      server.use(
        http.patch(`${baseUrl}/api/v2/courses/${courseId}/modules/reorder`, () => {
          return HttpResponse.json(
            { message: 'Invalid module ID: invalid-id' },
            { status: 400 }
          );
        })
      );

      await expect(reorderCourseSegments(courseId, { moduleIds })).rejects.toThrow();
    });

    it('should handle course not found error', async () => {
      const moduleIds = ['segment-1', 'segment-2'];

      server.use(
        http.patch(`${baseUrl}/api/v2/courses/${courseId}/modules/reorder`, () => {
          return HttpResponse.json(
            { message: 'Course not found' },
            { status: 404 }
          );
        })
      );

      await expect(reorderCourseSegments(courseId, { moduleIds })).rejects.toThrow();
    });

    it('should handle server error', async () => {
      const moduleIds = ['segment-1', 'segment-2'];

      server.use(
        http.patch(`${baseUrl}/api/v2/courses/${courseId}/modules/reorder`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(reorderCourseSegments(courseId, { moduleIds })).rejects.toThrow();
    });
  });

  describe('linkContentToModule', () => {
    it('should successfully link content to module', async () => {
      const contentId = 'content-123';
      const mockResponse = {
        moduleId,
        contentId,
        contentType: 'scorm',
        linkedAt: new Date().toISOString(),
        message: 'Content linked successfully',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(
          `${baseUrl}/courses/${courseId}/modules/${moduleId}/link-content`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({ data: mockResponse });
          }
        )
      );

      const result = await linkContentToModule(courseId, moduleId, { contentId });

      expect(result).toEqual(mockResponse);
      expect(capturedRequestBody.contentId).toBe(contentId);
      expect(result.moduleId).toBe(moduleId);
    });

    it('should link content with specified content type', async () => {
      const contentId = 'video-456';
      const contentType = 'video';
      const mockResponse = {
        moduleId,
        contentId,
        contentType,
        linkedAt: new Date().toISOString(),
        message: 'Video linked successfully',
      };

      server.use(
        http.post(
          `${baseUrl}/courses/${courseId}/modules/${moduleId}/link-content`,
          () => {
            return HttpResponse.json({ data: mockResponse });
          }
        )
      );

      const result = await linkContentToModule(courseId, moduleId, {
        contentId,
        contentType,
      });

      expect(result.contentType).toBe(contentType);
    });

    it('should handle content not found error', async () => {
      const contentId = 'invalid-content';

      server.use(
        http.post(
          `${baseUrl}/courses/${courseId}/modules/${moduleId}/link-content`,
          () => {
            return HttpResponse.json(
              { message: 'Content not found' },
              { status: 404 }
            );
          }
        )
      );

      await expect(
        linkContentToModule(courseId, moduleId, { contentId })
      ).rejects.toThrow();
    });

    it('should handle module not found error', async () => {
      const contentId = 'content-123';

      server.use(
        http.post(
          `${baseUrl}/courses/${courseId}/modules/${moduleId}/link-content`,
          () => {
            return HttpResponse.json(
              { message: 'Module not found' },
              { status: 404 }
            );
          }
        )
      );

      await expect(
        linkContentToModule(courseId, moduleId, { contentId })
      ).rejects.toThrow();
    });

    it('should handle already linked error', async () => {
      const contentId = 'content-123';

      server.use(
        http.post(
          `${baseUrl}/courses/${courseId}/modules/${moduleId}/link-content`,
          () => {
            return HttpResponse.json(
              { message: 'Content already linked to this module' },
              { status: 409 }
            );
          }
        )
      );

      await expect(
        linkContentToModule(courseId, moduleId, { contentId })
      ).rejects.toThrow();
    });
  });
});
