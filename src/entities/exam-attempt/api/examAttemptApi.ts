/**
 * Exam Attempt API Client
 * API methods for exam attempt operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import type {
  ExamAttempt,
  ExamAttemptsListResponse,
  ExamAttemptListItem,
  StartExamAttemptRequest,
  StartExamAttemptResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  SubmitExamRequest,
  SubmitExamResponse,
  ExamResult,
  GradeExamRequest,
  GradeExamResponse,
  ExamAttemptsByExamResponse,
  ListExamAttemptsParams,
  ListAttemptsByExamParams,
} from '../model/types';

/**
 * List exam attempts with filtering and pagination
 */
export async function listExamAttempts(
  params?: ListExamAttemptsParams
): Promise<ExamAttemptsListResponse> {
  const response = await client.get<ApiResponse<ExamAttemptsListResponse>>(
    endpoints.examAttempts.list,
    { params }
  );
  return response.data.data;
}

/**
 * Get a single exam attempt by ID
 */
export async function getExamAttempt(id: string): Promise<ExamAttempt> {
  const response = await client.get<ApiResponse<ExamAttempt>>(
    endpoints.examAttempts.byId(id)
  );
  return response.data.data;
}

/**
 * Start a new exam attempt
 */
export async function startExamAttempt(
  data: StartExamAttemptRequest
): Promise<StartExamAttemptResponse> {
  const response = await client.post<ApiResponse<StartExamAttemptResponse>>(
    endpoints.examAttempts.create,
    data
  );
  return response.data.data;
}

/**
 * Submit or update answers for questions
 */
export async function submitAnswers(
  attemptId: string,
  data: SubmitAnswersRequest
): Promise<SubmitAnswersResponse> {
  const response = await client.post<ApiResponse<SubmitAnswersResponse>>(
    endpoints.examAttempts.submitAnswers(attemptId),
    data
  );
  return response.data.data;
}

/**
 * Submit exam for grading (final submission)
 */
export async function submitExam(
  attemptId: string,
  data?: SubmitExamRequest
): Promise<SubmitExamResponse> {
  const response = await client.post<ApiResponse<SubmitExamResponse>>(
    endpoints.examAttempts.submit(attemptId),
    data || { confirmSubmit: true }
  );
  return response.data.data;
}

/**
 * Get graded exam results with detailed feedback
 */
export async function getExamResults(attemptId: string): Promise<ExamResult> {
  const response = await client.get<ApiResponse<ExamResult>>(
    endpoints.examAttempts.results(attemptId)
  );
  return response.data.data;
}

/**
 * Manually grade or update grades for an exam attempt (instructor)
 */
export async function gradeExam(
  attemptId: string,
  data: GradeExamRequest
): Promise<GradeExamResponse> {
  const response = await client.post<ApiResponse<GradeExamResponse>>(
    endpoints.examAttempts.grade(attemptId),
    data
  );
  return response.data.data;
}

/**
 * Get exercise attempts for a specific learner
 */
export async function getExerciseAttempts(
  exerciseId: string,
  learnerId: string
): Promise<ExamAttemptListItem[]> {
  const response = await client.get<ApiResponse<ExamAttemptsListResponse>>(
    endpoints.exercises.attempts(exerciseId),
    { params: { learnerId } }
  );
  return response.data.data.attempts;
}

/**
 * List all attempts for a specific exam (instructor view)
 */
export async function listAttemptsByExam(
  examId: string,
  params?: ListAttemptsByExamParams
): Promise<ExamAttemptsByExamResponse> {
  const response = await client.get<ApiResponse<ExamAttemptsByExamResponse>>(
    endpoints.examAttempts.byExam(examId),
    { params }
  );
  return response.data.data;
}
