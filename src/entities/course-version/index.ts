/**
 * Course Version Entity
 * Public API for course versioning system
 */

// Types
export type {
  // Canonical Course
  CanonicalCourse,
  CanonicalCourseListItem,
  // Course Version
  CourseVersionStatus,
  LockReason,
  CourseVersion,
  CourseVersionStats,
  CourseVersionListItem,
  CourseVersionDetail,
  // Course Version Module
  CourseVersionModule,
  CourseVersionModuleItem,
  // API Payloads
  CreateCourseVersionPayload,
  CreateCourseVersionResponse,
  UpdateCourseVersionPayload,
  PublishCourseVersionPayload,
  PublishCourseVersionResponse,
  LockCourseVersionPayload,
  CourseVersionFilters,
  CourseVersionsListResponse,
  // Edit Lock
  ModuleEditLock,
  ModuleEditLockResponse,
  RequestEditLockPayload,
  RequestAccessPayload,
} from './model/types';

// API (to be implemented)
// export * from './api/courseVersionApi';

// Hooks (to be implemented)
// export * from './hooks';
