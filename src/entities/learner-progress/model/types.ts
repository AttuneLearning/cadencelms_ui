/**
 * Learner Progress Types
 * Entity types for learner knowledge progress tracking
 */

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Learner Knowledge Progress
 * Tracks mastery of a specific knowledge node
 */
export interface LearnerKnowledgeProgress {
  learnerId: string;
  knowledgeNodeId: string;
  knowledgeNodeName: string;
  currentDepth: string;
  masteryScore: number; // 0.0 - 1.0
  totalAttempts: number;
  correctAttempts: number;
  consecutiveCorrect: number;
  lastAttemptAt: string;
  completedAt: string | null;
  isComplete: boolean;
  depthProgression: DepthProgression[];
}

/**
 * Depth Progression
 * Progress at each cognitive depth level
 */
export interface DepthProgression {
  depth: string;
  masteryScore: number;
  attempts: number;
  correctAttempts: number;
  achievedAt: string | null;
  isComplete: boolean;
}

/**
 * Learner Progress Summary
 * Overview of learner's overall progress
 */
export interface LearnerProgressSummary {
  learnerId: string;
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  averageMastery: number;
  totalAttempts: number;
  correctAttempts: number;
  lastActivityAt: string;
}

/**
 * Progress List Params
 */
export interface ProgressListParams {
  learnerId?: string;
  knowledgeNodeId?: string;
  minMastery?: number;
  maxMastery?: number;
  isComplete?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Progress List Response
 */
export interface ProgressListResponse {
  progress: LearnerKnowledgeProgress[];
  pagination: Pagination;
}
