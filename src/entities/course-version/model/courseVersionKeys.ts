/**
 * React Query keys for Course Versions
 */

import type { CourseVersionFilters } from './types';

export const courseVersionKeys = {
  // All course version queries
  all: ['course-versions'] as const,

  // Lists
  lists: () => [...courseVersionKeys.all, 'list'] as const,
  list: (canonicalCourseId: string) =>
    [...courseVersionKeys.lists(), canonicalCourseId] as const,
  listFiltered: (filters?: CourseVersionFilters) =>
    [...courseVersionKeys.lists(), 'filtered', filters] as const,

  // Details
  details: () => [...courseVersionKeys.all, 'detail'] as const,
  detail: (versionId: string) => [...courseVersionKeys.details(), versionId] as const,

  // Modules for a version
  modules: (versionId: string) =>
    [...courseVersionKeys.all, 'modules', versionId] as const,

  // Canonical courses
  canonical: () => [...courseVersionKeys.all, 'canonical'] as const,
  canonicalDetail: (canonicalCourseId: string) =>
    [...courseVersionKeys.canonical(), canonicalCourseId] as const,
};

export const moduleEditLockKeys = {
  // All module edit lock queries
  all: ['module-edit-locks'] as const,

  // Lock status for a specific module
  status: (moduleId: string) => [...moduleEditLockKeys.all, 'status', moduleId] as const,
};
