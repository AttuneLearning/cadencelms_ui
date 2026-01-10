/**
 * Hook for fetching single report template
 */

import { useQuery } from '@tanstack/react-query';
import { getReportTemplate } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';

export function useReportTemplate(templateId: string) {
  return useQuery({
    queryKey: reportKeys.templates.detail(templateId),
    queryFn: () => getReportTemplate(templateId),
    enabled: !!templateId,
  });
}
