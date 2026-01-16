/**
 * Report Template Entity Types
 * Version: 1.0.0
 *
 * Types for report templates - saved report configurations that can be reused.
 */

import type {
  ReportType,
  ReportDefinition,
  ReportFilter,
  DateRangePreset,
  ReportOutputFormat,
  ReportVisibility,
} from '@/shared/types/report-builder';

// ============================================================================
// Main Report Template Entity
// ============================================================================

/**
 * Report Template entity
 * Represents a saved report configuration that can be reused
 */
export interface ReportTemplate {
  _id: string;
  organizationId: string;

  // Template Information
  name: string;
  slug: string;
  description?: string;
  category: string;
  tags: string[];

  // Report Configuration
  reportType: ReportType;
  definition: ReportDefinition;
  defaultFilters?: ReportFilter[];
  defaultDateRange?: DateRangePreset;

  // Versioning
  version: number;
  previousVersionId?: string;
  isLatest: boolean;

  // Access Control
  visibility: ReportVisibility;
  sharedWith?: string[];
  teamId?: string;
  requiredPermissions?: string[];
  requiredRoleLevel?: number;

  // Display
  icon?: string;
  color?: string;

  // Metadata
  isSystemTemplate: boolean;
  isDeleted: boolean;
  usageCount: number;

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

/**
 * Create report template request payload
 */
export interface CreateReportTemplateRequest {
  name: string;
  description?: string;
  type: 'predefined' | 'custom';
  predefinedType?: ReportType;
  customDefinition?: ReportDefinition;
  defaultFilters?: ReportFilter[];
  defaultDateRange?: DateRangePreset;
  defaultOutputFormat: ReportOutputFormat;
  visibility?: ReportVisibility;
  sharedWith?: string[];
  tags?: string[];
  category?: string;
  icon?: string;
  color?: string;
}

/**
 * Update report template request payload
 */
export interface UpdateReportTemplateRequest {
  name?: string;
  description?: string;
  defaultFilters?: ReportFilter[];
  defaultDateRange?: DateRangePreset;
  visibility?: ReportVisibility;
  sharedWith?: string[];
  tags?: string[];
  category?: string;
  icon?: string;
  color?: string;
}

/**
 * List report templates query parameters
 */
export interface ListReportTemplatesParams {
  type?: 'predefined' | 'custom';
  visibility?: 'private' | 'shared' | 'system';
  category?: string;
  tags?: string[];
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
 * List report templates response
 */
export interface ListReportTemplatesResponse {
  templates: ReportTemplate[];
  pagination: Pagination;
}

/**
 * Create template from job request
 */
export interface CreateTemplateFromJobRequest {
  jobId: string;
  name: string;
  description?: string;
}
