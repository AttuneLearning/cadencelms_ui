/**
 * Learner React Query Hooks
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  listLearners,
  registerLearner,
  getLearnerById,
  updateLearner,
  deleteLearner,
} from '../api/learnerApi';
import { learnerKeys } from './learnerKeys';
import type {
  ListLearnersParams,
  ListLearnersResponse,
  RegisterLearnerPayload,
  LearnerResponse,
  LearnerDetails,
  UpdateLearnerPayload,
  DeleteLearnerResponse,
} from './types';

/**
 * Hook to list learners with filtering and pagination
 * GET /api/v2/users/learners
 */
export function useListLearners(
  params?: ListLearnersParams,
  options?: Omit<
    UseQueryOptions<
      ListLearnersResponse,
      Error,
      ListLearnersResponse,
      ReturnType<typeof learnerKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learnerKeys.list(params),
    queryFn: () => listLearners(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Hook to register a new learner
 * POST /api/v2/users/learners
 */
export function useRegisterLearner(
  options?: UseMutationOptions<LearnerResponse, Error, RegisterLearnerPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerLearner,
    onSuccess: () => {
      // Invalidate learner lists to refetch with new learner
      queryClient.invalidateQueries({ queryKey: learnerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to get learner details by ID
 * GET /api/v2/users/learners/:id
 */
export function useLearnerDetails(
  id: string,
  options?: Omit<
    UseQueryOptions<
      LearnerDetails,
      Error,
      LearnerDetails,
      ReturnType<typeof learnerKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learnerKeys.detail(id),
    queryFn: () => getLearnerById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to update learner profile
 * PUT /api/v2/users/learners/:id
 */
export function useUpdateLearner(
  options?: UseMutationOptions<
    LearnerResponse,
    Error,
    { id: string; payload: UpdateLearnerPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateLearner(id, payload),
    onSuccess: (data, variables) => {
      // Update cached learner details
      queryClient.setQueryData(learnerKeys.detail(variables.id), (old: LearnerDetails | undefined) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
        };
      });
      // Invalidate lists to show updated data
      queryClient.invalidateQueries({ queryKey: learnerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete/withdraw learner
 * DELETE /api/v2/users/learners/:id
 */
export function useDeleteLearner(
  options?: UseMutationOptions<
    DeleteLearnerResponse,
    Error,
    { id: string; reason?: string }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => deleteLearner(id, reason),
    onSuccess: (data, variables) => {
      // Update cached learner to show withdrawn status
      queryClient.setQueryData(learnerKeys.detail(variables.id), (old: LearnerDetails | undefined) => {
        if (!old) return old;
        return {
          ...old,
          status: 'withdrawn',
          updatedAt: data.deletedAt,
        };
      });
      // Invalidate lists to remove/update learner
      queryClient.invalidateQueries({ queryKey: learnerKeys.lists() });
    },
    ...options,
  });
}
