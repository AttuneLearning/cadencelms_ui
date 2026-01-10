/**
 * React Query hooks for Course Segments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listCourseSegments,
  getCourseSegment,
  createCourseSegment,
  updateCourseSegment,
  deleteCourseSegment,
  reorderCourseSegments,
} from '../api/courseSegmentApi';
import { courseSegmentKeys } from '../model/courseSegmentKeys';
import type {
  CourseSegmentFilters,
  CreateCourseSegmentPayload,
  UpdateCourseSegmentPayload,
  ReorderCourseSegmentsPayload,
} from '../model/types';

/**
 * Hook to fetch all course segments for a course
 */
export function useCourseSegments(
  courseId: string,
  filters?: CourseSegmentFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: courseSegmentKeys.list(courseId, filters),
    queryFn: () => listCourseSegments(courseId, filters),
    enabled: options?.enabled !== undefined ? options.enabled : !!courseId,
  });
}

/**
 * Hook to fetch a single course segment
 */
export function useCourseSegment(courseId: string, moduleId: string) {
  return useQuery({
    queryKey: courseSegmentKeys.detail(courseId, moduleId),
    queryFn: () => getCourseSegment(courseId, moduleId),
    enabled: !!courseId && !!moduleId,
  });
}

/**
 * Hook to create a new course segment
 */
export function useCreateCourseSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: CreateCourseSegmentPayload;
    }) => createCourseSegment(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.list(variables.courseId),
      });
    },
  });
}

/**
 * Hook to update a course segment
 */
export function useUpdateCourseSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: string;
      moduleId: string;
      payload: UpdateCourseSegmentPayload;
    }) => updateCourseSegment(courseId, moduleId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.detail(variables.courseId, variables.moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.list(variables.courseId),
      });
    },
  });
}

/**
 * Hook to delete a course segment
 */
export function useDeleteCourseSegment() {
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
    }) => deleteCourseSegment(courseId, moduleId, force),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.list(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.lists(),
      });
    },
  });
}

/**
 * Hook to reorder course segments
 */
export function useReorderCourseSegments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: ReorderCourseSegmentsPayload;
    }) => reorderCourseSegments(courseId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.list(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: courseSegmentKeys.lists(),
      });
    },
  });
}
