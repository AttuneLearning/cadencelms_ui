/**
 * Module Access API Client
 * Implements endpoints from api/contracts/api/module-access.contract.ts v1.0.0
 *
 * Tracks learner access and engagement at the module level
 */

import { client } from '@/shared/api/client';
import type {
  RecordAccessPayload,
  RecordAccessResponse,
  EnrollmentModuleAccessResponse,
  ModuleAccessAnalyticsResponse,
  CourseModuleAccessSummaryResponse,
  ModuleAccessFilters,
  CourseSummaryFilters,
  MarkLearningUnitStartedResponse,
  UpdateProgressPayload,
  UpdateProgressResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// RECORD ACCESS
// =====================

/**
 * POST /module-access - Record that a learner has accessed a module
 */
export async function recordModuleAccess(
  moduleId: string,
  payload: RecordAccessPayload
): Promise<RecordAccessResponse> {
  const response = await client.post<ApiResponse<RecordAccessResponse>>(
    '/module-access',
    { moduleId, ...payload }
  );
  return response.data.data;
}

// =====================
// GET BY ENROLLMENT
// =====================

/**
 * GET /module-access?enrollmentId=... - Get module access records for an enrollment
 */
export async function getModuleAccessByEnrollment(
  enrollmentId: string
): Promise<EnrollmentModuleAccessResponse> {
  const response = await client.get<ApiResponse<EnrollmentModuleAccessResponse>>(
    '/module-access',
    { params: { enrollmentId } }
  );
  return response.data.data;
}

// =====================
// GET BY MODULE (ANALYTICS)
// =====================

/**
 * GET /module-access?moduleId=... - Get learner access records for a module
 */
export async function getModuleAccessByModule(
  moduleId: string,
  filters?: ModuleAccessFilters
): Promise<ModuleAccessAnalyticsResponse> {
  const response = await client.get<ApiResponse<ModuleAccessAnalyticsResponse>>(
    '/module-access',
    { params: { moduleId, ...filters } }
  );
  return response.data.data;
}

// =====================
// GET COURSE SUMMARY
// =====================

/**
 * GET /module-access/analytics/drop-off?courseId=... - Get aggregated access/drop-off summary
 */
export async function getCourseModuleAccessSummary(
  courseId: string,
  filters?: CourseSummaryFilters
): Promise<CourseModuleAccessSummaryResponse> {
  const response = await client.get<ApiResponse<CourseModuleAccessSummaryResponse>>(
    '/module-access/analytics/drop-off',
    { params: { courseId, ...filters } }
  );
  return response.data.data;
}

// =====================
// MARK LEARNING UNIT STARTED
// =====================

/**
 * PUT /module-access/:moduleAccessId with action=mark_learning_unit_started
 */
export async function markLearningUnitStarted(
  moduleAccessId: string
): Promise<MarkLearningUnitStartedResponse> {
  const response = await client.put<ApiResponse<MarkLearningUnitStartedResponse>>(
    `/module-access/${moduleAccessId}`,
    { action: 'mark_learning_unit_started' }
  );
  return response.data.data;
}

// =====================
// UPDATE PROGRESS
// =====================

/**
 * PUT /module-access/:moduleAccessId with action=update_progress
 */
export async function updateModuleAccessProgress(
  moduleAccessId: string,
  payload: UpdateProgressPayload
): Promise<UpdateProgressResponse> {
  const response = await client.put<ApiResponse<UpdateProgressResponse>>(
    `/module-access/${moduleAccessId}`,
    {
      action: 'update_progress',
      ...payload,
    }
  );
  return response.data.data;
}
