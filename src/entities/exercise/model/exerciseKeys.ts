/**
 * React Query keys for Exercises
 */

import type { ExerciseFilters, GetQuestionsQuery } from './types';

export const exerciseKeys = {
  // All exercises
  all: ['exercises'] as const,

  // Lists
  lists: () => [...exerciseKeys.all, 'list'] as const,
  list: (filters?: ExerciseFilters) => [...exerciseKeys.lists(), filters] as const,

  // Details
  details: () => [...exerciseKeys.all, 'detail'] as const,
  detail: (id: string) => [...exerciseKeys.details(), id] as const,

  // Questions
  questions: (id: string) => [...exerciseKeys.detail(id), 'questions'] as const,
  questionsWithAnswers: (id: string, query?: GetQuestionsQuery) =>
    [...exerciseKeys.questions(id), query] as const,
};
