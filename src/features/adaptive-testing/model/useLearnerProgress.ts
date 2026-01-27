/**
 * Learner Progress Hook
 * React Query hook for managing learner progress in adaptive testing
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learnerProgressApi } from '../api/learnerProgressApi';
import type {
  LearnerUnitProgress,
  QuestionProgress,
  RecordAnswerRequest,
} from './types';

/**
 * Query keys for learner progress
 */
export const learnerProgressKeys = {
  all: ['learner-progress'] as const,
  unit: (learningUnitId: string, learnerId: string) =>
    [...learnerProgressKeys.all, learningUnitId, learnerId] as const,
  question: (learningUnitId: string, learnerId: string, questionId: string) =>
    [...learnerProgressKeys.unit(learningUnitId, learnerId), 'question', questionId] as const,
};

export interface UseLearnerProgressOptions {
  /** Whether to enable the query */
  enabled?: boolean;
}

export interface UseLearnerProgressReturn {
  /** Learner's progress data */
  progress: LearnerUnitProgress | undefined;
  /** Whether progress is loading */
  isLoading: boolean;
  /** Error if any */
  error: Error | null;
  /** Record an answer */
  recordAnswer: (params: RecordAnswerRequest) => Promise<QuestionProgress>;
  /** Whether recording is in progress */
  isRecording: boolean;
  /** Reset all progress */
  resetProgress: () => Promise<void>;
  /** Whether reset is in progress */
  isResetting: boolean;
  /** Refetch progress */
  refetch: () => void;
  /** Get progress for a specific question */
  getQuestionProgress: (questionId: string) => QuestionProgress | undefined;
  /** Check if a question is mastered */
  isQuestionMastered: (questionId: string) => boolean;
  /** Get active (non-mastered) questions */
  activeQuestions: QuestionProgress[];
  /** Get mastered questions */
  masteredQuestions: QuestionProgress[];
}

/**
 * useLearnerProgress Hook
 *
 * Provides access to and management of learner progress for adaptive testing.
 * Tracks correct/incorrect answers and mastery status for each question.
 *
 * @param learningUnitId - The learning unit ID
 * @param learnerId - The learner's ID
 * @param options - Additional options
 */
export function useLearnerProgress(
  learningUnitId: string,
  learnerId: string,
  options: UseLearnerProgressOptions = {}
): UseLearnerProgressReturn {
  const { enabled = true } = options;
  const queryClient = useQueryClient();

  // Query for progress data
  const {
    data: progress,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: learnerProgressKeys.unit(learningUnitId, learnerId),
    queryFn: () => learnerProgressApi.getProgress(learningUnitId, learnerId),
    enabled: enabled && !!learningUnitId && !!learnerId,
  });

  // Mutation for recording answers
  const recordAnswerMutation = useMutation({
    mutationFn: (params: RecordAnswerRequest) =>
      learnerProgressApi.recordAnswer(learningUnitId, learnerId, params),
    onSuccess: (updatedQuestion) => {
      // Optimistically update the cache
      queryClient.setQueryData<LearnerUnitProgress>(
        learnerProgressKeys.unit(learningUnitId, learnerId),
        (old) => {
          if (!old) return old;

          const updatedQuestions = old.questions.map((q) =>
            q.questionId === updatedQuestion.questionId ? updatedQuestion : q
          );

          const masteredCount = updatedQuestions.filter((q) => !q.isActive).length;

          return {
            ...old,
            questions: updatedQuestions,
            masteredCount,
            progressPercent: Math.round((masteredCount / old.totalQuestions) * 100),
            lastActivityAt: new Date().toISOString(),
          };
        }
      );
    },
  });

  // Mutation for resetting progress
  const resetProgressMutation = useMutation({
    mutationFn: () => learnerProgressApi.resetProgress(learningUnitId, learnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: learnerProgressKeys.unit(learningUnitId, learnerId),
      });
    },
  });

  // Helper functions
  const getQuestionProgress = (questionId: string): QuestionProgress | undefined => {
    return progress?.questions.find((q) => q.questionId === questionId);
  };

  const isQuestionMastered = (questionId: string): boolean => {
    const questionProgress = getQuestionProgress(questionId);
    return questionProgress ? !questionProgress.isActive : false;
  };

  const activeQuestions = progress?.questions.filter((q) => q.isActive) ?? [];
  const masteredQuestions = progress?.questions.filter((q) => !q.isActive) ?? [];

  return {
    progress,
    isLoading,
    error: error as Error | null,
    recordAnswer: recordAnswerMutation.mutateAsync,
    isRecording: recordAnswerMutation.isPending,
    resetProgress: resetProgressMutation.mutateAsync,
    isResetting: resetProgressMutation.isPending,
    refetch,
    getQuestionProgress,
    isQuestionMastered,
    activeQuestions,
    masteredQuestions,
  };
}

export default useLearnerProgress;
