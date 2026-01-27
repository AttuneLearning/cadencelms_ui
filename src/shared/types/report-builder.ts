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
  // Legacy single-field selector used by existing report-builder UI.
  field?: string;
  fields?: string[];
  // Legacy sort direction used by existing report-builder UI.
  sortBy?: 'asc' | 'desc';
  sortOrder?: number;
}

// Back-compat names used across the report-builder feature.
export type ReportDimension = DimensionConfig;

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
  // Legacy single-field selector used by existing report-builder UI.
  field?: string;
  // Legacy aggregation used by existing report-builder UI.
  aggregation?: AggregationFunction;
  targetField?: string;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  decimalPlaces?: number;
}

// Back-compat names used across the report-builder feature.
export type ReportMeasure = MeasureConfig;

// Aggregation functions referenced by the existing report-builder UI.
export type AggregationFunction = 'sum' | 'avg' | 'min' | 'max' | 'count';

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
  type?: SlicerType;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'between' | 'contains';
  value?: unknown;
  // Legacy fields-based slicer used by existing report-builder UI.
  field?: string;
  values?: Array<string | number | boolean>;
  label?: string;
}

// Back-compat names used across the report-builder feature.
export type ReportSlicer = SlicerConfig;

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
  // Current API shape.
  startDate?: string;
  endDate?: string;
  // Legacy shape used throughout the UI.
  start?: string;
  end?: string;
  preset?: DateRangePreset;
}

// ============================================================================
// Filters
// ============================================================================

export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'in'
  | 'notIn'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | Array<string | number | boolean>;
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
  groups: Array<GroupConfig | string>;
  filters?: ReportFilter[];
  sorting?: SortConfig[];
  pagination?: PaginationConfig;
}

// Back-compat name used by the report-builder feature UI.
export type CustomReportDefinition = ReportDefinition;

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
