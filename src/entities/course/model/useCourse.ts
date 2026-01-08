/**
 * useCourse hook
 * TanStack Query hook for fetching a single course
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getCourse } from '../api/courseApi';
import type { Course } from './types';

/**
 * Query key factory for course queries
 */
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (params?: Record<string, unknown>) =>
    [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  progress: (id: string) => [...courseKeys.detail(id), 'progress'] as const,
};

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(
  courseId: string,
  options?: Omit<
    UseQueryOptions<Course, Error, Course, ReturnType<typeof courseKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => getCourse(courseId),
    ...options,
  });
}
