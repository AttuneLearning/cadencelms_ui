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
} from '../api/moduleApi';
import { moduleKeys } from './moduleKeys';
import type {
  Module,
  ModulesListResponse,
  ModuleFilters,
  CreateModulePayload,
  UpdateModulePayload,
  ReorderModulesPayload,
  ReorderModulesResponse,
  DeleteModuleResponse,
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
