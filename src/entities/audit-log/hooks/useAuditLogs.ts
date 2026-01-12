/**
 * React Query hook for listing audit logs
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { listAuditLogs } from '../api/auditLogApi';
import { auditLogKeys } from '../model/auditLogKeys';
import type { AuditLogFilters, AuditLogsListResponse } from '../model/types';

export function useAuditLogs(
  filters: AuditLogFilters = {},
  options?: Omit<
    UseQueryOptions<
      AuditLogsListResponse,
      Error,
      AuditLogsListResponse,
      ReturnType<typeof auditLogKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: () => listAuditLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}
