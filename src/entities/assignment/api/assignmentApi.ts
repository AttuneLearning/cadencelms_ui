/**
 * Assignment API Client
 * API methods for assignment and submission operations
 */

import { client } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type {
  ListAssignmentsParams,
  ListAssignmentsResponse,
  Assignment,
  AssignmentSubmission,
  ListSubmissionsResponse,
  CreateSubmissionRequest,
  CreateSubmissionResponse,
  UpdateSubmissionRequest,
  UpdateSubmissionResponse,
  SubmitAssignmentRequest,
  SubmitAssignmentResponse,
  UploadFileRequest,
  UploadFileResponse,
  DeleteFileRequest,
  DeleteFileResponse,
  GradeSubmissionRequest,
  GradeSubmissionResponse,
} from '../model/types';

const BASE_PATH = '/assignments';
const SUBMISSIONS_PATH = '/assignment-submissions';

export const assignmentApi = {
  /**
   * List assignments with optional filters
   */
  listAssignments: async (params?: ListAssignmentsParams): Promise<ListAssignmentsResponse> => {
    const response = await client.get<ApiResponse<ListAssignmentsResponse>>(BASE_PATH, {
      params,
    });
    return response.data.data;
  },

  /**
   * Get a single assignment by ID
   */
  getAssignmentById: async (id: string): Promise<Assignment> => {
    const response = await client.get<ApiResponse<Assignment>>(`${BASE_PATH}/${id}`);
    return response.data.data;
  },

  /**
   * List submissions for an assignment
   */
  listSubmissions: async (
    assignmentId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ListSubmissionsResponse> => {
    const response = await client.get<ApiResponse<ListSubmissionsResponse>>(
      `${BASE_PATH}/${assignmentId}/submissions`,
      { params }
    );
    return response.data.data;
  },

  /**
   * Get my submissions for an assignment
   */
  getMySubmissions: async (assignmentId: string): Promise<AssignmentSubmission[]> => {
    const response = await client.get<ApiResponse<{ submissions: AssignmentSubmission[] }>>(
      `${BASE_PATH}/${assignmentId}/my-submissions`
    );
    return response.data.data.submissions;
  },

  /**
   * Get a single submission by ID
   */
  getSubmissionById: async (id: string): Promise<AssignmentSubmission> => {
    const response = await client.get<ApiResponse<AssignmentSubmission>>(
      `${SUBMISSIONS_PATH}/${id}`
    );
    return response.data.data;
  },

  /**
   * Create a new submission (draft)
   */
  createSubmission: async (
    data: CreateSubmissionRequest
  ): Promise<CreateSubmissionResponse> => {
    const response = await client.post<ApiResponse<CreateSubmissionResponse>>(
      SUBMISSIONS_PATH,
      data
    );
    return response.data.data;
  },

  /**
   * Update a submission (save draft)
   */
  updateSubmission: async (
    id: string,
    data: UpdateSubmissionRequest
  ): Promise<UpdateSubmissionResponse> => {
    const response = await client.patch<ApiResponse<UpdateSubmissionResponse>>(
      `${SUBMISSIONS_PATH}/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Submit an assignment (final submission)
   */
  submitAssignment: async (
    data: SubmitAssignmentRequest
  ): Promise<SubmitAssignmentResponse> => {
    const { submissionId, ...requestData } = data;
    const response = await client.post<ApiResponse<SubmitAssignmentResponse>>(
      `${SUBMISSIONS_PATH}/${submissionId}/submit`,
      requestData
    );
    return response.data.data;
  },

  /**
   * Upload a file to a submission
   */
  uploadFile: async (data: UploadFileRequest): Promise<UploadFileResponse> => {
    const formData = new FormData();
    formData.append('file', data.file);

    const response = await client.post<ApiResponse<UploadFileResponse>>(
      `${SUBMISSIONS_PATH}/${data.submissionId}/files`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  /**
   * Delete a file from a submission
   */
  deleteFile: async (data: DeleteFileRequest): Promise<DeleteFileResponse> => {
    const response = await client.delete<ApiResponse<DeleteFileResponse>>(
      `${SUBMISSIONS_PATH}/${data.submissionId}/files/${data.fileId}`
    );
    return response.data.data;
  },

  /**
   * Grade a submission (instructor only)
   */
  gradeSubmission: async (
    submissionId: string,
    data: GradeSubmissionRequest
  ): Promise<GradeSubmissionResponse> => {
    const response = await client.post<ApiResponse<GradeSubmissionResponse>>(
      `${SUBMISSIONS_PATH}/${submissionId}/grade`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete a submission
   */
  deleteSubmission: async (id: string): Promise<{ id: string; deleted: boolean }> => {
    const response = await client.delete<ApiResponse<{ id: string; deleted: boolean }>>(
      `${SUBMISSIONS_PATH}/${id}`
    );
    return response.data.data;
  },
};
