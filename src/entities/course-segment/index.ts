/**
 * Course Segment Entity
 * Public API for course segment (module) entity
 */

// Types
export type {
  CourseSegment,
  CourseSegmentListItem,
  CourseSegmentType,
  CourseSegmentSettings,
  CreateCourseSegmentPayload,
  UpdateCourseSegmentPayload,
  CourseSegmentFilters,
  CourseSegmentsListResponse,
  ReorderCourseSegmentsPayload,
  ReorderCourseSegmentsResponse,
  DeleteCourseSegmentResponse,
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
  listCourseSegments,
  getCourseSegment,
  createCourseSegment,
  updateCourseSegment,
  deleteCourseSegment,
  reorderCourseSegments,
  linkContentToModule,
  type LinkContentToModulePayload,
  type LinkContentToModuleResponse,
} from './api/courseSegmentApi';

// Query Keys
export { courseSegmentKeys } from './model/courseSegmentKeys';

// Hooks
export {
  useCourseSegments,
  useCourseSegment,
  useCreateCourseSegment,
  useUpdateCourseSegment,
  useDeleteCourseSegment,
  useReorderCourseSegments,
  useLinkContentToModule,
} from './hooks/useCourseSegments';

// UI Components
export { CourseSegmentCard } from './ui/CourseSegmentCard';
export { CourseSegmentList } from './ui/CourseSegmentList';
export { CourseSegmentForm } from './ui/CourseSegmentForm';
