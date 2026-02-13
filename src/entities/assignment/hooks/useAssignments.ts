/**
 * React Query hooks for Assignments
 * Aligned with API-ISS-029 assignment submission contracts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '../api/assignmentApi';
import type {
  ListAssignmentsParams,
  ListSubmissionsParams,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  CreateSubmissionPayload,
  UpdateSubmissionPayload,
  GradeSubmissionPayload,
  ReturnSubmissionPayload,
} from '../model/types';

/**
 * Query keys for assignments
 */
export const ASSIGNMENT_KEYS = {
  all: ['assignments'] as const,
  lists: () => [...ASSIGNMENT_KEYS.all, 'list'] as const,
  list: (params?: ListAssignmentsParams) => [...ASSIGNMENT_KEYS.lists(), params] as const,
  details: () => [...ASSIGNMENT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...ASSIGNMENT_KEYS.details(), id] as const,
  submissions: (assignmentId: string) =>
    [...ASSIGNMENT_KEYS.all, 'submissions', assignmentId] as const,
  submission: (id: string) => [...ASSIGNMENT_KEYS.all, 'submission', id] as const,
};

// =====================
// ASSIGNMENT QUERIES
// =====================

export function useAssignments(params?: ListAssignmentsParams) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.list(params),
    queryFn: () => assignmentApi.listAssignments(params),
  });
}

export function useAssignment(id: string) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.detail(id),
    queryFn: () => assignmentApi.getAssignment(id),
    enabled: !!id,
  });
}

// =====================
// SUBMISSION QUERIES
// =====================

export function useSubmissions(assignmentId: string, params?: ListSubmissionsParams) {
  return useQuery({
    queryKey: [...ASSIGNMENT_KEYS.submissions(assignmentId), params],
    queryFn: () => assignmentApi.listSubmissions(assignmentId, params),
    enabled: !!assignmentId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.submission(id),
    queryFn: () => assignmentApi.getSubmission(id),
    enabled: !!id,
  });
}

// =====================
// ASSIGNMENT MUTATIONS (Staff)
// =====================

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAssignmentPayload) => assignmentApi.createAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentPayload }) =>
      assignmentApi.updateAssignment(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentApi.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.lists() });
    },
  });
}

// =====================
// SUBMISSION MUTATIONS (Learner)
// =====================

export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, data }: { assignmentId: string; data: CreateSubmissionPayload }) =>
      assignmentApi.createSubmission(assignmentId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(variables.assignmentId),
      });
    },
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubmissionPayload }) =>
      assignmentApi.updateSubmission(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.submission(data.id) });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(data.assignmentId),
      });
    },
  });
}

export function useSubmitSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentApi.submitSubmission(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.submission(data.id) });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(data.assignmentId),
      });
    },
  });
}

// =====================
// GRADING MUTATIONS (Staff)
// =====================

export function useGradeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GradeSubmissionPayload }) =>
      assignmentApi.gradeSubmission(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.submission(data.id) });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(data.assignmentId),
      });
    },
  });
}

export function useReturnSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnSubmissionPayload }) =>
      assignmentApi.returnSubmission(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ASSIGNMENT_KEYS.submission(data.id) });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(data.assignmentId),
      });
    },
  });
}
