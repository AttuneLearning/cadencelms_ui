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
 * POST /modules/:moduleId/access - Record that a learner has accessed a module
 */
export async function recordModuleAccess(
  moduleId: string,
  payload: RecordAccessPayload
): Promise<RecordAccessResponse> {
  const response = await client.post<ApiResponse<RecordAccessResponse>>(
    `/modules/${moduleId}/access`,
    payload
  );
  return response.data.data;
}

// =====================
// GET BY ENROLLMENT
// =====================

/**
 * GET /enrollments/:enrollmentId/module-access - Get all module access records for an enrollment
 */
export async function getModuleAccessByEnrollment(
  enrollmentId: string
): Promise<EnrollmentModuleAccessResponse> {
  const response = await client.get<ApiResponse<EnrollmentModuleAccessResponse>>(
    `/enrollments/${enrollmentId}/module-access`
  );
  return response.data.data;
}

// =====================
// GET BY MODULE (ANALYTICS)
// =====================

/**
 * GET /modules/:moduleId/access - Get all learner access records for a module
 */
export async function getModuleAccessByModule(
  moduleId: string,
  filters?: ModuleAccessFilters
): Promise<ModuleAccessAnalyticsResponse> {
  const response = await client.get<ApiResponse<ModuleAccessAnalyticsResponse>>(
    `/modules/${moduleId}/access`,
    { params: filters }
  );
  return response.data.data;
}

// =====================
// GET COURSE SUMMARY
// =====================

/**
 * GET /courses/:courseId/module-access-summary - Get aggregated module access summary
 */
export async function getCourseModuleAccessSummary(
  courseId: string,
  filters?: CourseSummaryFilters
): Promise<CourseModuleAccessSummaryResponse> {
  const response = await client.get<ApiResponse<CourseModuleAccessSummaryResponse>>(
    `/courses/${courseId}/module-access-summary`,
    { params: filters }
  );
  return response.data.data;
}

// =====================
// MARK LEARNING UNIT STARTED
// =====================

/**
 * POST /module-access/:moduleAccessId/learning-unit-started - Mark that learner started a learning unit
 */
export async function markLearningUnitStarted(
  moduleAccessId: string
): Promise<MarkLearningUnitStartedResponse> {
  const response = await client.post<ApiResponse<MarkLearningUnitStartedResponse>>(
    `/module-access/${moduleAccessId}/learning-unit-started`,
    {}
  );
  return response.data.data;
}

// =====================
// UPDATE PROGRESS
// =====================

/**
 * PATCH /module-access/:moduleAccessId/progress - Update learning unit completion progress
 */
export async function updateModuleAccessProgress(
  moduleAccessId: string,
  payload: UpdateProgressPayload
): Promise<UpdateProgressResponse> {
  const response = await client.patch<ApiResponse<UpdateProgressResponse>>(
    `/module-access/${moduleAccessId}/progress`,
    payload
  );
  return response.data.data;
}
