/**
 * Class Query Keys
 * Query key factory for React Query
 */

import type { ClassFilters } from './types';

export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (filters?: ClassFilters) => [...classKeys.lists(), filters] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  roster: (id: string, params?: { includeProgress?: boolean; status?: string }) =>
    [...classKeys.detail(id), 'roster', params] as const,
  enrollments: (id: string, params?: { status?: string; page?: number; limit?: number }) =>
    [...classKeys.detail(id), 'enrollments', params] as const,
  progress: (id: string) => [...classKeys.detail(id), 'progress'] as const,
  stats: (id: string) => [...classKeys.detail(id), 'stats'] as const,
};
