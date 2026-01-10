/**
 * React Query keys for Enrollments
 */

import type { EnrollmentFilters } from './types';

export const enrollmentKeys = {
  // All enrollments
  all: ['enrollments'] as const,

  // Lists
  lists: () => [...enrollmentKeys.all, 'list'] as const,
  list: (filters?: EnrollmentFilters) => [...enrollmentKeys.lists(), filters] as const,

  // Details
  details: () => [...enrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...enrollmentKeys.details(), id] as const,

  // Program enrollments
  programEnrollments: (programId: string, filters?: any) =>
    [...enrollmentKeys.all, 'program', programId, filters] as const,

  // Course enrollments
  courseEnrollments: (courseId: string, filters?: any) =>
    [...enrollmentKeys.all, 'course', courseId, filters] as const,

  // Class enrollments
  classEnrollments: (classId: string, filters?: any) =>
    [...enrollmentKeys.all, 'class', classId, filters] as const,

  // My enrollments (current user)
  myEnrollments: (filters?: EnrollmentFilters) =>
    [...enrollmentKeys.all, 'my', filters] as const,

  // Enrollment status for a specific course
  enrollmentStatus: (courseId: string) =>
    [...enrollmentKeys.all, 'status', courseId] as const,
};
