/**
 * React Query keys for content queries
 * Organized hierarchically for efficient cache invalidation
 */

import type {
  ContentFilters,
  ScormPackageFilters,
  MediaFileFilters,
} from './types';

const baseContentKeys = ['content'] as const;

export const contentKeys = {
  all: baseContentKeys,

  // Content overview (all types)
  lists: () => [...baseContentKeys, 'list'] as const,
  list: (filters?: ContentFilters) => [...baseContentKeys, 'list', filters] as const,

  details: () => [...baseContentKeys, 'detail'] as const,
  detail: (id: string) => [...baseContentKeys, 'detail', id] as const,

  // SCORM packages
  scorm: {
    all: [...baseContentKeys, 'scorm'] as const,
    lists: () => [...baseContentKeys, 'scorm', 'list'] as const,
    list: (filters?: ScormPackageFilters) =>
      [...baseContentKeys, 'scorm', 'list', filters] as const,
    details: () => [...baseContentKeys, 'scorm', 'detail'] as const,
    detail: (id: string) => [...baseContentKeys, 'scorm', 'detail', id] as const,
  },

  // Media library
  media: {
    all: [...baseContentKeys, 'media'] as const,
    lists: () => [...baseContentKeys, 'media', 'list'] as const,
    list: (filters?: MediaFileFilters) =>
      [...baseContentKeys, 'media', 'list', filters] as const,
    details: () => [...baseContentKeys, 'media', 'detail'] as const,
    detail: (id: string) => [...baseContentKeys, 'media', 'detail', id] as const,
  },
};
