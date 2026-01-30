/**
 * Matching Exercise API Client
 * Implements endpoints for matching exercises
 */

import { client } from '@/shared/api/client';
import type { MediaContent } from '@/entities/question';

/**
 * Standard API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================================================
// Types
// ============================================================================

/**
 * A matching pair (Column A item matched to Column B item)
 */
export interface MatchingPair {
  id: string;
  /** Column A (prompt/question side) */
  columnA: {
    id: string;
    text: string;
    media?: MediaContent;
  };
  /** Column B (answer side) */
  columnB: {
    id: string;
    text: string;
    media?: MediaContent;
  };
}

/**
 * A column item for display (shuffled order)
 */
export interface ColumnItem {
  id: string;
  text: string;
  media?: MediaContent;
}

/**
 * Matching exercise session (shuffled for learner)
 */
export interface MatchingSession {
  id: string;
  questionId: string;
  courseId: string;
  learnerId: string;
  /** Question text/instructions */
  instructions: string;
  /** Column A items (in display order) */
  columnA: ColumnItem[];
  /** Column B items (shuffled, includes distractors) */
  columnB: ColumnItem[];
  /** Total correct pairs (excludes distractors) */
  totalPairs: number;
  /** Number of distractors in Column B */
  distractorCount: number;
  /** Points available for this exercise */
  points: number;
  /** Time limit in seconds (0 = no limit) */
  timeLimit: number;
  /** Session start time */
  startedAt: string;
  /** Whether exercise has been submitted */
  submitted: boolean;
}

/**
 * A user's match submission
 */
export interface MatchSubmission {
  /** Column A item ID */
  columnAId: string;
  /** Column B item ID (what user matched it to) */
  columnBId: string;
}

/**
 * Result of submitting matches
 */
export interface MatchingResult {
  sessionId: string;
  questionId: string;
  /** User's submitted matches */
  submissions: MatchSubmission[];
  /** Correct matches */
  correctMatches: Array<{
    columnAId: string;
    columnBId: string;
    isCorrect: boolean;
  }>;
  /** Score breakdown */
  score: {
    correct: number;
    incorrect: number;
    total: number;
    percentage: number;
    pointsEarned: number;
    pointsPossible: number;
  };
  /** Time taken in seconds */
  timeTaken: number;
  /** Feedback/explanation */
  feedback?: string;
  submittedAt: string;
}

/**
 * Payload for submitting matches
 */
export interface SubmitMatchesPayload {
  matches: MatchSubmission[];
}

/**
 * Historical attempt record
 */
export interface MatchingAttempt {
  id: string;
  sessionId: string;
  questionId: string;
  courseId: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
    pointsEarned: number;
  };
  timeTaken: number;
  attemptNumber: number;
  submittedAt: string;
}

/**
 * Parameters for getting matching attempts
 */
export interface GetAttemptsParams {
  questionId?: string;
  courseId?: string;
  limit?: number;
  page?: number;
}

/**
 * Paginated attempts response
 */
export interface MatchingAttemptsResponse {
  attempts: MatchingAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /questions/:questionId/matching/session - Get a shuffled matching exercise session
 */
export async function getSession(
  questionId: string,
  courseId: string
): Promise<MatchingSession> {
  const response = await client.get<ApiResponse<MatchingSession>>(
    `/questions/${questionId}/matching/session`,
    { params: { courseId } }
  );
  return response.data.data;
}

/**
 * POST /matching/session/:sessionId/submit - Submit matches and get score
 */
export async function submitResult(
  sessionId: string,
  payload: SubmitMatchesPayload
): Promise<MatchingResult> {
  const response = await client.post<ApiResponse<MatchingResult>>(
    `/matching/session/${sessionId}/submit`,
    payload
  );
  return response.data.data;
}

/**
 * GET /matching/attempts - Get attempt history
 */
export async function getAttempts(
  params?: GetAttemptsParams
): Promise<MatchingAttemptsResponse> {
  const response = await client.get<ApiResponse<MatchingAttemptsResponse>>(
    '/matching/attempts',
    { params }
  );
  return response.data.data;
}

/**
 * GET /matching/session/:sessionId - Get session details (for resuming)
 */
export async function getSessionById(sessionId: string): Promise<MatchingSession> {
  const response = await client.get<ApiResponse<MatchingSession>>(
    `/matching/session/${sessionId}`
  );
  return response.data.data;
}

/**
 * GET /matching/session/:sessionId/result - Get result for a completed session
 */
export async function getSessionResult(sessionId: string): Promise<MatchingResult> {
  const response = await client.get<ApiResponse<MatchingResult>>(
    `/matching/session/${sessionId}/result`
  );
  return response.data.data;
}
