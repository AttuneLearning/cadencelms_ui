/**
 * React Query hooks for fetching lessons
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lessonApi } from '../api/lessonApi';
import type { LessonFormData } from '../model/types';

export const LESSON_KEYS = {
  all: ['lessons'] as const,
  byCourse: (courseId: string) => [...LESSON_KEYS.all, 'course', courseId] as const,
  lists: (courseId: string) => [...LESSON_KEYS.byCourse(courseId), 'list'] as const,
  details: (courseId: string) => [...LESSON_KEYS.byCourse(courseId), 'detail'] as const,
  detail: (courseId: string, lessonId: string) =>
    [...LESSON_KEYS.details(courseId), lessonId] as const,
  next: (courseId: string, currentLessonId?: string) =>
    [...LESSON_KEYS.byCourse(courseId), 'next', currentLessonId] as const,
};

/**
 * Hook to fetch all lessons for a course
 */
export function useLessons(courseId: string) {
  return useQuery({
    queryKey: LESSON_KEYS.byCourse(courseId),
    queryFn: () => lessonApi.getByCourseId(courseId),
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch lesson list items (lightweight)
 */
export function useLessonList(courseId: string) {
  return useQuery({
    queryKey: LESSON_KEYS.lists(courseId),
    queryFn: () => lessonApi.getListByCourseId(courseId),
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch a single lesson by ID
 */
export function useLesson(courseId: string, lessonId: string) {
  return useQuery({
    queryKey: LESSON_KEYS.detail(courseId, lessonId),
    queryFn: () => lessonApi.getById(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });
}

/**
 * Hook to fetch the next lesson for a user
 */
export function useNextLesson(courseId: string, currentLessonId?: string) {
  return useQuery({
    queryKey: LESSON_KEYS.next(courseId, currentLessonId),
    queryFn: () => lessonApi.getNext(courseId, currentLessonId),
    enabled: !!courseId,
  });
}

/**
 * Hook to create a new lesson
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: LessonFormData }) =>
      lessonApi.create(courseId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.byCourse(variables.courseId) });
    },
  });
}

/**
 * Hook to update a lesson
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      lessonId,
      data,
    }: {
      courseId: string;
      lessonId: string;
      data: Partial<LessonFormData>;
    }) => lessonApi.update(courseId, lessonId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: LESSON_KEYS.detail(variables.courseId, variables.lessonId),
      });
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.byCourse(variables.courseId) });
    },
  });
}

/**
 * Hook to delete a lesson
 */
export function useDeleteLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) =>
      lessonApi.delete(courseId, lessonId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.byCourse(variables.courseId) });
    },
  });
}

/**
 * Hook to reorder lessons
 */
export function useReorderLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      lessons,
    }: {
      courseId: string;
      lessons: Array<{ lessonId: string; order: number }>;
    }) => lessonApi.reorder(courseId, lessons),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LESSON_KEYS.byCourse(variables.courseId) });
    },
  });
}
