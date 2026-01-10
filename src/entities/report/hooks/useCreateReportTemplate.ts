/**
 * Hook for creating report template
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReportTemplate } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';
import type { CreateReportTemplatePayload } from '../model/types';

export function useCreateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportTemplatePayload) => createReportTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() });
    },
  });
}
