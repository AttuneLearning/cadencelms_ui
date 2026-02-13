/**
 * Assignment API Client
 * Aligned with API-ISS-029 assignment submission contracts
 */

import { client } from '@/shared/api/client';
import type { ApiResponse } from '@/shared/api/types';
import type {
  ListAssignmentsParams,
  ListAssignmentsResponse,
  Assignment,
  AssignmentSubmission,
  ListSubmissionsResponse,
  ListSubmissionsParams,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  CreateSubmissionPayload,
  UpdateSubmissionPayload,
  GradeSubmissionPayload,
  ReturnSubmissionPayload,
} from '../model/types';

const ASSIGNMENTS_PATH = '/assignments';
const SUBMISSIONS_PATH = '/submissions';

export const assignmentApi = {
  // =====================
  // ASSIGNMENT MANAGEMENT (Staff)
  // =====================

  /** POST /assignments — Create assignment */
  createAssignment: async (data: CreateAssignmentPayload): Promise<Assignment> => {
    const response = await client.post<ApiResponse<Assignment>>(ASSIGNMENTS_PATH, data);
    return response.data.data;
  },

  /** GET /assignments/:id — Get assignment */
  getAssignment: async (id: string): Promise<Assignment> => {
    const response = await client.get<ApiResponse<Assignment>>(`${ASSIGNMENTS_PATH}/${id}`);
    return response.data.data;
  },

  /** PUT /assignments/:id — Update assignment */
  updateAssignment: async (id: string, data: UpdateAssignmentPayload): Promise<Assignment> => {
    const response = await client.put<ApiResponse<Assignment>>(
      `${ASSIGNMENTS_PATH}/${id}`,
      data
    );
    return response.data.data;
  },

  /** DELETE /assignments/:id — Soft-delete assignment */
  deleteAssignment: async (id: string): Promise<Assignment> => {
    const response = await client.delete<ApiResponse<Assignment>>(`${ASSIGNMENTS_PATH}/${id}`);
    return response.data.data;
  },

  /** GET /assignments — List assignments */
  listAssignments: async (params?: ListAssignmentsParams): Promise<ListAssignmentsResponse> => {
    const response = await client.get<ApiResponse<ListAssignmentsResponse>>(ASSIGNMENTS_PATH, {
      params,
    });
    return response.data.data;
  },

  // =====================
  // SUBMISSION LIFECYCLE (Learner)
  // =====================

  /** POST /assignments/:assignmentId/submissions — Create submission (draft) */
  createSubmission: async (
    assignmentId: string,
    data: CreateSubmissionPayload
  ): Promise<AssignmentSubmission> => {
    const response = await client.post<ApiResponse<AssignmentSubmission>>(
      `${ASSIGNMENTS_PATH}/${assignmentId}/submissions`,
      data
    );
    return response.data.data;
  },

  /** GET /assignments/:assignmentId/submissions — List submissions */
  listSubmissions: async (
    assignmentId: string,
    params?: ListSubmissionsParams
  ): Promise<ListSubmissionsResponse> => {
    const response = await client.get<ApiResponse<ListSubmissionsResponse>>(
      `${ASSIGNMENTS_PATH}/${assignmentId}/submissions`,
      { params }
    );
    return response.data.data;
  },

  /** GET /submissions/:submissionId — Get submission detail */
  getSubmission: async (id: string): Promise<AssignmentSubmission> => {
    const response = await client.get<ApiResponse<AssignmentSubmission>>(
      `${SUBMISSIONS_PATH}/${id}`
    );
    return response.data.data;
  },

  /** PUT /submissions/:submissionId — Update draft */
  updateSubmission: async (
    id: string,
    data: UpdateSubmissionPayload
  ): Promise<AssignmentSubmission> => {
    const response = await client.put<ApiResponse<AssignmentSubmission>>(
      `${SUBMISSIONS_PATH}/${id}`,
      data
    );
    return response.data.data;
  },

  /** POST /submissions/:submissionId/submit — Submit for grading */
  submitSubmission: async (id: string): Promise<AssignmentSubmission> => {
    const response = await client.post<ApiResponse<AssignmentSubmission>>(
      `${SUBMISSIONS_PATH}/${id}/submit`
    );
    return response.data.data;
  },

  // =====================
  // GRADING (Staff)
  // =====================

  /** POST /submissions/:submissionId/grade — Grade submission */
  gradeSubmission: async (
    id: string,
    data: GradeSubmissionPayload
  ): Promise<AssignmentSubmission> => {
    const response = await client.post<ApiResponse<AssignmentSubmission>>(
      `${SUBMISSIONS_PATH}/${id}/grade`,
      data
    );
    return response.data.data;
  },

  /** POST /submissions/:submissionId/return — Return for resubmission */
  returnSubmission: async (
    id: string,
    data: ReturnSubmissionPayload
  ): Promise<AssignmentSubmission> => {
    const response = await client.post<ApiResponse<AssignmentSubmission>>(
      `${SUBMISSIONS_PATH}/${id}/return`,
      data
    );
    return response.data.data;
  },
};
