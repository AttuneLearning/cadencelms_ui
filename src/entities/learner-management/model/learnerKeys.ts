/**
 * React Query keys for learner queries
 */

import type { ListLearnersParams } from './types';

export const learnerKeys = {
  all: ['learners'] as const,
  lists: () => [...learnerKeys.all, 'list'] as const,
  list: (params?: ListLearnersParams) => [...learnerKeys.lists(), params] as const,
  details: () => [...learnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...learnerKeys.details(), id] as const,
};
