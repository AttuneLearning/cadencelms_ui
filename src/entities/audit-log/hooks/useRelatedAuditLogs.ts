/**
 * React Query hook for fetching related audit logs
 */

import { useQuery } from '@tanstack/react-query';
import { getRelatedAuditLogs } from '../api/auditLogApi';
import { auditLogKeys } from '../model/auditLogKeys';

export function useRelatedAuditLogs(id: string) {
  return useQuery({
    queryKey: auditLogKeys.related(id),
    queryFn: () => getRelatedAuditLogs(id),
    enabled: !!id,
  });
}
