/**
 * React Query hooks for canonical assessment-attempt lifecycle.
 */

import { useCallback, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAssessmentAttempt,
  getAssessmentAttemptResult,
  listMyAssessmentAttempts,
  saveAssessmentResponses,
  startAssessmentAttempt,
  submitAssessmentAttempt,
  type SaveAssessmentResponsesRequest,
  type StartAssessmentAttemptRequest,
} from '../api/assessmentAttemptApi';
import type { ExamAttempt, SubmitExamRequest } from '@/entities/exam-attempt/model/types';

function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: TArgs) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export const ASSESSMENT_ATTEMPT_KEYS = {
  all: ['assessmentAttempts'] as const,
  details: () => [...ASSESSMENT_ATTEMPT_KEYS.all, 'detail'] as const,
  detail: (assessmentId: string, attemptId: string) =>
    [...ASSESSMENT_ATTEMPT_KEYS.details(), assessmentId, attemptId] as const,
  results: () => [...ASSESSMENT_ATTEMPT_KEYS.all, 'result'] as const,
  result: (assessmentId: string, attemptId: string) =>
    [...ASSESSMENT_ATTEMPT_KEYS.results(), assessmentId, attemptId] as const,
  myHistory: (assessmentId: string) =>
    [...ASSESSMENT_ATTEMPT_KEYS.all, 'my', assessmentId] as const,
};

export function useAssessmentAttempt(assessmentId: string, attemptId: string) {
  return useQuery({
    queryKey: ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId),
    queryFn: () => getAssessmentAttempt(assessmentId, attemptId),
    enabled: !!assessmentId && !!attemptId,
  });
}

export function useStartAssessmentAttempt(assessmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartAssessmentAttemptRequest) =>
      startAssessmentAttempt(assessmentId, data),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, data.id),
        data
      );
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_ATTEMPT_KEYS.myHistory(assessmentId),
      });
    },
  });
}

export function useSaveAssessmentResponses(assessmentId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data: SaveAssessmentResponsesRequest;
    }) => saveAssessmentResponses(assessmentId, attemptId, data),
    onMutate: async ({ attemptId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId),
      });

      const previousAttempt = queryClient.getQueryData(
        ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId)
      );

      queryClient.setQueryData(
        ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, attemptId),
        (old: ExamAttempt | undefined) => {
          if (!old) return old;
          return {
            ...old,
            questions: old.questions.map((q) => {
              const response = data.responses.find((r) => r.questionId === q.id);
              if (!response) return q;
              return {
                ...q,
                userAnswer: response.response,
                hasAnswer: true,
              };
            }),
            status: 'in_progress',
          };
        }
      );

      return { previousAttempt };
    },
    onError: (_err, variables, context) => {
      if (context?.previousAttempt) {
        queryClient.setQueryData(
          ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, variables.attemptId),
          context.previousAttempt
        );
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, variables.attemptId),
      });
    },
  });

  const debouncedMutate = useDebouncedCallback(mutation.mutate, 1000);

  return {
    ...mutation,
    mutate: mutation.mutate,
    mutateDebounced: debouncedMutate,
  };
}

export function useSubmitAssessmentAttempt(assessmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attemptId,
      data,
    }: {
      attemptId: string;
      data?: SubmitExamRequest;
    }) => submitAssessmentAttempt(assessmentId, attemptId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_ATTEMPT_KEYS.detail(assessmentId, variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_ATTEMPT_KEYS.result(assessmentId, variables.attemptId),
      });
      queryClient.invalidateQueries({
        queryKey: ASSESSMENT_ATTEMPT_KEYS.myHistory(assessmentId),
      });
    },
  });
}

export function useAssessmentAttemptResult(assessmentId: string, attemptId: string) {
  return useQuery({
    queryKey: ASSESSMENT_ATTEMPT_KEYS.result(assessmentId, attemptId),
    queryFn: () => getAssessmentAttemptResult(assessmentId, attemptId),
    enabled: !!assessmentId && !!attemptId,
  });
}

export function useMyAssessmentAttemptHistory(assessmentId: string) {
  return useQuery({
    queryKey: ASSESSMENT_ATTEMPT_KEYS.myHistory(assessmentId),
    queryFn: () => listMyAssessmentAttempts(assessmentId),
    enabled: !!assessmentId,
  });
}
