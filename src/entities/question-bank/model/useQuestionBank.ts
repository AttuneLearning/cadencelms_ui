/**
 * Question Bank React Query Hooks
 * Provides hooks for all question bank operations
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { useToast } from '@/shared/ui/use-toast';
import {
  getQuestionBanks,
  getQuestionBank,
  createQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
} from '../api/questionBankApi';
import { questionBankKeys } from './questionBankKeys';
import type {
  QuestionBankListResponse,
  QuestionBankListParams,
  QuestionBank,
  CreateQuestionBankPayload,
  UpdateQuestionBankPayload,
} from './types';

/**
 * Hook to fetch paginated list of question banks
 */
export function useQuestionBanks(
  departmentId: string,
  params?: QuestionBankListParams,
  options?: Omit<
    UseQueryOptions<
      QuestionBankListResponse,
      Error,
      QuestionBankListResponse,
      ReturnType<typeof questionBankKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: questionBankKeys.list(departmentId, params),
    queryFn: () => getQuestionBanks(departmentId, params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId,
    ...options,
  });
}

/**
 * Hook to fetch single question bank details
 */
export function useQuestionBank(
  departmentId: string,
  bankId: string,
  options?: Omit<
    UseQueryOptions<
      QuestionBank,
      Error,
      QuestionBank,
      ReturnType<typeof questionBankKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: questionBankKeys.detail(departmentId, bankId),
    queryFn: () => getQuestionBank(departmentId, bankId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!departmentId && !!bankId,
    ...options,
  });
}

/**
 * Hook to create a new question bank
 */
export function useCreateQuestionBank(
  departmentId: string,
  options?: UseMutationOptions<QuestionBank, Error, CreateQuestionBankPayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => createQuestionBank(departmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: questionBankKeys.lists(departmentId),
      });
      toast({
        title: 'Question bank created',
        description: 'The question bank has been created successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to create question bank',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to update an existing question bank
 */
export function useUpdateQuestionBank(
  departmentId: string,
  options?: UseMutationOptions<
    QuestionBank,
    Error,
    { bankId: string; payload: UpdateQuestionBankPayload }
  >
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ bankId, payload }) =>
      updateQuestionBank(departmentId, bankId, payload),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        questionBankKeys.detail(departmentId, variables.bankId),
        data
      );
      queryClient.invalidateQueries({
        queryKey: questionBankKeys.lists(departmentId),
      });
      toast({
        title: 'Question bank updated',
        description: 'The question bank has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update question bank',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to delete a question bank
 */
export function useDeleteQuestionBank(
  departmentId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (bankId) => deleteQuestionBank(departmentId, bankId),
    onSuccess: (_, bankId) => {
      queryClient.removeQueries({
        queryKey: questionBankKeys.detail(departmentId, bankId),
      });
      queryClient.invalidateQueries({
        queryKey: questionBankKeys.lists(departmentId),
      });
      toast({
        title: 'Question bank deleted',
        description: 'The question bank has been deleted successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to delete question bank',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}
