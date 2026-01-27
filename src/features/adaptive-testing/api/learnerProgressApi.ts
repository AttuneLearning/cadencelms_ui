/**
 * Learner Progress API
 * API client for tracking learner progress in adaptive testing
 */

import { client } from '@/shared/api/client';
import type {
  LearnerUnitProgress,
  QuestionProgress,
  RecordAnswerRequest,
} from '../model/types';

/**
 * Learner Progress API endpoints
 */
export const learnerProgressApi = {
  /**
   * Get learner's progress on a learning unit
   */
  getProgress: async (
    learningUnitId: string,
    learnerId: string
  ): Promise<LearnerUnitProgress> => {
    const response = await client.get<LearnerUnitProgress>(
      `/api/v1/learning-units/${learningUnitId}/progress/${learnerId}`
    );
    return response.data;
  },

  /**
   * Record a learner's answer to a question
   */
  recordAnswer: async (
    learningUnitId: string,
    learnerId: string,
    data: RecordAnswerRequest
  ): Promise<QuestionProgress> => {
    const response = await client.post<QuestionProgress>(
      `/api/v1/learning-units/${learningUnitId}/progress/${learnerId}/answers`,
      data
    );
    return response.data;
  },

  /**
   * Reset learner's progress on a learning unit
   */
  resetProgress: async (
    learningUnitId: string,
    learnerId: string
  ): Promise<void> => {
    await client.delete(
      `/api/v1/learning-units/${learningUnitId}/progress/${learnerId}`
    );
  },

  /**
   * Get detailed progress for a specific question
   */
  getQuestionProgress: async (
    learningUnitId: string,
    learnerId: string,
    questionId: string
  ): Promise<QuestionProgress> => {
    const response = await client.get<QuestionProgress>(
      `/api/v1/learning-units/${learningUnitId}/progress/${learnerId}/questions/${questionId}`
    );
    return response.data;
  },

  /**
   * Bulk update progress for multiple questions
   */
  bulkRecordAnswers: async (
    learningUnitId: string,
    learnerId: string,
    answers: RecordAnswerRequest[]
  ): Promise<QuestionProgress[]> => {
    const response = await client.post<QuestionProgress[]>(
      `/api/v1/learning-units/${learningUnitId}/progress/${learnerId}/answers/bulk`,
      { answers }
    );
    return response.data;
  },
};

export default learnerProgressApi;
