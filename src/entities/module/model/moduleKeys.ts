/**
 * React Query keys for Modules
 */

import type { ModuleFilters, ModuleLibraryFilters } from './types';

export const moduleKeys = {
  // All modules
  all: ['modules'] as const,

  // Lists (by course)
  lists: () => [...moduleKeys.all, 'list'] as const,
  list: (courseId: string, filters?: ModuleFilters) =>
    [...moduleKeys.lists(), courseId, filters] as const,

  // Details
  details: () => [...moduleKeys.all, 'detail'] as const,
  detail: (moduleId: string) => [...moduleKeys.details(), moduleId] as const,

  // With learning units
  withLearningUnits: (moduleId: string) =>
    [...moduleKeys.detail(moduleId), 'learning-units'] as const,

  // By course (for invalidation)
  byCourse: (courseId: string) => [...moduleKeys.all, 'course', courseId] as const,
};

// Module library keys (v2 API)
export const moduleLibraryKeys = {
  // All library queries
  all: ['module-library'] as const,

  // Browse library
  lists: () => [...moduleLibraryKeys.all, 'list'] as const,
  list: (filters?: ModuleLibraryFilters) =>
    [...moduleLibraryKeys.lists(), filters] as const,

  // Module detail from library
  detail: (moduleId: string) =>
    [...moduleLibraryKeys.all, 'detail', moduleId] as const,

  // Module usage
  usage: (moduleId: string) =>
    [...moduleLibraryKeys.all, 'usage', moduleId] as const,
};

// Module edit lock keys
export const moduleEditLockKeys = {
  // All edit lock queries
  all: ['module-edit-locks'] as const,

  // Lock status
  status: (moduleId: string) =>
    [...moduleEditLockKeys.all, 'status', moduleId] as const,
};
