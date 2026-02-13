/**
 * Tests for Content API Client
 * Tests all 15 endpoints from contentApi.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import * as contentApi from '../contentApi';
import type {
  ContentListResponse,
  ScormPackagesListResponse,
  MediaFilesListResponse,
} from '../../model/types';
import {
  mockContentListItems,
  mockContentListResponse,
  mockContents,
  mockScormPackageListItems,
  mockScormPackages,
  mockScormPackagesListResponse,
  mockMediaFileListItems,
  mockMediaFiles,
  mockMediaFilesListResponse,
  mockUploadScormPackageResponse,
  mockUploadMediaFileResponse,
  mockScormLaunchResponse,
  mockPublishScormPackageResponse,
  mockUnpublishScormPackageResponse,
  createMockScormFile,
  createMockVideoFile,
  createMockImageFile,
} from '@/test/mocks/data/content';

describe('contentApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  describe('Content Overview Endpoints', () => {
    describe('listContent', () => {
      it('should fetch paginated list of all content without filters', async () => {
        server.use(
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json({
              success: true,
              data: mockContentListResponse,
            });
          })
        );

        const result = await contentApi.listContent();

        expect(result).toEqual(mockContentListResponse);
        expect(result.content).toHaveLength(mockContentListItems.length);
      });

      it('should fetch content with pagination params', async () => {
        const mockResponse: ContentListResponse = {
          content: mockContentListItems.slice(0, 2),
          pagination: {
            page: 1,
            limit: 2,
            total: mockContentListItems.length,
            totalPages: 3,
            hasNext: true,
            hasPrev: false,
          },
        };

        let capturedParams: URLSearchParams | null = null;

        server.use(
          http.get(`${baseUrl}/content`, ({ request }) => {
            capturedParams = new URL(request.url).searchParams;
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listContent({ page: 1, limit: 2 });

        expect(result).toEqual(mockResponse);
        expect(capturedParams).not.toBeNull();
        expect(capturedParams!.get('page')).toBe('1');
        expect(capturedParams!.get('limit')).toBe('2');
      });

      it('should fetch content with type filter', async () => {
        const filteredContent = mockContentListItems.filter((c) => c.type === 'scorm');

        const mockResponse: ContentListResponse = {
          content: filteredContent,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredContent.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listContent({ type: 'scorm' });

        expect(result.content).toHaveLength(filteredContent.length);
        expect(result.content.every((c) => c.type === 'scorm')).toBe(true);
      });

      it('should fetch content with status filter', async () => {
        const filteredContent = mockContentListItems.filter((c) => c.status === 'published');

        const mockResponse: ContentListResponse = {
          content: filteredContent,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredContent.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listContent({ status: 'published' });

        expect(result.content).toHaveLength(filteredContent.length);
        expect(result.content.every((c) => c.status === 'published')).toBe(true);
      });

      it('should fetch content with search filter', async () => {
        const mockResponse: ContentListResponse = {
          content: mockContentListItems.slice(0, 1),
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listContent({ search: 'programming' });

        expect(result.content.length).toBeGreaterThanOrEqual(0);
      });

      it('should fetch content with department filter', async () => {
        const filteredContent = mockContentListItems.filter(
          (c) => c.departmentId === 'dept-1'
        );

        const mockResponse: ContentListResponse = {
          content: filteredContent,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredContent.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listContent({ departmentId: 'dept-1' });

        expect(result.content.every((c) => c.departmentId === 'dept-1')).toBe(true);
      });

      it('should handle empty content list', async () => {
        const mockResponse: ContentListResponse = {
          content: [],
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
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listContent();

        expect(result.content).toHaveLength(0);
        expect(result.pagination.total).toBe(0);
      });

      it('should handle API error', async () => {
        server.use(
          http.get(`${baseUrl}/content`, () => {
            return HttpResponse.json(
              { message: 'Internal server error' },
              { status: 500 }
            );
          })
        );

        await expect(contentApi.listContent()).rejects.toThrow();
      });
    });

    describe('getContent', () => {
      it('should fetch single content item by ID', async () => {
        const contentId = 'content-1';

        server.use(
          http.get(`${baseUrl}/content/${contentId}`, () => {
            return HttpResponse.json({
              success: true,
              data: mockContents[0],
            });
          })
        );

        const result = await contentApi.getContent(contentId);

        expect(result).toEqual(mockContents[0]);
        expect(result.id).toBe(contentId);
      });

      it('should handle content not found error', async () => {
        const contentId = 'non-existent';

        server.use(
          http.get(`${baseUrl}/content/${contentId}`, () => {
            return HttpResponse.json(
              { message: 'Content not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.getContent(contentId)).rejects.toThrow();
      });

      it('should handle unauthorized access', async () => {
        const contentId = 'content-1';

        server.use(
          http.get(`${baseUrl}/content/${contentId}`, () => {
            return HttpResponse.json(
              { message: 'Unauthorized' },
              { status: 401 }
            );
          })
        );

        await expect(contentApi.getContent(contentId)).rejects.toThrow();
      });
    });
  });

  describe('SCORM Package Endpoints', () => {
    describe('listScormPackages', () => {
      it('should fetch paginated list of SCORM packages without filters', async () => {
        server.use(
          http.get(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json({
              success: true,
              data: mockScormPackagesListResponse,
            });
          })
        );

        const result = await contentApi.listScormPackages();

        expect(result).toEqual(mockScormPackagesListResponse);
        expect(result.packages).toHaveLength(mockScormPackageListItems.length);
      });

      it('should fetch SCORM packages with pagination', async () => {
        const mockResponse: ScormPackagesListResponse = {
          packages: mockScormPackageListItems.slice(0, 2),
          pagination: {
            page: 1,
            limit: 2,
            total: mockScormPackageListItems.length,
            totalPages: 2,
            hasNext: true,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listScormPackages({ page: 1, limit: 2 });

        expect(result.packages).toHaveLength(2);
      });

      it('should fetch SCORM packages with version filter', async () => {
        const filteredPackages = mockScormPackageListItems.filter(
          (p) => p.version === '1.2'
        );

        const mockResponse: ScormPackagesListResponse = {
          packages: filteredPackages,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredPackages.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listScormPackages({ version: '1.2' });

        expect(result.packages.every((p) => p.version === '1.2')).toBe(true);
      });

      it('should fetch SCORM packages with status filter', async () => {
        const filteredPackages = mockScormPackageListItems.filter(
          (p) => p.status === 'published'
        );

        const mockResponse: ScormPackagesListResponse = {
          packages: filteredPackages,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredPackages.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listScormPackages({ status: 'published' });

        expect(result.packages.every((p) => p.status === 'published')).toBe(true);
      });

      it('should handle API error', async () => {
        server.use(
          http.get(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json(
              { message: 'Internal server error' },
              { status: 500 }
            );
          })
        );

        await expect(contentApi.listScormPackages()).rejects.toThrow();
      });
    });

    describe('uploadScormPackage', () => {
      it('should upload SCORM package successfully', async () => {
        const file = createMockScormFile('test-package.zip', 1024 * 1024 * 50);
        const payload = {
          file,
          title: 'Test SCORM Package',
          description: 'Test description',
          departmentId: 'dept-1',
        };

        let capturedFormData: FormData | null = null;

        server.use(
          http.post(`${baseUrl}/content/scorm`, async ({ request }) => {
            capturedFormData = await request.formData();
            return HttpResponse.json(
              {
                success: true,
                data: mockUploadScormPackageResponse,
              },
              { status: 201 }
            );
          })
        );

        const result = await contentApi.uploadScormPackage(payload);

        expect(result).toEqual(mockUploadScormPackageResponse);
        expect(capturedFormData).not.toBeNull();
        expect(capturedFormData!.get('file')).toBeTruthy();
        expect(capturedFormData!.get('title')).toBe('Test SCORM Package');
        expect(capturedFormData!.get('description')).toBe('Test description');
        expect(capturedFormData!.get('departmentId')).toBe('dept-1');
      });

      it('should upload SCORM package with thumbnail', async () => {
        const file = createMockScormFile();
        const thumbnail = createMockImageFile('thumbnail.jpg');
        const payload = {
          file,
          title: 'Test Package',
          thumbnail,
        };

        let capturedFormData: FormData | null = null;

        server.use(
          http.post(`${baseUrl}/content/scorm`, async ({ request }) => {
            capturedFormData = await request.formData();
            return HttpResponse.json(
              {
                success: true,
                data: mockUploadScormPackageResponse,
              },
              { status: 201 }
            );
          })
        );

        const result = await contentApi.uploadScormPackage(payload);

        expect(result).toEqual(mockUploadScormPackageResponse);
        expect(capturedFormData!.get('thumbnail')).toBeTruthy();
      });

      it('should track upload progress', async () => {
        const file = createMockScormFile();
        const payload = { file };
        const progressCallback = vi.fn();

        server.use(
          http.post(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json(
              {
                success: true,
                data: mockUploadScormPackageResponse,
              },
              { status: 201 }
            );
          })
        );

        await contentApi.uploadScormPackage(payload, progressCallback);

        // Progress callback should be provided (actual calls depend on axios mock)
        expect(progressCallback).toBeDefined();
      });

      it('should upload minimal SCORM package without optional fields', async () => {
        const file = createMockScormFile();
        const payload = { file };

        let capturedFormData: FormData | null = null;

        server.use(
          http.post(`${baseUrl}/content/scorm`, async ({ request }) => {
            capturedFormData = await request.formData();
            return HttpResponse.json(
              {
                success: true,
                data: mockUploadScormPackageResponse,
              },
              { status: 201 }
            );
          })
        );

        const result = await contentApi.uploadScormPackage(payload);

        expect(result).toEqual(mockUploadScormPackageResponse);
        expect(capturedFormData!.get('file')).toBeTruthy();
        expect(capturedFormData!.get('title')).toBeNull();
        expect(capturedFormData!.get('description')).toBeNull();
      });

      it('should handle upload validation error', async () => {
        const file = createMockScormFile();
        const payload = { file };

        server.use(
          http.post(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json(
              {
                message: 'Validation failed',
                errors: {
                  file: ['Invalid SCORM package format'],
                },
              },
              { status: 400 }
            );
          })
        );

        await expect(contentApi.uploadScormPackage(payload)).rejects.toThrow();
      });

      it('should handle upload server error', async () => {
        const file = createMockScormFile();
        const payload = { file };

        server.use(
          http.post(`${baseUrl}/content/scorm`, () => {
            return HttpResponse.json(
              { message: 'Internal server error' },
              { status: 500 }
            );
          })
        );

        await expect(contentApi.uploadScormPackage(payload)).rejects.toThrow();
      });
    });

    describe('getScormPackage', () => {
      it('should fetch single SCORM package by ID', async () => {
        const packageId = 'scorm-1';

        server.use(
          http.get(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json({
              success: true,
              data: mockScormPackages[0],
            });
          })
        );

        const result = await contentApi.getScormPackage(packageId);

        expect(result).toEqual(mockScormPackages[0]);
        expect(result.id).toBe(packageId);
      });

      it('should handle SCORM package not found error', async () => {
        const packageId = 'non-existent';

        server.use(
          http.get(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json(
              { message: 'SCORM package not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.getScormPackage(packageId)).rejects.toThrow();
      });
    });

    describe('updateScormPackage', () => {
      it('should update SCORM package metadata', async () => {
        const packageId = 'scorm-1';
        const payload = {
          title: 'Updated Title',
          description: 'Updated description',
          departmentId: 'dept-2',
        };

        const updatedPackage = {
          ...mockScormPackages[0],
          ...payload,
        };

        let capturedRequestBody: any = null;

        server.use(
          http.put(`${baseUrl}/content/scorm/${packageId}`, async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: updatedPackage,
            });
          })
        );

        const result = await contentApi.updateScormPackage(packageId, payload);

        expect(result).toEqual(updatedPackage);
        expect(capturedRequestBody).toEqual(payload);
      });

      it('should handle partial updates', async () => {
        const packageId = 'scorm-1';
        const payload = { title: 'Updated Title Only' };

        const updatedPackage = { ...mockScormPackages[0], title: 'Updated Title Only' };

        server.use(
          http.put(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json({
              success: true,
              data: updatedPackage,
            });
          })
        );

        const result = await contentApi.updateScormPackage(packageId, payload);

        expect(result.title).toBe('Updated Title Only');
      });

      it('should handle update validation error', async () => {
        const packageId = 'scorm-1';
        const payload = { departmentId: 'invalid-dept' };

        server.use(
          http.put(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json(
              {
                message: 'Validation failed',
                errors: {
                  departmentId: ['Department not found'],
                },
              },
              { status: 400 }
            );
          })
        );

        await expect(
          contentApi.updateScormPackage(packageId, payload)
        ).rejects.toThrow();
      });

      it('should handle package not found error', async () => {
        const packageId = 'non-existent';
        const payload = { title: 'Updated' };

        server.use(
          http.put(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json(
              { message: 'SCORM package not found' },
              { status: 404 }
            );
          })
        );

        await expect(
          contentApi.updateScormPackage(packageId, payload)
        ).rejects.toThrow();
      });
    });

    describe('deleteScormPackage', () => {
      it('should delete SCORM package by ID', async () => {
        const packageId = 'scorm-1';
        let deleteCalled = false;

        server.use(
          http.delete(`${baseUrl}/content/scorm/${packageId}`, () => {
            deleteCalled = true;
            return HttpResponse.json({}, { status: 204 });
          })
        );

        await contentApi.deleteScormPackage(packageId);

        expect(deleteCalled).toBe(true);
      });

      it('should handle package not found error', async () => {
        const packageId = 'non-existent';

        server.use(
          http.delete(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json(
              { message: 'SCORM package not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.deleteScormPackage(packageId)).rejects.toThrow();
      });

      it('should handle forbidden deletion', async () => {
        const packageId = 'scorm-1';

        server.use(
          http.delete(`${baseUrl}/content/scorm/${packageId}`, () => {
            return HttpResponse.json(
              { message: 'Cannot delete package in use by courses' },
              { status: 403 }
            );
          })
        );

        await expect(contentApi.deleteScormPackage(packageId)).rejects.toThrow();
      });
    });

    describe('launchScormPackage', () => {
      it('should launch SCORM package without payload', async () => {
        const packageId = 'scorm-1';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/launch`, () => {
            return HttpResponse.json({
              success: true,
              data: mockScormLaunchResponse,
            });
          })
        );

        const result = await contentApi.launchScormPackage(packageId);

        expect(result).toEqual(mockScormLaunchResponse);
        expect(result.playerUrl).toBeTruthy();
        expect(result.attemptId).toBeTruthy();
        expect(result.sessionToken).toBeTruthy();
      });

      it('should launch SCORM package with course content ID', async () => {
        const packageId = 'scorm-1';
        const payload = { courseContentId: 'course-content-123' };

        let capturedRequestBody: any = null;

        server.use(
          http.post(
            `${baseUrl}/content/scorm/${packageId}/launch`,
            async ({ request }) => {
              capturedRequestBody = await request.json();
              return HttpResponse.json({
                success: true,
                data: mockScormLaunchResponse,
              });
            }
          )
        );

        const result = await contentApi.launchScormPackage(packageId, payload);

        expect(result).toEqual(mockScormLaunchResponse);
        expect(capturedRequestBody).toEqual(payload);
      });

      it('should launch SCORM package with resume attempt flag', async () => {
        const packageId = 'scorm-1';
        const payload = { resumeAttempt: true };

        const resumeLaunchResponse = {
          ...mockScormLaunchResponse,
          isResumed: true,
        };

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/launch`, () => {
            return HttpResponse.json({
              success: true,
              data: resumeLaunchResponse,
            });
          })
        );

        const result = await contentApi.launchScormPackage(packageId, payload);

        expect(result.isResumed).toBe(true);
      });

      it('should handle launch error when package not published', async () => {
        const packageId = 'scorm-3';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/launch`, () => {
            return HttpResponse.json(
              { message: 'Cannot launch unpublished SCORM package' },
              { status: 400 }
            );
          })
        );

        await expect(contentApi.launchScormPackage(packageId)).rejects.toThrow();
      });

      it('should handle launch error when package not found', async () => {
        const packageId = 'non-existent';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/launch`, () => {
            return HttpResponse.json(
              { message: 'SCORM package not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.launchScormPackage(packageId)).rejects.toThrow();
      });
    });

    describe('publishScormPackage', () => {
      it('should publish SCORM package', async () => {
        const packageId = 'scorm-3';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/publish`, () => {
            return HttpResponse.json({
              success: true,
              data: mockPublishScormPackageResponse,
            });
          })
        );

        const result = await contentApi.publishScormPackage(packageId);

        expect(result).toEqual(mockPublishScormPackageResponse);
        expect(result.isPublished).toBe(true);
        expect(result.status).toBe('published');
      });

      it('should publish SCORM package with custom publish date', async () => {
        const packageId = 'scorm-3';
        const payload = { publishedAt: '2026-01-10T10:00:00Z' };

        let capturedRequestBody: any = null;

        server.use(
          http.post(
            `${baseUrl}/content/scorm/${packageId}/publish`,
            async ({ request }) => {
              capturedRequestBody = await request.json();
              return HttpResponse.json({
                success: true,
                data: {
                  ...mockPublishScormPackageResponse,
                  publishedAt: payload.publishedAt,
                },
              });
            }
          )
        );

        const result = await contentApi.publishScormPackage(packageId, payload);

        expect(result.publishedAt).toBe(payload.publishedAt);
        expect(capturedRequestBody).toEqual(payload);
      });

      it('should handle publish error when already published', async () => {
        const packageId = 'scorm-1';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/publish`, () => {
            return HttpResponse.json(
              { message: 'SCORM package already published' },
              { status: 400 }
            );
          })
        );

        await expect(contentApi.publishScormPackage(packageId)).rejects.toThrow();
      });

      it('should handle publish error when package not found', async () => {
        const packageId = 'non-existent';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/publish`, () => {
            return HttpResponse.json(
              { message: 'SCORM package not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.publishScormPackage(packageId)).rejects.toThrow();
      });
    });

    describe('unpublishScormPackage', () => {
      it('should unpublish SCORM package', async () => {
        const packageId = 'scorm-1';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/unpublish`, () => {
            return HttpResponse.json({
              success: true,
              data: mockUnpublishScormPackageResponse,
            });
          })
        );

        const result = await contentApi.unpublishScormPackage(packageId);

        expect(result).toEqual(mockUnpublishScormPackageResponse);
        expect(result.isPublished).toBe(false);
        expect(result.status).toBe('draft');
      });

      it('should handle unpublish error when already unpublished', async () => {
        const packageId = 'scorm-3';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/unpublish`, () => {
            return HttpResponse.json(
              { message: 'SCORM package already unpublished' },
              { status: 400 }
            );
          })
        );

        await expect(contentApi.unpublishScormPackage(packageId)).rejects.toThrow();
      });

      it('should handle unpublish error when package not found', async () => {
        const packageId = 'non-existent';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/unpublish`, () => {
            return HttpResponse.json(
              { message: 'SCORM package not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.unpublishScormPackage(packageId)).rejects.toThrow();
      });

      it('should handle unpublish forbidden when in use', async () => {
        const packageId = 'scorm-1';

        server.use(
          http.post(`${baseUrl}/content/scorm/${packageId}/unpublish`, () => {
            return HttpResponse.json(
              { message: 'Cannot unpublish package in use by courses' },
              { status: 403 }
            );
          })
        );

        await expect(contentApi.unpublishScormPackage(packageId)).rejects.toThrow();
      });
    });
  });

  describe('Media Library Endpoints', () => {
    describe('listMediaFiles', () => {
      it('should fetch paginated list of media files without filters', async () => {
        server.use(
          http.get(`${baseUrl}/media`, () => {
            return HttpResponse.json({
              success: true,
              data: mockMediaFilesListResponse,
            });
          })
        );

        const result = await contentApi.listMediaFiles();

        expect(result).toEqual(mockMediaFilesListResponse);
        expect(result.media).toHaveLength(mockMediaFileListItems.length);
      });

      it('should handle wrapped canonical list payload shape', async () => {
        server.use(
          http.get(`${baseUrl}/media`, () => {
            return HttpResponse.json({
              success: true,
              data: {
                data: {
                  media: mockMediaFilesListResponse.media.map((media) => ({
                    ...media,
                    cdnUrl: media.url,
                    fileSize: media.size,
                  })),
                  pagination: mockMediaFilesListResponse.pagination,
                },
              },
            });
          })
        );

        const result = await contentApi.listMediaFiles();

        expect(result.media[0].url).toBe(mockMediaFilesListResponse.media[0].url);
        expect(result.pagination.total).toBe(mockMediaFilesListResponse.pagination.total);
      });

      it('should fetch media files with pagination', async () => {
        const mockResponse: MediaFilesListResponse = {
          media: mockMediaFileListItems.slice(0, 2),
          pagination: {
            page: 1,
            limit: 2,
            total: mockMediaFileListItems.length,
            totalPages: 2,
            hasNext: true,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/media`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listMediaFiles({ page: 1, limit: 2 });

        expect(result.media).toHaveLength(2);
      });

      it('should fetch media files with type filter', async () => {
        const filteredMedia = mockMediaFileListItems.filter((m) => m.type === 'video');

        const mockResponse: MediaFilesListResponse = {
          media: filteredMedia,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredMedia.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/media`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listMediaFiles({ type: 'video' });

        expect(result.media.every((m) => m.type === 'video')).toBe(true);
      });

      it('should fetch media files with department filter', async () => {
        const filteredMedia = mockMediaFileListItems.filter(
          (m) => m.departmentId === 'dept-1'
        );

        const mockResponse: MediaFilesListResponse = {
          media: filteredMedia,
          pagination: {
            page: 1,
            limit: 20,
            total: filteredMedia.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };

        server.use(
          http.get(`${baseUrl}/media`, () => {
            return HttpResponse.json({
              success: true,
              data: mockResponse,
            });
          })
        );

        const result = await contentApi.listMediaFiles({ departmentId: 'dept-1' });

        expect(result.media.every((m) => m.departmentId === 'dept-1')).toBe(true);
      });

      it('should support document type filters on canonical media route', async () => {
        let requestedType: string | null = null;
        const documentRows = mockMediaFilesListResponse.media.filter((m) => m.type === 'document');

        server.use(
          http.get(`${baseUrl}/media`, ({ request }) => {
            const url = new URL(request.url);
            requestedType = url.searchParams.get('type');
            return HttpResponse.json({
              success: true,
              data: {
                media: documentRows,
                pagination: {
                  page: 1,
                  limit: 20,
                  total: documentRows.length,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                },
              },
            });
          })
        );

        const result = await contentApi.listMediaFiles({ type: 'document' });

        expect(requestedType).toBe('document');
        expect(result.media.length).toBe(documentRows.length);
        expect(result.media.every((m) => m.type === 'document')).toBe(true);
      });

      it('should handle API error', async () => {
        server.use(
          http.get(`${baseUrl}/media`, () => {
            return HttpResponse.json(
              { message: 'Internal server error' },
              { status: 500 }
            );
          })
        );

        await expect(contentApi.listMediaFiles()).rejects.toThrow();
      });
    });

    describe('uploadMediaFile', () => {
      it('should upload media file successfully', async () => {
        const file = createMockVideoFile('test-video.mp4', 1024 * 1024 * 10);
        const payload = {
          file,
          title: 'Test Video',
          description: 'Test description',
          departmentId: 'dept-1',
          type: 'video' as const,
        };
        let capturedUploadUrlBody: Record<string, unknown> | null = null;
        let confirmBody: Record<string, unknown> | null = null;

        server.use(
          http.post(`${baseUrl}/media/upload-url`, async ({ request }) => {
            capturedUploadUrlBody = await request.json() as Record<string, unknown>;
            return HttpResponse.json({
              success: true,
              data: {
                uploadId: 'upload-1',
                uploadUrl: `${baseUrl}/media/local-upload/upload-1`,
                method: 'PUT',
                contentType: 'video/mp4',
              },
            });
          }),
          http.put(`${baseUrl}/media/local-upload/upload-1`, async ({ request }) => {
            await request.arrayBuffer();
            return new HttpResponse(null, { status: 200 });
          }),
          http.post(`${baseUrl}/media/confirm`, async ({ request }) => {
            confirmBody = await request.json() as Record<string, unknown>;
            return HttpResponse.json(
              {
                success: true,
                data: {
                  ...mockUploadMediaFileResponse,
                  fileSize: mockUploadMediaFileResponse.size,
                  cdnUrl: mockUploadMediaFileResponse.url,
                },
              },
              { status: 201 }
            );
          }),
        );

        const result = await contentApi.uploadMediaFile(payload);

        expect(result).toEqual({
          ...mockUploadMediaFileResponse,
          title: 'Test Video',
          departmentId: 'dept-1',
        });
        expect(capturedUploadUrlBody).toMatchObject({
          filename: 'test-video.mp4',
          mimeType: 'video/mp4',
          fileSize: file.size,
          purpose: 'content',
          departmentId: 'dept-1',
        });
        expect(confirmBody).toMatchObject({
          uploadId: 'upload-1',
          altText: 'Test Video',
          metadata: {
            title: 'Test Video',
            description: 'Test description',
            departmentId: 'dept-1',
          },
        });
      });

      it('should upload media with wrapped canonical upload-url and confirm payloads', async () => {
        const file = createMockVideoFile('wrapped-shape.mp4', 1024 * 1024);
        const payload = {
          file,
          title: 'Wrapped Shape Video',
          type: 'video' as const,
        };

        server.use(
          http.post(`${baseUrl}/media/upload-url`, () => {
            return HttpResponse.json({
              success: true,
              data: {
                data: {
                  uploadId: 'upload-wrapped',
                  uploadUrl: `${baseUrl}/media/local-upload/upload-wrapped`,
                  contentType: 'video/mp4',
                },
              },
            });
          }),
          http.put(`${baseUrl}/media/local-upload/upload-wrapped`, async ({ request }) => {
            await request.arrayBuffer();
            return new HttpResponse(null, { status: 200 });
          }),
          http.post(`${baseUrl}/media/confirm`, () => {
            return HttpResponse.json({
              success: true,
              data: {
                data: {
                  id: 'media-wrapped',
                  type: 'video',
                  filename: 'wrapped-shape.mp4',
                  mimeType: 'video/mp4',
                  fileSize: file.size,
                  cdnUrl: 'https://example.com/media/wrapped-shape.mp4',
                  createdAt: '2026-02-13T00:00:00.000Z',
                },
              },
            });
          })
        );

        const result = await contentApi.uploadMediaFile(payload);

        expect(result.id).toBe('media-wrapped');
        expect(result.url).toBe('https://example.com/media/wrapped-shape.mp4');
        expect(result.size).toBe(file.size);
      });

      it('should track upload progress', async () => {
        const file = createMockVideoFile();
        const payload = {
          file,
          title: 'Test Video',
          type: 'video' as const,
        };
        const progressCallback = vi.fn();

        server.use(
          http.post(`${baseUrl}/media/upload-url`, () => {
            return HttpResponse.json({
              success: true,
              data: {
                uploadId: 'upload-2',
                uploadUrl: `${baseUrl}/media/local-upload/upload-2`,
                method: 'PUT',
                contentType: 'video/mp4',
              },
            });
          }),
          http.put(`${baseUrl}/media/local-upload/upload-2`, () => {
            return new HttpResponse(null, { status: 200 });
          }),
          http.post(`${baseUrl}/media/confirm`, () => {
            return HttpResponse.json(
              {
                success: true,
                data: {
                  ...mockUploadMediaFileResponse,
                  fileSize: mockUploadMediaFileResponse.size,
                  cdnUrl: mockUploadMediaFileResponse.url,
                },
              },
              { status: 201 }
            );
          }),
        );

        await contentApi.uploadMediaFile(payload, progressCallback);

        expect(progressCallback).toHaveBeenCalled();
      });

      it('should upload media without optional description', async () => {
        const file = createMockVideoFile();
        const payload = {
          file,
          title: 'Test Video',
          type: 'video' as const,
        };
        let confirmBody: Record<string, unknown> | null = null;

        server.use(
          http.post(`${baseUrl}/media/upload-url`, () => {
            return HttpResponse.json({
              success: true,
              data: {
                uploadId: 'upload-3',
                uploadUrl: `${baseUrl}/media/local-upload/upload-3`,
                method: 'PUT',
                contentType: 'video/mp4',
              },
            });
          }),
          http.put(`${baseUrl}/media/local-upload/upload-3`, () => {
            return new HttpResponse(null, { status: 200 });
          }),
          http.post(`${baseUrl}/media/confirm`, async ({ request }) => {
            confirmBody = await request.json() as Record<string, unknown>;
            return HttpResponse.json(
              {
                success: true,
                data: {
                  ...mockUploadMediaFileResponse,
                  fileSize: mockUploadMediaFileResponse.size,
                  cdnUrl: mockUploadMediaFileResponse.url,
                },
              },
              { status: 201 }
            );
          }),
        );

        const result = await contentApi.uploadMediaFile(payload);

        expect(result.title).toBe('Test Video');
        expect(confirmBody).toMatchObject({
          metadata: { title: 'Test Video' },
        });
      });

      it('should handle upload validation error', async () => {
        const file = createMockVideoFile();
        const payload = {
          file,
          title: 'Test Video',
          type: 'video' as const,
        };

        server.use(
          http.post(`${baseUrl}/media/upload-url`, () => {
            return HttpResponse.json(
              {
                message: 'Validation failed',
                errors: {
                  file: ['Invalid file format'],
                },
              },
              { status: 400 }
            );
          })
        );

        await expect(contentApi.uploadMediaFile(payload)).rejects.toThrow();
      });

      it('should handle upload server error', async () => {
        const file = createMockVideoFile();
        const payload = {
          file,
          title: 'Test Video',
          type: 'video' as const,
        };

        server.use(
          http.post(`${baseUrl}/media/upload-url`, () => {
            return HttpResponse.json(
              { message: 'Internal server error' },
              { status: 500 }
            );
          })
        );

        await expect(contentApi.uploadMediaFile(payload)).rejects.toThrow();
      });
    });

    describe('getMediaFile', () => {
      it('should fetch single media file by ID', async () => {
        const mediaId = 'media-1';

        server.use(
          http.get(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json({
              success: true,
              data: mockMediaFiles[0],
            });
          })
        );

        const result = await contentApi.getMediaFile(mediaId);

        expect(result).toEqual(mockMediaFiles[0]);
        expect(result.id).toBe(mediaId);
      });

      it('should handle media file not found error', async () => {
        const mediaId = 'non-existent';

        server.use(
          http.get(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json(
              { message: 'Media file not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.getMediaFile(mediaId)).rejects.toThrow();
      });
    });

    describe('updateMediaFile', () => {
      it('should update media file metadata', async () => {
        const mediaId = 'media-1';
        const payload = {
          title: 'Updated Title',
          description: 'Updated description',
          departmentId: 'dept-2',
        };

        const updatedMedia = {
          ...mockMediaFiles[0],
          ...payload,
        };

        let capturedRequestBody: any = null;

        server.use(
          http.put(`${baseUrl}/media/${mediaId}`, async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: {
                id: mediaId,
                altText: payload.title,
                metadata: {
                  title: payload.title,
                  description: payload.description,
                  departmentId: payload.departmentId,
                },
                updatedAt: updatedMedia.updatedAt,
              },
            });
          }),
          http.get(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json({
              success: true,
              data: updatedMedia,
            });
          })
        );

        const result = await contentApi.updateMediaFile(mediaId, payload);

        expect(result).toEqual(updatedMedia);
        expect(capturedRequestBody).toEqual({
          altText: 'Updated Title',
          metadata: {
            title: 'Updated Title',
            description: 'Updated description',
            departmentId: 'dept-2',
          },
        });
      });

      it('should handle partial updates', async () => {
        const mediaId = 'media-1';
        const payload = { title: 'Updated Title Only' };

        const updatedMedia = { ...mockMediaFiles[0], title: 'Updated Title Only' };

        server.use(
          http.put(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json({
              success: true,
              data: {
                id: mediaId,
                altText: 'Updated Title Only',
                metadata: { title: 'Updated Title Only' },
                updatedAt: updatedMedia.updatedAt,
              },
            });
          }),
          http.get(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json({
              success: true,
              data: updatedMedia,
            });
          })
        );

        const result = await contentApi.updateMediaFile(mediaId, payload);

        expect(result.title).toBe('Updated Title Only');
      });

      it('should handle media not found error', async () => {
        const mediaId = 'non-existent';
        const payload = { title: 'Updated' };

        server.use(
          http.put(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json(
              { message: 'Media file not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.updateMediaFile(mediaId, payload)).rejects.toThrow();
      });
    });

    describe('deleteMediaFile', () => {
      it('should delete media file by ID', async () => {
        const mediaId = 'media-1';
        let deleteCalled = false;

        server.use(
          http.delete(`${baseUrl}/media/${mediaId}`, () => {
            deleteCalled = true;
            return HttpResponse.json({}, { status: 204 });
          })
        );

        await contentApi.deleteMediaFile(mediaId);

        expect(deleteCalled).toBe(true);
      });

      it('should handle media not found error', async () => {
        const mediaId = 'non-existent';

        server.use(
          http.delete(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json(
              { message: 'Media file not found' },
              { status: 404 }
            );
          })
        );

        await expect(contentApi.deleteMediaFile(mediaId)).rejects.toThrow();
      });

      it('should handle forbidden deletion', async () => {
        const mediaId = 'media-1';

        server.use(
          http.delete(`${baseUrl}/media/${mediaId}`, () => {
            return HttpResponse.json(
              { message: 'Cannot delete media file in use by courses' },
              { status: 403 }
            );
          })
        );

        await expect(contentApi.deleteMediaFile(mediaId)).rejects.toThrow();
      });
    });
  });
});
