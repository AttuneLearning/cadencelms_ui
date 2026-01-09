/**
 * Question Entity Types
 * Generated from: /contracts/api/questions.contract.ts v1.0.0
 *
 * Types for question bank management, including multiple question types,
 * answer options, difficulty levels, and bulk import functionality.
 */

/**
 * Question Types
 */
export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'short_answer'
  | 'essay'
  | 'fill_blank';

/**
 * Question Difficulty Levels
 */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Answer Option
 * Used for multiple_choice and true_false questions
 */
export interface AnswerOption {
  text: string;
  isCorrect: boolean;
}

/**
 * Base Question
 * Core question information used across all views
 */
export interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: AnswerOption[];
  correctAnswer: string | string[];
  points: number;
  difficulty: QuestionDifficulty;
  tags: string[];
  explanation: string | null;
  department: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Question List Item
 * Question info used in list views (same as base for now)
 */
export interface QuestionListItem extends Question {}

/**
 * Question Details
 * Full question information including usage statistics
 */
export interface QuestionDetails extends Question {
  usageCount: number;
  lastUsed: string | null;
}

/**
 * Pagination metadata for list responses
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
 * Question List Query Parameters
 */
export interface QuestionListParams {
  page?: number;
  limit?: number;
  questionType?: string; // Can be comma-separated for multiple types
  tag?: string;
  difficulty?: QuestionDifficulty;
  search?: string;
  department?: string;
  sort?: string;
}

/**
 * Question List Response
 */
export interface QuestionListResponse {
  questions: QuestionListItem[];
  pagination: Pagination;
}

/**
 * Create Question Payload
 */
export interface CreateQuestionPayload {
  questionText: string;
  questionType: QuestionType;
  options?: AnswerOption[];
  correctAnswer?: string | string[];
  points: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  explanation?: string;
  department?: string;
}

/**
 * Update Question Payload
 */
export interface UpdateQuestionPayload {
  questionText?: string;
  questionType?: QuestionType;
  options?: AnswerOption[];
  correctAnswer?: string | string[];
  points?: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  explanation?: string;
  department?: string;
}

/**
 * Bulk Import Question Item
 * Single question in bulk import array
 */
export interface BulkImportQuestionItem {
  questionText: string;
  questionType: QuestionType;
  options?: AnswerOption[];
  correctAnswer?: string | string[];
  points: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  explanation?: string;
}

/**
 * Bulk Import Request Payload
 */
export interface BulkImportPayload {
  format: 'json' | 'csv';
  questions: BulkImportQuestionItem[];
  department?: string;
  overwriteExisting?: boolean;
}

/**
 * Bulk Import Result Item
 * Result for individual question in bulk import
 */
export interface BulkImportResultItem {
  index: number;
  status: 'success' | 'error';
  questionId: string | null;
  error: string | null;
}

/**
 * Bulk Import Response
 */
export interface BulkImportResponse {
  imported: number;
  failed: number;
  updated: number;
  results: BulkImportResultItem[];
}

/**
 * Question Filters
 * Used for filtering question lists (UI-specific)
 */
export interface QuestionFilters extends QuestionListParams {
  // Can add additional UI-specific filters here if needed
}

/**
 * Question Form Data
 * Used for creating/updating questions in forms
 */
export interface QuestionFormData {
  questionText: string;
  questionType: QuestionType;
  options: AnswerOption[];
  correctAnswer: string | string[];
  points: number;
  difficulty: QuestionDifficulty;
  tags: string[];
  explanation: string;
  department?: string;
}
