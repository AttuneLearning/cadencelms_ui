/**
 * React Query hooks for Grade Override
 * Hooks for dept-admin grade override functionality
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { overrideGrade, getGradeHistory } from '../api/gradeOverrideApi';
import { gradeOverrideKeys } from '../model/gradeOverrideKeys';
import { enrollmentKeys } from '../model/enrollmentKeys';
import type {
  GradeOverridePayload,
  GradeOverrideResponse,
  GradeHistoryEntry,
  GradeHistoryParams,
} from '../model/gradeOverrideTypes';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch grade history for an enrollment
 * Returns immutable audit log of all grade overrides
 *
 * @param enrollmentId - The enrollment ID to get history for
 * @param params - Optional date range filters
 * @param options - React Query options
 *
 * @example
 * const { data: history, isLoading } = useGradeHistory('enroll-123', {
 *   startDate: '2026-01-01'
 * });
 */
export function useGradeHistory(
  enrollmentId: string,
  params?: GradeHistoryParams,
  options?: Omit<
    UseQueryOptions<
      GradeHistoryEntry[],
      Error,
      GradeHistoryEntry[],
      ReturnType<typeof gradeOverrideKeys.history>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: gradeOverrideKeys.history(enrollmentId, params),
    queryFn: () => getGradeHistory(enrollmentId, params),
    enabled: !!enrollmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes - history doesn't change often
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to override a student's grade
 * Creates immutable audit log entry
 * Invalidates enrollment and grade history queries on success
 *
 * @returns Mutation hook with override function
 *
 * @example
 * const overrideMutation = useOverrideGrade();
 *
 * await overrideMutation.mutateAsync({
 *   enrollmentId: 'enroll-123',
 *   payload: {
 *     gradePercentage: 85,
 *     reason: 'Grade appeal approved'
 *   }
 * });
 */
export function useOverrideGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      payload,
    }: {
      enrollmentId: string;
      payload: GradeOverridePayload;
    }) => overrideGrade(enrollmentId, payload),
    onSuccess: (data, variables) => {
      // Invalidate the specific enrollment detail
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.detail(variables.enrollmentId),
      });

      // Invalidate all enrollment lists (roster, class lists, etc.)
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.lists(),
      });

      // Invalidate grade history for this enrollment
      queryClient.invalidateQueries({
        queryKey: gradeOverrideKeys.history(variables.enrollmentId),
      });

      // Invalidate all grade history queries (in case there are aggregated views)
      queryClient.invalidateQueries({
        queryKey: gradeOverrideKeys.histories(),
      });
    },
  });
}
