/**
 * React Query keys for Module Access
 */

import type { ModuleAccessFilters, CourseSummaryFilters } from './types';

export const moduleAccessKeys = {
  // All module access
  all: ['module-access'] as const,

  // By enrollment
  byEnrollment: (enrollmentId: string) =>
    [...moduleAccessKeys.all, 'enrollment', enrollmentId] as const,

  // By module (analytics)
  byModule: (moduleId: string, filters?: ModuleAccessFilters) =>
    [...moduleAccessKeys.all, 'module', moduleId, filters] as const,

  // Course summary
  courseSummary: (courseId: string, filters?: CourseSummaryFilters) =>
    [...moduleAccessKeys.all, 'course-summary', courseId, filters] as const,

  // Individual record
  record: (moduleAccessId: string) =>
    [...moduleAccessKeys.all, 'record', moduleAccessId] as const,
};
