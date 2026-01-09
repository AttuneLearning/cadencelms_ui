/**
 * React Query keys for Courses
 */

import type { CourseFilters } from './types';

export const courseKeys = {
  // All courses
  all: ['courses'] as const,

  // Lists
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters?: CourseFilters) => [...courseKeys.lists(), filters] as const,

  // Details
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,

  // Export
  export: (id: string, format?: string) => [...courseKeys.detail(id), 'export', format] as const,

  // Statistics
  stats: (id: string) => [...courseKeys.detail(id), 'stats'] as const,
};
