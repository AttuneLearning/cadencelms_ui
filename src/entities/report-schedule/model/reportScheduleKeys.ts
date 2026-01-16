/**
 * Report Schedule Query Keys
 * Version: 1.0.0
 *
 * React Query cache keys for report schedules.
 */

import type { ListReportSchedulesParams } from './types';

export const reportScheduleKeys = {
  all: ['report-schedules'] as const,
  lists: () => [...reportScheduleKeys.all, 'list'] as const,
  list: (params: ListReportSchedulesParams) => [...reportScheduleKeys.lists(), params] as const,
  details: () => [...reportScheduleKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportScheduleKeys.details(), id] as const,
};
