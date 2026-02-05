/**
 * React Query hooks for Modules
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  listModuleLibrary,
  getModuleFromLibrary,
  getModuleUsage,
  acquireEditLock,
  refreshEditLock,
  releaseEditLock,
  getEditLockStatus,
  forceReleaseEditLock,
} from '../api/moduleApi';
import { moduleKeys, moduleLibraryKeys, moduleEditLockKeys } from './moduleKeys';
import type {
  Module,
  ModulesListResponse,
  ModuleFilters,
  CreateModulePayload,
  UpdateModulePayload,
  ReorderModulesPayload,
  ReorderModulesResponse,
  DeleteModuleResponse,
  ModuleLibraryItem,
  ModuleLibraryResponse,
  ModuleLibraryFilters,
  ModuleUsage,
  ModuleEditLockStatus,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of modules for a course
 */
export function useModules(
  courseId: string,
  filters?: ModuleFilters,
  options?: Omit<
    UseQueryOptions<ModulesListResponse, Error, ModulesListResponse, ReturnType<typeof moduleKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleKeys.list(courseId, filters),
    queryFn: () => listModules(courseId, filters),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single module
 */
export function useModule(
  moduleId: string,
  includeLearningUnits?: boolean,
  options?: Omit<
    UseQueryOptions<Module, Error, Module, ReturnType<typeof moduleKeys.detail> | ReturnType<typeof moduleKeys.withLearningUnits>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: includeLearningUnits
      ? moduleKeys.withLearningUnits(moduleId)
      : moduleKeys.detail(moduleId),
    queryFn: () => getModule(moduleId, includeLearningUnits),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a module
 */
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CreateModulePayload }) =>
      createModule(courseId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate module lists for this course
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.byCourse(variables.courseId) });
    },
  });
}

/**
 * Hook to update a module
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
      courseId: _courseId,
    }: {
      moduleId: string;
      payload: UpdateModulePayload;
      courseId: string;
    }) => updateModule(moduleId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.detail(variables.moduleId) });
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.courseId) });
    },
  });
}

/**
 * Hook to delete a module
 */
export function useDeleteModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      force,
    }: {
      moduleId: string;
      courseId: string;
      force?: boolean;
    }): Promise<DeleteModuleResponse> => deleteModule(moduleId, force),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.courseId) });
      queryClient.removeQueries({ queryKey: moduleKeys.detail(variables.moduleId) });
    },
  });
}

/**
 * Hook to reorder modules
 */
export function useReorderModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: ReorderModulesPayload;
    }): Promise<ReorderModulesResponse> => reorderModules(courseId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: moduleKeys.list(variables.courseId) });
    },
  });
}

// =====================
// MODULE LIBRARY HOOKS (v2 API)
// =====================

/**
 * Hook to browse the module library
 */
export function useModuleLibrary(
  filters?: ModuleLibraryFilters,
  options?: Omit<
    UseQueryOptions<
      ModuleLibraryResponse,
      Error,
      ModuleLibraryResponse,
      ReturnType<typeof moduleLibraryKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleLibraryKeys.list(filters),
    queryFn: () => listModuleLibrary(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to get module detail from library
 */
export function useModuleLibraryItem(
  moduleId: string,
  options?: Omit<
    UseQueryOptions<
      ModuleLibraryItem,
      Error,
      ModuleLibraryItem,
      ReturnType<typeof moduleLibraryKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleLibraryKeys.detail(moduleId),
    queryFn: () => getModuleFromLibrary(moduleId),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to get module usage (where it's used)
 */
export function useModuleUsage(
  moduleId: string,
  options?: Omit<
    UseQueryOptions<
      ModuleUsage,
      Error,
      ModuleUsage,
      ReturnType<typeof moduleLibraryKeys.usage>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleLibraryKeys.usage(moduleId),
    queryFn: () => getModuleUsage(moduleId),
    enabled: !!moduleId,
    staleTime: 2 * 60 * 1000, // 2 minutes - usage can change
    ...options,
  });
}

// =====================
// MODULE EDIT LOCK HOOKS (v2 API)
// =====================

/**
 * Hook to check module edit lock status
 */
export function useModuleEditLockStatus(
  moduleId: string,
  options?: Omit<
    UseQueryOptions<
      ModuleEditLockStatus,
      Error,
      ModuleEditLockStatus,
      ReturnType<typeof moduleEditLockKeys.status>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: moduleEditLockKeys.status(moduleId),
    queryFn: () => getEditLockStatus(moduleId),
    enabled: !!moduleId,
    staleTime: 30 * 1000, // 30 seconds - lock status needs to be fresh
    refetchInterval: 60 * 1000, // Poll every minute
    ...options,
  });
}

/**
 * Hook to acquire module edit lock
 */
export function useAcquireEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => acquireEditLock(moduleId),
    onSuccess: (data) => {
      queryClient.setQueryData(moduleEditLockKeys.status(data.moduleId), data);
    },
  });
}

/**
 * Hook to refresh module edit lock (heartbeat)
 */
export function useRefreshEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => refreshEditLock(moduleId),
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
export function useReleaseEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => releaseEditLock(moduleId),
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
export function useForceReleaseEditLock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (moduleId: string) => forceReleaseEditLock(moduleId),
    onSuccess: (_, moduleId) => {
      queryClient.invalidateQueries({
        queryKey: moduleEditLockKeys.status(moduleId),
      });
    },
  });
}
