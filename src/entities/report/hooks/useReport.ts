/**
 * Hook for fetching a single report
 */

import { useQuery } from '@tanstack/react-query';
import { getReport } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';

export function useReport(reportId: string) {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: () => getReport(reportId),
    enabled: !!reportId,
  });
}
