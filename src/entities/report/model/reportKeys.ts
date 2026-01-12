/**
 * React Query keys for Reports
 */

import type { ReportFilters, TemplateFilters } from './types';

export const reportKeys = {
  // All reports
  all: ['reports'] as const,

  // Report Lists
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (filters?: ReportFilters) => [...reportKeys.lists(), filters] as const,

  // Report Details
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,

  // Report Download
  download: (id: string, format: string) => [...reportKeys.all, 'download', id, format] as const,

  // Report Templates
  templates: {
    all: ['reportTemplates'] as const,
    lists: () => [...reportKeys.templates.all, 'list'] as const,
    list: (filters?: TemplateFilters) => [...reportKeys.templates.lists(), filters] as const,
    details: () => [...reportKeys.templates.all, 'detail'] as const,
    detail: (id: string) => [...reportKeys.templates.details(), id] as const,
  },
};
