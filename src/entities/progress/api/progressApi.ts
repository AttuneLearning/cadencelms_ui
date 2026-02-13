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
  ModuleProgress,
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

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function normalizeModuleType(value: unknown): ModuleProgress['moduleType'] {
  const raw = (asString(value) || '').toLowerCase();
  switch (raw) {
    case 'scorm':
    case 'custom':
    case 'exercise':
    case 'video':
    case 'document':
      return raw;
    default:
      return 'custom';
  }
}

function normalizeProgressStatus(value: unknown): ModuleProgress['status'] {
  const raw = (asString(value) || '').toLowerCase();
  switch (raw) {
    case 'not_started':
    case 'in_progress':
    case 'completed':
      return raw;
    default:
      return 'not_started';
  }
}

function normalizeModuleProgressItem(raw: unknown, index: number): ModuleProgress {
  const item = asRecord(raw) || {};

  return {
    moduleId:
      asString(item.moduleId) ??
      asString(item.id) ??
      asString(item.contentId) ??
      asString(item.learningUnitId) ??
      `module-${index + 1}`,
    moduleTitle:
      asString(item.moduleTitle) ??
      asString(item.title) ??
      asString(item.name) ??
      `Module ${index + 1}`,
    moduleType: normalizeModuleType(item.moduleType ?? item.type),
    order: asNumber(item.order) ?? index + 1,
    status: normalizeProgressStatus(item.status),
    completionPercent: asNumber(item.completionPercent) ?? 0,
    score: asNumber(item.score),
    timeSpent: asNumber(item.timeSpent) ?? 0,
    attempts: asNumber(item.attempts) ?? 0,
    bestAttemptScore: asNumber(item.bestAttemptScore),
    lastAttemptScore: asNumber(item.lastAttemptScore),
    startedAt: asString(item.startedAt),
    completedAt: asString(item.completedAt),
    lastAccessedAt: asString(item.lastAccessedAt),
    isRequired: asBoolean(item.isRequired) ?? true,
    passingScore: asNumber(item.passingScore),
    passed: asBoolean(item.passed),
  };
}

function normalizeCourseProgress(raw: CourseProgress): CourseProgress {
  const record = asRecord(raw);
  if (!record) return raw;

  const normalizedModules = asArray(record.moduleProgress).map((module, index) =>
    normalizeModuleProgressItem(module, index)
  );

  return {
    ...raw,
    courseId:
      asString(record.courseId) ??
      asString(record.id) ??
      raw.courseId,
    moduleProgress: normalizedModules,
  };
}

function normalizeDetailedProgressReport(raw: DetailedProgressReport): DetailedProgressReport {
  const report = asRecord(raw);
  if (!report) return raw;

  const learnerDetails = asArray(report.learnerDetails).map((learner) => {
    const learnerRecord = asRecord(learner);
    if (!learnerRecord) return learner;

    const normalizedModules = asArray(learnerRecord.moduleProgress).map((module, index) =>
      normalizeModuleProgressItem(module, index)
    );

    return {
      ...learnerRecord,
      moduleProgress: normalizedModules,
    };
  });

  return {
    ...raw,
    learnerDetails: learnerDetails as DetailedProgressReport['learnerDetails'],
  };
}

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
  return normalizeCourseProgress(response.data.data);
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
  return normalizeDetailedProgressReport(response.data.data);
}

// =====================
// LESSON PROGRESS
// =====================

export interface StartLessonRequest {
  courseId: string;
  lessonId: string;
  enrollmentId?: string;
}

export interface StartLessonResponse {
  lessonProgressId: string;
  startedAt: string;
  resumeData?: Record<string, unknown>;
}

export interface UpdateLessonProgressRequest {
  courseId: string;
  lessonId: string;
  progressData: {
    completionPercent?: number;
    lastPosition?: string;
    timeSpent?: number;
    interactionsCompleted?: string[];
    suspendData?: Record<string, unknown>;
  };
  enrollmentId?: string;
}

export interface UpdateLessonProgressResponse {
  lessonProgressId: string;
  updatedAt: string;
  progressData: {
    completionPercent: number;
    timeSpent: number;
  };
}

export interface CompleteLessonRequest {
  courseId: string;
  lessonId: string;
  completionData: {
    score?: number;
    timeSpent: number;
    completedAt?: string;
    finalData?: Record<string, unknown>;
  };
  enrollmentId?: string;
}

export interface CompleteLessonResponse {
  lessonProgressId: string;
  completedAt: string;
  score?: number;
  creditAwarded: boolean;
}

/**
 * POST /progress/lesson/start - Start tracking lesson progress
 */
export async function startLesson(
  request: StartLessonRequest
): Promise<StartLessonResponse> {
  const response = await client.post<ApiResponse<StartLessonResponse>>(
    '/progress/lesson/start',
    request
  );
  return response.data.data;
}

/**
 * PATCH /progress/lesson/update - Update lesson progress
 */
export async function updateLessonProgress(
  request: UpdateLessonProgressRequest
): Promise<UpdateLessonProgressResponse> {
  const response = await client.patch<ApiResponse<UpdateLessonProgressResponse>>(
    '/progress/lesson/update',
    request
  );
  return response.data.data;
}

/**
 * POST /progress/lesson/complete - Mark lesson as complete
 */
export async function completeLesson(
  request: CompleteLessonRequest
): Promise<CompleteLessonResponse> {
  const response = await client.post<ApiResponse<CompleteLessonResponse>>(
    '/progress/lesson/complete',
    request
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
  startLesson,
  updateLessonProgress,
  completeLesson,
};
