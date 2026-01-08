/**
 * React Query hooks for fetching enrollments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../api/enrollmentApi';
import type { EnrollmentFormData } from '../model/types';

export const ENROLLMENT_KEYS = {
  all: ['enrollments'] as const,
  lists: () => [...ENROLLMENT_KEYS.all, 'list'] as const,
  list: (params?: Record<string, unknown>) => [...ENROLLMENT_KEYS.lists(), params] as const,
  details: () => [...ENROLLMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ENROLLMENT_KEYS.details(), id] as const,
  byCourse: (courseId: string) => [...ENROLLMENT_KEYS.all, 'course', courseId] as const,
  stats: () => [...ENROLLMENT_KEYS.all, 'stats'] as const,
  check: (courseId: string) => [...ENROLLMENT_KEYS.all, 'check', courseId] as const,
};

/**
 * Hook to fetch user's enrollments
 */
export function useEnrollments(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.list(params),
    queryFn: () => enrollmentApi.getMyEnrollments(params),
  });
}

/**
 * Hook to fetch a single enrollment by ID
 */
export function useEnrollment(id: string) {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.detail(id),
    queryFn: () => enrollmentApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch enrollment for a specific course
 */
export function useEnrollmentByCourse(courseId: string) {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.byCourse(courseId),
    queryFn: () => enrollmentApi.getByCourseId(courseId),
    enabled: !!courseId,
  });
}

/**
 * Hook to check if user is enrolled in a course
 */
export function useCheckEnrollment(courseId: string) {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.check(courseId),
    queryFn: () => enrollmentApi.checkEnrollment(courseId),
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch enrollment statistics
 */
export function useEnrollmentStats() {
  return useQuery({
    queryKey: ENROLLMENT_KEYS.stats(),
    queryFn: () => enrollmentApi.getStats(),
  });
}

/**
 * Hook to enroll in a course
 */
export function useEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnrollmentFormData) => enrollmentApi.enroll(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.byCourse(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.check(variables.courseId) });
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.stats() });
    },
  });
}

/**
 * Hook to unenroll from a course
 */
export function useUnenroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => enrollmentApi.unenroll(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.stats() });
    },
  });
}

/**
 * Hook to update enrollment status
 */
export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      status,
    }: {
      enrollmentId: string;
      status: 'active' | 'completed' | 'dropped';
    }) => enrollmentApi.updateStatus(enrollmentId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.detail(data._id) });
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: ENROLLMENT_KEYS.stats() });
    },
  });
}
