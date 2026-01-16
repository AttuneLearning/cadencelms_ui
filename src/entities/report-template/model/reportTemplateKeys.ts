/**
 * Report Template Query Keys
 * Version: 1.0.0
 *
 * React Query cache keys for report templates.
 */

import type { ListReportTemplatesParams } from './types';

export const reportTemplateKeys = {
  all: ['report-templates'] as const,
  lists: () => [...reportTemplateKeys.all, 'list'] as const,
  list: (params: ListReportTemplatesParams) => [...reportTemplateKeys.lists(), params] as const,
  my: () => [...reportTemplateKeys.all, 'my'] as const,
  system: () => [...reportTemplateKeys.all, 'system'] as const,
  details: () => [...reportTemplateKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportTemplateKeys.details(), id] as const,
};
