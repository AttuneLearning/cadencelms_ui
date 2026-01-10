/**
 * React Query hook for fetching a single audit log
 */

import { useQuery } from '@tanstack/react-query';
import { getAuditLog } from '../api/auditLogApi';
import { auditLogKeys } from '../model/auditLogKeys';

export function useAuditLog(id: string) {
  return useQuery({
    queryKey: auditLogKeys.detail(id),
    queryFn: () => getAuditLog(id),
    enabled: !!id,
  });
}
