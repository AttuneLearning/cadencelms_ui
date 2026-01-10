/**
 * Hook for updating report template
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReportTemplate } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';
import type { UpdateReportTemplatePayload } from '../model/types';

export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReportTemplatePayload }) =>
      updateReportTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() });
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.details() });
    },
  });
}
