/**
 * React Query keys for program queries
 * Organized hierarchically for efficient cache invalidation
 */

import type {
  ProgramFilters,
  ProgramEnrollmentFilters,
} from './types';

export const programKeys = {
  all: ['programs'] as const,

  lists: () => [...programKeys.all, 'list'] as const,
  list: (filters?: ProgramFilters) => [...programKeys.lists(), filters] as const,

  details: () => [...programKeys.all, 'detail'] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,

  levels: () => [...programKeys.all, 'levels'] as const,
  programLevels: (id: string) => [...programKeys.levels(), id] as const,

  enrollments: () => [...programKeys.all, 'enrollments'] as const,
  programEnrollments: (id: string, filters?: ProgramEnrollmentFilters) =>
    [...programKeys.enrollments(), id, filters] as const,

  certificates: () => [...programKeys.all, 'certificate'] as const,
  programCertificate: (id: string) => [...programKeys.certificates(), id] as const,

  // Learner-specific keys
  myPrograms: (params?: { page?: number; limit?: number; status?: string }) =>
    [...programKeys.all, 'myPrograms', params] as const,
  learnerDetails: () => [...programKeys.all, 'learnerDetail'] as const,
  learnerDetail: (id: string) => [...programKeys.learnerDetails(), id] as const,
  enrollmentProgress: (enrollmentId: string) =>
    [...programKeys.all, 'enrollmentProgress', enrollmentId] as const,
};

export const certificateTemplateKeys = {
  all: ['certificateTemplates'] as const,
  list: (params?: { scope?: string; departmentId?: string }) =>
    [...certificateTemplateKeys.all, 'list', params] as const,
};
