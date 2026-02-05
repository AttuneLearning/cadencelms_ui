/**
 * Learning Unit Questions API Client
 * Implements endpoints from learning-unit-questions.contract.ts v1.0.0
 *
 * These endpoints manage linking questions from Question Banks to Learning Units
 * (specifically exercises and assessments).
 */

import { client } from '@/shared/api/client';
import type {
  LinkedQuestionsResponse,
  LinkQuestionPayload,
  LinkQuestionResponse,
  BulkLinkPayload,
  BulkLinkResponse,
  UpdateLinkPayload,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * GET /learning-units/:learningUnitId/questions - List linked questions
 */
export async function getLinkedQuestions(
  learningUnitId: string
): Promise<LinkedQuestionsResponse> {
  const response = await client.get<ApiResponse<LinkedQuestionsResponse>>(
    `/learning-units/${learningUnitId}/questions`
  );
  return response.data.data;
}

/**
 * POST /learning-units/:learningUnitId/questions - Link a question
 */
export async function linkQuestion(
  learningUnitId: string,
  payload: LinkQuestionPayload
): Promise<LinkQuestionResponse> {
  const response = await client.post<ApiResponse<LinkQuestionResponse>>(
    `/learning-units/${learningUnitId}/questions`,
    payload
  );
  return response.data.data;
}

/**
 * POST /learning-units/:learningUnitId/questions/bulk - Bulk link questions
 */
export async function bulkLinkQuestions(
  learningUnitId: string,
  payload: BulkLinkPayload
): Promise<BulkLinkResponse> {
  const response = await client.post<ApiResponse<BulkLinkResponse>>(
    `/learning-units/${learningUnitId}/questions/bulk`,
    payload
  );
  return response.data.data;
}

/**
 * PUT /learning-units/:learningUnitId/questions/:linkId - Update a linked question
 */
export async function updateLinkedQuestion(
  learningUnitId: string,
  linkId: string,
  payload: UpdateLinkPayload
): Promise<LinkQuestionResponse> {
  const response = await client.put<ApiResponse<LinkQuestionResponse>>(
    `/learning-units/${learningUnitId}/questions/${linkId}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /learning-units/:learningUnitId/questions/:linkId - Unlink a question
 */
export async function unlinkQuestion(
  learningUnitId: string,
  linkId: string
): Promise<void> {
  await client.delete(`/learning-units/${learningUnitId}/questions/${linkId}`);
}
