/**
 * Question Bank API Client
 * API operations for question bank management
 * Department-scoped endpoints: /departments/:id/question-banks
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}
import type {
  QuestionBankListResponse,
  QuestionBankListParams,
  QuestionBank,
  CreateQuestionBankPayload,
  UpdateQuestionBankPayload,
} from '../model/types';

/**
 * GET /departments/:departmentId/question-banks - List question banks
 */
export async function getQuestionBanks(
  departmentId: string,
  params?: QuestionBankListParams
): Promise<QuestionBankListResponse> {
  const response = await client.get<ApiResponse<QuestionBankListResponse>>(
    `/departments/${departmentId}/question-banks`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /departments/:departmentId/question-banks/:id - Get question bank details
 */
export async function getQuestionBank(
  departmentId: string,
  bankId: string
): Promise<QuestionBank> {
  const response = await client.get<ApiResponse<QuestionBank>>(
    `/departments/${departmentId}/question-banks/${bankId}`
  );
  return response.data.data;
}

/**
 * POST /departments/:departmentId/question-banks - Create question bank
 */
export async function createQuestionBank(
  departmentId: string,
  payload: CreateQuestionBankPayload
): Promise<QuestionBank> {
  const response = await client.post<ApiResponse<QuestionBank>>(
    `/departments/${departmentId}/question-banks`,
    payload
  );
  return response.data.data;
}

/**
 * PUT /departments/:departmentId/question-banks/:id - Update question bank
 */
export async function updateQuestionBank(
  departmentId: string,
  bankId: string,
  payload: UpdateQuestionBankPayload
): Promise<QuestionBank> {
  const response = await client.put<ApiResponse<QuestionBank>>(
    `/departments/${departmentId}/question-banks/${bankId}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /departments/:departmentId/question-banks/:id - Delete question bank
 */
export async function deleteQuestionBank(
  departmentId: string,
  bankId: string
): Promise<void> {
  await client.delete(
    `/departments/${departmentId}/question-banks/${bankId}`
  );
}
