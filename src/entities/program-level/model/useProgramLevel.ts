/**
 * Program Level React Query Hooks
 * Provides hooks for all program level-related API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getProgramLevel,
  updateProgramLevel,
  deleteProgramLevel,
  reorderProgramLevel,
} from '../api/programLevelApi';
import { programLevelKeys } from './programLevelKeys';
import { programKeys } from '@/entities/program/model/programKeys';
import type {
  ProgramLevel,
  UpdateProgramLevelPayload,
  ReorderProgramLevelPayload,
  ReorderProgramLevelResponse,
} from './types';

/**
 * Hook to fetch single program level details (GET /api/v2/program-levels/:id)
 */
export function useProgramLevel(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ProgramLevel,
      Error,
      ProgramLevel,
      ReturnType<typeof programLevelKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programLevelKeys.detail(id),
    queryFn: () => getProgramLevel(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to update an existing program level (PUT /api/v2/program-levels/:id)
 */
export function useUpdateProgramLevel(
  options?: UseMutationOptions<
    ProgramLevel,
    Error,
    { id: string; payload: UpdateProgramLevelPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateProgramLevel(id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(programLevelKeys.detail(variables.id), data);
      // Invalidate program levels list (from program entity)
      queryClient.invalidateQueries({
        queryKey: programKeys.levels(),
      });
    },
    ...options,
  });
}

/**
 * Hook to delete a program level (DELETE /api/v2/program-levels/:id)
 */
export function useDeleteProgramLevel(
  options?: UseMutationOptions<void, Error, { id: string; programId: string }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => deleteProgramLevel(id),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: programLevelKeys.detail(variables.id),
      });
      // Invalidate program levels list
      queryClient.invalidateQueries({
        queryKey: programKeys.levels(),
      });
      // Invalidate specific program levels
      if (variables.programId) {
        queryClient.invalidateQueries({
          queryKey: programKeys.programLevels(variables.programId),
        });
      }
    },
    ...options,
  });
}

/**
 * Hook to reorder a program level (PATCH /api/v2/program-levels/:id/reorder)
 */
export function useReorderProgramLevel(
  options?: UseMutationOptions<
    ReorderProgramLevelResponse,
    Error,
    { id: string; programId: string; payload: ReorderProgramLevelPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => reorderProgramLevel(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate program levels list to reflect new order
      queryClient.invalidateQueries({
        queryKey: programKeys.levels(),
      });
      // Invalidate specific program levels
      if (variables.programId) {
        queryClient.invalidateQueries({
          queryKey: programKeys.programLevels(variables.programId),
        });
      }
    },
    ...options,
  });
}
