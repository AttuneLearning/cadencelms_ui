/**
 * Hook for deleting a report
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReport } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';

export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
