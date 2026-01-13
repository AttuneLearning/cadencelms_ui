/**
 * Exercise API Client
 * Implements endpoints from exercises.contract.ts v1.0.0
 *
 * Covers all 10 exercise management endpoints
 */

import { client } from '@/shared/api/client';
import type {
  Exercise,
  ExercisesListResponse,
  ExerciseFilters,
  CreateExercisePayload,
  UpdateExercisePayload,
  ExerciseQuestionsResponse,
  GetQuestionsQuery,
  AddQuestionPayload,
  AddQuestionResponse,
  BulkAddQuestionsPayload,
  BulkAddQuestionsResponse,
  RemoveQuestionResponse,
  ReorderQuestionsPayload,
  ReorderQuestionsResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// EXERCISES
// =====================

/**
 * GET /content/exercises - List all exercises
 */
export async function listExercises(filters?: ExerciseFilters): Promise<ExercisesListResponse> {
  const response = await client.get<ApiResponse<ExercisesListResponse>>(
    '/content/exercises',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /content/exercises/:id - Get exercise details
 */
export async function getExercise(id: string): Promise<Exercise> {
  const response = await client.get<ApiResponse<Exercise>>(`/content/exercises/${id}`);
  return response.data.data;
}

/**
 * POST /content/exercises - Create new exercise
 */
export async function createExercise(payload: CreateExercisePayload): Promise<Exercise> {
  const response = await client.post<ApiResponse<Exercise>>('/content/exercises', payload);
  return response.data.data;
}

/**
 * PUT /content/exercises/:id - Update exercise
 */
export async function updateExercise(
  id: string,
  payload: UpdateExercisePayload
): Promise<Exercise> {
  const response = await client.put<ApiResponse<Exercise>>(
    `/content/exercises/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /content/exercises/:id - Delete exercise (soft delete)
 */
export async function deleteExercise(id: string): Promise<void> {
  await client.delete(`/content/exercises/${id}`);
}

// =====================
// QUESTIONS
// =====================

/**
 * GET /content/exercises/:id/questions - Get questions in exercise
 */
export async function getExerciseQuestions(
  id: string,
  query?: GetQuestionsQuery
): Promise<ExerciseQuestionsResponse> {
  const response = await client.get<ApiResponse<ExerciseQuestionsResponse>>(
    `/content/exercises/${id}/questions`,
    { params: query }
  );
  return response.data.data;
}

/**
 * POST /content/exercises/:id/questions - Add question to exercise
 */
export async function addExerciseQuestion(
  id: string,
  payload: AddQuestionPayload
): Promise<AddQuestionResponse> {
  const response = await client.post<ApiResponse<AddQuestionResponse>>(
    `/content/exercises/${id}/questions`,
    payload
  );
  return response.data.data;
}

/**
 * POST /content/exercises/:id/questions/bulk - Bulk add questions
 */
export async function bulkAddExerciseQuestions(
  id: string,
  payload: BulkAddQuestionsPayload
): Promise<BulkAddQuestionsResponse> {
  const response = await client.post<ApiResponse<BulkAddQuestionsResponse>>(
    `/content/exercises/${id}/questions/bulk`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /content/exercises/:id/questions/:questionId - Remove question from exercise
 */
export async function removeExerciseQuestion(
  id: string,
  questionId: string
): Promise<RemoveQuestionResponse> {
  const response = await client.delete<ApiResponse<RemoveQuestionResponse>>(
    `/content/exercises/${id}/questions/${questionId}`
  );
  return response.data.data;
}

/**
 * PATCH /content/exercises/:id/questions/reorder - Reorder questions
 */
export async function reorderExerciseQuestions(
  id: string,
  payload: ReorderQuestionsPayload
): Promise<ReorderQuestionsResponse> {
  const response = await client.patch<ApiResponse<ReorderQuestionsResponse>>(
    `/content/exercises/${id}/questions/reorder`,
    payload
  );
  return response.data.data;
}

// =====================
// STATUS ACTIONS (Derived from contract notes)
// =====================

/**
 * Publish exercise (via status update in PUT endpoint)
 */
export async function publishExercise(id: string): Promise<Exercise> {
  return updateExercise(id, { status: 'published' });
}

/**
 * Unpublish exercise (via status update in PUT endpoint)
 */
export async function unpublishExercise(id: string): Promise<Exercise> {
  return updateExercise(id, { status: 'draft' });
}

/**
 * Archive exercise (via status update in PUT endpoint)
 */
export async function archiveExercise(id: string): Promise<Exercise> {
  return updateExercise(id, { status: 'archived' });
}
