/**
 * React Query hooks for Exceptions
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listExceptions,
  getException,
  grantException,
  updateException,
  revokeException,
} from '../api/exceptionApi';
import { exceptionKeys } from '../model/exceptionKeys';
import type {
  LearnerException,
  ExceptionsListResponse,
  GrantExceptionPayload,
  UpdateExceptionPayload,
  ExceptionFilters,
} from '../model/types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of exceptions
 */
export function useExceptions(
  filters?: ExceptionFilters,
  options?: Omit<
    UseQueryOptions<
      ExceptionsListResponse,
      Error,
      ExceptionsListResponse,
      ReturnType<typeof exceptionKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exceptionKeys.list(filters),
    queryFn: () => listExceptions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single exception
 */
export function useException(
  id: string,
  options?: Omit<
    UseQueryOptions<
      LearnerException,
      Error,
      LearnerException,
      ReturnType<typeof exceptionKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exceptionKeys.detail(id),
    queryFn: () => getException(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch exceptions for a learner
 */
export function useLearnerExceptions(
  learnerId: string,
  filters?: ExceptionFilters,
  options?: Omit<
    UseQueryOptions<
      ExceptionsListResponse,
      Error,
      ExceptionsListResponse,
      ReturnType<typeof exceptionKeys.learnerExceptions>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exceptionKeys.learnerExceptions(learnerId, filters),
    queryFn: () => listExceptions({ ...filters, learnerId }),
    enabled: !!learnerId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch exceptions for a course
 */
export function useCourseExceptions(
  courseId: string,
  filters?: ExceptionFilters,
  options?: Omit<
    UseQueryOptions<
      ExceptionsListResponse,
      Error,
      ExceptionsListResponse,
      ReturnType<typeof exceptionKeys.courseExceptions>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exceptionKeys.courseExceptions(courseId, filters),
    queryFn: () => listExceptions({ ...filters, courseId }),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to grant a new exception
 */
export function useGrantException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GrantExceptionPayload) => grantException(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exceptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.learnerExceptions(data.learnerId) });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.courseExceptions(data.courseId) });
    },
  });
}

/**
 * Hook to update an exception
 */
export function useUpdateException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExceptionPayload }) =>
      updateException(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exceptionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.learnerExceptions(data.learnerId) });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.courseExceptions(data.courseId) });
    },
  });
}

/**
 * Hook to revoke an exception
 */
export function useRevokeException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeException(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exceptionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.all });
    },
  });
}
