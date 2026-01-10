/**
 * Hook for deleting report template
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReportTemplate } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';

export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => deleteReportTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() });
    },
  });
}
