/**
 * React Query keys for Exceptions
 */

import type { ExceptionFilters } from './types';

export const exceptionKeys = {
  // All exceptions
  all: ['exceptions'] as const,

  // Lists
  lists: () => [...exceptionKeys.all, 'list'] as const,
  list: (filters?: ExceptionFilters) => [...exceptionKeys.lists(), filters] as const,

  // Details
  details: () => [...exceptionKeys.all, 'detail'] as const,
  detail: (id: string) => [...exceptionKeys.details(), id] as const,

  // Enrollment exceptions
  enrollmentExceptions: (enrollmentId: string, filters?: ExceptionFilters) =>
    [...exceptionKeys.all, 'enrollment', enrollmentId, filters] as const,
};
