/**
 * Unit tests for content API functions
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  getContent,
  getContentList,
  getContentByCourseId,
  getContentByLessonId,
  createContent,
  updateContent,
  deleteContent,
  searchContent,
  getContentByTags,
} from './contentApi';
import {
  ContentType,
  ContentStatus,
  ScormVersion,
  VideoFormat,
  type Content,
  type CreateContentPayload,
  type UpdateContentPayload,
  type ScormMetadata,
} from '../model/types';

// Mock content data
const mockScormMetadata: ScormMetadata = {
  scormVersion: ScormVersion.SCORM_12,
  packageSize: 1024000,
  manifestUrl: 'https://example.com/manifest.xml',
  launchUrl: 'https://example.com/launch.html',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockContent: Content = {
  id: 'content-1',
  title: 'Introduction to JavaScript',
  description: 'Learn the basics of JavaScript programming',
  type: ContentType.SCORM_12,
  status: ContentStatus.PUBLISHED,
  courseId: 'course-1',
  metadata: mockScormMetadata,
  isRequired: true,
  sortOrder: 1,
  thumbnailUrl: 'https://example.com/thumbnail.jpg',
};

const mockContentList: Content[] = [
  mockContent,
  {
    ...mockContent,
    id: 'content-2',
    title: 'Advanced JavaScript',
    sortOrder: 2,
  },
];

describe('Content API', () => {
  describe('getContent', () => {
    it('should fetch a single content item by ID', async () => {
      server.use(
        http.get(`${env.apiBaseUrl}/content/:id`, ({ params }) => {
          const { id } = params;
          return HttpResponse.json({
            data: { ...mockContent, id },
            status: 200,
          });
        })
      );

      const result = await getContent('content-1');

      expect(result).toEqual(mockContent);
      expect(result.id).toBe('content-1');
    });

    it('should throw error when content not found', async () => {
      server.use(
        http.get(`${env.apiBaseUrl}/content/:id`, () => {
          return HttpResponse.json(
            {
              message: 'Content not found',
              code: 'NOT_FOUND',
              status: 404,
            },
            { status: 404 }
          );
        })
      );

      await expect(getContent('invalid-id')).rejects.toThrow();
    });
  });

  describe('getContentList', () => {
    it('should fetch a paginated list of content items', async () => {
      server.use(
        http.get(`${env.apiBaseUrl}/content/scorm`, () => {
          return HttpResponse.json({
            data: mockContentList,
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 2,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const result = await getContentList();

      expect(result.data).toEqual(mockContentList);
      expect(result.meta.totalCount).toBe(2);
    });

    it('should pass filter parameters correctly', async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${env.apiBaseUrl}/content/scorm`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            data: [mockContent],
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      await getContentList({
        type: ContentType.SCORM_12,
        status: ContentStatus.PUBLISHED,
        page: 2,
        pageSize: 20,
      });

      expect(capturedParams?.get('type')).toBe(ContentType.SCORM_12);
      expect(capturedParams?.get('status')).toBe(ContentStatus.PUBLISHED);
      expect(capturedParams?.get('page')).toBe('2');
      expect(capturedParams?.get('pageSize')).toBe('20');
    });
  });

  describe('getContentByCourseId', () => {
    it('should fetch content items for a specific course', async () => {
      server.use(
        http.get(`${env.apiBaseUrl}/content/scorm`, ({ request }) => {
          const url = new URL(request.url);
          const courseId = url.searchParams.get('courseId');

          return HttpResponse.json({
            data: mockContentList.filter((c) => c.courseId === courseId),
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 2,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const result = await getContentByCourseId('course-1');

      expect(result.data).toHaveLength(2);
      expect(result.data[0].courseId).toBe('course-1');
    });
  });

  describe('getContentByLessonId', () => {
    it('should fetch content items for a specific lesson', async () => {
      server.use(
        http.get(`${env.apiBaseUrl}/content/scorm`, ({ request }) => {
          const url = new URL(request.url);
          const lessonId = url.searchParams.get('lessonId');

          return HttpResponse.json({
            data: mockContentList.filter((c) => c.lessonId === lessonId),
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      const result = await getContentByLessonId('lesson-1');

      expect(result.data).toBeDefined();
    });
  });

  describe('createContent', () => {
    it('should create a new content item', async () => {
      const payload: CreateContentPayload = {
        title: 'New Content',
        description: 'New content description',
        type: ContentType.VIDEO,
        status: ContentStatus.DRAFT,
        courseId: 'course-1',
        metadata: {
          duration: 300,
          format: VideoFormat.MP4,
          fileSize: 5242880,
        },
      };

      server.use(
        http.post(`${env.apiBaseUrl}/content/scorm`, async ({ request }) => {
          const body = (await request.json()) as CreateContentPayload;
          return HttpResponse.json({
            data: {
              id: 'new-content-id',
              ...body,
              metadata: {
                ...mockScormMetadata,
                ...body.metadata,
              },
            },
            status: 201,
          });
        })
      );

      const result = await createContent(payload);

      expect(result.id).toBe('new-content-id');
      expect(result.title).toBe(payload.title);
    });
  });

  describe('updateContent', () => {
    it('should update an existing content item', async () => {
      const payload: UpdateContentPayload = {
        title: 'Updated Title',
        status: ContentStatus.PUBLISHED,
      };

      server.use(
        http.put(`${env.apiBaseUrl}/content/:id`, async ({ params, request }) => {
          const { id } = params;
          const body = (await request.json()) as UpdateContentPayload;
          return HttpResponse.json({
            data: {
              ...mockContent,
              id: id as string,
              ...body,
            },
            status: 200,
          });
        })
      );

      const result = await updateContent('content-1', payload);

      expect(result.id).toBe('content-1');
      expect(result.title).toBe(payload.title);
      expect(result.status).toBe(payload.status);
    });
  });

  describe('deleteContent', () => {
    it('should delete a content item', async () => {
      server.use(
        http.delete(`${env.apiBaseUrl}/content/:id`, () => {
          return HttpResponse.json(null, { status: 204 });
        })
      );

      await expect(deleteContent('content-1')).resolves.toBeUndefined();
    });
  });

  describe('searchContent', () => {
    it('should search content items by query', async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${env.apiBaseUrl}/content/scorm`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            data: [mockContent],
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      await searchContent('JavaScript');

      expect(capturedParams?.get('search')).toBe('JavaScript');
    });
  });

  describe('getContentByTags', () => {
    it('should fetch content items by tags', async () => {
      let capturedParams: URLSearchParams | undefined;

      server.use(
        http.get(`${env.apiBaseUrl}/content/scorm`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            data: [mockContent],
            meta: {
              currentPage: 1,
              pageSize: 10,
              totalPages: 1,
              totalCount: 1,
              hasNextPage: false,
              hasPreviousPage: false,
            },
          });
        })
      );

      await getContentByTags(['javascript', 'tutorial']);

      expect(capturedParams?.get('tags')).toBe('javascript,tutorial');
    });
  });
});
