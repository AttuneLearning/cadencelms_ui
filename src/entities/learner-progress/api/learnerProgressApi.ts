/**
 * Learner Progress API Client
 * API operations for learner knowledge progress tracking
 */

import { client } from '@/shared/api/client';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}
import type {
  LearnerKnowledgeProgress,
  LearnerProgressSummary,
  ProgressListParams,
  ProgressListResponse,
} from '../model/types';

/**
 * GET /learners/:learnerId/knowledge-progress - List learner's progress
 */
export async function getLearnerProgress(
  learnerId: string,
  params?: ProgressListParams
): Promise<ProgressListResponse> {
  const response = await client.get<ApiResponse<ProgressListResponse>>(
    `/learners/${learnerId}/knowledge-progress`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /learners/:learnerId/knowledge-progress/:nodeId - Get progress for specific node
 */
export async function getNodeProgress(
  learnerId: string,
  nodeId: string
): Promise<LearnerKnowledgeProgress> {
  const response = await client.get<ApiResponse<LearnerKnowledgeProgress>>(
    `/learners/${learnerId}/knowledge-progress/${nodeId}`
  );
  return response.data.data;
}

/**
 * GET /learners/:learnerId/progress-summary - Get overall progress summary
 */
export async function getProgressSummary(
  learnerId: string
): Promise<LearnerProgressSummary> {
  const response = await client.get<ApiResponse<LearnerProgressSummary>>(
    `/learners/${learnerId}/progress-summary`
  );
  return response.data.data;
}

/**
 * DELETE /learners/:learnerId/knowledge-progress/:nodeId - Reset progress for node
 */
export async function resetNodeProgress(
  learnerId: string,
  nodeId: string
): Promise<void> {
  await client.delete(
    `/learners/${learnerId}/knowledge-progress/${nodeId}`
  );
}
