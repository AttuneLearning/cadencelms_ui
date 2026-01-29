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
 * Hook to fetch paginated list of questions (GET /api/v2/departments/:id/questions)
 * Updated for department-scoped API v1.1.0
 */
export function useQuestions(
  departmentId: string,
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
    queryKey: questionKeys.list(departmentId, params),
    queryFn: () => getQuestions(departmentId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId,
    ...options,
  });
}

/**
 * Hook to fetch single question details (GET /api/v2/departments/:id/questions/:id)
 * Updated for department-scoped API v1.1.0
 */
export function useQuestion(
  departmentId: string,
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
    queryKey: questionKeys.detail(departmentId, id),
    queryFn: () => getQuestionById(departmentId, id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId && !!id,
    ...options,
  });
}

/**
 * Hook to create a new question (POST /api/v2/departments/:id/questions)
 * Updated for department-scoped API v1.1.0
 */
export function useCreateQuestion(
  departmentId: string,
  options?: UseMutationOptions<Question, Error, CreateQuestionPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => createQuestion(departmentId, payload),
    onSuccess: () => {
      // Invalidate all question lists for this department
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to update an existing question (PUT /api/v2/departments/:id/questions/:id)
 * Updated for department-scoped API v1.1.0
 */
export function useUpdateQuestion(
  departmentId: string,
  options?: UseMutationOptions<
    Question,
    Error,
    { id: string; payload: UpdateQuestionPayload }
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateQuestion(departmentId, id, payload),
    onSuccess: (data, variables) => {
      // Update cached detail
      queryClient.setQueryData(questionKeys.detail(departmentId, variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to delete a question (DELETE /api/v2/departments/:id/questions/:id)
 * Updated for department-scoped API v1.1.0
 */
export function useDeleteQuestion(
  departmentId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteQuestion(departmentId, id),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: questionKeys.detail(departmentId, id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}

/**
 * Hook to bulk import questions (POST /api/v2/departments/:id/questions/bulk)
 * Updated for department-scoped API v1.1.0
 */
export function useBulkImportQuestions(
  departmentId: string,
  options?: UseMutationOptions<BulkImportResponse, Error, BulkImportPayload>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => bulkImportQuestions(departmentId, payload),
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
 * Updated for department-scoped API v1.1.0
 */
export function useDuplicateQuestion(
  departmentId: string,
  options?: UseMutationOptions<Question, Error, string>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch the original question
      const original = await getQuestionById(departmentId, id);

      // Create a new question with duplicated data
      const duplicatePayload: CreateQuestionPayload = {
        questionBankId: original.questionBankId,
        questionText: `${original.questionText} (Copy)`,
        questionTypes: original.questionTypes,
        options: original.options,
        correctAnswers: original.correctAnswers,
        points: original.points,
        difficulty: original.difficulty,
        tags: original.tags,
        explanation: original.explanation || undefined,
        knowledgeNodeId: original.knowledgeNodeId,
        cognitiveDepth: original.cognitiveDepth,
      };

      return createQuestion(departmentId, duplicatePayload);
    },
    onSuccess: () => {
      // Invalidate all question lists
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
    ...options,
  });
}
