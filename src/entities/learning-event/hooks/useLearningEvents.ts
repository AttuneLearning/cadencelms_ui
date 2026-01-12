/**
 * React Query hooks for learning events
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningEventApi } from '../api/learningEventApi';
import type {
  CreateLearningEventData,
  LearningEventsFilters,
  StatsFilters,
} from '../model/types';

export const LEARNING_EVENT_KEYS = {
  all: ['learning-events'] as const,
  lists: () => [...LEARNING_EVENT_KEYS.all, 'list'] as const,
  list: (filters?: LearningEventsFilters) => [...LEARNING_EVENT_KEYS.lists(), filters] as const,
  details: () => [...LEARNING_EVENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LEARNING_EVENT_KEYS.details(), id] as const,
  learnerActivity: (learnerId: string, filters?: Omit<LearningEventsFilters, 'learner'>) =>
    [...LEARNING_EVENT_KEYS.all, 'learner', learnerId, filters] as const,
  courseActivity: (courseId: string, filters?: Omit<LearningEventsFilters, 'course'>) =>
    [...LEARNING_EVENT_KEYS.all, 'course', courseId, filters] as const,
  classActivity: (classId: string, filters?: Omit<LearningEventsFilters, 'class'>) =>
    [...LEARNING_EVENT_KEYS.all, 'class', classId, filters] as const,
  stats: (filters?: StatsFilters) => [...LEARNING_EVENT_KEYS.all, 'stats', filters] as const,
};

/**
 * Hook to fetch learning events with filters
 */
export function useLearningEvents(filters?: LearningEventsFilters) {
  return useQuery({
    queryKey: LEARNING_EVENT_KEYS.list(filters),
    queryFn: () => learningEventApi.list(filters),
  });
}

/**
 * Hook to fetch a single learning event by ID
 */
export function useLearningEvent(id: string) {
  return useQuery({
    queryKey: LEARNING_EVENT_KEYS.detail(id),
    queryFn: () => learningEventApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch learner activity feed
 */
export function useLearnerActivity(
  learnerId: string,
  filters?: Omit<LearningEventsFilters, 'learner'>
) {
  return useQuery({
    queryKey: LEARNING_EVENT_KEYS.learnerActivity(learnerId, filters),
    queryFn: () => learningEventApi.getLearnerActivity(learnerId, filters),
    enabled: !!learnerId,
  });
}

/**
 * Hook to fetch course activity feed
 */
export function useCourseActivity(
  courseId: string,
  filters?: Omit<LearningEventsFilters, 'course'>
) {
  return useQuery({
    queryKey: LEARNING_EVENT_KEYS.courseActivity(courseId, filters),
    queryFn: () => learningEventApi.getCourseActivity(courseId, filters),
    enabled: !!courseId,
  });
}

/**
 * Hook to fetch class activity feed
 */
export function useClassActivity(
  classId: string,
  filters?: Omit<LearningEventsFilters, 'class'>
) {
  return useQuery({
    queryKey: LEARNING_EVENT_KEYS.classActivity(classId, filters),
    queryFn: () => learningEventApi.getClassActivity(classId, filters),
    enabled: !!classId,
  });
}

/**
 * Hook to fetch activity statistics
 */
export function useActivityStats(filters?: StatsFilters) {
  return useQuery({
    queryKey: LEARNING_EVENT_KEYS.stats(filters),
    queryFn: () => learningEventApi.getStats(filters),
  });
}

/**
 * Hook to log a single learning event
 * Note: For better performance, consider using EventLogger for batching
 */
export function useLogLearningEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLearningEventData) => learningEventApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: LEARNING_EVENT_KEYS.lists() });

      if (variables.learnerId) {
        queryClient.invalidateQueries({
          queryKey: LEARNING_EVENT_KEYS.learnerActivity(variables.learnerId),
        });
      }

      if (variables.courseId) {
        queryClient.invalidateQueries({
          queryKey: LEARNING_EVENT_KEYS.courseActivity(variables.courseId),
        });
      }

      if (variables.classId) {
        queryClient.invalidateQueries({
          queryKey: LEARNING_EVENT_KEYS.classActivity(variables.classId),
        });
      }

      queryClient.invalidateQueries({ queryKey: LEARNING_EVENT_KEYS.stats() });
    },
  });
}

/**
 * Hook to log multiple learning events in a batch
 * Recommended for better performance
 */
export function useBatchLogEvents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (events: CreateLearningEventData[]) => learningEventApi.createBatch(events),
    onSuccess: () => {
      // Invalidate all event queries after batch
      queryClient.invalidateQueries({ queryKey: LEARNING_EVENT_KEYS.all });
    },
  });
}
