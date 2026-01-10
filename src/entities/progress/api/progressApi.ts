/**
 * Progress API Client
 * Implements endpoints from progress.contract.ts v1.0.0
 *
 * Covers all 8 progress tracking endpoints
 */

import { client } from '@/shared/api/client';
import type {
  ProgramProgress,
  CourseProgress,
  ClassProgress,
  LearnerProgress,
  UpdateProgressRequest,
  UpdateProgressResponse,
  ProgressSummaryFilters,
  ProgressSummaryResponse,
  DetailedProgressReportFilters,
  DetailedProgressReport,
  ApiResponse,
} from '../model/types';

// =====================
// PROGRAM PROGRESS
// =====================

/**
 * GET /api/v2/progress/program/:programId - Get program progress
 */
export async function getProgramProgress(
  programId: string,
  learnerId?: string
): Promise<ProgramProgress> {
  const response = await client.get<ApiResponse<ProgramProgress>>(
    `/api/v2/progress/program/${programId}`,
    { params: learnerId ? { learnerId } : undefined }
  );
  return response.data.data;
}

// =====================
// COURSE PROGRESS
// =====================

/**
 * GET /api/v2/progress/course/:courseId - Get detailed course progress
 */
export async function getCourseProgress(
  courseId: string,
  learnerId?: string
): Promise<CourseProgress> {
  const response = await client.get<ApiResponse<CourseProgress>>(
    `/api/v2/progress/course/${courseId}`,
    { params: learnerId ? { learnerId } : undefined }
  );
  return response.data.data;
}

// =====================
// CLASS PROGRESS
// =====================

/**
 * GET /api/v2/progress/class/:classId - Get class progress with attendance
 */
export async function getClassProgress(
  classId: string,
  learnerId?: string
): Promise<ClassProgress> {
  const response = await client.get<ApiResponse<ClassProgress>>(
    `/api/v2/progress/class/${classId}`,
    { params: learnerId ? { learnerId } : undefined }
  );
  return response.data.data;
}

// =====================
// LEARNER PROGRESS
// =====================

/**
 * GET /api/v2/progress/learner/:learnerId - Get comprehensive learner progress
 */
export async function getLearnerProgress(learnerId: string): Promise<LearnerProgress> {
  const response = await client.get<ApiResponse<LearnerProgress>>(
    `/api/v2/progress/learner/${learnerId}`
  );
  return response.data.data;
}

/**
 * GET /api/v2/progress/learner/:learnerId/program/:programId - Get learner's program progress
 */
export async function getLearnerProgramProgress(
  learnerId: string,
  programId: string
): Promise<ProgramProgress> {
  const response = await client.get<ApiResponse<ProgramProgress>>(
    `/api/v2/progress/learner/${learnerId}/program/${programId}`
  );
  return response.data.data;
}

// =====================
// UPDATE PROGRESS
// =====================

/**
 * POST /api/v2/progress/update - Manual progress update (instructor/admin override)
 */
export async function updateProgress(
  payload: UpdateProgressRequest
): Promise<UpdateProgressResponse> {
  // Default notifyLearner to true if not specified
  const requestPayload = {
    ...payload,
    notifyLearner: payload.notifyLearner !== undefined ? payload.notifyLearner : true,
  };

  const response = await client.post<ApiResponse<UpdateProgressResponse>>(
    '/api/v2/progress/update',
    requestPayload
  );
  return response.data.data;
}

// =====================
// PROGRESS REPORTS
// =====================

/**
 * GET /api/v2/progress/reports/summary - Get progress summary report
 */
export async function getProgressSummary(
  filters?: ProgressSummaryFilters
): Promise<ProgressSummaryResponse> {
  const response = await client.get<ApiResponse<ProgressSummaryResponse>>(
    '/api/v2/progress/reports/summary',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/progress/reports/detailed - Get detailed progress report
 */
export async function getDetailedProgressReport(
  filters?: DetailedProgressReportFilters
): Promise<DetailedProgressReport> {
  const response = await client.get<ApiResponse<DetailedProgressReport>>(
    '/api/v2/progress/reports/detailed',
    { params: filters }
  );
  return response.data.data;
}
