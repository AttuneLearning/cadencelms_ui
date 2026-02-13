/**
 * Exam Attempt API Client
 * API methods for exam attempt operations
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { ApiResponse } from '@/shared/api/types';
import {
  getAssessmentAttemptByAttemptId,
  gradeAssessmentAttemptByAttemptId,
  listAssessmentAttempts,
} from '@/entities/assessment-attempt/api/assessmentAttemptApi';
import type {
  ExamAttempt,
  ExamAttemptsListResponse,
  ExamAttemptListItem,
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
  return listAssessmentAttempts(params);
}

/**
 * Get a single exam attempt by ID
 */
export async function getExamAttempt(id: string): Promise<ExamAttempt> {
  return getAssessmentAttemptByAttemptId(id);
}

/**
 * Manually grade or update grades for an exam attempt (instructor)
 */
export async function gradeExam(
  attemptId: string,
  data: GradeExamRequest
): Promise<GradeExamResponse> {
  return gradeAssessmentAttemptByAttemptId(attemptId, data);
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
  const listResponse = await listAssessmentAttempts({
    assessmentId: examId,
    ...params,
  });

  const completedAttempts = listResponse.attempts.filter((attempt) => attempt.status === 'graded');
  const averageScore =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
        completedAttempts.length
      : 0;
  const averagePercentage =
    completedAttempts.length > 0
      ? completedAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) /
        completedAttempts.length
      : 0;
  const passedCount = completedAttempts.filter((attempt) => attempt.passed).length;

  return {
    examId,
    examTitle: listResponse.attempts[0]?.examTitle || 'Assessment',
    statistics: {
      totalAttempts: listResponse.attempts.length,
      completedAttempts: completedAttempts.length,
      inProgressAttempts: listResponse.attempts.filter((attempt) =>
        attempt.status === 'in_progress' || attempt.status === 'started'
      ).length,
      averageScore,
      averagePercentage,
      passRate:
        completedAttempts.length > 0
          ? (passedCount / completedAttempts.length) * 100
          : 0,
      averageTimeSpent:
        listResponse.attempts.length > 0
          ? listResponse.attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0) /
            listResponse.attempts.length
          : 0,
    },
    attempts: listResponse.attempts.map((attempt) => ({
      ...attempt,
      learnerEmail: '',
      requiresGrading: attempt.status === 'submitted' || attempt.status === 'grading',
    })),
    pagination: listResponse.pagination,
  };
}
