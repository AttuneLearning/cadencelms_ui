/**
 * useCourses hook
 * TanStack Query hook for fetching a list of courses
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type { PaginatedResponse } from '@/shared/api/types';
import { getCourses, getEnrolledCourses } from '../api/courseApi';
import type { CourseListItem, CourseQueryParams } from './types';
import { courseKeys } from './useCourse';

/**
 * Hook to fetch a paginated list of courses
 */
export function useCourses(
  params?: CourseQueryParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedResponse<CourseListItem>,
      Error,
      PaginatedResponse<CourseListItem>,
      ReturnType<typeof courseKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: courseKeys.list(params as Record<string, unknown>),
    queryFn: () => getCourses(params),
    ...options,
  });
}

/**
 * Hook to fetch courses the user is enrolled in
 */
export function useEnrolledCourses(
  params?: CourseQueryParams,
  options?: Omit<
    UseQueryOptions<
      PaginatedResponse<CourseListItem>,
      Error,
      PaginatedResponse<CourseListItem>,
      ReturnType<typeof courseKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  const enrolledParams = { ...params, enrolled: true };

  return useQuery({
    queryKey: courseKeys.list(enrolledParams as Record<string, unknown>),
    queryFn: () => getEnrolledCourses(params),
    ...options,
  });
}
