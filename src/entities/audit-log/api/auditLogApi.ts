/**
 * Audit Log API Functions
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogsListResponse,
  ExportAuditLogsPayload,
  ExportAuditLogsResponse,
} from '../model/types';

/**
 * List audit logs with filters
 */
export async function listAuditLogs(
  filters: AuditLogFilters = {}
): Promise<AuditLogsListResponse> {
  const response = await client.get<{ success: boolean; data: AuditLogsListResponse }>(
    endpoints.auditLogs.list,
    { params: filters }
  );
  return response.data.data;
}

/**
 * Get a single audit log by ID
 */
export async function getAuditLog(id: string): Promise<AuditLog> {
  const response = await client.get<{ success: boolean; data: AuditLog }>(
    endpoints.auditLogs.byId(id)
  );
  return response.data.data;
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(
  payload: ExportAuditLogsPayload
): Promise<ExportAuditLogsResponse> {
  const response = await client.post<{ success: boolean; data: ExportAuditLogsResponse }>(
    endpoints.auditLogs.export,
    payload
  );
  return response.data.data;
}

/**
 * Export a single audit log
 */
export async function exportSingleAuditLog(
  id: string,
  format: 'csv' | 'excel' | 'json'
): Promise<ExportAuditLogsResponse> {
  const response = await client.post<{ success: boolean; data: ExportAuditLogsResponse }>(
    endpoints.auditLogs.export,
    {
      logIds: [id],
      format,
      applyFilters: false,
    }
  );
  return response.data.data;
}

/**
 * Get related audit logs (same user or entity within time window)
 */
export async function getRelatedAuditLogs(
  logId: string,
  options?: { limit?: number; timeWindow?: number }
): Promise<AuditLog[]> {
  const log = await getAuditLog(logId);
  const filters: AuditLogFilters = {
    limit: options?.limit || 10,
  };

  // Get logs from the same user or related to the same entity
  // within a time window (default 1 hour before and after)
  const timeWindow = options?.timeWindow || 3600000; // 1 hour in milliseconds
  const logTime = new Date(log.timestamp).getTime();

  filters.dateFrom = new Date(logTime - timeWindow).toISOString();
  filters.dateTo = new Date(logTime + timeWindow).toISOString();

  // Filter by either same user or same entity
  if (log.userId) {
    filters.userId = log.userId;
  }
  if (log.entityType && log.entityId) {
    filters.entityType = log.entityType;
    filters.entityId = log.entityId;
  }

  const response = await listAuditLogs(filters);

  // Filter out the current log and return related ones
  return response.logs.filter(l => l.id !== logId);
}
