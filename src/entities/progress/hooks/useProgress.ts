/**
 * React Query hooks for Progress entity
 * Based on progress.contract.ts v1.0.0
 * Includes debounced progress updates (30s interval)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useCallback } from 'react';
import {
  getProgramProgress,
  getCourseProgress,
  getClassProgress,
  getLearnerProgress,
  getLearnerProgramProgress,
  updateProgress,
  getProgressSummary,
  getDetailedProgressReport,
  startLesson,
  updateLessonProgress,
  completeLesson,
} from '../api/progressApi';
import type {
  UpdateProgressRequest,
  ProgressSummaryFilters,
  DetailedProgressReportFilters,
} from '../model/types';
import type {
  StartLessonRequest,
  UpdateLessonProgressRequest,
  CompleteLessonRequest,
} from '../api/progressApi';

// =====================
// QUERY KEYS
// =====================

export const PROGRESS_KEYS = {
  all: ['progress'] as const,
  program: (programId: string, learnerId?: string) =>
    [...PROGRESS_KEYS.all, 'program', programId, learnerId] as const,
  course: (courseId: string, learnerId?: string) =>
    [...PROGRESS_KEYS.all, 'course', courseId, learnerId] as const,
  class: (classId: string, learnerId?: string) =>
    [...PROGRESS_KEYS.all, 'class', classId, learnerId] as const,
  learner: (learnerId: string) => [...PROGRESS_KEYS.all, 'learner', learnerId] as const,
  learnerProgram: (learnerId: string, programId: string) =>
    [...PROGRESS_KEYS.learner(learnerId), 'program', programId] as const,
  summary: (filters?: ProgressSummaryFilters) => [...PROGRESS_KEYS.all, 'summary', filters] as const,
  detailedReport: (filters?: DetailedProgressReportFilters) =>
    [...PROGRESS_KEYS.all, 'detailed-report', filters] as const,
  lesson: (courseId: string, lessonId: string) =>
    [...PROGRESS_KEYS.all, 'lesson', courseId, lessonId] as const,
};

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch program progress
 */
export function useProgramProgress(programId: string, learnerId?: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.program(programId, learnerId),
    queryFn: () => getProgramProgress(programId, learnerId),
    enabled: !!programId,
  });
}

/**
 * Hook to fetch detailed course progress
 */
export function useCourseProgress(courseId: string, learnerId?: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.course(courseId, learnerId),
    queryFn: () => getCourseProgress(courseId, learnerId),
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch class progress with attendance
 */
export function useClassProgress(classId: string, learnerId?: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.class(classId, learnerId),
    queryFn: () => getClassProgress(classId, learnerId),
    enabled: !!classId,
  });
}

/**
 * Hook to fetch comprehensive learner progress
 */
export function useLearnerProgress(learnerId: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.learner(learnerId),
    queryFn: () => getLearnerProgress(learnerId),
    enabled: !!learnerId,
  });
}

/**
 * Hook to fetch learner's program progress
 */
export function useLearnerProgramProgress(learnerId: string, programId: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.learnerProgram(learnerId, programId),
    queryFn: () => getLearnerProgramProgress(learnerId, programId),
    enabled: !!learnerId && !!programId,
  });
}

/**
 * Hook to fetch progress summary report
 */
export function useProgressSummary(filters?: ProgressSummaryFilters) {
  return useQuery({
    queryKey: PROGRESS_KEYS.summary(filters),
    queryFn: () => getProgressSummary(filters),
  });
}

/**
 * Hook to fetch detailed progress report
 */
export function useDetailedProgressReport(
  filters?: DetailedProgressReportFilters,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: PROGRESS_KEYS.detailedReport(filters),
    queryFn: () => getDetailedProgressReport(filters),
    enabled,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to update progress with debouncing (30 second delay)
 * Accumulates rapid updates and sends only the last one after 30s
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<UpdateProgressRequest | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: UpdateProgressRequest) => updateProgress(payload),
    onSuccess: () => {
      // Invalidate all relevant progress queries
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.all });
    },
  });

  const debouncedMutate = useCallback(
    (payload: UpdateProgressRequest) => {
      // Store the latest update
      pendingUpdateRef.current = payload;

      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer for 30 seconds (30000ms)
      debounceTimerRef.current = setTimeout(() => {
        if (pendingUpdateRef.current) {
          mutation.mutate(pendingUpdateRef.current);
          pendingUpdateRef.current = null;
        }
      }, 30000);
    },
    [mutation]
  );

  // Return a modified mutation object with debounced mutate
  return {
    ...mutation,
    mutate: debouncedMutate,
    mutateAsync: async (payload: UpdateProgressRequest) => {
      debouncedMutate(payload);
      // Note: This won't wait for the actual mutation due to debouncing
      // If you need to wait, use the regular mutation.mutateAsync
      return Promise.resolve();
    },
  };
}

// =====================
// LESSON PROGRESS MUTATIONS
// =====================

/**
 * Hook to start lesson progress tracking
 */
export function useStartLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartLessonRequest) => startLesson(request),
    onSuccess: (_, variables) => {
      // Invalidate course and lesson progress
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.course(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.lesson(variables.courseId, variables.lessonId),
      });
    },
  });
}

/**
 * Hook to update lesson progress
 */
export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateLessonProgressRequest) => updateLessonProgress(request),
    onSuccess: (_, variables) => {
      // Invalidate course and lesson progress
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.course(variables.courseId),
      });
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.lesson(variables.courseId, variables.lessonId),
      });
    },
  });
}

/**
 * Hook to complete lesson
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CompleteLessonRequest) => completeLesson(request),
    onSuccess: () => {
      // Invalidate all progress queries as completion may affect multiple areas
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.all,
      });
    },
  });
}
