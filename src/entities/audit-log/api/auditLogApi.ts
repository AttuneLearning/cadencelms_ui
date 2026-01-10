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
