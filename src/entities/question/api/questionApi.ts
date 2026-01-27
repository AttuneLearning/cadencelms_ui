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
 * GET /departments/:departmentId/questions - List questions with pagination and filtering
 * Updated for department-scoped API v1.1.0
 */
export async function getQuestions(
  departmentId: string,
  params?: QuestionListParams
): Promise<QuestionListResponse> {
  const response = await client.get<ApiResponse<QuestionListResponse>>(
    `/departments/${departmentId}/questions`,
    { params }
  );
  return response.data.data;
}

/**
 * POST /departments/:departmentId/questions - Create a new question
 * Updated for department-scoped API v1.1.0
 */
export async function createQuestion(
  departmentId: string,
  payload: CreateQuestionPayload
): Promise<Question> {
  const response = await client.post<ApiResponse<Question>>(
    `/departments/${departmentId}/questions`,
    payload
  );
  return response.data.data;
}

/**
 * GET /departments/:departmentId/questions/:id - Get question details by ID
 * Updated for department-scoped API v1.1.0
 */
export async function getQuestionById(
  departmentId: string,
  id: string
): Promise<QuestionDetails> {
  const response = await client.get<ApiResponse<QuestionDetails>>(
    `/departments/${departmentId}/questions/${id}`
  );
  return response.data.data;
}

/**
 * PUT /departments/:departmentId/questions/:id - Update question information
 * Updated for department-scoped API v1.1.0
 */
export async function updateQuestion(
  departmentId: string,
  id: string,
  payload: UpdateQuestionPayload
): Promise<Question> {
  const response = await client.put<ApiResponse<Question>>(
    `/departments/${departmentId}/questions/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /departments/:departmentId/questions/:id - Delete question (soft delete)
 * Updated for department-scoped API v1.1.0
 */
export async function deleteQuestion(
  departmentId: string,
  id: string
): Promise<void> {
  await client.delete(`/departments/${departmentId}/questions/${id}`);
}

/**
 * POST /departments/:departmentId/questions/bulk - Bulk import questions
 * Updated for department-scoped API v1.1.0
 */
export async function bulkImportQuestions(
  departmentId: string,
  payload: BulkImportPayload
): Promise<BulkImportResponse> {
  const response = await client.post<ApiResponse<BulkImportResponse>>(
    `/departments/${departmentId}/questions/bulk`,
    payload
  );
  return response.data.data;
}
