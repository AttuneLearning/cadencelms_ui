/**
 * Learning Unit Questions Types
 * Types for linking questions from Question Banks to Learning Units (Exercise/Assessment)
 */

/**
 * Linked question in a learning unit
 */
export interface LinkedQuestion {
  id: string; // Link ID
  questionId: string;
  learningUnitId: string;
  sequence: number;
  pointsOverride: number | null;
  question: {
    id: string;
    type: string;
    text: string;
    difficulty: string;
    points: number;
    tags: string[];
    options: unknown[] | null;
  };
}

/**
 * Response from listing linked questions
 */
export interface LinkedQuestionsResponse {
  learningUnitId: string;
  learningUnitTitle: string;
  questions: LinkedQuestion[];
  totalQuestions: number;
  totalPoints: number;
}

/**
 * Payload for linking a single question
 */
export interface LinkQuestionPayload {
  questionId: string;
  sequence?: number;
  pointsOverride?: number | null;
}

/**
 * Response from linking a question
 */
export interface LinkQuestionResponse {
  id: string;
  questionId: string;
  learningUnitId: string;
  sequence: number;
  pointsOverride: number | null;
}

/**
 * Payload for bulk linking questions
 */
export interface BulkLinkPayload {
  questions: Array<{
    questionId: string;
    sequence?: number;
    pointsOverride?: number | null;
  }>;
}

/**
 * Response from bulk linking questions
 */
export interface BulkLinkResponse {
  linked: Array<{
    id: string;
    questionId: string;
    sequence: number;
    pointsOverride: number | null;
  }>;
  failed: Array<{
    questionId: string;
    reason: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * Payload for updating a linked question
 */
export interface UpdateLinkPayload {
  sequence?: number;
  pointsOverride?: number | null;
}
