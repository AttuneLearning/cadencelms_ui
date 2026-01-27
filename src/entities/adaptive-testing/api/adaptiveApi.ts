/**
 * Adaptive Testing API Client
 * API operations for adaptive question selection and response recording
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}
import type {
  SelectQuestionParams,
  SelectQuestionsParams,
  AdaptiveQuestionResponse,
  RecordResponseParams,
  RecordResponseResult,
} from '../model/types';

/**
 * POST /adaptive/select-question - Select single adaptive question
 */
export async function selectQuestion(
  params: SelectQuestionParams
): Promise<AdaptiveQuestionResponse> {
  const response = await client.post<ApiResponse<AdaptiveQuestionResponse>>(
    '/adaptive/select-question',
    params
  );
  return response.data.data;
}

/**
 * POST /adaptive/select-questions - Select multiple adaptive questions
 */
export async function selectQuestions(
  params: SelectQuestionsParams
): Promise<AdaptiveQuestionResponse[]> {
  const response = await client.post<ApiResponse<AdaptiveQuestionResponse[]>>(
    '/adaptive/select-questions',
    params
  );
  return response.data.data;
}

/**
 * POST /adaptive/record-response - Record learner response and update progress
 */
export async function recordResponse(
  params: RecordResponseParams
): Promise<RecordResponseResult> {
  const response = await client.post<ApiResponse<RecordResponseResult>>(
    '/adaptive/record-response',
    params
  );
  return response.data.data;
}
