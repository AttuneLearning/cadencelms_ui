/**
 * Hook for generating a report
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReport } from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';
import type { CreateReportPayload } from '../model/types';

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportPayload) => createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}
