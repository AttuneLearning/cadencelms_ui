/**
 * Adaptive Testing API Types
 */

import type { Question } from '@/entities/question';

export interface SelectQuestionParams {
  learnerId?: string;
  knowledgeNodeId?: string;
  departmentId: string;
  questionBankIds?: string[];
  excludeQuestionIds?: string[];
  preferredStrategy?: 'advancing' | 'reinforcing' | 'reviewing';
  contextType?: 'exercise' | 'assessment' | 'practice' | 'review';
}

export interface SelectQuestionsParams extends SelectQuestionParams {
  count: number;
}

export interface RecordResponseParams {
  learnerId?: string;
  questionId: string;
  knowledgeNodeId: string;
  cognitiveDepth: string;
  isCorrect: boolean;
  timeSpentSeconds?: number;
  attemptData?: Record<string, unknown>;
}

export interface AdaptiveMetadata {
  currentMastery: number;
  targetDepth: string;
  progressToNextDepth: number;
  recommendedStrategy: 'advancing' | 'reinforcing' | 'reviewing';
}

export interface AdaptiveQuestionResponse {
  question: Question;
  presentationType: string;
  cognitiveDepth: string;
  selectionReason: 'advancing' | 'reinforcing' | 'reviewing';
  adaptiveMetadata: AdaptiveMetadata;
}

export interface RecordResponseResult {
  progressUpdated: boolean;
  newMasteryScore: number;
  levelAdvanced: boolean;
  previousDepth: string;
  newDepth?: string;
  isNodeComplete: boolean;
  streakCount: number;
}
