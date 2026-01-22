/**
 * React Query keys for Learning Units
 */

import type { LearningUnitFilters } from './types';

export const learningUnitKeys = {
  // All learning units
  all: ['learning-units'] as const,

  // Lists (by module)
  lists: () => [...learningUnitKeys.all, 'list'] as const,
  list: (moduleId: string, filters?: LearningUnitFilters) =>
    [...learningUnitKeys.lists(), moduleId, filters] as const,

  // Details
  details: () => [...learningUnitKeys.all, 'detail'] as const,
  detail: (learningUnitId: string) => [...learningUnitKeys.details(), learningUnitId] as const,

  // By module (for invalidation)
  byModule: (moduleId: string) => [...learningUnitKeys.all, 'module', moduleId] as const,

  // By category
  byCategory: (moduleId: string, category: string) =>
    [...learningUnitKeys.list(moduleId), 'category', category] as const,
};
