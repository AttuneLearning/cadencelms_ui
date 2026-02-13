/**
 * Flashcard API Client
 * Implements canonical flashcard, retention-check, and remediation endpoints.
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type CheckFrequency = 'every_module' | 'every_n_modules' | 'custom';
export type SelectionMethod = 'random' | 'weighted_by_difficulty' | 'sm2_priority';
export type RemediationStatus = 'pending' | 'content_reviewed' | 'final_retaken' | 'completed';

export interface FlashcardConfig {
  courseId: string;
  enabled: boolean;
  flashcardsPerCheck: number;
  failureThreshold: number;
  checkFrequency: CheckFrequency;
  checkFrequencyValue: number | null;
  selectionMethod: SelectionMethod;
  requireContentReview: boolean;
  requireFinalRetake: boolean;
  includeOnlyCompletedModules: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFlashcardConfigPayload {
  enabled?: boolean;
  flashcardsPerCheck?: number;
  failureThreshold?: number;
  checkFrequency?: CheckFrequency;
  checkFrequencyValue?: number | null;
  selectionMethod?: SelectionMethod;
  requireContentReview?: boolean;
  requireFinalRetake?: boolean;
  includeOnlyCompletedModules?: boolean;
}

export interface FlashcardMedia {
  [key: string]: unknown;
}

export interface FlashcardPrompt {
  text: string;
  media?: FlashcardMedia;
}

export interface FlashcardCardProgress {
  timesCorrect: number;
  timesIncorrect: number;
  lastReviewed: string | null;
  mastered: boolean;
}

export interface FlashcardItem {
  questionId: string;
  promptIndex: number;
  learningUnitId?: string;
  learningUnitQuestionId?: string;
  sourceModuleId?: string;
  front: FlashcardPrompt;
  back: FlashcardPrompt;
  explanation?: string;
  hints?: string[];
  difficulty?: string;
  progress: FlashcardCardProgress;
}

export interface FlashcardSessionStats {
  totalCards: number;
  dueCards: number;
  masteredCards: number;
  newCards: number;
}

export interface FlashcardSession {
  courseId: string;
  moduleId?: string;
  sessionSize: number;
  cards: FlashcardItem[];
  stats: FlashcardSessionStats;
}

export interface FlashcardResult {
  questionId: string;
  promptIndex: number;
  isCorrect: boolean;
  quality?: number;
  timeSpent?: number;
}

export interface RecordResultResponse {
  questionId: string;
  promptIndex: number;
  isCorrect: boolean;
  newInterval: number;
  nextReviewDate: string;
  mastered: boolean;
  masteredAt?: string;
}

export interface FlashcardProgressSummary {
  totalCards: number;
  masteredCards: number;
  masteryPercentage: number;
  cardsNeedingReview: number;
  averageEaseFactor: number;
}

export interface FlashcardProgressByModule {
  moduleId: string;
  moduleName: string;
  totalCards: number;
  masteredCards: number;
  masteryPercentage: number;
}

export interface FlashcardRecentActivity {
  lastReviewDate: string | null;
  cardsReviewedToday: number;
  streakDays: number;
}

export interface FlashcardProgress {
  courseId: string;
  learnerId: string;
  summary: FlashcardProgressSummary;
  byModule: FlashcardProgressByModule[];
  recentActivity: FlashcardRecentActivity;
}

export interface GetSessionParams {
  moduleId?: string;
  sessionSize?: number;
  includeMastered?: boolean;
  shuffle?: boolean;
}

export interface ResetProgressParams {
  moduleId?: string;
  learnerId?: string;
}

export interface PendingRetentionCheck {
  checkId: string;
  sourceModuleId: string;
  sourceModuleName?: string;
  cardCount: number;
  triggeredAt: string;
  isBlocking: boolean;
}

export interface PendingRetentionChecksResponse {
  pendingChecks: PendingRetentionCheck[];
  totalPending: number;
}

export interface RetentionCheckCard {
  questionId: string;
  promptIndex: number;
  learningUnitId?: string;
  learningUnitQuestionId?: string;
  sourceModuleId?: string;
  front: FlashcardPrompt;
  back: FlashcardPrompt;
}

export interface RetentionCheckDetail {
  checkId: string;
  sourceModuleId: string;
  failureThreshold: number;
  cards: RetentionCheckCard[];
  startedAt: string;
}

export interface SubmitRetentionCheckAnswer {
  questionId: string;
  promptIndex?: number;
  correct: boolean;
  quality?: number;
  timeSpent?: number;
}

export interface SubmitRetentionCheckRequest {
  answers: SubmitRetentionCheckAnswer[];
}

export interface RetentionRemediationSummary {
  remediationId: string;
  requireContentReview: boolean;
  requireFinalRetake: boolean;
  moduleId: string;
}

export interface SubmitRetentionCheckResponse {
  checkId: string;
  sourceModuleId: string;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  failureThreshold: number;
  remediationRequired: boolean;
  remediation: RetentionRemediationSummary | null;
}

export interface RetentionHistoryItem {
  checkId: string;
  sourceModuleId: string;
  completedAt: string;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  remediationRequired: boolean;
  remediationStatus: string | null;
}

export interface RetentionHistoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RetentionCheckHistoryResponse {
  history: RetentionHistoryItem[];
  pagination: RetentionHistoryPagination;
}

export interface GetRetentionHistoryParams {
  moduleId?: string;
  page?: number;
  limit?: number;
}

export interface ActiveRemediation {
  remediationId: string;
  moduleId: string;
  moduleName: string;
  triggeredAt: string;
  triggeredByCheckId: string;
  status: RemediationStatus;
  requireContentReview: boolean;
  requireFinalRetake: boolean;
  contentReviewedAt: string | null;
  finalRetakenAt: string | null;
}

export interface ActiveRemediationsResponse {
  remediations: ActiveRemediation[];
  totalActive: number;
  isBlocking: boolean;
}

/**
 * GET /courses/:courseId/flashcard-config
 */
export async function getConfig(courseId: string): Promise<FlashcardConfig> {
  const response = await client.get<ApiResponse<FlashcardConfig>>(
    `/courses/${courseId}/flashcard-config`
  );
  return response.data.data;
}

/**
 * PUT /courses/:courseId/flashcard-config
 */
export async function updateConfig(
  courseId: string,
  payload: UpdateFlashcardConfigPayload
): Promise<FlashcardConfig> {
  const response = await client.put<ApiResponse<FlashcardConfig>>(
    `/courses/${courseId}/flashcard-config`,
    payload
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/flashcard-session
 */
export async function getSession(
  courseId: string,
  params?: GetSessionParams
): Promise<FlashcardSession> {
  const response = await client.get<ApiResponse<FlashcardSession>>(
    `/courses/${courseId}/flashcard-session`,
    { params }
  );
  return response.data.data;
}

/**
 * POST /courses/:courseId/flashcard-result
 */
export async function recordResult(
  courseId: string,
  result: FlashcardResult
): Promise<RecordResultResponse> {
  const response = await client.post<ApiResponse<RecordResultResponse>>(
    `/courses/${courseId}/flashcard-result`,
    result
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/flashcard-progress
 */
export async function getProgress(
  courseId: string,
  moduleId?: string
): Promise<FlashcardProgress> {
  const response = await client.get<ApiResponse<FlashcardProgress>>(
    `/courses/${courseId}/flashcard-progress`,
    { params: moduleId ? { moduleId } : undefined }
  );
  return response.data.data;
}

/**
 * DELETE /courses/:courseId/flashcard-progress
 */
export async function resetProgress(
  courseId: string,
  params?: ResetProgressParams
): Promise<{ cardsReset: number }> {
  const response = await client.delete<ApiResponse<{ cardsReset: number }>>(
    `/courses/${courseId}/flashcard-progress`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/retention-checks/pending
 */
export async function getPendingRetentionChecks(
  courseId: string
): Promise<PendingRetentionChecksResponse> {
  const response = await client.get<ApiResponse<PendingRetentionChecksResponse>>(
    `/courses/${courseId}/retention-checks/pending`
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/retention-checks/:checkId
 */
export async function getRetentionCheck(
  courseId: string,
  checkId: string
): Promise<RetentionCheckDetail> {
  const response = await client.get<ApiResponse<RetentionCheckDetail>>(
    `/courses/${courseId}/retention-checks/${checkId}`
  );
  return response.data.data;
}

/**
 * POST /courses/:courseId/retention-checks/:checkId/submit
 */
export async function submitRetentionCheck(
  courseId: string,
  checkId: string,
  payload: SubmitRetentionCheckRequest
): Promise<SubmitRetentionCheckResponse> {
  const response = await client.post<ApiResponse<SubmitRetentionCheckResponse>>(
    `/courses/${courseId}/retention-checks/${checkId}/submit`,
    payload
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/retention-checks/history
 */
export async function getRetentionCheckHistory(
  courseId: string,
  params?: GetRetentionHistoryParams
): Promise<RetentionCheckHistoryResponse> {
  const response = await client.get<ApiResponse<RetentionCheckHistoryResponse>>(
    `/courses/${courseId}/retention-checks/history`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/remediations/active
 */
export async function getActiveRemediations(
  courseId: string
): Promise<ActiveRemediationsResponse> {
  const response = await client.get<ApiResponse<ActiveRemediationsResponse>>(
    `/courses/${courseId}/remediations/active`
  );
  return response.data.data;
}
