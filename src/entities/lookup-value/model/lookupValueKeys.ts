/**
 * React Query keys for Lookup Values
 */

import type { LookupValuesFilters } from './types';

export const lookupValueKeys = {
  all: ['lookup-values'] as const,
  lists: () => [...lookupValueKeys.all, 'list'] as const,
  list: (filters?: LookupValuesFilters) => [...lookupValueKeys.lists(), filters] as const,
};
