/**
 * Course Module Entity
 * Public API for course module entity
 */

// Types
export type {
  CourseModule,
  CourseModuleListItem,
  CourseModuleLessonItem,
  CourseModuleType,
  CourseModuleSettings,
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
  CourseModuleFilters,
  CourseModulesListResponse,
  ReorderCourseModulesPayload,
  ReorderCourseModulesResponse,
  DeleteCourseModuleResponse,
} from './model/types';

// Lesson Types
export type {
  Lesson,
  LessonListItem,
  LessonSettings,
  CompletionCriteria,
  CompletionCriteriaType,
  CreateLessonPayload,
  UpdateLessonPayload,
  ReorderLessonsPayload,
  LessonSettingsFormData,
} from './model/lessonTypes';

// API
export {
  listCourseModules,
  getCourseModule,
  createCourseModule,
  updateCourseModule,
  deleteCourseModule,
  reorderCourseModules,
  linkContentToModule,
  type LinkContentToModulePayload,
  type LinkContentToModuleResponse,
} from './api/courseModuleApi';

// Query Keys
export { courseModuleKeys } from './model/courseModuleKeys';

// Hooks
export {
  useCourseModules,
  useCourseModule,
  useCreateCourseModule,
  useUpdateCourseModule,
  useDeleteCourseModule,
  useReorderCourseModules,
  useLinkContentToModule,
} from './hooks/useCourseModules';

// UI Components
export { CourseModuleCard } from './ui/CourseModuleCard';
export { CourseModuleList } from './ui/CourseModuleList';
export { CourseModuleForm } from './ui/CourseModuleForm';
