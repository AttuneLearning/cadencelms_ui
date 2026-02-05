/**
 * Access Policy API Client
 * Implements access policy, enrollment, and extension endpoints
 *
 * Endpoint base: /api/v2/access-policies, /api/v2/program-enrollments, /api/v2/access-extensions
 */

import { client } from '@/shared/api/client';
import type {
  DepartmentAccessPolicy,
  DepartmentAccessPoliciesListResponse,
  UpdateDepartmentAccessPolicyPayload,
  ProgramAccessOverride,
  ProgramAccessOverridesListResponse,
  UpsertProgramAccessOverridePayload,
  ProgramEnrollment,
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

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// =====================
// DEPARTMENT ACCESS POLICIES
// =====================

/**
 * GET /api/v2/access-policies/departments - List department access policies
 */
export async function listDepartmentAccessPolicies(): Promise<DepartmentAccessPoliciesListResponse> {
  const response = await client.get<ApiResponse<DepartmentAccessPoliciesListResponse>>(
    '/api/v2/access-policies/departments'
  );
  return response.data.data;
}

/**
 * GET /api/v2/access-policies/departments/:departmentId - Get department access policy
 */
export async function getDepartmentAccessPolicy(
  departmentId: string
): Promise<DepartmentAccessPolicy> {
  const response = await client.get<ApiResponse<DepartmentAccessPolicy>>(
    `/api/v2/access-policies/departments/${departmentId}`
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/access-policies/departments/:departmentId - Update department access policy
 */
export async function updateDepartmentAccessPolicy(
  departmentId: string,
  payload: UpdateDepartmentAccessPolicyPayload
): Promise<DepartmentAccessPolicy> {
  const response = await client.patch<ApiResponse<DepartmentAccessPolicy>>(
    `/api/v2/access-policies/departments/${departmentId}`,
    payload
  );
  return response.data.data;
}

// =====================
// PROGRAM ACCESS OVERRIDES
// =====================

/**
 * GET /api/v2/access-policies/programs - List program access overrides
 */
export async function listProgramAccessOverrides(
  departmentId?: string
): Promise<ProgramAccessOverridesListResponse> {
  const response = await client.get<ApiResponse<ProgramAccessOverridesListResponse>>(
    '/api/v2/access-policies/programs',
    { params: departmentId ? { departmentId } : undefined }
  );
  return response.data.data;
}

/**
 * GET /api/v2/access-policies/programs/:programId - Get program access override
 */
export async function getProgramAccessOverride(
  programId: string
): Promise<ProgramAccessOverride> {
  const response = await client.get<ApiResponse<ProgramAccessOverride>>(
    `/api/v2/access-policies/programs/${programId}`
  );
  return response.data.data;
}

/**
 * PUT /api/v2/access-policies/programs/:programId - Create/update program access override
 */
export async function upsertProgramAccessOverride(
  programId: string,
  payload: UpsertProgramAccessOverridePayload
): Promise<ProgramAccessOverride> {
  const response = await client.put<ApiResponse<ProgramAccessOverride>>(
    `/api/v2/access-policies/programs/${programId}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/access-policies/programs/:programId - Remove program override (revert to department policy)
 */
export async function deleteProgramAccessOverride(programId: string): Promise<void> {
  await client.delete(`/api/v2/access-policies/programs/${programId}`);
}

// =====================
// PROGRAM ENROLLMENTS
// =====================

/**
 * GET /api/v2/program-enrollments - List program enrollments
 */
export async function listProgramEnrollments(
  filters?: ProgramEnrollmentFilters
): Promise<ProgramEnrollmentsListResponse> {
  const response = await client.get<ApiResponse<ProgramEnrollmentsListResponse>>(
    '/api/v2/program-enrollments',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/program-enrollments/:id - Get program enrollment details
 */
export async function getProgramEnrollment(id: string): Promise<ProgramEnrollmentDetail> {
  const response = await client.get<ApiResponse<ProgramEnrollmentDetail>>(
    `/api/v2/program-enrollments/${id}`
  );
  return response.data.data;
}

/**
 * GET /api/v2/learners/:learnerId/program-enrollments - Get learner's program enrollments
 */
export async function getLearnerProgramEnrollments(
  learnerId: string,
  filters?: { status?: string }
): Promise<ProgramEnrollmentListItem[]> {
  const response = await client.get<ApiResponse<ProgramEnrollmentListItem[]>>(
    `/api/v2/learners/${learnerId}/program-enrollments`,
    { params: filters }
  );
  return response.data.data;
}

/**
 * POST /api/v2/program-enrollments/:id/extend - Manually extend access
 */
export async function extendProgramAccess(
  enrollmentId: string,
  payload: ExtendAccessPayload
): Promise<ProgramEnrollment> {
  const response = await client.post<ApiResponse<ProgramEnrollment>>(
    `/api/v2/program-enrollments/${enrollmentId}/extend`,
    payload
  );
  return response.data.data;
}

// =====================
// ACCESS EXTENSION REQUESTS
// =====================

/**
 * GET /api/v2/access-extensions - List access extension requests
 */
export async function listAccessExtensionRequests(
  filters?: AccessExtensionRequestFilters
): Promise<AccessExtensionRequestsListResponse> {
  const response = await client.get<ApiResponse<AccessExtensionRequestsListResponse>>(
    '/api/v2/access-extensions',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/access-extensions/:id - Get access extension request details
 */
export async function getAccessExtensionRequest(id: string): Promise<AccessExtensionRequest> {
  const response = await client.get<ApiResponse<AccessExtensionRequest>>(
    `/api/v2/access-extensions/${id}`
  );
  return response.data.data;
}

/**
 * POST /api/v2/program-enrollments/:enrollmentId/request-extension - Request access extension
 */
export async function requestAccessExtension(
  enrollmentId: string,
  payload: RequestAccessExtensionPayload
): Promise<AccessExtensionRequest> {
  const response = await client.post<ApiResponse<AccessExtensionRequest>>(
    `/api/v2/program-enrollments/${enrollmentId}/request-extension`,
    payload
  );
  return response.data.data;
}

/**
 * POST /api/v2/access-extensions/:id/review - Review access extension request
 */
export async function reviewAccessExtensionRequest(
  requestId: string,
  payload: ReviewAccessExtensionPayload
): Promise<AccessExtensionRequest> {
  const response = await client.post<ApiResponse<AccessExtensionRequest>>(
    `/api/v2/access-extensions/${requestId}/review`,
    payload
  );
  return response.data.data;
}
