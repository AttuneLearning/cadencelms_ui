/**
 * Course Entity
 * Public API for course entity
 */

// Types
export type {
  Course,
  CourseListItem,
  CourseStatus,
  ModuleType,
  LockReason,
  CourseSettings,
  DepartmentRef,
  ProgramRef,
  InstructorRef,
  CourseModule,
  CreateCoursePayload,
  UpdateCoursePayload,
  PatchCoursePayload,
  CourseFilters,
  CoursesListResponse,
  PublishCoursePayload,
  UnpublishCoursePayload,
  ArchiveCoursePayload,
  DuplicateCoursePayload,
  DuplicateCourseResponse,
  ExportCourseResponse,
  ExportFormat,
  CourseFormData,
  Pagination,
  // Note: Versioning types (CreateCourseVersionPayload, CourseVersionListItem, etc.)
  // are now in @/entities/course-version - use that entity for versioning operations
} from './model/types';

// Functions
export { canEditCourse } from './model/types';

// API
export {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  patchCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  archiveCourse,
  unarchiveCourse,
  duplicateCourse,
  exportCourse,
  moveDepartment,
  assignProgram,
} from './api/courseApi';

// Query Keys
export { courseKeys } from './model/courseKeys';

// Hooks
export {
  useCourses,
  useCourse,
  useExportCourse,
  useCreateCourse,
  useUpdateCourse,
  usePatchCourse,
  useDeleteCourse,
  usePublishCourse,
  useUnpublishCourse,
  useArchiveCourse,
  useUnarchiveCourse,
  useDuplicateCourse,
  useMoveDepartment,
  useAssignProgram,
} from './model/useCourse';

// UI Components
export { CourseCard } from './ui/CourseCard';
export { CourseList } from './ui/CourseList';
export { CourseForm } from './ui/CourseForm';
