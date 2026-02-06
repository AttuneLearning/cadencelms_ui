/**
 * Matching Builder React Query Hooks
 * Provides data fetching and mutations for matching exercise authoring
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMatchingExercises,
  getMatchingExercise,
  createMatchingExercise,
  updateMatchingExercise,
  deleteMatchingExercise,
  updateMatchingPairs,
  bulkImportPairs,
  reorderMatchingPairs,
  type MatchingExerciseResponse,
  type CreateMatchingExerciseRequest,
  type UpdateMatchingExerciseRequest,
  type UpdatePairsRequest,
  type BulkImportRequest,
  type ReorderRequest,
  type MatchingPairItem,
} from '../api/matchingBuilderApi';

// ============================================================================
// Query Keys
// ============================================================================

export const matchingBuilderKeys = {
  all: ['matching-builder'] as const,
  lists: () => [...matchingBuilderKeys.all, 'list'] as const,
  list: (moduleId: string) => [...matchingBuilderKeys.lists(), moduleId] as const,
  details: () => [...matchingBuilderKeys.all, 'detail'] as const,
  detail: (moduleId: string, exerciseId: string) =>
    [...matchingBuilderKeys.details(), moduleId, exerciseId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all matching exercises for a module
 */
export function useMatchingExercises(moduleId: string) {
  return useQuery({
    queryKey: matchingBuilderKeys.list(moduleId),
    queryFn: () => getMatchingExercises(moduleId),
    enabled: !!moduleId,
  });
}

/**
 * Fetch a single matching exercise
 */
export function useMatchingExercise(moduleId: string, exerciseId: string) {
  return useQuery({
    queryKey: matchingBuilderKeys.detail(moduleId, exerciseId),
    queryFn: () => getMatchingExercise(moduleId, exerciseId),
    enabled: !!moduleId && !!exerciseId,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new matching exercise
 */
export function useCreateMatchingExercise(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMatchingExerciseRequest) =>
      createMatchingExercise(moduleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.list(moduleId),
      });
    },
  });
}

/**
 * Update a matching exercise
 */
export function useUpdateMatchingExercise(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      data,
    }: {
      exerciseId: string;
      data: UpdateMatchingExerciseRequest;
    }) => updateMatchingExercise(moduleId, exerciseId, data),
    onSuccess: (_, { exerciseId }) => {
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.list(moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.detail(moduleId, exerciseId),
      });
    },
  });
}

/**
 * Delete a matching exercise
 */
export function useDeleteMatchingExercise(moduleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) => deleteMatchingExercise(moduleId, exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.list(moduleId),
      });
    },
  });
}

/**
 * Update pairs for a matching exercise
 */
export function useUpdateMatchingPairs(moduleId: string, exerciseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePairsRequest) =>
      updateMatchingPairs(moduleId, exerciseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.list(moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.detail(moduleId, exerciseId),
      });
    },
  });
}

/**
 * Bulk import pairs to a matching exercise
 */
export function useBulkImportMatchingPairs(moduleId: string, exerciseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkImportRequest) =>
      bulkImportPairs(moduleId, exerciseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.list(moduleId),
      });
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.detail(moduleId, exerciseId),
      });
    },
  });
}

/**
 * Reorder pairs with optimistic update
 */
export function useReorderMatchingPairs(moduleId: string, exerciseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderRequest) =>
      reorderMatchingPairs(moduleId, exerciseId, data),
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: matchingBuilderKeys.detail(moduleId, exerciseId),
      });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<MatchingExerciseResponse>(
        matchingBuilderKeys.detail(moduleId, exerciseId)
      );

      // Optimistically update the pairs order
      if (previousData?.exercise?.pairs) {
        const pairMap = new Map(
          previousData.exercise.pairs.map((p) => [p.id, p])
        );
        const reorderedPairs: MatchingPairItem[] = newOrder.pairIds
          .map((id, index) => {
            const pair = pairMap.get(id);
            if (pair) {
              return { ...pair, sequence: index };
            }
            return null;
          })
          .filter((p): p is MatchingPairItem => p !== null);

        queryClient.setQueryData(
          matchingBuilderKeys.detail(moduleId, exerciseId),
          {
            ...previousData,
            exercise: {
              ...previousData.exercise,
              pairs: reorderedPairs,
            },
          }
        );
      }

      return { previousData };
    },
    onError: (_err, _newOrder, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(
          matchingBuilderKeys.detail(moduleId, exerciseId),
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({
        queryKey: matchingBuilderKeys.detail(moduleId, exerciseId),
      });
    },
  });
}
