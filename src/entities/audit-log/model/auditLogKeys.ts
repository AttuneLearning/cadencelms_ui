/**
 * Query keys for audit log queries
 */

import type { AuditLogFilters } from './types';

export const auditLogKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters: AuditLogFilters) => [...auditLogKeys.lists(), filters] as const,
  details: () => [...auditLogKeys.all, 'detail'] as const,
  detail: (id: string) => [...auditLogKeys.details(), id] as const,
  related: (id: string) => [...auditLogKeys.all, 'related', id] as const,
};
