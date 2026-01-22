/**
 * Assessment API Client
 * Implements endpoints from api/contracts/api/assessments.contract.ts v1.0.0
 *
 * Assessments are standalone entities at /assessments
 */

import { client } from '@/shared/api/client';
import type {
  Assessment,
  AssessmentsListResponse,
  AssessmentFilters,
  CreateAssessmentPayload,
  UpdateAssessmentPayload,
  PublishAssessmentResponse,
  ArchiveAssessmentResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// LIST ASSESSMENTS
// =====================

/**
 * GET /assessments - List all assessments with filtering and pagination
 */
export async function listAssessments(
  filters?: AssessmentFilters
): Promise<AssessmentsListResponse> {
  const response = await client.get<ApiResponse<AssessmentsListResponse>>(
    '/assessments',
    { params: filters }
  );
  return response.data.data;
}

// =====================
// GET ASSESSMENT
// =====================

/**
 * GET /assessments/:id - Get assessment details
 */
export async function getAssessment(id: string): Promise<Assessment> {
  const response = await client.get<ApiResponse<Assessment>>(`/assessments/${id}`);
  return response.data.data;
}

// =====================
// CREATE ASSESSMENT
// =====================

/**
 * POST /assessments - Create a new assessment (quiz or exam)
 */
export async function createAssessment(
  payload: CreateAssessmentPayload
): Promise<Assessment> {
  const response = await client.post<ApiResponse<Assessment>>('/assessments', payload);
  return response.data.data;
}

// =====================
// UPDATE ASSESSMENT
// =====================

/**
 * PUT /assessments/:id - Update an assessment
 */
export async function updateAssessment(
  id: string,
  payload: UpdateAssessmentPayload
): Promise<Assessment> {
  const response = await client.put<ApiResponse<Assessment>>(
    `/assessments/${id}`,
    payload
  );
  return response.data.data;
}

// =====================
// DELETE ASSESSMENT
// =====================

/**
 * DELETE /assessments/:id - Permanently delete an assessment
 */
export async function deleteAssessment(id: string): Promise<void> {
  await client.delete(`/assessments/${id}`);
}

// =====================
// PUBLISH ASSESSMENT
// =====================

/**
 * POST /assessments/:id/publish - Publish an assessment
 */
export async function publishAssessment(id: string): Promise<PublishAssessmentResponse> {
  const response = await client.post<ApiResponse<PublishAssessmentResponse>>(
    `/assessments/${id}/publish`,
    {}
  );
  return response.data.data;
}

// =====================
// UNPUBLISH ASSESSMENT
// =====================

/**
 * POST /assessments/:id/unpublish - Unpublish an assessment
 */
export async function unpublishAssessment(id: string): Promise<{ id: string; isPublished: false }> {
  const response = await client.post<ApiResponse<{ id: string; isPublished: false }>>(
    `/assessments/${id}/unpublish`,
    {}
  );
  return response.data.data;
}

// =====================
// ARCHIVE ASSESSMENT
// =====================

/**
 * POST /assessments/:id/archive - Archive an assessment (soft delete)
 */
export async function archiveAssessment(id: string): Promise<ArchiveAssessmentResponse> {
  const response = await client.post<ApiResponse<ArchiveAssessmentResponse>>(
    `/assessments/${id}/archive`,
    {}
  );
  return response.data.data;
}

// =====================
// UNARCHIVE ASSESSMENT
// =====================

/**
 * POST /assessments/:id/unarchive - Unarchive an assessment
 */
export async function unarchiveAssessment(id: string): Promise<{ id: string; isArchived: false }> {
  const response = await client.post<ApiResponse<{ id: string; isArchived: false }>>(
    `/assessments/${id}/unarchive`,
    {}
  );
  return response.data.data;
}
