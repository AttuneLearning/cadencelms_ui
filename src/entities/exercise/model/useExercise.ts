/**
 * React Query hooks for Exercises
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  publishExercise,
  unpublishExercise,
  archiveExercise,
  getExerciseQuestions,
  addExerciseQuestion,
  bulkAddExerciseQuestions,
  removeExerciseQuestion,
  reorderExerciseQuestions,
} from '../api/exerciseApi';
import { exerciseKeys } from './exerciseKeys';
import type {
  Exercise,
  ExercisesListResponse,
  ExerciseFilters,
  CreateExercisePayload,
  UpdateExercisePayload,
  ExerciseQuestionsResponse,
  GetQuestionsQuery,
  AddQuestionPayload,
  BulkAddQuestionsPayload,
  ReorderQuestionsPayload,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of exercises
 */
export function useExercises(
  filters?: ExerciseFilters,
  options?: Omit<
    UseQueryOptions<
      ExercisesListResponse,
      Error,
      ExercisesListResponse,
      ReturnType<typeof exerciseKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exerciseKeys.list(filters),
    queryFn: () => listExercises(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single exercise
 */
export function useExercise(
  id: string,
  options?: Omit<
    UseQueryOptions<Exercise, Error, Exercise, ReturnType<typeof exerciseKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exerciseKeys.detail(id),
    queryFn: () => getExercise(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch exercise questions
 */
export function useExerciseQuestions(
  id: string,
  query?: GetQuestionsQuery,
  options?: Omit<
    UseQueryOptions<
      ExerciseQuestionsResponse,
      Error,
      ExerciseQuestionsResponse,
      ReturnType<typeof exerciseKeys.questionsWithAnswers>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: exerciseKeys.questionsWithAnswers(id, query),
    queryFn: () => getExerciseQuestions(id, query),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// MUTATION HOOKS - EXERCISES
// =====================

/**
 * Hook to create an exercise
 */
export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateExercisePayload) => createExercise(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
  });
}

/**
 * Hook to update an exercise
 */
export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExercisePayload }) =>
      updateExercise(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      // Optimistically update the cache
      queryClient.setQueryData(exerciseKeys.detail(variables.id), data);
    },
  });
}

/**
 * Hook to delete an exercise
 */
export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
  });
}

/**
 * Hook to publish an exercise
 */
export function usePublishExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishExercise(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      // Optimistically update the cache
      queryClient.setQueryData(exerciseKeys.detail(id), data);
    },
  });
}

/**
 * Hook to unpublish an exercise
 */
export function useUnpublishExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unpublishExercise(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      // Optimistically update the cache
      queryClient.setQueryData(exerciseKeys.detail(id), data);
    },
  });
}

/**
 * Hook to archive an exercise
 */
export function useArchiveExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveExercise(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
      // Optimistically update the cache
      queryClient.setQueryData(exerciseKeys.detail(id), data);
    },
  });
}

// =====================
// MUTATION HOOKS - QUESTIONS
// =====================

/**
 * Hook to add a question to exercise
 */
export function useAddExerciseQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddQuestionPayload }) =>
      addExerciseQuestion(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate exercise details to update totals
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.id) });
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: exerciseKeys.questions(variables.id) });
      // Invalidate exercise lists to update question counts
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });

      // Optimistically update questions cache
      queryClient.setQueryData<ExerciseQuestionsResponse>(
        exerciseKeys.questions(variables.id),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            questionCount: data.updatedTotals.questionCount,
            totalPoints: data.updatedTotals.totalPoints,
            questions: [...old.questions, data.question],
          };
        }
      );
    },
  });
}

/**
 * Hook to bulk add questions to exercise
 */
export function useBulkAddExerciseQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: BulkAddQuestionsPayload }) =>
      bulkAddExerciseQuestions(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.questions(variables.id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });
    },
  });
}

/**
 * Hook to remove a question from exercise
 */
export function useRemoveExerciseQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, questionId }: { id: string; questionId: string }) =>
      removeExerciseQuestion(id, questionId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.questions(variables.id) });
      queryClient.invalidateQueries({ queryKey: exerciseKeys.lists() });

      // Optimistically update questions cache
      queryClient.setQueryData<ExerciseQuestionsResponse>(
        exerciseKeys.questions(variables.id),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            questionCount: data.updatedTotals.questionCount,
            totalPoints: data.updatedTotals.totalPoints,
            questions: old.questions.filter((q) => q.id !== data.removedQuestionId),
          };
        }
      );
    },
  });
}

/**
 * Hook to reorder exercise questions
 */
export function useReorderExerciseQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReorderQuestionsPayload }) =>
      reorderExerciseQuestions(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.questions(variables.id) });

      // Optimistically update questions cache with new order
      queryClient.setQueryData<ExerciseQuestionsResponse>(
        exerciseKeys.questions(variables.id),
        (old) => {
          if (!old) return old;
          const orderMap = new Map(data.updatedOrder.map((item) => [item.questionId, item.order]));
          const reorderedQuestions = [...old.questions].sort((a, b) => {
            const orderA = orderMap.get(a.id) || 0;
            const orderB = orderMap.get(b.id) || 0;
            return orderA - orderB;
          });
          return {
            ...old,
            questions: reorderedQuestions.map((q) => ({
              ...q,
              order: orderMap.get(q.id) || q.order,
            })),
          };
        }
      );
    },
  });
}
