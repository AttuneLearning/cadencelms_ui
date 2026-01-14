/**
 * Course Module Query Keys
 * Centralized query key factory for React Query
 */

import type { CourseModuleFilters } from './types';

export const courseModuleKeys = {
  all: ['courseModules'] as const,
  lists: () => [...courseModuleKeys.all, 'list'] as const,
  list: (courseId: string, filters?: CourseModuleFilters) =>
    [...courseModuleKeys.lists(), courseId, filters] as const,
  details: () => [...courseModuleKeys.all, 'detail'] as const,
  detail: (courseId: string, moduleId: string) =>
    [...courseModuleKeys.details(), courseId, moduleId] as const,
};
