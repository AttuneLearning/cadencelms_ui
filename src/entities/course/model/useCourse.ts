/**
 * React Query hooks for Courses
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
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
} from '../api/courseApi';
import { courseKeys } from './courseKeys';
import type {
  Course,
  CoursesListResponse,
  CourseFilters,
  CreateCoursePayload,
  UpdateCoursePayload,
  PatchCoursePayload,
  PublishCoursePayload,
  UnpublishCoursePayload,
  ArchiveCoursePayload,
  DuplicateCoursePayload,
  ExportFormat,
  MoveDepartmentPayload,
  AssignProgramPayload,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of courses
 */
export function useCourses(
  filters?: CourseFilters,
  options?: Omit<
    UseQueryOptions<CoursesListResponse, Error, CoursesListResponse, ReturnType<typeof courseKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseKeys.list(filters),
    queryFn: () => listCourses(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single course
 */
export function useCourse(
  id: string,
  options?: Omit<
    UseQueryOptions<Course, Error, Course, ReturnType<typeof courseKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => getCourse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to export course
 */
export function useExportCourse(
  id: string,
  format?: ExportFormat,
  options?: Omit<
    UseQueryOptions<any, Error, any, ReturnType<typeof courseKeys.export>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseKeys.export(id, format),
    queryFn: () => exportCourse(id, format),
    enabled: false, // Manual trigger only
    staleTime: 0, // Don't cache exports
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCoursePayload) => createCourse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to update a course (full)
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCoursePayload }) =>
      updateCourse(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to patch a course (partial)
 */
export function usePatchCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatchCoursePayload }) =>
      patchCourse(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to publish a course
 */
export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: PublishCoursePayload }) =>
      publishCourse(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to unpublish a course
 */
export function useUnpublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: UnpublishCoursePayload }) =>
      unpublishCourse(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to archive a course
 */
export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ArchiveCoursePayload }) =>
      archiveCourse(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to unarchive a course
 */
export function useUnarchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveCourse(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to duplicate a course
 */
export function useDuplicateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DuplicateCoursePayload }) =>
      duplicateCourse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to move course to different department
 */
export function useMoveDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MoveDepartmentPayload }) =>
      moveDepartment(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

/**
 * Hook to assign course to program
 */
export function useAssignProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AssignProgramPayload }) =>
      assignProgram(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}
