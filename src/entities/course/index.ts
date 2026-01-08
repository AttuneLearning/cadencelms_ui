/**
 * Course entity exports
 * Public API for the course entity
 */

// Types
export type {
  Course,
  CourseCategory,
  CourseInstructor,
  CourseStats,
  CourseMetadata,
  CreateCourseInput,
  UpdateCourseInput,
  CourseQueryParams,
  CourseFilters,
  CourseEnrollment,
  EnrolledCourse,
} from './model/types';

// Enums
export { CourseStatus, CourseDifficulty } from './model/types';

// API
export {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  unenrollFromCourse,
  getCourseProgress,
  getEnrolledCourses,
} from './api/courseApi';

// Hooks
export { useCourse, courseKeys } from './model/useCourse';
export { useCourses, useEnrolledCourses } from './model/useCourses';

// UI Components
export { CourseCard } from './ui/CourseCard';
export type { CourseCardProps } from './ui/CourseCard';
export {
  CourseList,
  CourseCardSkeleton,
  CourseListError,
  CourseListEmpty,
} from './ui/CourseList';
export type { CourseListProps } from './ui/CourseList';
