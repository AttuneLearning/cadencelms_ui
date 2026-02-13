/**
 * React Query hooks for fetching and mutating exam attempts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listExamAttempts,
  getExamAttempt,
  gradeExam,
  listAttemptsByExam,
  getExerciseAttempts,
} from '../api/examAttemptApi';
import type {
  ListExamAttemptsParams,
  GradeExamRequest,
  ListAttemptsByExamParams,
} from '../model/types';

export const EXAM_ATTEMPT_KEYS = {
  all: ['examAttempts'] as const,
  lists: () => [...EXAM_ATTEMPT_KEYS.all, 'list'] as const,
  list: (params?: ListExamAttemptsParams) =>
    [...EXAM_ATTEMPT_KEYS.lists(), params] as const,
  details: () => [...EXAM_ATTEMPT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...EXAM_ATTEMPT_KEYS.details(), id] as const,
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
