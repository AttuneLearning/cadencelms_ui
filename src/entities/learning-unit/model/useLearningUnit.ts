/**
 * React Query hooks for Learning Units
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listLearningUnits,
  getLearningUnit,
  createLearningUnit,
  updateLearningUnit,
  deleteLearningUnit,
  reorderLearningUnits,
  moveLearningUnit,
} from '../api/learningUnitApi';
import { learningUnitKeys } from './learningUnitKeys';
import type {
  LearningUnit,
  LearningUnitsListResponse,
  LearningUnitFilters,
  CreateLearningUnitPayload,
  UpdateLearningUnitPayload,
  ReorderLearningUnitsPayload,
  ReorderLearningUnitsResponse,
  MoveLearningUnitPayload,
  MoveLearningUnitResponse,
  DeleteLearningUnitResponse,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of learning units for a module
 */
export function useLearningUnits(
  moduleId: string,
  filters?: LearningUnitFilters,
  options?: Omit<
    UseQueryOptions<LearningUnitsListResponse, Error, LearningUnitsListResponse, ReturnType<typeof learningUnitKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learningUnitKeys.list(moduleId, filters),
    queryFn: () => listLearningUnits(moduleId, filters),
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single learning unit
 */
export function useLearningUnit(
  learningUnitId: string,
  options?: Omit<
    UseQueryOptions<LearningUnit, Error, LearningUnit, ReturnType<typeof learningUnitKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learningUnitKeys.detail(learningUnitId),
    queryFn: () => getLearningUnit(learningUnitId),
    enabled: !!learningUnitId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a learning unit
 */
export function useCreateLearningUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, payload }: { moduleId: string; payload: CreateLearningUnitPayload }) =>
      createLearningUnit(moduleId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate learning unit lists for this module
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.list(variables.moduleId) });
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.byModule(variables.moduleId) });
    },
  });
}

/**
 * Hook to update a learning unit
 */
export function useUpdateLearningUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningUnitId,
      payload,
      moduleId: _moduleId,
    }: {
      learningUnitId: string;
      payload: UpdateLearningUnitPayload;
      moduleId: string;
    }) => updateLearningUnit(learningUnitId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.detail(variables.learningUnitId) });
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.list(variables.moduleId) });
    },
  });
}

/**
 * Hook to delete a learning unit
 */
export function useDeleteLearningUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningUnitId,
      force,
    }: {
      learningUnitId: string;
      moduleId: string;
      force?: boolean;
    }): Promise<DeleteLearningUnitResponse> => deleteLearningUnit(learningUnitId, force),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.list(variables.moduleId) });
      queryClient.removeQueries({ queryKey: learningUnitKeys.detail(variables.learningUnitId) });
    },
  });
}

/**
 * Hook to reorder learning units
 */
export function useReorderLearningUnits() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      moduleId,
      payload,
    }: {
      moduleId: string;
      payload: ReorderLearningUnitsPayload;
    }): Promise<ReorderLearningUnitsResponse> => reorderLearningUnits(moduleId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.list(variables.moduleId) });
    },
  });
}

/**
 * Hook to move a learning unit to another module
 */
export function useMoveLearningUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      learningUnitId,
      payload,
    }: {
      learningUnitId: string;
      payload: MoveLearningUnitPayload;
      sourceModuleId: string;
    }): Promise<MoveLearningUnitResponse> => moveLearningUnit(learningUnitId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate both source and target module lists
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.list(variables.sourceModuleId) });
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.list(variables.payload.targetModuleId) });
      queryClient.invalidateQueries({ queryKey: learningUnitKeys.detail(variables.learningUnitId) });
    },
  });
}
