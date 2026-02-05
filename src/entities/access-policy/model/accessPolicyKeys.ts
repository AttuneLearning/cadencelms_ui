/**
 * React Query keys for Access Policies
 */

import type { ProgramEnrollmentFilters, AccessExtensionRequestFilters } from './types';

export const departmentAccessPolicyKeys = {
  // All department access policy queries
  all: ['department-access-policies'] as const,

  // Lists
  lists: () => [...departmentAccessPolicyKeys.all, 'list'] as const,
  list: () => [...departmentAccessPolicyKeys.lists()] as const,

  // Details
  details: () => [...departmentAccessPolicyKeys.all, 'detail'] as const,
  detail: (departmentId: string) =>
    [...departmentAccessPolicyKeys.details(), departmentId] as const,
};

export const programAccessOverrideKeys = {
  // All program access override queries
  all: ['program-access-overrides'] as const,

  // Lists
  lists: () => [...programAccessOverrideKeys.all, 'list'] as const,
  list: (departmentId?: string) =>
    [...programAccessOverrideKeys.lists(), { departmentId }] as const,

  // Details
  details: () => [...programAccessOverrideKeys.all, 'detail'] as const,
  detail: (programId: string) =>
    [...programAccessOverrideKeys.details(), programId] as const,
};

export const programEnrollmentKeys = {
  // All program enrollment queries
  all: ['program-enrollments'] as const,

  // Lists
  lists: () => [...programEnrollmentKeys.all, 'list'] as const,
  list: (filters?: ProgramEnrollmentFilters) =>
    [...programEnrollmentKeys.lists(), filters] as const,

  // For a specific learner
  forLearner: (learnerId: string, status?: string) =>
    [...programEnrollmentKeys.all, 'learner', learnerId, { status }] as const,

  // Details
  details: () => [...programEnrollmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...programEnrollmentKeys.details(), id] as const,
};

export const accessExtensionRequestKeys = {
  // All access extension request queries
  all: ['access-extension-requests'] as const,

  // Lists
  lists: () => [...accessExtensionRequestKeys.all, 'list'] as const,
  list: (filters?: AccessExtensionRequestFilters) =>
    [...accessExtensionRequestKeys.lists(), filters] as const,

  // Details
  details: () => [...accessExtensionRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...accessExtensionRequestKeys.details(), id] as const,
};
