/**
 * Tests for Course Version API Client
 * Tests versioning endpoints from API-ISS-014, API-ISS-015
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  createVersion,
  listVersions,
  getVersion,
  updateVersion,
  publishVersion,
  lockVersion,
  listVersionModules,
  addModuleToVersion,
  reorderVersionModules,
  updateVersionModule,
  removeModuleFromVersion,
  acquireModuleEditLock,
  refreshModuleEditLock,
  releaseModuleEditLock,
  getModuleEditLockStatus,
  forceReleaseModuleEditLock,
} from '../courseVersionApi';
import {
  mockCourseVersionsListResponse,
  mockCourseVersionDetail,
  mockModuleEditLockResponse,
  mockModuleEditLockResponseLocked,
} from '@/test/mocks/data/courseVersions';

describe('courseVersionApi', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // COURSE VERSIONS
  // =====================

  describe('createVersion', () => {
    it('should create a new draft version from a published course', async () => {
      const canonicalCourseId = 'canonical-web101';
      const mockResponse = {
        courseVersion: {
          id: 'new-version-id',
          canonicalCourseId,
          version: 3,
          title: 'Introduction to Web Development',
          status: 'draft',
          isLocked: false,
          isLatest: true,
        },
        previousVersion: {
          id: 'course-1',
          version: 2,
          isLocked: true,
        },
        message: 'New draft version created successfully',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${canonicalCourseId}/versions`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await createVersion(canonicalCourseId, { changeNotes: 'Test changes' });

      expect(result.courseVersion.id).toBe('new-version-id');
      expect(result.courseVersion.version).toBe(3);
      expect(result.courseVersion.status).toBe('draft');
      expect(result.previousVersion?.isLocked).toBe(true);
    });

    it('should create version without payload', async () => {
      const canonicalCourseId = 'canonical-web101';
      const mockResponse = {
        courseVersion: {
          id: 'new-version-id',
          canonicalCourseId,
          version: 3,
          status: 'draft',
        },
        previousVersion: null,
        message: 'Created',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/courses/${canonicalCourseId}/versions`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await createVersion(canonicalCourseId);

      expect(result.courseVersion.id).toBe('new-version-id');
    });
  });

  describe('listVersions', () => {
    it('should fetch all versions of a canonical course', async () => {
      const canonicalCourseId = 'canonical-web101';

      server.use(
        http.get(`${baseUrl}/api/v2/courses/${canonicalCourseId}/versions`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockCourseVersionsListResponse,
          });
        })
      );

      const result = await listVersions(canonicalCourseId);

      expect(result.canonicalCourseId).toBe('canonical-web101');
      expect(result.canonicalCourseCode).toBe('WEB101');
      expect(result.versions).toHaveLength(2);
      expect(result.totalVersions).toBe(2);
    });
  });

  describe('getVersion', () => {
    it('should fetch version details', async () => {
      const versionId = 'course-1';

      server.use(
        http.get(`${baseUrl}/api/v2/course-versions/${versionId}`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockCourseVersionDetail,
          });
        })
      );

      const result = await getVersion(versionId);

      expect(result.id).toBe('course-1');
      expect(result.title).toBe('Introduction to Web Development');
      expect(result.version).toBe(2);
      expect(result.canonicalCourse).toBeDefined();
      expect(result.instructors).toHaveLength(1);
      expect(result.modules).toHaveLength(2);
    });
  });

  describe('updateVersion', () => {
    it('should update a draft version', async () => {
      const versionId = 'course-3';
      const payload = {
        title: 'Updated Course Title',
        description: 'Updated description',
        credits: 4,
      };

      const mockResponse = {
        id: versionId,
        canonicalCourseId: 'canonical-bus201',
        title: payload.title,
        description: payload.description,
        credits: payload.credits,
        status: 'draft',
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/course-versions/${versionId}`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await updateVersion(versionId, payload);

      expect(result.title).toBe('Updated Course Title');
      expect(result.credits).toBe(4);
    });
  });

  describe('publishVersion', () => {
    it('should publish a draft version', async () => {
      const versionId = 'course-3';
      const mockResponse = {
        courseVersion: {
          id: versionId,
          canonicalCourseId: 'canonical-bus201',
          status: 'published',
          publishedAt: '2026-02-05T10:00:00Z',
        },
        previousVersion: null,
        affectedCertificates: [],
        message: 'Version published successfully',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/course-versions/${versionId}/publish`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await publishVersion(versionId, { publishNotes: 'Initial publish' });

      expect(result.courseVersion.status).toBe('published');
      expect(result.courseVersion.publishedAt).toBeDefined();
    });

    it('should return affected certificates when publishing', async () => {
      const versionId = 'course-1';
      const mockResponse = {
        courseVersion: {
          id: versionId,
          canonicalCourseId: 'canonical-web101',
          status: 'published',
        },
        previousVersion: {
          id: 'course-1-v1',
          version: 1,
          isLocked: true,
        },
        affectedCertificates: [
          { id: 'cert-1', title: 'Web Dev Certificate', newVersionCreated: true },
        ],
        message: 'Published',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/course-versions/${versionId}/publish`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await publishVersion(versionId);

      expect(result.affectedCertificates).toHaveLength(1);
      expect(result.affectedCertificates[0].newVersionCreated).toBe(true);
    });
  });

  describe('lockVersion', () => {
    it('should lock a version manually', async () => {
      const versionId = 'course-1';
      const mockResponse = {
        id: versionId,
        canonicalCourseId: 'canonical-web101',
        isLocked: true,
        lockedAt: '2026-02-05T10:00:00Z',
        lockedReason: 'manual',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/course-versions/${versionId}/lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await lockVersion(versionId, { reason: 'Archiving for compliance' });

      expect(result.isLocked).toBe(true);
      expect(result.lockedReason).toBe('manual');
    });
  });

  // =====================
  // VERSION MODULES
  // =====================

  describe('listVersionModules', () => {
    it('should list modules in a version', async () => {
      const versionId = 'course-1';

      server.use(
        http.get(`${baseUrl}/api/v2/course-versions/${versionId}/modules`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockCourseVersionDetail.modules,
          });
        })
      );

      const result = await listVersionModules(versionId);

      expect(result).toHaveLength(2);
      expect(result[0].module.title).toBe('Introduction to Web Development');
    });
  });

  describe('addModuleToVersion', () => {
    it('should add a module to a version', async () => {
      const versionId = 'course-3';
      const payload = {
        moduleId: 'module-5',
        order: 1,
        isRequired: true,
      };

      const mockResponse = {
        id: 'cvm-new',
        courseVersionId: versionId,
        moduleId: payload.moduleId,
        order: payload.order,
        isRequired: payload.isRequired,
        availableFrom: null,
        availableUntil: null,
        createdAt: '2026-02-05T10:00:00Z',
      };

      server.use(
        http.post(`${baseUrl}/api/v2/course-versions/${versionId}/modules`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await addModuleToVersion(versionId, payload);

      expect(result.moduleId).toBe('module-5');
      expect(result.isRequired).toBe(true);
    });
  });

  describe('reorderVersionModules', () => {
    it('should reorder modules in a version', async () => {
      const versionId = 'course-1';
      const moduleOrder = ['module-2', 'module-1'];

      server.use(
        http.patch(`${baseUrl}/api/v2/course-versions/${versionId}/modules/reorder`, () => {
          return HttpResponse.json({
            status: 'success',
            data: null,
          });
        })
      );

      await expect(reorderVersionModules(versionId, moduleOrder)).resolves.not.toThrow();
    });
  });

  describe('updateVersionModule', () => {
    it('should update module settings in a version', async () => {
      const versionId = 'course-1';
      const moduleId = 'module-1';
      const payload = {
        isRequired: false,
        availableFrom: '2026-03-01T00:00:00Z',
      };

      const mockResponse = {
        id: 'cvm-1',
        courseVersionId: versionId,
        moduleId,
        order: 1,
        isRequired: false,
        availableFrom: '2026-03-01T00:00:00Z',
        availableUntil: null,
        createdAt: '2025-08-15T10:00:00Z',
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/course-versions/${versionId}/modules/${moduleId}`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await updateVersionModule(versionId, moduleId, payload);

      expect(result.isRequired).toBe(false);
      expect(result.availableFrom).toBe('2026-03-01T00:00:00Z');
    });
  });

  describe('removeModuleFromVersion', () => {
    it('should remove a module from a version', async () => {
      const versionId = 'course-3';
      const moduleId = 'module-5';

      server.use(
        http.delete(`${baseUrl}/api/v2/course-versions/${versionId}/modules/${moduleId}`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(removeModuleFromVersion(versionId, moduleId)).resolves.not.toThrow();
    });
  });

  // =====================
  // MODULE EDIT LOCKS
  // =====================

  describe('acquireModuleEditLock', () => {
    it('should acquire an edit lock on a module', async () => {
      const moduleId = 'module-1';
      const mockResponse = {
        moduleId,
        isLocked: true,
        lock: {
          userId: 'user-1',
          userName: 'John Smith',
          acquiredAt: '2026-02-05T10:00:00Z',
          expiresAt: '2026-02-05T10:30:00Z',
        },
        accessRequest: null,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await acquireModuleEditLock(moduleId);

      expect(result.isLocked).toBe(true);
      expect(result.lock?.userId).toBe('user-1');
    });
  });

  describe('refreshModuleEditLock', () => {
    it('should refresh an existing lock', async () => {
      const moduleId = 'module-1';
      const mockResponse = {
        moduleId,
        expiresAt: '2026-02-05T11:00:00Z',
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const result = await refreshModuleEditLock(moduleId);

      expect(result.moduleId).toBe(moduleId);
      expect(result.expiresAt).toBe('2026-02-05T11:00:00Z');
    });
  });

  describe('releaseModuleEditLock', () => {
    it('should release an edit lock', async () => {
      const moduleId = 'module-1';

      server.use(
        http.delete(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(releaseModuleEditLock(moduleId)).resolves.not.toThrow();
    });
  });

  describe('getModuleEditLockStatus', () => {
    it('should return unlocked status', async () => {
      const moduleId = 'module-1';

      server.use(
        http.get(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockModuleEditLockResponse,
          });
        })
      );

      const result = await getModuleEditLockStatus(moduleId);

      expect(result.isLocked).toBe(false);
      expect(result.lock).toBeNull();
    });

    it('should return locked status with lock details', async () => {
      const moduleId = 'module-1';

      server.use(
        http.get(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockModuleEditLockResponseLocked,
          });
        })
      );

      const result = await getModuleEditLockStatus(moduleId);

      expect(result.isLocked).toBe(true);
      expect(result.lock?.userName).toBe('Jane Instructor');
    });
  });

  describe('forceReleaseModuleEditLock', () => {
    it('should force release a lock (admin)', async () => {
      const moduleId = 'module-1';

      server.use(
        http.delete(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock/force`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(forceReleaseModuleEditLock(moduleId)).resolves.not.toThrow();
    });
  });

  // =====================
  // ERROR HANDLING
  // =====================

  describe('error handling', () => {
    it('should handle 404 for non-existent version', async () => {
      const versionId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/api/v2/course-versions/${versionId}`, () => {
          return HttpResponse.json(
            {
              status: 'error',
              message: 'Version not found',
            },
            { status: 404 }
          );
        })
      );

      await expect(getVersion(versionId)).rejects.toThrow();
    });

    it('should handle 409 conflict when lock already exists', async () => {
      const moduleId = 'module-1';

      server.use(
        http.post(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json(
            {
              status: 'error',
              message: 'Module is already locked by another user',
            },
            { status: 409 }
          );
        })
      );

      await expect(acquireModuleEditLock(moduleId)).rejects.toThrow();
    });

    it('should handle 400 for invalid publish (no modules)', async () => {
      const versionId = 'course-3';

      server.use(
        http.post(`${baseUrl}/api/v2/course-versions/${versionId}/publish`, () => {
          return HttpResponse.json(
            {
              status: 'error',
              message: 'Cannot publish version with no modules',
            },
            { status: 400 }
          );
        })
      );

      await expect(publishVersion(versionId)).rejects.toThrow();
    });
  });
});
