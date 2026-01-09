/**
 * React Query keys for program level queries
 * Organized hierarchically for efficient cache invalidation
 */

export const programLevelKeys = {
  all: ['program-levels'] as const,

  details: () => [...programLevelKeys.all, 'detail'] as const,
  detail: (id: string) => [...programLevelKeys.details(), id] as const,
};
