/**
 * React Query keys for Forum
 */

import type { ThreadFilters } from './types';

export const forumKeys = {
  // All forum data
  all: ['forum'] as const,

  // Thread lists
  lists: () => [...forumKeys.all, 'list'] as const,
  list: (filters?: ThreadFilters) => [...forumKeys.lists(), filters] as const,

  // Thread details
  details: () => [...forumKeys.all, 'detail'] as const,
  detail: (threadId: string) => [...forumKeys.details(), threadId] as const,

  // Course threads
  courseThreads: (courseId: string, filters?: ThreadFilters) =>
    [...forumKeys.all, 'course', courseId, filters] as const,

  // Module threads
  moduleThreads: (moduleId: string, filters?: ThreadFilters) =>
    [...forumKeys.all, 'module', moduleId, filters] as const,
};
