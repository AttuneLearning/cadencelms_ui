/**
 * Course Entity
 * Public API for course entity
 */

// Types
export type {
  Course,
  CourseListItem,
  CourseFormData,
  CourseQueryParams,
} from './model/types';
export type { CourseStatus } from './model/types';

// API
export {
  getCourses,
  getCourse,
  getEnrolledCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getCourseStats,
} from './api/courseApi';

// Hooks
export { useCourse, courseKeys } from './model/useCourse';
export { useCourses, useEnrolledCourses } from './model/useCourses';

// UI Components
export { CourseCard } from './ui/CourseCard';
export { CourseList } from './ui/CourseList';
