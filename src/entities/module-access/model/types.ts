/**
 * Module Access Entity Types
 * Generated from: api/contracts/api/module-access.contract.ts v1.0.0
 *
 * ModuleAccess tracks learner access and engagement at the module level.
 * Used for analytics, progress tracking, and identifying drop-off points.
 *
 * Endpoints: /module-access, /module-access/analytics/drop-off
 */

// =====================
// ENUMS & LITERAL TYPES
// =====================

/**
 * Module Access Status
 * - not_accessed: Module has never been opened
 * - accessed: Module was opened but no learning unit started
 * - in_progress: Learner has started at least one learning unit
 * - completed: All required learning units completed
 */
export type ModuleAccessStatus = 'not_accessed' | 'accessed' | 'in_progress' | 'completed';

// =====================
// NESTED TYPES
// =====================

/**
 * Module Access Analytics - Aggregate metrics for a module
 */
export interface ModuleAccessAnalytics {
  totalAccessed: number;
  startedLearningUnit: number;
  completed: number;
  dropOffRate: number; // (accessed - startedLearningUnit) / accessed
  averageAccessCount: number;
  averageTimeToFirstUnit: number | null; // in seconds
}

/**
 * Module Metrics - Metrics for course summary view
 */
export interface ModuleMetrics {
  totalAccessed: number;
  accessedPercent: number;
  startedLearningUnit: number;
  startedPercent: number;
  completed: number;
  completedPercent: number;
  dropOffCount: number;
  dropOffPercent: number;
}

/**
 * Course Funnel - Progression through course
 */
export interface CourseFunnel {
  enrolled: number;
  startedCourse: number;
  reachedMidpoint: number;
  completedCourse: number;
}

/**
 * Enrollment Summary - Summary of module progress
 */
export interface ModuleAccessSummary {
  totalModules: number;
  modulesAccessed: number;
  modulesInProgress: number;
  modulesCompleted: number;
  overallProgress: number; // 0-1
}

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// MODULE ACCESS ENTITY TYPES
// =====================

/**
 * Module Access Record - Tracks individual learner access to a module
 */
export interface ModuleAccess {
  moduleAccessId: string;
  moduleId: string;
  moduleTitle?: string;
  moduleOrder?: number;
  learnerId: string;
  learnerName?: string;
  enrollmentId: string;
  courseId: string;
  firstAccessedAt: string | null;
  lastAccessedAt: string | null;
  accessCount: number;
  hasStartedLearningUnit: boolean;
  firstLearningUnitStartedAt: string | null;
  learningUnitsCompleted: number;
  learningUnitsTotal: number;
  status: ModuleAccessStatus;
  completedAt: string | null;
}

/**
 * Module Access Response - Response from recording access
 */
export interface RecordAccessResponse {
  moduleAccessId: string;
  moduleId: string;
  learnerId: string;
  enrollmentId: string;
  courseId: string;
  firstAccessedAt: string;
  lastAccessedAt: string;
  accessCount: number;
  hasStartedLearningUnit: boolean;
  status: ModuleAccessStatus;
  isNewAccess: boolean;
}

/**
 * Module Summary Item - For course-level module access summary
 */
export interface ModuleSummaryItem {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  metrics: ModuleMetrics;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Record Access Payload
 */
export interface RecordAccessPayload {
  enrollmentId: string;
  courseId: string;
}

/**
 * Update Progress Payload
 */
export interface UpdateProgressPayload {
  learningUnitsCompleted: number;
  learningUnitsTotal: number;
}

// =====================
// QUERY FILTER TYPES
// =====================

/**
 * Module Access Filters
 */
export interface ModuleAccessFilters {
  hasStartedLearningUnit?: boolean;
  status?: ModuleAccessStatus;
  page?: number;
  limit?: number;
}

/**
 * Course Summary Filters
 */
export interface CourseSummaryFilters {
  classId?: string;
}

// =====================
// RESPONSE TYPES
// =====================

/**
 * Get Module Access by Enrollment Response
 */
export interface EnrollmentModuleAccessResponse {
  accessRecords: ModuleAccess[];
  pagination: Pagination;
}

/**
 * Get Module Access by Module Response (Analytics)
 */
export interface ModuleAccessAnalyticsResponse {
  accessRecords: ModuleAccess[];
  pagination: Pagination;
}

/**
 * Module access summary metrics (drop-off endpoint)
 */
export interface ModuleAccessSummaryMetrics {
  totalModules: number;
  totalAccess: number;
  accessedOnly: number;
  inProgress: number;
  completed: number;
  dropOffRate: number;
  dropOffPercentage: number;
}

/**
 * Module access summary insights (drop-off endpoint)
 */
export interface ModuleAccessSummaryInsights {
  learnersNotStartingContent: number;
  learnersStuckInProgress: number;
  completionRate: number;
}

/**
 * Course Module Access Summary Response (drop-off analytics)
 */
export interface CourseModuleAccessSummaryResponse {
  courseId: string;
  metrics: ModuleAccessSummaryMetrics;
  insights: ModuleAccessSummaryInsights;
}

/**
 * Shared response shape for action-based module-access updates
 */
export interface ModuleAccessActionResponse {
  moduleAccessId: string;
  moduleId: string;
  learnerId: string;
  hasStartedLearningUnit: boolean;
  firstLearningUnitStartedAt: string | null;
  learningUnitsCompleted: number;
  learningUnitsTotal: number;
  status: ModuleAccessStatus;
  completedAt: string | null;
}

/**
 * Mark Learning Unit Started Response
 */
export type MarkLearningUnitStartedResponse = ModuleAccessActionResponse;

/**
 * Update Progress Response
 */
export type UpdateProgressResponse = ModuleAccessActionResponse;

// =====================
// UTILITY TYPES
// =====================

/**
 * Calculate progress percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100) / 100;
}

/**
 * Check if module is completed
 */
export function isModuleCompleted(access: ModuleAccess): boolean {
  return access.status === 'completed';
}

/**
 * Check if learner has started any content
 */
export function hasStartedContent(access: ModuleAccess): boolean {
  return access.hasStartedLearningUnit;
}

/**
 * Calculate drop-off rate from analytics
 */
export function calculateDropOffRate(accessed: number, started: number): number {
  if (accessed === 0) return 0;
  return Math.round(((accessed - started) / accessed) * 100) / 100;
}
