/**
 * React Query hooks for fetching and updating progress
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi } from '../api/progressApi';
import type { ProgressUpdate } from '../model/types';

export const PROGRESS_KEYS = {
  all: ['progress'] as const,
  stats: () => [...PROGRESS_KEYS.all, 'stats'] as const,
  course: (courseId: string) => [...PROGRESS_KEYS.all, 'course', courseId] as const,
  lesson: (courseId: string, lessonId: string) =>
    [...PROGRESS_KEYS.course(courseId), 'lesson', lessonId] as const,
  batch: (courseId: string, lessonIds: string[]) =>
    [...PROGRESS_KEYS.course(courseId), 'batch', ...lessonIds] as const,
};

/**
 * Hook to fetch progress for a specific lesson
 */
export function useLessonProgress(courseId: string, lessonId: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.lesson(courseId, lessonId),
    queryFn: () => progressApi.getLessonProgress(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });
}

/**
 * Hook to fetch progress for all lessons in a course
 */
export function useCourseProgress(courseId: string) {
  return useQuery({
    queryKey: PROGRESS_KEYS.course(courseId),
    queryFn: () => progressApi.getCourseProgress(courseId),
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch overall progress statistics
 */
export function useProgressStats() {
  return useQuery({
    queryKey: PROGRESS_KEYS.stats(),
    queryFn: () => progressApi.getStats(),
  });
}

/**
 * Hook to fetch progress for multiple lessons (batch)
 */
export function useBatchProgress(courseId: string, lessonIds: string[]) {
  return useQuery({
    queryKey: PROGRESS_KEYS.batch(courseId, lessonIds),
    queryFn: () => progressApi.getBatchProgress(courseId, lessonIds),
    enabled: !!courseId && lessonIds.length > 0,
  });
}

/**
 * Hook to update progress for a lesson
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      lessonId,
      data,
    }: {
      courseId: string;
      lessonId: string;
      data: ProgressUpdate;
    }) => progressApi.updateLessonProgress(courseId, lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.lesson(variables.courseId, variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.course(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
    },
  });
}

/**
 * Hook to start a lesson
 */
export function useStartLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      progressApi.startLesson(courseId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.lesson(variables.courseId, variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.course(variables.courseId),
      });
    },
  });
}

/**
 * Hook to complete a lesson
 */
export function useCompleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      lessonId,
      data,
    }: {
      courseId: string;
      lessonId: string;
      data?: { score?: number; timeSpent?: number };
    }) => progressApi.completeLesson(courseId, lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.lesson(variables.courseId, variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.course(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
    },
  });
}

/**
 * Hook to reset progress for a lesson
 */
export function useResetProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      progressApi.resetLessonProgress(courseId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.lesson(variables.courseId, variables.lessonId),
      });
      queryClient.invalidateQueries({
        queryKey: PROGRESS_KEYS.course(variables.courseId),
      });
      queryClient.invalidateQueries({ queryKey: PROGRESS_KEYS.stats() });
    },
  });
}
