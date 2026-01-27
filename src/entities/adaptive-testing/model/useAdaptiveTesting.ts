/**
 * Adaptive Testing React Query Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/use-toast';
import {
  selectQuestion,
  selectQuestions,
  recordResponse,
} from '../api/adaptiveApi';
import type {
  SelectQuestionParams,
  SelectQuestionsParams,
  RecordResponseParams,
} from './types';

/**
 * Hook to select a single adaptive question
 */
export function useSelectQuestion() {
  return useMutation({
    mutationFn: (params: SelectQuestionParams) => selectQuestion(params),
  });
}

/**
 * Hook to select multiple adaptive questions
 */
export function useSelectQuestions() {
  return useMutation({
    mutationFn: (params: SelectQuestionsParams) => selectQuestions(params),
  });
}

/**
 * Hook to record a learner's response
 */
export function useRecordResponse() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: RecordResponseParams) => recordResponse(params),
    onSuccess: (result, variables) => {
      // Invalidate learner progress cache (if we have that entity)
      if (variables.learnerId && variables.knowledgeNodeId) {
        queryClient.invalidateQueries({
          queryKey: ['learnerProgress', variables.learnerId, variables.knowledgeNodeId],
        });
      }

      // Show achievement toasts
      if (result.levelAdvanced) {
        toast({
          title: 'Level Up! 🎉',
          description: `You've advanced to ${result.newDepth} level!`,
        });
      }

      if (result.isNodeComplete) {
        toast({
          title: 'Mastery Achieved! 🏆',
          description: 'You have mastered this knowledge area.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to record response',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
