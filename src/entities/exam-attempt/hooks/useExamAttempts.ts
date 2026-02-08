/**
 * React Query hooks for fetching and mutating exam attempts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import {
  listExamAttempts,
  getExamAttempt,
  startExamAttempt,
  submitAnswers,
  submitExam,
  getExamResults,
  gradeExam,
  listAttemptsByExam,
  getExerciseAttempts,
} from '../api/examAttemptApi';
import type {
  ListExamAttemptsParams,
  StartExamAttemptRequest,
  SubmitAnswersRequest,
  SubmitExamRequest,
  GradeExamRequest,
  ListAttemptsByExamParams,
} from '../model/types';

/**
 * Simple debounce hook
 */
function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

export const EXAM_ATTEMPT_KEYS = {
  all: ['examAttempts'] as const,
  lists: () => [...EXAM_ATTEMPT_KEYS.all, 'list'] as const,
  list: (params?: ListExamAttemptsParams) =>
    [...EXAM_ATTEMPT_KEYS.lists(), params] as const,
  details: () => [...EXAM_ATTEMPT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EXAM_ATTEMPT_KEYS.details(), id] as const,
  results: () => [...EXAM_ATTEMPT_KEYS.all, 'results'] as const,
  result: (id: string) => [...EXAM_ATTEMPT_KEYS.results(), id] as const,
  history: (examId: string) => [...EXAM_ATTEMPT_KEYS.all, 'history', examId] as const,
  exerciseAttempts: (exerciseId: string, learnerId: string) =>
    [...EXAM_ATTEMPT_KEYS.all, 'exerciseAttempts', exerciseId, learnerId] as const,
  byExam: (examId: string, params?: ListAttemptsByExamParams) =>
    [...EXAM_ATTEMPT_KEYS.all, 'byExam', examId, params] as const,
};

/**
 * Hook to fetch list of exam attempts
 */
export function useExamAttempts(params?: ListExamAttemptsParams) {
  return useQuery({
    queryKey: EXAM_ATTEMPT_KEYS.list(params),
    queryFn: () => listExamAttempts(params),
  });
}

/**
 * Hook to fetch a single exam attempt by ID
 */
export function useExamAttempt(id: string) {
  return useQuery({
    queryKey: EXAM_ATTEMPT_KEYS.detail(id),
    queryFn: () => getExamAttempt(id),
    enabled: !!id,
  });
}

/**
 * Hook to start a new exam attempt
 */
export function useStartExamAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartExamAttemptRequest) => startExamAttempt(data),
    onSuccess: (data, variables) => {
      // Invalidate attempts list
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.lists() });
      // Invalidate exam-specific lists
      queryClient.invalidateQueries({
        queryKey: EXAM_ATTEMPT_KEYS.list({ examId: variables.examId }),
      });
      // Set the new attempt data in cache
      queryClient.setQueryData(EXAM_ATTEMPT_KEYS.detail(data.id), data);
    },
  });
}

/**
 * Hook to save answer with auto-save (debounced)
 */
export function useSaveAnswer() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: SubmitAnswersRequest['answers'];
    }) => submitAnswers(attemptId, { answers }),
    onMutate: async ({ attemptId, answers }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: EXAM_ATTEMPT_KEYS.detail(attemptId) });

      // Snapshot the previous value
      const previousAttempt = queryClient.getQueryData(EXAM_ATTEMPT_KEYS.detail(attemptId));

      // Optimistically update the cache
      queryClient.setQueryData(EXAM_ATTEMPT_KEYS.detail(attemptId), (old: any) => {
        if (!old) return old;

        return {
          ...old,
          questions: old.questions.map((q: any) => {
            const answer = answers.find((a) => a.questionId === q.id);
            if (answer) {
              return {
                ...q,
                userAnswer: answer.answer,
                hasAnswer: true,
              };
            }
            return q;
          }),
          status: 'in_progress',
        };
      });

      return { previousAttempt };
    },
    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousAttempt) {
        queryClient.setQueryData(
          EXAM_ATTEMPT_KEYS.detail(variables.attemptId),
          context.previousAttempt
        );
      }
    },
    onSuccess: (data, variables) => {
      // Update with server response
      queryClient.setQueryData(EXAM_ATTEMPT_KEYS.detail(variables.attemptId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...data,
        };
      });
    },
  });

  // Create debounced version for auto-save
  const debouncedMutate = useDebouncedCallback(mutation.mutate, 1000);

  return {
    ...mutation,
    mutate: mutation.mutate,
    mutateDebounced: debouncedMutate,
  };
}

/**
 * Hook to submit exam for grading
 */
export function useSubmitExamAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data?: SubmitExamRequest;
    }) => submitExam(attemptId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.detail(variables.attemptId) });
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.lists() });
      // If graded, invalidate results
      if (data.status === 'graded') {
        queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.result(variables.attemptId) });
      }
    },
  });
}

/**
 * Hook to fetch exam results
 */
export function useExamAttemptResult(id: string) {
  return useQuery({
    queryKey: EXAM_ATTEMPT_KEYS.result(id),
    queryFn: () => getExamResults(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch exam attempt history for a specific exam
 */
export function useExamAttemptHistory(examId: string) {
  return useQuery({
    queryKey: EXAM_ATTEMPT_KEYS.history(examId),
    queryFn: () => listExamAttempts({ examId, status: 'graded', sort: '-submittedAt' }),
    enabled: !!examId,
  });
}

/**
 * Hook to manually grade an exam (instructor)
 */
export function useGradeExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: string; data: GradeExamRequest }) =>
      gradeExam(attemptId, data),
    onSuccess: (_data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.detail(variables.attemptId) });
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.result(variables.attemptId) });
      queryClient.invalidateQueries({ queryKey: EXAM_ATTEMPT_KEYS.lists() });
    },
  });
}

/**
 * Hook to fetch exercise attempts for a specific learner
 */
export function useExerciseAttempts(exerciseId: string, learnerId: string) {
  return useQuery({
    queryKey: EXAM_ATTEMPT_KEYS.exerciseAttempts(exerciseId, learnerId),
    queryFn: () => getExerciseAttempts(exerciseId, learnerId),
    enabled: !!exerciseId && !!learnerId,
  });
}

/**
 * Hook to list all attempts for an exam (instructor view)
 */
export function useExamAttemptsByExam(examId: string, params?: ListAttemptsByExamParams) {
  return useQuery({
    queryKey: EXAM_ATTEMPT_KEYS.byExam(examId, params),
    queryFn: () => listAttemptsByExam(examId, params),
    enabled: !!examId,
  });
}
