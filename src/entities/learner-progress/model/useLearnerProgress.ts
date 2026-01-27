/**
 * Learner Progress React Query Hooks
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
  getLearnerProgress,
  getNodeProgress,
  getProgressSummary,
  resetNodeProgress,
} from '../api/learnerProgressApi';
import { learnerProgressKeys } from './learnerProgressKeys';
import type {
  LearnerKnowledgeProgress,
  LearnerProgressSummary,
  ProgressListParams,
  ProgressListResponse,
} from './types';

/**
 * Hook to fetch learner's progress list
 */
export function useLearnerProgress(
  learnerId: string,
  params?: ProgressListParams,
  options?: Omit<
    UseQueryOptions<
      ProgressListResponse,
      Error,
      ProgressListResponse,
      ReturnType<typeof learnerProgressKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learnerProgressKeys.list(learnerId, params),
    queryFn: () => getLearnerProgress(learnerId, params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!learnerId,
    ...options,
  });
}

/**
 * Hook to fetch progress for a specific node
 */
export function useNodeProgress(
  learnerId: string,
  nodeId: string,
  options?: Omit<
    UseQueryOptions<
      LearnerKnowledgeProgress,
      Error,
      LearnerKnowledgeProgress,
      ReturnType<typeof learnerProgressKeys.forNode>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learnerProgressKeys.forNode(learnerId, nodeId),
    queryFn: () => getNodeProgress(learnerId, nodeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!learnerId && !!nodeId,
    ...options,
  });
}

/**
 * Hook to fetch learner's progress summary
 */
export function useProgressSummary(
  learnerId: string,
  options?: Omit<
    UseQueryOptions<
      LearnerProgressSummary,
      Error,
      LearnerProgressSummary,
      ReturnType<typeof learnerProgressKeys.summary>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: learnerProgressKeys.summary(learnerId),
    queryFn: () => getProgressSummary(learnerId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!learnerId,
    ...options,
  });
}

/**
 * Hook to reset progress for a node
 */
export function useResetNodeProgress(
  learnerId: string,
  options?: UseMutationOptions<void, Error, string>
) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (nodeId) => resetNodeProgress(learnerId, nodeId),
    onSuccess: (_, nodeId) => {
      queryClient.invalidateQueries({
        queryKey: learnerProgressKeys.forNode(learnerId, nodeId),
      });
      queryClient.invalidateQueries({
        queryKey: learnerProgressKeys.lists(learnerId),
      });
      queryClient.invalidateQueries({
        queryKey: learnerProgressKeys.summary(learnerId),
      });
      toast({
        title: 'Progress reset',
        description: 'Knowledge node progress has been reset.',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to reset progress',
        description: 'Please try again.',
        variant: 'destructive',
      });
    },
    ...options,
  });
}
