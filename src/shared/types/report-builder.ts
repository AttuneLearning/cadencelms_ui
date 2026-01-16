/**
 * Report Builder Types
 * Version: 1.0.0
 *
 * Types for custom report builder - dimensions, measures, slicers, groups.
 * All enum values use kebab-case per API convention.
 */

// ============================================================================
// Report Types
// ============================================================================

/**
 * Report types (kebab-case)
 * These are the pre-defined report types available in the system
 */
export type ReportType =
  | 'enrollment-summary'
  | 'completion-rates'
  | 'performance-analysis'
  | 'learner-activity'
  | 'course-analytics'
  | 'instructor-workload'
  | 'department-overview'
  | 'program-progress'
  | 'assessment-results'
  | 'scorm-attempts'
  | 'transcript'
  | 'certification-status'
  | 'custom';

// ============================================================================
// Dimensions (Row Entities)
// ============================================================================

/**
 * Dimension types define WHAT you're reporting on - the primary entity for each row
 */
export type DimensionType =
  | 'learner'
  | 'course'
  | 'class'
  | 'program'
  | 'department'
  | 'instructor'
  | 'enrollment'
  | 'activity'
  | 'assessment'
  | 'scorm-attempt';

export interface DimensionConfig {
  type: DimensionType;
  label?: string;
  fields?: string[];
  sortOrder?: number;
}

// ============================================================================
// Measures (Calculated Values)
// ============================================================================

/**
 * Measure types - calculated values for each dimension
 */
export type MeasureType =
  | 'count'
  | 'average'
  | 'sum'
  | 'min'
  | 'max'
  | 'completion-rate'
  | 'pass-rate'
  | 'fail-rate'
  | 'average-score'
  | 'average-time-spent'
  | 'total-time-spent'
  | 'average-attempts'
  | 'first-attempt-pass-rate'
  | 'engagement-rate'
  | 'event-count'
  | 'unique-users'
  | 'enrollment-count'
  | 'dropout-rate'
  | 'on-time-completion-rate';

export interface MeasureConfig {
  type: MeasureType;
  label?: string;
  targetField?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  decimalPlaces?: number;
}

// ============================================================================
// Slicers (Column Breakdown / Filters)
// ============================================================================

/**
 * Slicer types - how to filter/break down the data
 */
export type SlicerType =
  | 'date-range'
  | 'department-id'
  | 'course-id'
  | 'class-id'
  | 'program-id'
  | 'enrollment-status'
  | 'completion-status'
  | 'instructor-id'
  | 'event-type'
  | 'content-type'
  | 'assessment-type'
  | 'passing-status'
  | 'role-level';

export interface SlicerConfig {
  type: SlicerType;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between' | 'contains';
  value: unknown;
  label?: string;
}

// ============================================================================
// Groups (Aggregation Buckets)
// ============================================================================

/**
 * Group types - how to aggregate/bucket the data
 */
export type GroupType =
  | 'day'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'department'
  | 'course'
  | 'class'
  | 'instructor'
  | 'status';

export interface GroupConfig {
  type: GroupType;
  label?: string;
  sortBy?: 'label' | 'value';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

// ============================================================================
// Sorting & Pagination
// ============================================================================

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}

// ============================================================================
// Date Ranges
// ============================================================================

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last-7-days'
  | 'last-30-days'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'last-year'
  | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
  preset?: DateRangePreset;
}

// ============================================================================
// Filters
// ============================================================================

export interface ReportFilter {
  field: string;
  operator: string;
  value: unknown;
}

// ============================================================================
// Report Definition (Custom Reports)
// ============================================================================

/**
 * Complete report definition for custom reports
 * Defines dimensions, measures, slicers, groups, filters, and display options
 */
export interface ReportDefinition {
  dimensions: DimensionConfig[];
  measures: MeasureConfig[];
  slicers: SlicerConfig[];
  groups: GroupConfig[];
  sorting?: SortConfig[];
  pagination?: PaginationConfig;
}

// ============================================================================
// Output Formats
// ============================================================================

export type ReportOutputFormat = 'pdf' | 'excel' | 'csv' | 'json';

// ============================================================================
// Visibility Levels
// ============================================================================

/**
 * Report visibility levels (4 levels per API recommendation)
 */
export type ReportVisibility = 'private' | 'team' | 'department' | 'organization';

// ============================================================================
// Notification Channels
// ============================================================================

export type NotificationChannel = 'email' | 'in-app' | 'slack' | 'webhook';

export interface NotificationConfig {
  onComplete?: NotificationChannel[];
  onFailure?: NotificationChannel[];
  recipients?: string[];
}
