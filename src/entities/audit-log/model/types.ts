/**
 * Audit Log Entity Types
 */

export type ActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'download'
  | 'upload'
  | 'export'
  | 'import';

export type EntityType =
  | 'user'
  | 'course'
  | 'enrollment'
  | 'program'
  | 'class'
  | 'content'
  | 'exercise'
  | 'question'
  | 'template'
  | 'certificate'
  | 'report'
  | 'department'
  | 'academic-year'
  | 'staff'
  | 'learner';

export type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogChanges {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface AuditLogMetadata {
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: ActionType;
  entityType: EntityType;
  entityId?: string;
  entityName?: string;
  severity: SeverityLevel;
  ipAddress: string;
  description: string;
  changes?: AuditLogChanges[];
  metadata?: AuditLogMetadata;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: ActionType[];
  entityType?: EntityType;
  severity?: SeverityLevel[];
  ipAddress?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsListResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ExportAuditLogsPayload {
  format: 'csv' | 'excel' | 'json';
  filters?: AuditLogFilters;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportAuditLogsResponse {
  url: string;
  expiresAt: string;
}
