/**
 * React Query hook for exporting audit logs
 */

import { useMutation } from '@tanstack/react-query';
import { exportAuditLogs, exportSingleAuditLog } from '../api/auditLogApi';
import type { ExportAuditLogsPayload } from '../model/types';

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: (payload: ExportAuditLogsPayload) => exportAuditLogs(payload),
  });
}

export function useExportSingleAuditLog() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'csv' | 'excel' | 'json' }) =>
      exportSingleAuditLog(id, format),
  });
}
