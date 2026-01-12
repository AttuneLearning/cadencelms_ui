/**
 * Course Segment Query Keys
 * Centralized query key factory for React Query
 */

import type { CourseSegmentFilters } from './types';

export const courseSegmentKeys = {
  all: ['courseSegments'] as const,
  lists: () => [...courseSegmentKeys.all, 'list'] as const,
  list: (courseId: string, filters?: CourseSegmentFilters) =>
    [...courseSegmentKeys.lists(), courseId, filters] as const,
  details: () => [...courseSegmentKeys.all, 'detail'] as const,
  detail: (courseId: string, moduleId: string) =>
    [...courseSegmentKeys.details(), courseId, moduleId] as const,
};
