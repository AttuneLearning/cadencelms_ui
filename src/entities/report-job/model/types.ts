/**
 * Report Job Entity Types
 * Version: 1.0.0
 *
 * Types for report job queue system.
 * Jobs represent queued report generation requests with states, progress, and results.
 */

import type {
  ReportType,
  ReportDefinition,
  ReportFilter,
  DateRange,
  ReportOutputFormat,
  ReportVisibility,
  NotificationConfig,
} from '@/shared/types/report-builder';
import type { DataShapeWarningDetails } from '@/shared/types/data-shape-warning';

// ============================================================================
// Job States
// ============================================================================

/**
 * Report job lifecycle states (kebab-case)
 */
export type ReportJobState =
  | 'pending'
  | 'queued'
  | 'processing'
  | 'rendering'
  | 'uploading'
  | 'ready'
  | 'downloaded'
  | 'failed'
  | 'cancelled'
  | 'expired';

/**
 * Job priority levels
 */
export type ReportJobPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'critical'
  | 'scheduled';

// ============================================================================
// Job Result
// ============================================================================

/**
 * Report job result with file information
 */
export interface ReportJobResult {
  fileUrl: string;
  fileSize: number;
  rowCount: number;
  pageCount?: number;
  downloadCount: number;
  lastDownloadedAt?: string;
  checksum?: string;
}

// ============================================================================
// Job Error
// ============================================================================

/**
 * Report job error information
 */
export interface ReportJobError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  occurredAt: string;
}

// ============================================================================
// Job Metrics
// ============================================================================

/**
 * Performance metrics for report job
 */
export interface ReportJobMetrics {
  queueWaitTimeMs?: number;
  queryTimeMs?: number;
  renderTimeMs?: number;
  uploadTimeMs?: number;
  totalTimeMs?: number;
  dataRowsProcessed?: number;
  memoryUsedMB?: number;
  retryCount?: number;
}

// ============================================================================
// Main Report Job Entity
// ============================================================================

/**
 * Report Job entity
 * Represents a queued report generation request
 */
export interface ReportJob {
  _id: string;
  organizationId: string;
  reportType: ReportType;
  templateId?: string;
  name: string;
  description?: string;

  // Job State
  state: ReportJobState;
  priority: ReportJobPriority;

  // Report Configuration
  definition: ReportDefinition;
  filters: ReportFilter[];
  dateRange: DateRange;
  outputFormat: ReportOutputFormat;

  // Results & Errors
  result?: ReportJobResult;
  error?: ReportJobError;
  metrics?: ReportJobMetrics;

  // Access Control
  visibility: ReportVisibility;
  sharedWith?: string[];
  teamId?: string;

  // Notifications
  notifications?: NotificationConfig;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Create report job request payload
 */
export interface CreateReportJobRequest {
  name: string;
  description?: string;
  type: 'predefined' | 'custom' | 'from-template';
  predefinedType?: ReportType;
  customDefinition?: ReportDefinition;
  templateId?: string;
  filters?: ReportFilter[];
  dateRange?: DateRange;
  outputFormat: ReportOutputFormat;
  priority?: ReportJobPriority;
  visibility?: ReportVisibility;
  sharedWith?: string[];
  notifyOnComplete?: boolean;
  notifyEmails?: string[];
}

/**
 * List report jobs query parameters
 */
export interface ListReportJobsParams {
  status?: ReportJobState[];
  type?: 'predefined' | 'custom' | 'from-template';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * List report jobs response
 */
export interface ListReportJobsResponse {
  jobs: ReportJob[];
  pagination?: Pagination;
  totalCount?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  shapeWarning?: DataShapeWarningDetails;
}

/**
 * Get report job status response (lightweight for polling)
 */
export interface ReportJobStatusResponse {
  id: string;
  state: ReportJobState;
  progress: number;
  estimatedTimeRemaining?: number;
  fileUrl?: string;
  error?: Pick<ReportJobError, 'code' | 'message'>;
}

/**
 * Get download URL response
 */
export interface ReportJobDownloadResponse {
  downloadUrl: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  expiresAt: string;
}
