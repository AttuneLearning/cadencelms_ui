/**
 * Flashcard API Client
 * Implements endpoints for flashcard configuration and practice sessions
 */

import { client } from '@/shared/api/client';

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
 * Flashcard configuration for a course
 */
export interface FlashcardConfig {
  id: string;
  courseId: string;
  enabled: boolean;
  /** Questions per session (default 10) */
  questionsPerSession: number;
  /** Show hints on front of card */
  showHints: boolean;
  /** Allow learners to mark cards as "known" */
  allowSelfAssessment: boolean;
  /** Spaced repetition algorithm settings */
  spacedRepetition: {
    enabled: boolean;
    /** Intervals in days for each level (e.g., [1, 3, 7, 14, 30]) */
    intervals: number[];
  };
  /** Which question types to include as flashcards */
  includedQuestionTypes: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload for updating flashcard configuration
 */
export interface UpdateFlashcardConfigPayload {
  enabled?: boolean;
  questionsPerSession?: number;
  showHints?: boolean;
  allowSelfAssessment?: boolean;
  spacedRepetition?: {
    enabled?: boolean;
    intervals?: number[];
  };
  includedQuestionTypes?: string[];
}

/**
 * A single flashcard in a session
 */
export interface FlashcardItem {
  id: string;
  questionId: string;
  front: {
    text: string;
    hints?: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
  };
  back: {
    text: string;
    explanation?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
  };
  /** Current mastery level (0-5 for spaced repetition) */
  masteryLevel: number;
  /** Next review date for spaced repetition */
  nextReviewDate?: string;
  /** Number of times reviewed */
  reviewCount: number;
}

/**
 * Flashcard practice session
 */
export interface FlashcardSession {
  id: string;
  courseId: string;
  learnerId: string;
  cards: FlashcardItem[];
  /** Current card index in session */
  currentIndex: number;
  /** Total cards in session */
  totalCards: number;
  /** Cards completed in this session */
  completedCards: number;
  /** Session start time */
  startedAt: string;
  /** Session type: 'new' | 'review' | 'mixed' */
  sessionType: 'new' | 'review' | 'mixed';
}

/**
 * Result for a single flashcard review
 */
export interface FlashcardResult {
  cardId: string;
  questionId: string;
  /** User's self-assessment: 0=again, 1=hard, 2=good, 3=easy */
  rating: 0 | 1 | 2 | 3;
  /** Time spent on card in seconds */
  timeSpent: number;
  /** Whether user viewed the answer */
  viewedAnswer: boolean;
}

/**
 * Response after recording a flashcard result
 */
export interface RecordResultResponse {
  success: boolean;
  /** Updated mastery level */
  newMasteryLevel: number;
  /** Next review date (if spaced repetition enabled) */
  nextReviewDate?: string;
  /** Session progress */
  sessionProgress: {
    completedCards: number;
    totalCards: number;
    isComplete: boolean;
  };
}

/**
 * Flashcard progress statistics
 */
export interface FlashcardProgress {
  courseId: string;
  learnerId: string;
  /** Total unique cards seen */
  totalCardsSeen: number;
  /** Cards at each mastery level (0-5) */
  cardsByMasteryLevel: Record<number, number>;
  /** Total review sessions completed */
  totalSessions: number;
  /** Average rating across all reviews */
  averageRating: number;
  /** Cards due for review today */
  cardsDueToday: number;
  /** Streak (consecutive days with practice) */
  currentStreak: number;
  /** Longest streak */
  longestStreak: number;
  /** Last practice date */
  lastPracticeDate?: string;
}

/**
 * Parameters for getting a flashcard session
 */
export interface GetSessionParams {
  /** Session type preference */
  sessionType?: 'new' | 'review' | 'mixed';
  /** Override questions per session */
  limit?: number;
  /** Specific question IDs to include */
  questionIds?: string[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /courses/:courseId/flashcards/config - Get flashcard configuration
 */
export async function getConfig(courseId: string): Promise<FlashcardConfig> {
  const response = await client.get<ApiResponse<FlashcardConfig>>(
    `/courses/${courseId}/flashcards/config`
  );
  return response.data.data;
}

/**
 * PUT /courses/:courseId/flashcards/config - Update flashcard configuration
 */
export async function updateConfig(
  courseId: string,
  payload: UpdateFlashcardConfigPayload
): Promise<FlashcardConfig> {
  const response = await client.put<ApiResponse<FlashcardConfig>>(
    `/courses/${courseId}/flashcards/config`,
    payload
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/flashcards/session - Get or start a flashcard session
 */
export async function getSession(
  courseId: string,
  params?: GetSessionParams
): Promise<FlashcardSession> {
  const response = await client.get<ApiResponse<FlashcardSession>>(
    `/courses/${courseId}/flashcards/session`,
    { params }
  );
  return response.data.data;
}

/**
 * POST /courses/:courseId/flashcards/session/:sessionId/result - Record flashcard result
 */
export async function recordResult(
  courseId: string,
  sessionId: string,
  result: FlashcardResult
): Promise<RecordResultResponse> {
  const response = await client.post<ApiResponse<RecordResultResponse>>(
    `/courses/${courseId}/flashcards/session/${sessionId}/result`,
    result
  );
  return response.data.data;
}

/**
 * GET /courses/:courseId/flashcards/progress - Get flashcard progress statistics
 */
export async function getProgress(courseId: string): Promise<FlashcardProgress> {
  const response = await client.get<ApiResponse<FlashcardProgress>>(
    `/courses/${courseId}/flashcards/progress`
  );
  return response.data.data;
}

/**
 * DELETE /courses/:courseId/flashcards/progress - Reset flashcard progress
 */
export async function resetProgress(courseId: string): Promise<void> {
  await client.delete(`/courses/${courseId}/flashcards/progress`);
}

/**
 * POST /courses/:courseId/flashcards/session/:sessionId/complete - Complete a session
 */
export async function completeSession(
  courseId: string,
  sessionId: string
): Promise<{ completedAt: string; summary: { cardsReviewed: number; averageRating: number } }> {
  const response = await client.post<
    ApiResponse<{ completedAt: string; summary: { cardsReviewed: number; averageRating: number } }>
  >(`/courses/${courseId}/flashcards/session/${sessionId}/complete`);
  return response.data.data;
}
