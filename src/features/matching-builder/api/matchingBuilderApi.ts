/**
 * Matching Builder API Client
 * Implements module-level matching exercise authoring endpoints
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
 * Media content for matching pair items
 */
export interface MatchingMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  altText?: string;
}

/**
 * A matching pair for authoring
 */
export interface MatchingPairItem {
  id: string;
  /** Left side (Column A / prompt) */
  left: {
    text: string;
    hints?: string[];
    media?: MatchingMedia;
  };
  /** Right side (Column B / answer) */
  right: {
    text: string;
    explanation?: string;
    media?: MatchingMedia;
  };
  sequence: number;
}

/**
 * Matching exercise/activity configuration
 */
export interface MatchingExercise {
  id: string;
  moduleId: string;
  questionId: string;
  title: string;
  description?: string;
  instructions: string;
  pairs: MatchingPairItem[];
  settings: {
    shufflePairs: boolean;
    timeLimit: number; // seconds, 0 = no limit
    attemptsAllowed: number; // 0 = unlimited
    showFeedback: boolean;
    pointsPerMatch: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create matching exercise request
 */
export interface CreateMatchingExerciseRequest {
  title: string;
  description?: string;
  instructions?: string;
  pairs: Array<{
    left: {
      text: string;
      hints?: string[];
      media?: MatchingMedia;
    };
    right: {
      text: string;
      explanation?: string;
      media?: MatchingMedia;
    };
  }>;
  settings?: {
    shufflePairs?: boolean;
    timeLimit?: number;
    attemptsAllowed?: number;
    showFeedback?: boolean;
    pointsPerMatch?: number;
  };
  tags?: string[];
}

/**
 * Update matching exercise request
 */
export interface UpdateMatchingExerciseRequest {
  title?: string;
  description?: string;
  instructions?: string;
  settings?: {
    shufflePairs?: boolean;
    timeLimit?: number;
    attemptsAllowed?: number;
    showFeedback?: boolean;
    pointsPerMatch?: number;
  };
  tags?: string[];
}

/**
 * Update pairs request
 */
export interface UpdatePairsRequest {
  pairs: Array<{
    id?: string;
    left: {
      text: string;
      hints?: string[];
      media?: MatchingMedia | null;
    };
    right: {
      text: string;
      explanation?: string;
      media?: MatchingMedia | null;
    };
  }>;
}

/**
 * Bulk import pair item
 */
export interface BulkMatchingPairItem {
  left: string;
  right: string;
  leftHints?: string[];
  rightExplanation?: string;
}

/**
 * Bulk import request
 */
export interface BulkImportRequest {
  pairs: BulkMatchingPairItem[];
  appendToExisting?: boolean;
}

/**
 * Bulk import response
 */
export interface BulkImportResponse {
  imported: number;
  failed: number;
  errors?: Array<{ index: number; error: string }>;
  pairs: MatchingPairItem[];
}

/**
 * Reorder request
 */
export interface ReorderRequest {
  pairIds: string[];
}

/**
 * Matching exercises list response
 */
export interface MatchingExercisesListResponse {
  moduleId: string;
  moduleName: string;
  exercises: MatchingExercise[];
  totalExercises: number;
}

/**
 * Single matching exercise response
 */
export interface MatchingExerciseResponse {
  moduleId: string;
  moduleName: string;
  exercise: MatchingExercise;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /modules/:moduleId/matching-exercises - Get all matching exercises for a module
 */
export async function getMatchingExercises(
  moduleId: string
): Promise<MatchingExercisesListResponse> {
  const response = await client.get<ApiResponse<MatchingExercisesListResponse>>(
    `/modules/${moduleId}/matching-exercises`
  );
  return response.data.data;
}

/**
 * GET /modules/:moduleId/matching-exercises/:exerciseId - Get a single matching exercise
 */
export async function getMatchingExercise(
  moduleId: string,
  exerciseId: string
): Promise<MatchingExerciseResponse> {
  const response = await client.get<ApiResponse<MatchingExerciseResponse>>(
    `/modules/${moduleId}/matching-exercises/${exerciseId}`
  );
  return response.data.data;
}

/**
 * POST /modules/:moduleId/matching-exercises - Create a new matching exercise
 */
export async function createMatchingExercise(
  moduleId: string,
  data: CreateMatchingExerciseRequest
): Promise<MatchingExercise> {
  const response = await client.post<ApiResponse<MatchingExercise>>(
    `/modules/${moduleId}/matching-exercises`,
    data
  );
  return response.data.data;
}

/**
 * PUT /modules/:moduleId/matching-exercises/:exerciseId - Update a matching exercise
 */
export async function updateMatchingExercise(
  moduleId: string,
  exerciseId: string,
  data: UpdateMatchingExerciseRequest
): Promise<MatchingExercise> {
  const response = await client.put<ApiResponse<MatchingExercise>>(
    `/modules/${moduleId}/matching-exercises/${exerciseId}`,
    data
  );
  return response.data.data;
}

/**
 * DELETE /modules/:moduleId/matching-exercises/:exerciseId - Delete a matching exercise
 */
export async function deleteMatchingExercise(
  moduleId: string,
  exerciseId: string
): Promise<void> {
  await client.delete(`/modules/${moduleId}/matching-exercises/${exerciseId}`);
}

/**
 * PUT /modules/:moduleId/matching-exercises/:exerciseId/pairs - Update pairs
 */
export async function updateMatchingPairs(
  moduleId: string,
  exerciseId: string,
  data: UpdatePairsRequest
): Promise<MatchingPairItem[]> {
  const response = await client.put<ApiResponse<MatchingPairItem[]>>(
    `/modules/${moduleId}/matching-exercises/${exerciseId}/pairs`,
    data
  );
  return response.data.data;
}

/**
 * POST /modules/:moduleId/matching-exercises/:exerciseId/pairs/bulk - Bulk import pairs
 */
export async function bulkImportPairs(
  moduleId: string,
  exerciseId: string,
  data: BulkImportRequest
): Promise<BulkImportResponse> {
  const response = await client.post<ApiResponse<BulkImportResponse>>(
    `/modules/${moduleId}/matching-exercises/${exerciseId}/pairs/bulk`,
    data
  );
  return response.data.data;
}

/**
 * PATCH /modules/:moduleId/matching-exercises/:exerciseId/pairs/reorder - Reorder pairs
 */
export async function reorderMatchingPairs(
  moduleId: string,
  exerciseId: string,
  data: ReorderRequest
): Promise<MatchingPairItem[]> {
  const response = await client.patch<ApiResponse<MatchingPairItem[]>>(
    `/modules/${moduleId}/matching-exercises/${exerciseId}/pairs/reorder`,
    data
  );
  return response.data.data;
}
