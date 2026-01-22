/**
 * React Query keys for Assessments
 */

import type { AssessmentFilters } from './types';

export const assessmentKeys = {
  // All assessments
  all: ['assessments'] as const,

  // Lists
  lists: () => [...assessmentKeys.all, 'list'] as const,
  list: (filters?: AssessmentFilters) => [...assessmentKeys.lists(), filters] as const,

  // Details
  details: () => [...assessmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assessmentKeys.details(), id] as const,

  // By department (for invalidation)
  byDepartment: (departmentId: string) =>
    [...assessmentKeys.all, 'department', departmentId] as const,

  // By style
  byStyle: (style: string) => [...assessmentKeys.all, 'style', style] as const,

  // Statistics
  stats: (id: string) => [...assessmentKeys.detail(id), 'stats'] as const,
};
