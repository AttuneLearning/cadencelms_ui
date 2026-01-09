/**
 * React Query keys for Templates
 */

import type { TemplateFilters, TemplatePreviewParams } from './types';

export const templateKeys = {
  // All templates
  all: ['templates'] as const,

  // Lists
  lists: () => [...templateKeys.all, 'list'] as const,
  list: (filters?: TemplateFilters) => [...templateKeys.lists(), filters] as const,

  // Details
  details: () => [...templateKeys.all, 'detail'] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const,

  // Preview
  previews: () => [...templateKeys.all, 'preview'] as const,
  preview: (id: string, params?: TemplatePreviewParams) =>
    [...templateKeys.previews(), id, params] as const,
};
