/**
 * Learner Progress Entity
 * Public API for learner knowledge progress tracking
 */

// Types
export type {
  LearnerKnowledgeProgress,
  DepthProgression,
  LearnerProgressSummary,
  ProgressListParams,
  ProgressListResponse,
} from './model/types';

// API
export {
  getLearnerProgress,
  getNodeProgress,
  getProgressSummary,
  resetNodeProgress,
} from './api/learnerProgressApi';

// Hooks
export {
  useLearnerProgress,
  useNodeProgress,
  useProgressSummary,
  useResetNodeProgress,
} from './model/useLearnerProgress';

// Query Keys
export { learnerProgressKeys } from './model/learnerProgressKeys';
