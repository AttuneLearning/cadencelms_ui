/**
 * React Query hooks for Course Versions
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
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
} from '../api/courseVersionApi';
import { courseVersionKeys, moduleEditLockKeys } from '../model/courseVersionKeys';
import type {
  CourseVersionDetail,
  CourseVersionsListResponse,
  CourseVersionModuleItem,
  CreateCourseVersionPayload,
  UpdateCourseVersionPayload,
  PublishCourseVersionPayload,
  LockCourseVersionPayload,
  ModuleEditLockResponse,
} from '../model/types';

// =====================
// VERSION QUERY HOOKS
// =====================

/**
 * Hook to fetch list of versions for a canonical course
 */
export function useCourseVersions(
  canonicalCourseId: string,
  options?: Omit<
    UseQueryOptions<
      CourseVersionsListResponse,
      Error,
      CourseVersionsListResponse,
      ReturnType<typeof courseVersionKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseVersionKeys.list(canonicalCourseId),
    queryFn: () => listVersions(canonicalCourseId),
    enabled: !!canonicalCourseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single course version detail
 */
export function useCourseVersion(
  versionId: string,
  options?: Omit<
    UseQueryOptions<
      CourseVersionDetail,
      Error,
      CourseVersionDetail,
      ReturnType<typeof courseVersionKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseVersionKeys.detail(versionId),
    queryFn: () => getVersion(versionId),
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch modules for a course version
 */
export function useCourseVersionModules(
  versionId: string,
  options?: Omit<
    UseQueryOptions<
      CourseVersionModuleItem[],
      Error,
      CourseVersionModuleItem[],
      ReturnType<typeof courseVersionKeys.modules>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseVersionKeys.modules(versionId),
    queryFn: () => listVersionModules(versionId),
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// VERSION MUTATION HOOKS
// =====================

/**
 * Hook to create a new draft version from a published course
 */
export function useCreateCourseVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      canonicalCourseId,
      payload,
    }: {
      canonicalCourseId: string;
      payload?: CreateCourseVersionPayload;
    }) => createVersion(canonicalCourseId, payload),
    onSuccess: (data) => {
      // Invalidate version list for this canonical course
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.list(data.courseVersion.canonicalCourseId),
      });
      // Invalidate canonical course detail
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.canonicalDetail(data.courseVersion.canonicalCourseId),
      });
    },
  });
}

/**
 * Hook to update a draft course version
 */
export function useUpdateCourseVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      payload,
    }: {
      versionId: string;
      payload: UpdateCourseVersionPayload;
    }) => updateVersion(versionId, payload),
    onSuccess: (data) => {
      // Invalidate version detail
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.detail(data.id),
      });
      // Invalidate version list
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.list(data.canonicalCourseId),
      });
    },
  });
}

/**
 * Hook to publish a course version
 */
export function usePublishCourseVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      payload,
    }: {
      versionId: string;
      payload?: PublishCourseVersionPayload;
    }) => publishVersion(versionId, payload),
    onSuccess: (data) => {
      // Invalidate version detail
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.detail(data.courseVersion.id),
      });
      // Invalidate version list
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.list(data.courseVersion.canonicalCourseId),
      });
      // Invalidate previous version if it was locked
      if (data.previousVersion) {
        queryClient.invalidateQueries({
          queryKey: courseVersionKeys.detail(data.previousVersion.id),
        });
      }
      // Invalidate canonical course
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.canonicalDetail(data.courseVersion.canonicalCourseId),
      });
    },
  });
}

/**
 * Hook to manually lock a course version
 */
export function useLockCourseVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      payload,
    }: {
      versionId: string;
      payload?: LockCourseVersionPayload;
    }) => lockVersion(versionId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.list(data.canonicalCourseId),
      });
    },
  });
}

// =====================
// MODULE MUTATION HOOKS
// =====================

/**
 * Hook to add a module to a course version
 */
export function useAddModuleToVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      payload,
    }: {
      versionId: string;
      payload: {
        moduleId: string;
        order?: number;
        isRequired?: boolean;
        availableFrom?: string;
        availableUntil?: string;
      };
    }) => addModuleToVersion(versionId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.modules(variables.versionId),
      });
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.detail(variables.versionId),
      });
    },
  });
}

/**
 * Hook to reorder modules in a course version
 */
export function useReorderVersionModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      moduleOrder,
    }: {
      versionId: string;
      moduleOrder: string[];
    }) => reorderVersionModules(versionId, moduleOrder),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.modules(variables.versionId),
      });
    },
  });
}

/**
 * Hook to update module settings in a course version
 */
export function useUpdateVersionModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      moduleId,
      payload,
    }: {
      versionId: string;
      moduleId: string;
      payload: {
        isRequired?: boolean;
        availableFrom?: string | null;
        availableUntil?: string | null;
      };
    }) => updateVersionModule(versionId, moduleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.modules(variables.versionId),
      });
    },
  });
}

/**
 * Hook to remove a module from a course version
 */
export function useRemoveModuleFromVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      versionId,
      moduleId,
    }: {
      versionId: string;
      moduleId: string;
    }) => removeModuleFromVersion(versionId, moduleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.modules(variables.versionId),
      });
      queryClient.invalidateQueries({
        queryKey: courseVersionKeys.detail(variables.versionId),
      });
    },
  });
}

// =====================
// EDIT LOCK HOOKS
// =====================

/**
 * Hook to fetch module edit lock status
 */
export function useModuleEditLockStatus(
  moduleId: string,
  options?: Omit<
    UseQueryOptions<
      ModuleEditLockResponse,
      Error,
      ModuleEditLockResponse,
      ReturnType<typeof moduleEditLockKeys.status>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleEditLockKeys.status(moduleId),
    queryFn: () => getModuleEditLockStatus(moduleId),
    enabled: !!moduleId,
    staleTime: 30 * 1000, // 30 seconds - lock status needs to be fresh
    refetchInterval: 60 * 1000, // Refetch every minute
    ...options,
  });
}

/**
 * Hook to acquire module edit lock
 */
export function useAcquireModuleEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => acquireModuleEditLock(moduleId),
    onSuccess: (data) => {
      queryClient.setQueryData(moduleEditLockKeys.status(data.moduleId), data);
    },
  });
}

/**
 * Hook to refresh module edit lock (heartbeat)
 */
export function useRefreshModuleEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => refreshModuleEditLock(moduleId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: moduleEditLockKeys.status(data.moduleId),
      });
    },
  });
}

/**
 * Hook to release module edit lock
 */
export function useReleaseModuleEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => releaseModuleEditLock(moduleId),
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({
        queryKey: moduleEditLockKeys.status(moduleId),
      });
    },
  });
}

/**
 * Hook to force release module edit lock (admin only)
 */
export function useForceReleaseModuleEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => forceReleaseModuleEditLock(moduleId),
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({
        queryKey: moduleEditLockKeys.status(moduleId),
      });
    },
  });
}
