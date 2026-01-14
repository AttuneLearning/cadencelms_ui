/**
 * React Query hooks for Course Modules
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCourseModules,
  getCourseModule,
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
  reorderCourseModules,
  linkContentToModule,
  type LinkContentToModulePayload,
} from '../api/courseModuleApi';
import { courseModuleKeys } from '../model/courseModuleKeys';
import type {
  CourseModuleFilters,
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
  ReorderCourseModulesPayload,
} from '../model/types';

/**
 * Hook to fetch all course modules for a course
 */
export function useCourseModules(
  courseId: string,
  filters?: CourseModuleFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: courseModuleKeys.list(courseId, filters),
    queryFn: () => listCourseModules(courseId, filters),
    enabled: options?.enabled !== undefined ? options.enabled : !!courseId,
  });
}

/**
 * Hook to fetch a single course module
 */
export function useCourseModule(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: courseModuleKeys.detail(courseId, moduleId),
    queryFn: () => getCourseModule(courseId, moduleId),
    enabled: !!courseId && !!moduleId,
  });
}

/**
 * Hook to create a new course module
 */
export function useCreateCourseModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: CreateCourseModulePayload;
    }) => createCourseModule(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.list(variables.courseId),
      });
    },
  });
}

/**
 * Hook to update a course module
 */
export function useUpdateCourseModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      payload: UpdateCourseModulePayload;
    }) => updateCourseModule(courseId, moduleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.detail(variables.courseId, variables.moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.list(variables.courseId),
      });
    },
  });
}

/**
 * Hook to delete a course module
 */
export function useDeleteCourseModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      force,
    }: {
      courseId: string;
      moduleId: string;
      force?: boolean;
    }) => deleteCourseModule(courseId, moduleId, force),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.list(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.lists(),
      });
    },
  });
}

/**
 * Hook to reorder course modules
 */
export function useReorderCourseModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: ReorderCourseModulesPayload;
    }) => reorderCourseModules(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.list(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.lists(),
      });
    },
  });
}

/**
 * Hook to link content to a course module
 */
export function useLinkContentToModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      payload: LinkContentToModulePayload;
    }) => linkContentToModule(courseId, moduleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.detail(variables.courseId, variables.moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: courseModuleKeys.list(variables.courseId),
      });
    },
  });
}
