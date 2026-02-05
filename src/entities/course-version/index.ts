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

// API
export {
  createVersion,
  listVersions,
  getVersion,
  updateVersion,
  publishVersion,
  lockVersion,
  listVersionModules,
  addModuleToVersion,
  reorderVersionModules,
  updateVersionModule,
  removeModuleFromVersion,
  acquireModuleEditLock,
  refreshModuleEditLock,
  releaseModuleEditLock,
  getModuleEditLockStatus,
  forceReleaseModuleEditLock,
} from './api/courseVersionApi';

// Query Keys
export { courseVersionKeys, moduleEditLockKeys } from './model/courseVersionKeys';

// Hooks
export {
  // Version queries
  useCourseVersions,
  useCourseVersion,
  useCourseVersionModules,
  // Version mutations
  useCreateCourseVersion,
  useUpdateCourseVersion,
  usePublishCourseVersion,
  useLockCourseVersion,
  // Module mutations
  useAddModuleToVersion,
  useReorderVersionModules,
  useUpdateVersionModule,
  useRemoveModuleFromVersion,
  // Edit lock hooks
  useModuleEditLockStatus,
  useAcquireModuleEditLock,
  useRefreshModuleEditLock,
  useReleaseModuleEditLock,
  useForceReleaseModuleEditLock,
} from './hooks/useCourseVersions';
