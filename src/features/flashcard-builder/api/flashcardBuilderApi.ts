/**
 * Flashcard Builder API Client
 * Implements module-level flashcard authoring endpoints
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
 * Media content for flashcard front/back
 */
export interface FlashcardMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  altText?: string;
}

/**
 * Flashcard item in a module
 */
export interface FlashcardItem {
  id: string;
  moduleId: string;
  questionId: string;
  front: {
    text: string;
    hints?: string[];
    media?: FlashcardMedia;
  };
  back: {
    text: string;
    explanation?: string;
    media?: FlashcardMedia;
  };
  tags: string[];
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create flashcard request
 */
export interface CreateFlashcardRequest {
  front: {
    text: string;
    hints?: string[];
    media?: FlashcardMedia;
  };
  back: {
    text: string;
    explanation?: string;
    media?: FlashcardMedia;
  };
  tags?: string[];
}

/**
 * Update flashcard request
 */
export interface UpdateFlashcardRequest {
  front?: {
    text?: string;
    hints?: string[];
    media?: FlashcardMedia | null;
  };
  back?: {
    text?: string;
    explanation?: string;
    media?: FlashcardMedia | null;
  };
  tags?: string[];
}

/**
 * Bulk import flashcard item
 */
export interface BulkFlashcardItem {
  front: string;
  back: string;
  hints?: string[];
  tags?: string[];
}

/**
 * Bulk import request
 */
export interface BulkImportRequest {
  cards: BulkFlashcardItem[];
  appendToExisting?: boolean;
}

/**
 * Bulk import response
 */
export interface BulkImportResponse {
  imported: number;
  failed: number;
  errors?: Array<{ index: number; error: string }>;
  cards: FlashcardItem[];
}

/**
 * Reorder request
 */
export interface ReorderRequest {
  cardIds: string[];
}

/**
 * Flashcards list response
 */
export interface FlashcardsListResponse {
  moduleId: string;
  moduleName: string;
  cards: FlashcardItem[];
  totalCards: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * GET /modules/:moduleId/flashcards - Get all flashcards for a module
 */
export async function getFlashcards(moduleId: string): Promise<FlashcardsListResponse> {
  const response = await client.get<ApiResponse<FlashcardsListResponse>>(
    `/modules/${moduleId}/flashcards`
  );
  return response.data.data;
}

/**
 * POST /modules/:moduleId/flashcards - Create a new flashcard
 */
export async function createFlashcard(
  moduleId: string,
  data: CreateFlashcardRequest
): Promise<FlashcardItem> {
  const response = await client.post<ApiResponse<FlashcardItem>>(
    `/modules/${moduleId}/flashcards`,
    data
  );
  return response.data.data;
}

/**
 * PUT /modules/:moduleId/flashcards/:cardId - Update a flashcard
 */
export async function updateFlashcard(
  moduleId: string,
  cardId: string,
  data: UpdateFlashcardRequest
): Promise<FlashcardItem> {
  const response = await client.put<ApiResponse<FlashcardItem>>(
    `/modules/${moduleId}/flashcards/${cardId}`,
    data
  );
  return response.data.data;
}

/**
 * DELETE /modules/:moduleId/flashcards/:cardId - Delete a flashcard
 */
export async function deleteFlashcard(moduleId: string, cardId: string): Promise<void> {
  await client.delete(`/modules/${moduleId}/flashcards/${cardId}`);
}

/**
 * POST /modules/:moduleId/flashcards/bulk - Bulk import flashcards
 */
export async function bulkImportFlashcards(
  moduleId: string,
  data: BulkImportRequest
): Promise<BulkImportResponse> {
  const response = await client.post<ApiResponse<BulkImportResponse>>(
    `/modules/${moduleId}/flashcards/bulk`,
    data
  );
  return response.data.data;
}

/**
 * PATCH /modules/:moduleId/flashcards/reorder - Reorder flashcards
 */
export async function reorderFlashcards(
  moduleId: string,
  data: ReorderRequest
): Promise<FlashcardItem[]> {
  const response = await client.patch<ApiResponse<FlashcardItem[]>>(
    `/modules/${moduleId}/flashcards/reorder`,
    data
  );
  return response.data.data;
}
