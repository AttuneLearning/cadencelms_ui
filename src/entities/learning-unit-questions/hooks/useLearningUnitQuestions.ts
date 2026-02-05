/**
 * Learning Unit Questions React Query Hooks
 * Hooks for managing questions linked to exercises and assessments
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
  getLinkedQuestions,
  linkQuestion,
  bulkLinkQuestions,
  updateLinkedQuestion,
  unlinkQuestion,
} from '../api/learningUnitQuestionsApi';
import { learningUnitQuestionsKeys } from '../model/learningUnitQuestionsKeys';
import type {
  LinkedQuestionsResponse,
  LinkQuestionPayload,
  LinkQuestionResponse,
  BulkLinkPayload,
  BulkLinkResponse,
  UpdateLinkPayload,
} from '../model/types';

/**
 * Hook to fetch questions linked to a learning unit
 */
export function useLinkedQuestions(
  learningUnitId: string,
  options?: Omit<
    UseQueryOptions<
      LinkedQuestionsResponse,
      Error,
      LinkedQuestionsResponse,
      ReturnType<typeof learningUnitQuestionsKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learningUnitQuestionsKeys.list(learningUnitId),
    queryFn: () => getLinkedQuestions(learningUnitId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!learningUnitId,
    ...options,
  });
}

/**
 * Hook to link a question to a learning unit
 */
export function useLinkQuestion(
  learningUnitId: string,
  options?: UseMutationOptions<LinkQuestionResponse, Error, LinkQuestionPayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => linkQuestion(learningUnitId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningUnitQuestionsKeys.list(learningUnitId),
      });
      toast({
        title: 'Question linked',
        description: 'The question has been added to this assessment.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to link question',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to bulk link questions to a learning unit
 */
export function useBulkLinkQuestions(
  learningUnitId: string,
  options?: UseMutationOptions<BulkLinkResponse, Error, BulkLinkPayload>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload) => bulkLinkQuestions(learningUnitId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: learningUnitQuestionsKeys.list(learningUnitId),
      });
      toast({
        title: 'Questions linked',
        description: `${data.summary.successful} question(s) added successfully.${
          data.summary.failed > 0 ? ` ${data.summary.failed} failed.` : ''
        }`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to link questions',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to update a linked question
 */
export function useUpdateLinkedQuestion(
  learningUnitId: string,
  options?: UseMutationOptions<
    LinkQuestionResponse,
    Error,
    { linkId: string; payload: UpdateLinkPayload }
  >
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ linkId, payload }) =>
      updateLinkedQuestion(learningUnitId, linkId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningUnitQuestionsKeys.list(learningUnitId),
      });
      toast({
        title: 'Question updated',
        description: 'The question settings have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update question',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Hook to unlink a question from a learning unit
 */
export function useUnlinkQuestion(
  learningUnitId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (linkId) => unlinkQuestion(learningUnitId, linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learningUnitQuestionsKeys.list(learningUnitId),
      });
      toast({
        title: 'Question removed',
        description: 'The question has been removed from this assessment.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove question',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}
