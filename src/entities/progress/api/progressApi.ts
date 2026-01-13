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
 * GET /progress/program/:programId - Get program progress
 */
export async function getProgramProgress(
  programId: string,
  learnerId?: string
): Promise<ProgramProgress> {
  const response = await client.get<ApiResponse<ProgramProgress>>(
    `/progress/program/${programId}`,
    { params: learnerId ? { learnerId } : undefined }
  );
  return response.data.data;
}

// =====================
// COURSE PROGRESS
// =====================

/**
 * GET /progress/course/:courseId - Get detailed course progress
 */
export async function getCourseProgress(
  courseId: string,
  learnerId?: string
): Promise<CourseProgress> {
  const response = await client.get<ApiResponse<CourseProgress>>(
    `/progress/course/${courseId}`,
    { params: learnerId ? { learnerId } : undefined }
  );
  return response.data.data;
}

// =====================
// CLASS PROGRESS
// =====================

/**
 * GET /progress/class/:classId - Get class progress with attendance
 */
export async function getClassProgress(
  classId: string,
  learnerId?: string
): Promise<ClassProgress> {
  const response = await client.get<ApiResponse<ClassProgress>>(
    `/progress/class/${classId}`,
    { params: learnerId ? { learnerId } : undefined }
  );
  return response.data.data;
}

// =====================
// LEARNER PROGRESS
// =====================

/**
 * GET /progress/learner/:learnerId - Get comprehensive learner progress
 */
export async function getLearnerProgress(learnerId: string): Promise<LearnerProgress> {
  const response = await client.get<ApiResponse<LearnerProgress>>(
    `/progress/learner/${learnerId}`
  );
  return response.data.data;
}

/**
 * GET /progress/learner/:learnerId/program/:programId - Get learner's program progress
 */
export async function getLearnerProgramProgress(
  learnerId: string,
  programId: string
): Promise<ProgramProgress> {
  const response = await client.get<ApiResponse<ProgramProgress>>(
    `/progress/learner/${learnerId}/program/${programId}`
  );
  return response.data.data;
}

// =====================
// UPDATE PROGRESS
// =====================

/**
 * POST /progress/update - Manual progress update (instructor/admin override)
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
    '/progress/update',
    requestPayload
  );
  return response.data.data;
}

// =====================
// PROGRESS REPORTS
// =====================

/**
 * GET /progress/reports/summary - Get progress summary report
 */
export async function getProgressSummary(
  filters?: ProgressSummaryFilters
): Promise<ProgressSummaryResponse> {
  const response = await client.get<ApiResponse<ProgressSummaryResponse>>(
    '/progress/reports/summary',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /progress/reports/detailed - Get detailed progress report
 */
export async function getDetailedProgressReport(
  filters?: DetailedProgressReportFilters
): Promise<DetailedProgressReport> {
  const response = await client.get<ApiResponse<DetailedProgressReport>>(
    '/progress/reports/detailed',
    { params: filters }
  );
  return response.data.data;
}

/**
 * Progress API object for backward compatibility
 * Groups all progress API functions for easier consumption
 */
export const progressApi = {
  getProgramProgress,
  getCourseProgress,
  getClassProgress,
  getLearnerProgress,
  updateProgress,
  getProgressSummary,
  getDetailedProgressReport,
  // Stub methods for features not yet implemented
  startLesson: async (_courseId: string, _lessonId: string) => {
    console.warn('progressApi.startLesson not yet implemented');
  },
  updateLessonProgress: async (_courseId: string, _lessonId: string, _data: any) => {
    console.warn('progressApi.updateLessonProgress not yet implemented');
  },
  completeLesson: async (_courseId: string, _lessonId: string, _data: any) => {
    console.warn('progressApi.completeLesson not yet implemented');
  },
};
