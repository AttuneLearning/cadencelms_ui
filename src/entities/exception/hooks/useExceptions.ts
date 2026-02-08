/**
 * React Query hooks for Exceptions
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  getEnrollmentExceptions,
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
 * Hook to fetch exceptions for an enrollment
 */
export function useEnrollmentExceptions(
  enrollmentId: string,
  filters?: ExceptionFilters,
  options?: Omit<
    UseQueryOptions<
      ExceptionsListResponse,
      Error,
      ExceptionsListResponse,
      ReturnType<typeof exceptionKeys.enrollmentExceptions>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exceptionKeys.enrollmentExceptions(enrollmentId, filters),
    queryFn: () => getEnrollmentExceptions(enrollmentId, filters),
    enabled: !!enrollmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single exception
 */
export function useException(
  enrollmentId: string,
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
    queryFn: () => getException(enrollmentId, id),
    enabled: !!enrollmentId && !!id,
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
      queryClient.invalidateQueries({
        queryKey: exceptionKeys.enrollmentExceptions(data.enrollmentId),
      });
    },
  });
}

/**
 * Hook to update an exception
 */
export function useUpdateException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      id,
      payload,
    }: {
      enrollmentId: string;
      id: string;
      payload: UpdateExceptionPayload;
    }) => updateException(enrollmentId, id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: exceptionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: exceptionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exceptionKeys.enrollmentExceptions(data.enrollmentId),
      });
    },
  });
}

/**
 * Hook to revoke an exception
 */
export function useRevokeException() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, id }: { enrollmentId: string; id: string }) =>
      revokeException(enrollmentId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exceptionKeys.all });
    },
  });
}
