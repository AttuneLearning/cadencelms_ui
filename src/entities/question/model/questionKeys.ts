/**
 * React Query keys for question queries
 * Organized hierarchically for efficient cache invalidation
 */

import type { QuestionListParams } from './types';

export const questionKeys = {
  all: ['questions'] as const,

  lists: () => [...questionKeys.all, 'list'] as const,
  list: (params?: QuestionListParams) => [...questionKeys.lists(), params] as const,

  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
};
