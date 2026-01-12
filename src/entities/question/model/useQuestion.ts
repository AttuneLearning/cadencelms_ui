/**
 * Question React Query Hooks
 * Provides hooks for all question-related API operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkImportQuestions,
} from '../api/questionApi';
import { questionKeys } from './questionKeys';
import type {
  QuestionListResponse,
  QuestionListParams,
  QuestionDetails,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  Question,
  BulkImportPayload,
  BulkImportResponse,
} from './types';

/**
 * Hook to fetch paginated list of questions (GET /api/v2/questions)
 */
export function useQuestions(
  params?: QuestionListParams,
  options?: Omit<
    UseQueryOptions<
      QuestionListResponse,
      Error,
      QuestionListResponse,
      ReturnType<typeof questionKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: questionKeys.list(params),
    queryFn: () => getQuestions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single question details (GET /api/v2/questions/:id)
 */
export function useQuestion(
  id: string,
  options?: Omit<
    UseQueryOptions<
      QuestionDetails,
      Error,
      QuestionDetails,
      ReturnType<typeof questionKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: questionKeys.detail(id),
    queryFn: () => getQuestionById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook to create a new question (POST /api/v2/questions)
 */
export function useCreateQuestion(
  options?: UseMutationOptions<Question, Error, CreateQuestionPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      // Invalidate all question lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing question (PUT /api/v2/questions/:id)
 */
export function useUpdateQuestion(
  options?: UseMutationOptions<
    Question,
    Error,
    { id: string; payload: UpdateQuestionPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateQuestion(id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(questionKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a question (DELETE /api/v2/questions/:id)
 */
export function useDeleteQuestion(
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: questionKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to bulk import questions (POST /api/v2/questions/bulk)
 */
export function useBulkImportQuestions(
  options?: UseMutationOptions<BulkImportResponse, Error, BulkImportPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkImportQuestions,
    onSuccess: () => {
      // Invalidate all question lists after bulk import
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to duplicate a question
 * Creates a new question based on an existing one
 */
export function useDuplicateQuestion(
  options?: UseMutationOptions<Question, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch the original question
      const original = await getQuestionById(id);

      // Create a new question with duplicated data
      const duplicatePayload: CreateQuestionPayload = {
        questionText: `${original.questionText} (Copy)`,
        questionType: original.questionType,
        options: original.options,
        correctAnswer: original.correctAnswer,
        points: original.points,
        difficulty: original.difficulty,
        tags: original.tags,
        explanation: original.explanation || undefined,
        department: original.department || undefined,
      };

      return createQuestion(duplicatePayload);
    },
    onSuccess: () => {
      // Invalidate all question lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}
