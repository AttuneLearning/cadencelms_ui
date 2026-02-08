/**
 * React Query hooks for Assignments
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentApi } from '../api/assignmentApi';
import type {
  ListAssignmentsParams,
  CreateSubmissionRequest,
  UpdateSubmissionRequest,
  SubmitAssignmentRequest,
  UploadFileRequest,
  DeleteFileRequest,
  GradeSubmissionRequest,
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
  mySubmissions: (assignmentId: string) =>
    [...ASSIGNMENT_KEYS.all, 'my-submissions', assignmentId] as const,
  submission: (id: string) => [...ASSIGNMENT_KEYS.all, 'submission', id] as const,
};

/**
 * Hook to fetch list of assignments
 */
export function useAssignments(params?: ListAssignmentsParams) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.list(params),
    queryFn: () => assignmentApi.listAssignments(params),
  });
}

/**
 * Hook to fetch single assignment by ID
 */
export function useAssignment(id: string) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.detail(id),
    queryFn: () => assignmentApi.getAssignmentById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch submissions for an assignment (instructor view)
 */
export function useSubmissions(
  assignmentId: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: [...ASSIGNMENT_KEYS.submissions(assignmentId), params],
    queryFn: () => assignmentApi.listSubmissions(assignmentId, params),
    enabled: !!assignmentId,
  });
}

/**
 * Hook to fetch my submissions for an assignment (learner view)
 */
export function useMySubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.mySubmissions(assignmentId),
    queryFn: () => assignmentApi.getMySubmissions(assignmentId),
    enabled: !!assignmentId,
  });
}

/**
 * Hook to fetch single submission by ID
 */
export function useSubmission(id: string) {
  return useQuery({
    queryKey: ASSIGNMENT_KEYS.submission(id),
    queryFn: () => assignmentApi.getSubmissionById(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new submission
 */
export function useCreateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSubmissionRequest) => assignmentApi.createSubmission(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.mySubmissions(variables.assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(variables.assignmentId),
      });
    },
  });
}

/**
 * Hook to update a submission (save draft)
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSubmissionRequest }) =>
      assignmentApi.updateSubmission(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submission(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.mySubmissions(data.assignmentId),
      });
    },
  });
}

/**
 * Hook to submit an assignment (final submission)
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitAssignmentRequest) => assignmentApi.submitAssignment(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submission(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.mySubmissions(data.assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(data.assignmentId),
      });
    },
  });
}

/**
 * Hook to upload a file to a submission
 */
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadFileRequest) => assignmentApi.uploadFile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submission(data.submissionId),
      });
    },
  });
}

/**
 * Hook to delete a file from a submission
 */
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteFileRequest) => assignmentApi.deleteFile(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submission(data.submissionId),
      });
    },
  });
}

/**
 * Hook to grade a submission (instructor only)
 */
export function useGradeSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: GradeSubmissionRequest }) =>
      assignmentApi.gradeSubmission(submissionId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submission(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submissions(data.assignmentId),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.mySubmissions(data.assignmentId),
      });
    },
  });
}

/**
 * Hook to delete a submission
 */
export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => assignmentApi.deleteSubmission(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.submission(id),
      });
      queryClient.invalidateQueries({
        queryKey: ASSIGNMENT_KEYS.all,
      });
    },
  });
}
