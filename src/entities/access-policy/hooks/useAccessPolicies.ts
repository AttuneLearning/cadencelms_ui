/**
 * React Query hooks for Access Policies
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listDepartmentAccessPolicies,
  getDepartmentAccessPolicy,
  updateDepartmentAccessPolicy,
  listProgramAccessOverrides,
  getProgramAccessOverride,
  upsertProgramAccessOverride,
  deleteProgramAccessOverride,
  listProgramEnrollments,
  getProgramEnrollment,
  getLearnerProgramEnrollments,
  extendProgramAccess,
  listAccessExtensionRequests,
  getAccessExtensionRequest,
  requestAccessExtension,
  reviewAccessExtensionRequest,
} from '../api/accessPolicyApi';
import {
  departmentAccessPolicyKeys,
  programAccessOverrideKeys,
  programEnrollmentKeys,
  accessExtensionRequestKeys,
} from '../model/accessPolicyKeys';
import type {
  DepartmentAccessPolicy,
  DepartmentAccessPoliciesListResponse,
  UpdateDepartmentAccessPolicyPayload,
  ProgramAccessOverride,
  ProgramAccessOverridesListResponse,
  UpsertProgramAccessOverridePayload,
  ProgramEnrollmentListItem,
  ProgramEnrollmentDetail,
  ProgramEnrollmentsListResponse,
  ProgramEnrollmentFilters,
  ExtendAccessPayload,
  AccessExtensionRequest,
  AccessExtensionRequestsListResponse,
  AccessExtensionRequestFilters,
  RequestAccessExtensionPayload,
  ReviewAccessExtensionPayload,
} from '../model/types';

// =====================
// DEPARTMENT ACCESS POLICY HOOKS
// =====================

/**
 * Hook to fetch list of department access policies
 */
export function useDepartmentAccessPolicies(
  options?: Omit<
    UseQueryOptions<
      DepartmentAccessPoliciesListResponse,
      Error,
      DepartmentAccessPoliciesListResponse,
      ReturnType<typeof departmentAccessPolicyKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentAccessPolicyKeys.list(),
    queryFn: () => listDepartmentAccessPolicies(),
    staleTime: 10 * 60 * 1000, // 10 minutes - policies don't change often
    ...options,
  });
}

/**
 * Hook to fetch single department access policy
 */
export function useDepartmentAccessPolicy(
  departmentId: string,
  options?: Omit<
    UseQueryOptions<
      DepartmentAccessPolicy,
      Error,
      DepartmentAccessPolicy,
      ReturnType<typeof departmentAccessPolicyKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: departmentAccessPolicyKeys.detail(departmentId),
    queryFn: () => getDepartmentAccessPolicy(departmentId),
    enabled: !!departmentId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to update department access policy
 */
export function useUpdateDepartmentAccessPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      payload,
    }: {
      departmentId: string;
      payload: UpdateDepartmentAccessPolicyPayload;
    }) => updateDepartmentAccessPolicy(departmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: departmentAccessPolicyKeys.detail(variables.departmentId),
      });
      queryClient.invalidateQueries({ queryKey: departmentAccessPolicyKeys.lists() });
    },
  });
}

// =====================
// PROGRAM ACCESS OVERRIDE HOOKS
// =====================

/**
 * Hook to fetch list of program access overrides
 */
export function useProgramAccessOverrides(
  departmentId?: string,
  options?: Omit<
    UseQueryOptions<
      ProgramAccessOverridesListResponse,
      Error,
      ProgramAccessOverridesListResponse,
      ReturnType<typeof programAccessOverrideKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programAccessOverrideKeys.list(departmentId),
    queryFn: () => listProgramAccessOverrides(departmentId),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single program access override
 */
export function useProgramAccessOverride(
  programId: string,
  options?: Omit<
    UseQueryOptions<
      ProgramAccessOverride,
      Error,
      ProgramAccessOverride,
      ReturnType<typeof programAccessOverrideKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programAccessOverrideKeys.detail(programId),
    queryFn: () => getProgramAccessOverride(programId),
    enabled: !!programId,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create/update program access override
 */
export function useUpsertProgramAccessOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      programId,
      payload,
    }: {
      programId: string;
      payload: UpsertProgramAccessOverridePayload;
    }) => upsertProgramAccessOverride(programId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: programAccessOverrideKeys.detail(variables.programId),
      });
      queryClient.invalidateQueries({ queryKey: programAccessOverrideKeys.lists() });
    },
  });
}

/**
 * Hook to delete program access override
 */
export function useDeleteProgramAccessOverride() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => deleteProgramAccessOverride(programId),
    onSuccess: (_, programId) => {
      queryClient.invalidateQueries({
        queryKey: programAccessOverrideKeys.detail(programId),
      });
      queryClient.invalidateQueries({ queryKey: programAccessOverrideKeys.lists() });
    },
  });
}

// =====================
// PROGRAM ENROLLMENT HOOKS
// =====================

/**
 * Hook to fetch list of program enrollments
 */
export function useProgramEnrollments(
  filters?: ProgramEnrollmentFilters,
  options?: Omit<
    UseQueryOptions<
      ProgramEnrollmentsListResponse,
      Error,
      ProgramEnrollmentsListResponse,
      ReturnType<typeof programEnrollmentKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programEnrollmentKeys.list(filters),
    queryFn: () => listProgramEnrollments(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single program enrollment
 */
export function useProgramEnrollment(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ProgramEnrollmentDetail,
      Error,
      ProgramEnrollmentDetail,
      ReturnType<typeof programEnrollmentKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programEnrollmentKeys.detail(id),
    queryFn: () => getProgramEnrollment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch learner's program enrollments
 */
export function useLearnerProgramEnrollments(
  learnerId: string,
  status?: string,
  options?: Omit<
    UseQueryOptions<
      ProgramEnrollmentListItem[],
      Error,
      ProgramEnrollmentListItem[],
      ReturnType<typeof programEnrollmentKeys.forLearner>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: programEnrollmentKeys.forLearner(learnerId, status),
    queryFn: () => getLearnerProgramEnrollments(learnerId, status ? { status } : undefined),
    enabled: !!learnerId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to extend program access
 */
export function useExtendProgramAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      payload,
    }: {
      enrollmentId: string;
      payload: ExtendAccessPayload;
    }) => extendProgramAccess(enrollmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: programEnrollmentKeys.detail(variables.enrollmentId),
      });
      queryClient.invalidateQueries({ queryKey: programEnrollmentKeys.lists() });
    },
  });
}

// =====================
// ACCESS EXTENSION REQUEST HOOKS
// =====================

/**
 * Hook to fetch list of access extension requests
 */
export function useAccessExtensionRequests(
  filters?: AccessExtensionRequestFilters,
  options?: Omit<
    UseQueryOptions<
      AccessExtensionRequestsListResponse,
      Error,
      AccessExtensionRequestsListResponse,
      ReturnType<typeof accessExtensionRequestKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: accessExtensionRequestKeys.list(filters),
    queryFn: () => listAccessExtensionRequests(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - requests may need faster updates
    ...options,
  });
}

/**
 * Hook to fetch single access extension request
 */
export function useAccessExtensionRequest(
  id: string,
  options?: Omit<
    UseQueryOptions<
      AccessExtensionRequest,
      Error,
      AccessExtensionRequest,
      ReturnType<typeof accessExtensionRequestKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: accessExtensionRequestKeys.detail(id),
    queryFn: () => getAccessExtensionRequest(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to request access extension
 */
export function useRequestAccessExtension() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      enrollmentId,
      payload,
    }: {
      enrollmentId: string;
      payload: RequestAccessExtensionPayload;
    }) => requestAccessExtension(enrollmentId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: programEnrollmentKeys.detail(variables.enrollmentId),
      });
      queryClient.invalidateQueries({ queryKey: accessExtensionRequestKeys.lists() });
    },
  });
}

/**
 * Hook to review access extension request
 */
export function useReviewAccessExtensionRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: ReviewAccessExtensionPayload;
    }) => reviewAccessExtensionRequest(requestId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: accessExtensionRequestKeys.detail(variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: accessExtensionRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: programEnrollmentKeys.lists() });
    },
  });
}
