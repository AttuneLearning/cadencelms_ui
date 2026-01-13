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
 * GET /questions - List questions with pagination and filtering
 */
export async function getQuestions(
  params?: QuestionListParams
): Promise<QuestionListResponse> {
  const response = await client.get<ApiResponse<QuestionListResponse>>(
    '/questions',
    { params }
  );
  return response.data.data;
}

/**
 * POST /questions - Create a new question
 */
export async function createQuestion(
  payload: CreateQuestionPayload
): Promise<Question> {
  const response = await client.post<ApiResponse<Question>>(
    '/questions',
    payload
  );
  return response.data.data;
}

/**
 * GET /questions/:id - Get question details by ID
 */
export async function getQuestionById(id: string): Promise<QuestionDetails> {
  const response = await client.get<ApiResponse<QuestionDetails>>(
    `/questions/${id}`
  );
  return response.data.data;
}

/**
 * PUT /questions/:id - Update question information
 */
export async function updateQuestion(
  id: string,
  payload: UpdateQuestionPayload
): Promise<Question> {
  const response = await client.put<ApiResponse<Question>>(
    `/questions/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /questions/:id - Delete question (soft delete)
 */
export async function deleteQuestion(id: string): Promise<void> {
  await client.delete(`/questions/${id}`);
}

/**
 * POST /questions/bulk - Bulk import questions
 */
export async function bulkImportQuestions(
  payload: BulkImportPayload
): Promise<BulkImportResponse> {
  const response = await client.post<ApiResponse<BulkImportResponse>>(
    '/questions/bulk',
    payload
  );
  return response.data.data;
}
