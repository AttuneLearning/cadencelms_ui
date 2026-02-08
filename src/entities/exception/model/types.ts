/**
 * Learner Exception Entity Types
 * Types for learner exception management (extra attempts, extended access, etc.)
 */

// =====================
// SHARED TYPES
// =====================

export type ExceptionType =
  | 'extra_attempts'
  | 'extended_access'
  | 'module_unlock'
  | 'grade_override'
  | 'excused_content';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GrantedByRef {
  id: string;
  firstName: string;
  lastName: string;
}

// =====================
// EXCEPTION TYPES
// =====================

export interface LearnerException {
  id: string;
  learnerId: string;
  learnerName: string;
  courseId: string;
  type: ExceptionType;
  details: Record<string, unknown>; // type-specific data
  reason: string;
  grantedBy: GrantedByRef;
  grantedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface LearnerExceptionListItem {
  id: string;
  learnerId: string;
  learnerName: string;
  courseId: string;
  type: ExceptionType;
  details: Record<string, unknown>;
  reason: string;
  grantedBy: GrantedByRef;
  grantedAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

// =====================
// TYPE-SPECIFIC DETAILS
// =====================

export interface ExtraAttemptsDetails {
  contentId: string;
  contentType: 'exercise' | 'exam' | 'quiz';
  additionalAttempts: number;
}

export interface ExtendedAccessDetails {
  newExpirationDate: string;
}

export interface ModuleUnlockDetails {
  moduleId: string;
  moduleName: string;
}

export interface GradeOverrideDetails {
  contentId: string;
  contentType: 'exercise' | 'exam' | 'module' | 'course';
  newGrade: number;
  originalGrade?: number;
}

export interface ExcusedContentDetails {
  contentId: string;
  contentType: 'exercise' | 'exam' | 'module';
  contentName: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

export interface GrantExceptionPayload {
  learnerId: string;
  courseId: string;
  type: ExceptionType;
  details: Record<string, unknown>;
  reason: string;
  expiresAt?: string;
}

export interface UpdateExceptionPayload {
  details?: Record<string, unknown>;
  reason?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export interface ExceptionFilters {
  page?: number;
  limit?: number;
  learnerId?: string;
  courseId?: string;
  type?: ExceptionType;
  isActive?: boolean;
  grantedBy?: string;
  sort?: string;
}

// =====================
// API RESPONSE TYPES
// =====================

export interface ExceptionsListResponse {
  exceptions: LearnerExceptionListItem[];
  pagination: Pagination;
}

export interface GrantExceptionResponse {
  exception: LearnerException;
}
