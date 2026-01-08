/**
 * React Query hook for fetching courses
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseApi } from '../api/courseApi';
import type { CourseFormData } from '../model/types';

export const COURSE_KEYS = {
  all: ['courses'] as const,
  lists: () => [...COURSE_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...COURSE_KEYS.lists(), params] as const,
  details: () => [...COURSE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...COURSE_KEYS.details(), id] as const,
  myCourses: (params?: Record<string, unknown>) => [...COURSE_KEYS.all, 'my-courses', params] as const,
  stats: (id: string) => [...COURSE_KEYS.detail(id), 'stats'] as const,
};

/**
 * Hook to fetch all courses with pagination and filters
 */
export function useCourses(params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  level?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: COURSE_KEYS.list(params),
    queryFn: () => courseApi.getAll(params),
  });
}

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(id: string) {
  return useQuery({
    queryKey: COURSE_KEYS.detail(id),
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch user's enrolled courses
 */
export function useMyCourses(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: COURSE_KEYS.myCourses(params),
    queryFn: () => courseApi.getMyCourses(params),
  });
}

/**
 * Hook to fetch course statistics
 */
export function useCourseStats(id: string) {
  return useQuery({
    queryKey: COURSE_KEYS.stats(id),
    queryFn: () => courseApi.getStats(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CourseFormData) => courseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
    },
  });
}

/**
 * Hook to update a course
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseFormData> }) =>
      courseApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
    },
  });
}

/**
 * Hook to publish a course
 */
export function usePublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
    },
  });
}

/**
 * Hook to unpublish a course
 */
export function useUnpublishCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: COURSE_KEYS.lists() });
    },
  });
}
