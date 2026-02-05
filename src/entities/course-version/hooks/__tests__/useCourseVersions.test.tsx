/**
 * Tests for Course Version React Query Hooks
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  useCourseVersions,
  useCourseVersion,
  useCourseVersionModules,
  useCreateCourseVersion,
  useUpdateCourseVersion,
  usePublishCourseVersion,
  useLockCourseVersion,
  useAddModuleToVersion,
  useReorderVersionModules,
  useUpdateVersionModule,
  useRemoveModuleFromVersion,
  useModuleEditLockStatus,
  useAcquireModuleEditLock,
  useRefreshModuleEditLock,
  useReleaseModuleEditLock,
  useForceReleaseModuleEditLock,
} from '../useCourseVersions';
import {
  mockCourseVersionsListResponse,
  mockCourseVersionDetail,
  mockModuleEditLockResponse,
  mockModuleEditLockResponseLocked,
} from '@/test/mocks/data/courseVersions';

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

describe('Course Version Hooks', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // QUERY HOOKS
  // =====================

  describe('useCourseVersions', () => {
    it('should fetch list of versions for a canonical course', async () => {
      const canonicalCourseId = 'canonical-web101';

      server.use(
        http.get(`${baseUrl}/api/v2/courses/${canonicalCourseId}/versions`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockCourseVersionsListResponse,
          });
        })
      );

      const { result } = renderHook(() => useCourseVersions(canonicalCourseId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCourseVersionsListResponse);
      expect(result.current.data?.versions).toHaveLength(2);
      expect(result.current.data?.totalVersions).toBe(2);
    });

    it('should not fetch when canonicalCourseId is empty', async () => {
      const { result } = renderHook(() => useCourseVersions(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCourseVersion', () => {
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

      const { result } = renderHook(() => useCourseVersion(versionId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe('course-1');
      expect(result.current.data?.title).toBe('Introduction to Web Development');
      expect(result.current.data?.modules).toHaveLength(2);
    });

    it('should not fetch when versionId is empty', async () => {
      const { result } = renderHook(() => useCourseVersion(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
    });
  });

  describe('useCourseVersionModules', () => {
    it('should fetch modules for a version', async () => {
      const versionId = 'course-1';

      server.use(
        http.get(`${baseUrl}/api/v2/course-versions/${versionId}/modules`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockCourseVersionDetail.modules,
          });
        })
      );

      const { result } = renderHook(() => useCourseVersionModules(versionId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].module.title).toBe('Introduction to Web Development');
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useCreateCourseVersion', () => {
    it('should create a new version', async () => {
      const canonicalCourseId = 'canonical-web101';
      const mockResponse = {
        courseVersion: {
          id: 'new-version',
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

      const { result } = renderHook(() => useCreateCourseVersion(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          canonicalCourseId,
          payload: { changeNotes: 'Test' },
        });
      });

      expect(mutationResult?.courseVersion.version).toBe(3);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useUpdateCourseVersion', () => {
    it('should update a draft version', async () => {
      const versionId = 'course-3';
      const mockResponse = {
        id: versionId,
        canonicalCourseId: 'canonical-bus201',
        title: 'Updated Title',
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

      const { result } = renderHook(() => useUpdateCourseVersion(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          versionId,
          payload: { title: 'Updated Title' },
        });
      });

      expect(mutationResult?.title).toBe('Updated Title');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('usePublishCourseVersion', () => {
    it('should publish a version', async () => {
      const versionId = 'course-3';
      const mockResponse = {
        courseVersion: {
          id: versionId,
          canonicalCourseId: 'canonical-bus201',
          status: 'published',
        },
        previousVersion: null,
        affectedCertificates: [],
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

      const { result } = renderHook(() => usePublishCourseVersion(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({ versionId });
      });

      expect(mutationResult?.courseVersion.status).toBe('published');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useLockCourseVersion', () => {
    it('should lock a version', async () => {
      const versionId = 'course-1';
      const mockResponse = {
        id: versionId,
        canonicalCourseId: 'canonical-web101',
        isLocked: true,
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

      const { result } = renderHook(() => useLockCourseVersion(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          versionId,
          payload: { reason: 'Manual lock' },
        });
      });

      expect(mutationResult?.isLocked).toBe(true);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =====================
  // MODULE MUTATION HOOKS
  // =====================

  describe('useAddModuleToVersion', () => {
    it('should add a module to a version', async () => {
      const versionId = 'course-3';
      const mockResponse = {
        id: 'cvm-new',
        courseVersionId: versionId,
        moduleId: 'module-5',
        order: 1,
        isRequired: true,
      };

      server.use(
        http.post(`${baseUrl}/api/v2/course-versions/${versionId}/modules`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useAddModuleToVersion(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          versionId,
          payload: { moduleId: 'module-5', order: 1, isRequired: true },
        });
      });

      expect(mutationResult?.moduleId).toBe('module-5');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useReorderVersionModules', () => {
    it('should reorder modules', async () => {
      const versionId = 'course-1';

      server.use(
        http.patch(`${baseUrl}/api/v2/course-versions/${versionId}/modules/reorder`, () => {
          return HttpResponse.json({
            status: 'success',
            data: null,
          });
        })
      );

      const { result } = renderHook(() => useReorderVersionModules(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          versionId,
          moduleOrder: ['module-2', 'module-1'],
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useUpdateVersionModule', () => {
    it('should update module settings', async () => {
      const versionId = 'course-1';
      const moduleId = 'module-1';
      const mockResponse = {
        id: 'cvm-1',
        courseVersionId: versionId,
        moduleId,
        isRequired: false,
      };

      server.use(
        http.patch(`${baseUrl}/api/v2/course-versions/${versionId}/modules/${moduleId}`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useUpdateVersionModule(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync({
          versionId,
          moduleId,
          payload: { isRequired: false },
        });
      });

      expect(mutationResult?.isRequired).toBe(false);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useRemoveModuleFromVersion', () => {
    it('should remove a module', async () => {
      const versionId = 'course-3';
      const moduleId = 'module-5';

      server.use(
        http.delete(`${baseUrl}/api/v2/course-versions/${versionId}/modules/${moduleId}`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useRemoveModuleFromVersion(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ versionId, moduleId });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =====================
  // EDIT LOCK HOOKS
  // =====================

  describe('useModuleEditLockStatus', () => {
    it('should fetch unlocked status', async () => {
      const moduleId = 'module-1';

      server.use(
        http.get(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockModuleEditLockResponse,
          });
        })
      );

      const { result } = renderHook(() => useModuleEditLockStatus(moduleId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isLocked).toBe(false);
      expect(result.current.data?.lock).toBeNull();
    });

    it('should fetch locked status', async () => {
      const moduleId = 'module-1';

      server.use(
        http.get(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json({
            status: 'success',
            data: mockModuleEditLockResponseLocked,
          });
        })
      );

      const { result } = renderHook(() => useModuleEditLockStatus(moduleId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.isLocked).toBe(true);
      expect(result.current.data?.lock?.userName).toBe('Jane Instructor');
    });
  });

  describe('useAcquireModuleEditLock', () => {
    it('should acquire a lock', async () => {
      const moduleId = 'module-1';
      const mockResponse = {
        moduleId,
        isLocked: true,
        lock: {
          userId: 'user-1',
          userName: 'Test User',
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

      const { result } = renderHook(() => useAcquireModuleEditLock(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync(moduleId);
      });

      expect(mutationResult?.isLocked).toBe(true);
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useRefreshModuleEditLock', () => {
    it('should refresh a lock', async () => {
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

      const { result } = renderHook(() => useRefreshModuleEditLock(), {
        wrapper: createWrapper(),
      });

      let mutationResult: any;
      await act(async () => {
        mutationResult = await result.current.mutateAsync(moduleId);
      });

      expect(mutationResult?.expiresAt).toBe('2026-02-05T11:00:00Z');
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useReleaseModuleEditLock', () => {
    it('should release a lock', async () => {
      const moduleId = 'module-1';

      server.use(
        http.delete(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useReleaseModuleEditLock(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(moduleId);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe('useForceReleaseModuleEditLock', () => {
    it('should force release a lock', async () => {
      const moduleId = 'module-1';

      server.use(
        http.delete(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock/force`, () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      const { result } = renderHook(() => useForceReleaseModuleEditLock(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync(moduleId);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =====================
  // ERROR HANDLING
  // =====================

  describe('error handling', () => {
    it('should handle query errors', async () => {
      const versionId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/api/v2/course-versions/${versionId}`, () => {
          return HttpResponse.json(
            { status: 'error', message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useCourseVersion(versionId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle mutation errors', async () => {
      const moduleId = 'module-1';

      server.use(
        http.post(`${baseUrl}/api/v2/modules/${moduleId}/edit-lock`, () => {
          return HttpResponse.json(
            { status: 'error', message: 'Already locked' },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useAcquireModuleEditLock(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync(moduleId);
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
