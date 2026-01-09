/**
 * Question API Client
 * Implements endpoints from questions.contract.ts v1.0.0
 */

import { client } from '@/shared/api/client';
import type {
  QuestionListResponse,
  QuestionListParams,
  QuestionDetails,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  Question,
  BulkImportPayload,
  BulkImportResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /api/v2/questions - List questions with pagination and filtering
 */
export async function getQuestions(
  params?: QuestionListParams
): Promise<QuestionListResponse> {
  const response = await client.get<ApiResponse<QuestionListResponse>>(
    '/api/v2/questions',
    { params }
  );
  return response.data.data;
}

/**
 * POST /api/v2/questions - Create a new question
 */
export async function createQuestion(
  payload: CreateQuestionPayload
): Promise<Question> {
  const response = await client.post<ApiResponse<Question>>(
    '/api/v2/questions',
    payload
  );
  return response.data.data;
}

/**
 * GET /api/v2/questions/:id - Get question details by ID
 */
export async function getQuestionById(id: string): Promise<QuestionDetails> {
  const response = await client.get<ApiResponse<QuestionDetails>>(
    `/api/v2/questions/${id}`
  );
  return response.data.data;
}

/**
 * PUT /api/v2/questions/:id - Update question information
 */
export async function updateQuestion(
  id: string,
  payload: UpdateQuestionPayload
): Promise<Question> {
  const response = await client.put<ApiResponse<Question>>(
    `/api/v2/questions/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/questions/:id - Delete question (soft delete)
 */
export async function deleteQuestion(id: string): Promise<void> {
  await client.delete(`/api/v2/questions/${id}`);
}

/**
 * POST /api/v2/questions/bulk - Bulk import questions
 */
export async function bulkImportQuestions(
  payload: BulkImportPayload
): Promise<BulkImportResponse> {
  const response = await client.post<ApiResponse<BulkImportResponse>>(
    '/api/v2/questions/bulk',
    payload
  );
  return response.data.data;
}
