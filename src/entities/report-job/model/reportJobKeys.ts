/**
 * Report Job Query Keys
 * Version: 1.0.0
 *
 * React Query cache keys for report jobs.
 * Follows the hierarchical key structure for efficient cache invalidation.
 */

import type { ListReportJobsParams } from './types';

export const reportJobKeys = {
  all: ['report-jobs'] as const,
  lists: () => [...reportJobKeys.all, 'list'] as const,
  list: (params: ListReportJobsParams) => [...reportJobKeys.lists(), params] as const,
  details: () => [...reportJobKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportJobKeys.details(), id] as const,
  status: (id: string) => [...reportJobKeys.detail(id), 'status'] as const,
  download: (id: string) => [...reportJobKeys.detail(id), 'download'] as const,
};
