/**
 * React Query hooks for Learner entity
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getLearners,
  getLearnerById,
  createLearner,
  updateLearner,
  deleteLearner,
  bulkDeleteLearners,
} from '../api/learnerApi';
import type { LearnerFormData, LearnerFilters } from '../model/types';

export const LEARNER_KEYS = {
  all: ['learners'] as const,
  lists: () => [...LEARNER_KEYS.all, 'list'] as const,
  list: (params?: { page?: number; pageSize?: number; filters?: LearnerFilters }) =>
    [...LEARNER_KEYS.lists(), params] as const,
  details: () => [...LEARNER_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LEARNER_KEYS.details(), id] as const,
};

/**
 * Hook to fetch all learners with pagination and filters
 */
export function useLearnerList(params?: {
  page?: number;
  pageSize?: number;
  filters?: LearnerFilters;
}) {
  return useQuery({
    queryKey: LEARNER_KEYS.list(params),
    queryFn: () => getLearners(params),
  });
}

/**
 * Hook to fetch a single learner by ID
 */
export function useLearnerDetail(id: string) {
  return useQuery({
    queryKey: LEARNER_KEYS.detail(id),
    queryFn: () => getLearnerById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new learner
 */
export function useCreateLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LearnerFormData) => createLearner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNER_KEYS.lists() });
    },
  });
}

/**
 * Hook to update a learner
 */
export function useUpdateLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LearnerFormData> }) =>
      updateLearner(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LEARNER_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: LEARNER_KEYS.lists() });
    },
  });
}

/**
 * Hook to delete a learner
 */
export function useDeleteLearner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLearner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNER_KEYS.lists() });
    },
  });
}

/**
 * Hook to bulk delete learners
 */
export function useBulkDeleteLearners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteLearners(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEARNER_KEYS.lists() });
    },
  });
}
