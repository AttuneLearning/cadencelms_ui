/**
 * Course Version Entity Types
 * Comprehensive types for the course versioning system
 * Based on: COURSE_VERSIONING_TYPES.md
 */

import type { CourseSettings, InstructorRef } from '@/entities/course';

// =====================
// CANONICAL COURSE
// =====================

/**
 * CanonicalCourse - The stable identity of a course across all versions.
 * This is the "concept" of the course that persists as versions evolve.
 */
export interface CanonicalCourse {
  id: string;
  code: string;
  departmentId: string;
  programId: string | null;

  // Current state
  currentPublishedVersionId: string | null;
  latestDraftVersionId: string | null;
  totalVersions: number;

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * CanonicalCourse list item for API responses
 */
export interface CanonicalCourseListItem {
  id: string;
  code: string;
  department: { id: string; name: string };
  program: { id: string; name: string } | null;
  currentPublishedVersion: {
    id: string;
    version: number;
    title: string;
  } | null;
  latestDraftVersion: {
    id: string;
    version: number;
    title: string;
  } | null;
  totalVersions: number;
  createdAt: string;
}

// =====================
// COURSE VERSION
// =====================

/**
 * CourseVersion status lifecycle
 */
export type CourseVersionStatus = 'draft' | 'published' | 'archived';

/**
 * Reason a version was locked
 */
export type LockReason = 'superseded' | 'archived' | 'manual' | 'new_version_created';

/**
 * CourseVersion - An immutable snapshot of a course at a point in time.
 */
export interface CourseVersion {
  id: string;
  canonicalCourseId: string;
  version: number;

  // Course metadata (version-specific)
  title: string;
  description: string;
  credits: number;
  duration: number;
  settings: CourseSettings;
  instructorIds: string[];

  // Lifecycle
  status: CourseVersionStatus;
  isLocked: boolean;
  isLatest: boolean;

  // Lineage
  parentVersionId: string | null;

  // Audit
  createdBy: string;
  createdAt: string;
  publishedAt: string | null;
  publishedBy: string | null;
  lockedAt: string | null;
  lockedBy: string | null;
  lockedReason: LockReason | null;

  // Change tracking
  changeNotes: string | null;

  // Stats (snapshot at lock time for historical record)
  statsAtLock: CourseVersionStats | null;
}

export interface CourseVersionStats {
  moduleCount: number;
  learningUnitCount: number;
  enrollmentCount: number;
  completionCount: number;
}

/**
 * CourseVersion list item for API responses
 */
export interface CourseVersionListItem {
  id: string;
  canonicalCourseId: string;
  canonicalCourseCode: string;
  version: number;
  title: string;
  status: CourseVersionStatus;
  isLocked: boolean;
  isLatest: boolean;
  moduleCount: number;
  enrollmentCount: number;
  createdAt: string;
  publishedAt: string | null;
  lockedAt: string | null;
  lockedReason: LockReason | null;
  changeNotes: string | null;
}

/**
 * Full CourseVersion detail including related data
 */
export interface CourseVersionDetail extends CourseVersion {
  canonicalCourse: {
    id: string;
    code: string;
    department: { id: string; name: string };
    program: { id: string; name: string } | null;
  };
  instructors: InstructorRef[];
  modules: CourseVersionModuleItem[];
  parentVersion: {
    id: string;
    version: number;
    title: string;
  } | null;
  statistics: {
    moduleCount: number;
    learningUnitCount: number;
    totalDuration: number;
    enrollmentCount: number;
    completionRate: number;
  };
}

// =====================
// COURSE VERSION MODULE
// =====================

/**
 * Links a module to a specific course version with ordering and overrides.
 */
export interface CourseVersionModule {
  id: string;
  courseVersionId: string;
  moduleId: string;
  order: number;

  // Version-specific overrides
  isRequired: boolean;
  availableFrom: string | null;
  availableUntil: string | null;

  createdAt: string;
}

/**
 * CourseVersionModule with module details for display
 */
export interface CourseVersionModuleItem extends CourseVersionModule {
  module: {
    id: string;
    title: string;
    description: string | null;
    estimatedDuration: number;
    learningUnitCount: number;
    isPublished: boolean;
  };
}

// =====================
// API PAYLOADS
// =====================

/**
 * Create a new draft version from a published course
 */
export interface CreateCourseVersionPayload {
  changeNotes?: string;
}

export interface CreateCourseVersionResponse {
  courseVersion: CourseVersion;
  previousVersion: {
    id: string;
    version: number;
    isLocked: boolean;
  } | null;
  message: string;
}

/**
 * Update a draft course version
 */
export interface UpdateCourseVersionPayload {
  title?: string;
  description?: string;
  credits?: number;
  duration?: number;
  settings?: Partial<CourseSettings>;
  instructorIds?: string[];
  changeNotes?: string;
}

/**
 * Publish a course version
 */
export interface PublishCourseVersionPayload {
  publishNotes?: string;
}

export interface PublishCourseVersionResponse {
  courseVersion: CourseVersion;
  previousVersion: {
    id: string;
    version: number;
    isLocked: boolean;
  } | null;
  affectedCertificates: {
    id: string;
    title: string;
    newVersionCreated: boolean;
  }[];
  message: string;
}

/**
 * Lock a course version manually
 */
export interface LockCourseVersionPayload {
  reason: string;
}

/**
 * Course version filters
 */
export interface CourseVersionFilters {
  canonicalCourseId?: string;
  status?: CourseVersionStatus;
  isLocked?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Course versions list response
 */
export interface CourseVersionsListResponse {
  canonicalCourseId: string;
  canonicalCourseCode: string;
  versions: CourseVersionListItem[];
  totalVersions: number;
}

// =====================
// EDIT LOCK TYPES
// =====================

/**
 * Module edit lock for preventing simultaneous edits
 */
export interface ModuleEditLock {
  moduleId: string;
  userId: string;
  userName: string;
  acquiredAt: string;
  expiresAt: string;
}

/**
 * Module edit lock response
 */
export interface ModuleEditLockResponse {
  moduleId: string;
  isLocked: boolean;
  lock: {
    userId: string;
    userName: string;
    acquiredAt: string;
    expiresAt: string;
  } | null;
  accessRequest: {
    userId: string;
    userName: string;
    requestedAt: string;
  } | null;
}

/**
 * Request edit lock payload
 */
export interface RequestEditLockPayload {
  // No payload needed - uses authenticated user
}

/**
 * Request access payload (when module is locked by another user)
 */
export interface RequestAccessPayload {
  message?: string;
}
