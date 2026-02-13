/**
 * Assessment Attempt API Client
 * Canonical assessment-attempt lifecycle keyed by assessmentId.
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import type {
  Answer,
  ExamAttempt,
  ExamAttemptsListResponse,
  ExamResult,
  StartExamAttemptResponse,
  SubmitExamRequest,
  SubmitExamResponse,
  SubmitAnswersResponse,
} from '@/entities/exam-attempt/model/types';

export interface StartAssessmentAttemptRequest {
  enrollmentId: string;
  learningUnitId?: string;
}

export interface SaveAssessmentResponsesRequest {
  responses: Array<{
    questionId: string;
    response: Answer['answer'];
  }>;
}

/**
 * POST /assessments/:assessmentId/attempts/start
 */
export async function startAssessmentAttempt(
  assessmentId: string,
  data: StartAssessmentAttemptRequest
): Promise<StartExamAttemptResponse> {
  const response = await client.post<ApiResponse<StartExamAttemptResponse>>(
    endpoints.assessmentAttempts.start(assessmentId),
    data
  );
  return response.data.data;
}

/**
 * GET /assessments/:assessmentId/attempts/:attemptId
 */
export async function getAssessmentAttempt(
  assessmentId: string,
  attemptId: string
): Promise<ExamAttempt> {
  const response = await client.get<ApiResponse<ExamAttempt>>(
    endpoints.assessmentAttempts.byId(assessmentId, attemptId)
  );
  return response.data.data;
}

/**
 * PUT /assessments/:assessmentId/attempts/:attemptId/save
 */
export async function saveAssessmentResponses(
  assessmentId: string,
  attemptId: string,
  data: SaveAssessmentResponsesRequest
): Promise<SubmitAnswersResponse> {
  const response = await client.put<ApiResponse<SubmitAnswersResponse>>(
    endpoints.assessmentAttempts.save(assessmentId, attemptId),
    data
  );
  return response.data.data;
}

/**
 * POST /assessments/:assessmentId/attempts/:attemptId/submit
 */
export async function submitAssessmentAttempt(
  assessmentId: string,
  attemptId: string,
  data?: SubmitExamRequest
): Promise<SubmitExamResponse> {
  const response = await client.post<ApiResponse<SubmitExamResponse>>(
    endpoints.assessmentAttempts.submit(assessmentId, attemptId),
    data || { confirmSubmit: true }
  );
  return response.data.data;
}

/**
 * GET /assessments/:assessmentId/attempts/:attemptId
 * Contract uses the same resource for detail/results.
 */
export async function getAssessmentAttemptResult(
  assessmentId: string,
  attemptId: string
): Promise<ExamResult> {
  const response = await client.get<ApiResponse<ExamResult>>(
    endpoints.assessmentAttempts.byId(assessmentId, attemptId)
  );
  return response.data.data;
}

/**
 * GET /assessments/:assessmentId/attempts/my
 */
export async function listMyAssessmentAttempts(
  assessmentId: string
): Promise<ExamAttemptsListResponse> {
  const response = await client.get<ApiResponse<ExamAttemptsListResponse>>(
    endpoints.assessmentAttempts.my(assessmentId)
  );
  return response.data.data;
}
