/**
 * React Query keys for program queries
 * Organized hierarchically for efficient cache invalidation
 */

import type {
  ProgramFilters,
  ProgramEnrollmentFilters,
} from './types';

export const programKeys = {
  all: ['programs'] as const,

  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters?: ProgramFilters) => [...programKeys.lists(), filters] as const,

  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,

  levels: () => [...programKeys.all, 'levels'] as const,
  programLevels: (id: string) => [...programKeys.levels(), id] as const,

  enrollments: () => [...programKeys.all, 'enrollments'] as const,
  programEnrollments: (id: string, filters?: ProgramEnrollmentFilters) =>
    [...programKeys.enrollments(), id, filters] as const,
};
