/**
 * Grade Override Types
 * Types for dept-admin grade override functionality with audit logging
 *
 * API Endpoints:
 * - PUT /api/v2/enrollments/:enrollmentId/grades/override
 * - GET /api/v2/enrollments/:enrollmentId/grades/history
 *
 * Authorization: academic:grades:override access right required
 */

// =====================
// GRADE OVERRIDE TYPES
// =====================

/**
 * Grade Override Request Payload
 * At least one grade field must be provided
 * Reason is mandatory (10-1000 characters)
 */
export interface GradeOverridePayload {
  /** Grade letter (A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F) */
  gradeLetter?: string;
  /** Grade percentage (0-100) */
  gradePercentage?: number;
  /** Grade points (0-4.0) */
  gradePoints?: number;
  /** Required explanation for override (10-1000 chars) */
  reason: string;
}

/**
 * Grade Change Details
 * Shows previous and new values for a specific grade field
 */
export interface GradeChange {
  previous: number | string | null;
  new: number | string | null;
}

/**
 * Grade Override Response
 * Returned after successful grade override
 * Includes audit trail information
 */
export interface GradeOverrideResponse {
  enrollmentId: string;
  gradeChanges: {
    gradeLetter?: GradeChange;
    gradePercentage?: GradeChange;
    gradePoints?: GradeChange;
  };
  overrideBy: string;
  overrideByName: string;
  overrideAt: string;
  reason: string;
  changeLogId: string;
}

/**
 * Grade History Entry
 * Immutable audit log entry for grade changes
 */
export interface GradeHistoryEntry {
  id: string;
  enrollmentId: string;
  classId?: string;
  courseId?: string;
  learnerId?: string;
  fieldChanged: 'gradeLetter' | 'gradePercentage' | 'gradePoints' | 'all';
  previousGradeLetter?: string | null;
  newGradeLetter?: string | null;
  previousGradePercentage?: number | null;
  newGradePercentage?: number | null;
  previousGradePoints?: number | null;
  newGradePoints?: number | null;
  changedBy: string;
  changedByRole: string;
  changedAt: string;
  reason: string;
  changeType: 'override';
  departmentId?: string;
  termId?: string;
}

/**
 * Grade History Query Parameters
 * Optional filters for grade history endpoint
 */
export interface GradeHistoryParams {
  startDate?: string;
  endDate?: string;
}

/**
 * Grade History Response
 * Array of grade change log entries
 */
export interface GradeHistoryResponse {
  success: boolean;
  data: GradeHistoryEntry[];
}

// =====================
// VALIDATION CONSTANTS
// =====================

/**
 * Valid grade letters
 */
export const VALID_GRADE_LETTERS = [
  'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-',
  'D+', 'D', 'D-',
  'F'
] as const;

export type ValidGradeLetter = typeof VALID_GRADE_LETTERS[number];

/**
 * Validation constraints
 */
export const GRADE_OVERRIDE_VALIDATION = {
  REASON_MIN_LENGTH: 10,
  REASON_MAX_LENGTH: 1000,
  PERCENTAGE_MIN: 0,
  PERCENTAGE_MAX: 100,
  POINTS_MIN: 0,
  POINTS_MAX: 4.0,
} as const;

// =====================
// UI HELPER TYPES
// =====================

/**
 * Current Grade Display
 * Used to show current grade values in override dialog
 */
export interface CurrentGrade {
  letter?: string | null;
  percentage?: number | null;
  points?: number | null;
  gradedAt?: string | null;
  gradedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

/**
 * Grade Override Form Values
 * Used by react-hook-form for grade override dialog
 */
export interface GradeOverrideFormValues {
  gradeLetter?: string;
  gradePercentage?: number;
  gradePoints?: number;
  reason: string;
}
