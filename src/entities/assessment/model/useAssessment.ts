/**
 * React Query hooks for Assessments
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  publishAssessment,
  unpublishAssessment,
  archiveAssessment,
  unarchiveAssessment,
} from '../api/assessmentApi';
import { assessmentKeys } from './assessmentKeys';
import type {
  Assessment,
  AssessmentsListResponse,
  AssessmentFilters,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
  PublishAssessmentResponse,
  ArchiveAssessmentResponse,
} from './types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of assessments
 */
export function useAssessments(
  filters?: AssessmentFilters,
  options?: Omit<
    UseQueryOptions<AssessmentsListResponse, Error, AssessmentsListResponse, ReturnType<typeof assessmentKeys.list>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: assessmentKeys.list(filters),
    queryFn: () => listAssessments(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single assessment
 */
export function useAssessment(
  id: string,
  options?: Omit<
    UseQueryOptions<Assessment, Error, Assessment, ReturnType<typeof assessmentKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: assessmentKeys.detail(id),
    queryFn: () => getAssessment(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create an assessment
 */
export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssessmentPayload) => createAssessment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      if (data.departmentId) {
        queryClient.invalidateQueries({
          queryKey: assessmentKeys.byDepartment(data.departmentId),
        });
      }
    },
  });
}

/**
 * Hook to update an assessment
 */
export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssessmentPayload }) =>
      updateAssessment(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

/**
 * Hook to delete an assessment
 */
export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
      queryClient.removeQueries({ queryKey: assessmentKeys.detail(id) });
    },
  });
}

/**
 * Hook to publish an assessment
 */
export function usePublishAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<PublishAssessmentResponse> => publishAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

/**
 * Hook to unpublish an assessment
 */
export function useUnpublishAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unpublishAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

/**
 * Hook to archive an assessment
 */
export function useArchiveAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<ArchiveAssessmentResponse> => archiveAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}

/**
 * Hook to unarchive an assessment
 */
export function useUnarchiveAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveAssessment(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: assessmentKeys.lists() });
    },
  });
}
