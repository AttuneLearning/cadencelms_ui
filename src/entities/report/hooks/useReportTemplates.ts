/**
 * Hook for fetching report templates
 */

import { useQuery } from '@tanstack/react-query';
import { listReportTemplates } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';
import type { TemplateFilters } from '../model/types';

export function useReportTemplates(filters?: TemplateFilters) {
  return useQuery({
    queryKey: reportKeys.templates.list(filters),
    queryFn: () => listReportTemplates(filters),
  });
}
