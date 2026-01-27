/**
 * React Query keys for question queries
 * Organized hierarchically for efficient cache invalidation
 * Updated for department-scoped API v1.1.0
 */

import type { QuestionListParams } from './types';

export const questionKeys = {
  all: ['questions'] as const,

  lists: () => [...questionKeys.all, 'list'] as const,
  list: (departmentId: string, params?: QuestionListParams) => 
    [...questionKeys.lists(), departmentId, params] as const,

  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (departmentId: string, id: string) => 
    [...questionKeys.details(), departmentId, id] as const,
};
