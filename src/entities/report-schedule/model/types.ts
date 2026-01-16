/**
 * Report Schedule Entity Types
 * Version: 1.0.0
 *
 * Types for scheduled/recurring reports.
 */

import type {
  ReportType,
  ReportDefinition,
  ReportOutputFormat,
  ReportVisibility,
} from '@/shared/types/report-builder';

// ============================================================================
// Schedule Frequency
// ============================================================================

/**
 * Schedule frequency types (kebab-case)
 */
export type ScheduleFrequency =
  | 'once'
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

// ============================================================================
// Schedule Configuration
// ============================================================================

/**
 * Schedule configuration
 */
export interface ScheduleConfig {
  frequency: ScheduleFrequency;
  cronExpression?: string;
  timezone: string;
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time?: string; // HH:mm
  startDate?: string;
  endDate?: string;
}

/**
 * Email delivery configuration
 */
export interface EmailDeliveryConfig {
  recipients: string[];
  subject?: string;
  body?: string;
  attachReport: boolean;
}

/**
 * Storage delivery configuration
 */
export interface StorageDeliveryConfig {
  location: string;
  retentionDays: number;
}

/**
 * Webhook delivery configuration
 */
export interface WebhookDeliveryConfig {
  url: string;
  headers?: Record<string, string>;
}

/**
 * Delivery configuration
 */
export interface DeliveryConfig {
  email?: EmailDeliveryConfig;
  storage?: StorageDeliveryConfig;
  webhook?: WebhookDeliveryConfig;
}

// ============================================================================
// Main Report Schedule Entity
// ============================================================================

/**
 * Report Schedule entity
 * Represents a recurring report generation configuration
 */
export interface ReportSchedule {
  _id: string;
  organizationId: string;

  // Schedule Information
  name: string;
  description?: string;
  templateId?: string;
  reportType: ReportType;
  definition: ReportDefinition;

  // Schedule Configuration
  schedule: ScheduleConfig;
  outputFormat: ReportOutputFormat;
  delivery: DeliveryConfig;

  // State
  isActive: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  lastJobId?: string;
  consecutiveFailures: number;
  maxConsecutiveFailures: number;

  // Access Control
  visibility: ReportVisibility;
  createdBy: string;

  // Audit
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Create report schedule request payload
 */
export interface CreateReportScheduleRequest {
  name: string;
  description?: string;
  templateId?: string;
  reportType: ReportType;
  definition: ReportDefinition;
  schedule: ScheduleConfig;
  outputFormat: ReportOutputFormat;
  delivery: DeliveryConfig;
  visibility?: ReportVisibility;
}

/**
 * Update report schedule request payload
 */
export interface UpdateReportScheduleRequest {
  name?: string;
  description?: string;
  schedule?: ScheduleConfig;
  outputFormat?: ReportOutputFormat;
  delivery?: DeliveryConfig;
  visibility?: ReportVisibility;
  isActive?: boolean;
}

/**
 * List report schedules query parameters
 */
export interface ListReportSchedulesParams {
  isActive?: boolean;
  templateId?: string;
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
 * List report schedules response
 */
export interface ListReportSchedulesResponse {
  schedules: ReportSchedule[];
  pagination: Pagination;
}
