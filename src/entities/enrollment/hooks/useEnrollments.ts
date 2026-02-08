/**
 * React Query hooks for Enrollments
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listEnrollments,
  getEnrollment,
  enrollInProgram,
  enrollInCourse,
  enrollInClass,
  bulkEnrollInCourse,
  updateEnrollmentStatus,
  withdrawFromEnrollment,
  listProgramEnrollments,
  listCourseEnrollments,
  listClassEnrollments,
} from '../api/enrollmentApi';
import { enrollmentKeys } from '../model/enrollmentKeys';
import type {
  Enrollment,
  EnrollmentsListResponse,
  EnrollmentFilters,
  EnrollProgramPayload,
  EnrollCoursePayload,
  EnrollClassPayload,
  BulkCourseEnrollmentPayload,
  BulkCourseEnrollmentResponse,
  UpdateEnrollmentStatusPayload,
  ProgramEnrollmentsResponse,
  CourseEnrollmentsResponse,
  ClassEnrollmentsResponse,
} from '../model/types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of enrollments
 */
export function useEnrollments(
  filters?: EnrollmentFilters,
  options?: Omit<
    UseQueryOptions<
      EnrollmentsListResponse,
      Error,
      EnrollmentsListResponse,
      ReturnType<typeof enrollmentKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: enrollmentKeys.list(filters),
    queryFn: () => listEnrollments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single enrollment
 */
export function useEnrollment(
  id: string,
  options?: Omit<
    UseQueryOptions<Enrollment, Error, Enrollment, ReturnType<typeof enrollmentKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => getEnrollment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch current user's enrollments
 * Convenience wrapper around useEnrollments
 */
export function useMyEnrollments(
  filters?: EnrollmentFilters,
  options?: Omit<
    UseQueryOptions<
      EnrollmentsListResponse,
      Error,
      EnrollmentsListResponse,
      ReturnType<typeof enrollmentKeys.myEnrollments>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: enrollmentKeys.myEnrollments(filters),
    queryFn: () => listEnrollments(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - fresher for user's own data
    ...options,
  });
}

/**
 * Hook to fetch program enrollments
 */
export function useProgramEnrollments(
  programId: string,
  filters?: { page?: number; limit?: number; status?: string; sort?: string },
  options?: Omit<
    UseQueryOptions<
      ProgramEnrollmentsResponse,
      Error,
      ProgramEnrollmentsResponse,
      ReturnType<typeof enrollmentKeys.programEnrollments>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: enrollmentKeys.programEnrollments(programId, filters),
    queryFn: () => listProgramEnrollments(programId, filters),
    enabled: !!programId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch course enrollments
 */
export function useCourseEnrollments(
  courseId: string,
  filters?: { page?: number; limit?: number; status?: string; sort?: string },
  options?: Omit<
    UseQueryOptions<
      CourseEnrollmentsResponse,
      Error,
      CourseEnrollmentsResponse,
      ReturnType<typeof enrollmentKeys.courseEnrollments>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: enrollmentKeys.courseEnrollments(courseId, filters),
    queryFn: () => listCourseEnrollments(courseId, filters),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch class enrollments
 */
export function useClassEnrollments(
  classId: string,
  filters?: { page?: number; limit?: number; status?: string; sort?: string },
  options?: Omit<
    UseQueryOptions<
      ClassEnrollmentsResponse,
      Error,
      ClassEnrollmentsResponse,
      ReturnType<typeof enrollmentKeys.classEnrollments>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: enrollmentKeys.classEnrollments(classId, filters),
    queryFn: () => listClassEnrollments(classId, filters),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to check enrollment status for a specific course
 * Returns the enrollment if enrolled, null otherwise
 */
export function useEnrollmentStatus(courseId: string) {
  return useQuery({
    queryKey: enrollmentKeys.enrollmentStatus(courseId),
    queryFn: async () => {
      const result = await listEnrollments({ course: courseId, limit: 1 });
      return result.enrollments[0] || null;
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to enroll in a program
 */
export function useEnrollInProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrollProgramPayload) => enrollInProgram(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
    },
  });
}

/**
 * Hook to enroll in a course
 */
export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrollCoursePayload) => enrollInCourse(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollmentStatus(variables.courseId) });
    },
  });
}

/**
 * Hook to enroll in a class
 */
export function useEnrollInClass() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrollClassPayload) => enrollInClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
}

/**
 * Hook to bulk enroll multiple learners in a course
 * Max 500 learners per request
 */
export function useBulkEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation<BulkCourseEnrollmentResponse, Error, BulkCourseEnrollmentPayload>({
    mutationFn: (payload) => bulkEnrollInCourse(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.courseEnrollments(variables.courseId) });
    },
  });
}

/**
 * Hook to update enrollment status
 */
export function useUpdateEnrollmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEnrollmentStatusPayload }) =>
      updateEnrollmentStatus(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
}

/**
 * Hook to withdraw from an enrollment
 */
export function useWithdraw() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      withdrawFromEnrollment(id, reason ? { reason } : undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.lists() });
    },
  });
}
