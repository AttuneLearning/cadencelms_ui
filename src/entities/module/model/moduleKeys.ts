/**
 * React Query keys for Modules
 */

import type { ModuleFilters } from './types';

export const moduleKeys = {
  // All modules
  all: ['modules'] as const,

  // Lists (by course)
  lists: () => [...moduleKeys.all, 'list'] as const,
  list: (courseId: string, filters?: ModuleFilters) =>
    [...moduleKeys.lists(), courseId, filters] as const,

  // Details
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (moduleId: string) => [...moduleKeys.details(), moduleId] as const,

  // With learning units
  withLearningUnits: (moduleId: string) =>
    [...moduleKeys.detail(moduleId), 'learning-units'] as const,

  // By course (for invalidation)
  byCourse: (courseId: string) => [...moduleKeys.all, 'course', courseId] as const,
};
