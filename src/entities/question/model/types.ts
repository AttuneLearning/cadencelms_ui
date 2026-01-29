/**
 * Question Entity Types
 * Generated from: /contracts/api/questions.contract.ts v1.0.0
 * Updated for monolithic Question design per API v1.2.0
 *
 * Types for question bank management, including multiple question types,
 * answer options, difficulty levels, and bulk import functionality.
 *
 * Monolithic Design: A single Question can support multiple presentations
 * (quiz, flashcard, matching) without content duplication.
 */

/**
 * Question Types
 * Updated to array format per API v1.1.0
 */
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'matching'
  | 'flashcard'
  | 'fill_in_blank'
  // Legacy aliases used across parts of the UI
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
 * Question Hierarchy for Adaptive Testing
 */
export interface QuestionHierarchy {
  parentQuestionId?: string;
  relatedQuestionIds: string[];
  prerequisiteQuestionIds: string[];
  conceptTag?: string;
  difficultyProgression?: number;
}

/**
 * Media Layout Options
 * Defines how text and media are arranged in content
 */
export type MediaLayout =
  | 'text_only'
  | 'media_only'
  | 'media_above'
  | 'media_below'
  | 'media_left'
  | 'media_right'
  | 'media_background';

/**
 * Media Attachment
 * Reference to uploaded media with display metadata
 */
export interface MediaAttachment {
  mediaId: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  altText?: string;
  caption?: string;
}

/**
 * Media Content
 * Rich content supporting text with optional media attachments
 * Used for flashcard fronts/backs and matching columns
 */
export interface MediaContent {
  text: string;
  media?: MediaAttachment;
  layout: MediaLayout;
}

/**
 * Flashcard-Specific Data
 * Extension fields for questions used as flashcards
 */
export interface FlashcardData {
  /** Additional prompts/hints for the front of card */
  prompts: string[];
  /** Media for the front of the card */
  frontMedia?: MediaContent;
  /** Media for the back of the card */
  backMedia?: MediaContent;
}

/**
 * Matching-Specific Data
 * Extension fields for questions used in matching exercises
 */
export interface MatchingData {
  /** Media/rich content for Column A (prompt side) */
  columnAMedia?: MediaContent;
  /** Media/rich content for Column B (answer side) */
  columnBMedia?: MediaContent;
}

/**
 * Base Question
 * Core question information used across all views
 * Updated for department-scoped API v1.1.0
 * Updated for monolithic Question design per API v1.2.0
 */
export interface Question {
  id: string;
  departmentId: string;
  // Legacy field used by older UI surfaces
  department?: string;
  questionBankId: string;
  questionText: string;
  questionTypes: QuestionType[];  // Array of types - enables multi-presentation
  // Legacy single type used by older UI surfaces
  questionType?: QuestionType;
  options: AnswerOption[];
  correctAnswer: string | string[];
  /** Distractors for matching exercises (wrong answers in Column B) */
  distractors?: string[];
  points: number;
  difficulty: QuestionDifficulty;
  tags: string[];
  explanation: string | null;

  // Adaptive learning fields (optional)
  knowledgeNodeId?: string;
  cognitiveDepth?: string;
  hierarchy?: QuestionHierarchy;

  // Monolithic design: type-specific extensions
  /** Flashcard-specific data when questionTypes includes 'flashcard' */
  flashcardData?: FlashcardData;
  /** Matching-specific data when questionTypes includes 'matching' */
  matchingData?: MatchingData;

  // Metadata
  usageCount?: number;
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
 * For department-scoped question API
 */
export interface QuestionListParams {
  page?: number;
  limit?: number;
  questionType?: string; // Can be comma-separated for multiple types
  tag?: string;
  difficulty?: QuestionDifficulty;
  search?: string;
  bankId?: string;
  knowledgeNodeId?: string;
  cognitiveDepth?: string;
  hasKnowledgeNode?: boolean;
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
  questionBankId?: string;
  questionText: string;
  questionTypes: QuestionType[];
  options?: AnswerOption[];
  correctAnswer?: string | string[];
  distractors?: string[];
  points: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  explanation?: string;

  // Adaptive learning fields (optional)
  knowledgeNodeId?: string;
  cognitiveDepth?: string;
  hierarchy?: Partial<QuestionHierarchy>;

  // Monolithic design: type-specific extensions
  flashcardData?: FlashcardData;
  matchingData?: MatchingData;
}

/**
 * Update Question Payload
 */
export interface UpdateQuestionPayload {
  questionBankId?: string;
  questionText?: string;
  questionTypes?: QuestionType[];
  options?: AnswerOption[];
  correctAnswer?: string | string[];
  distractors?: string[];
  points?: number;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  explanation?: string;

  // Adaptive learning fields (optional)
  knowledgeNodeId?: string;
  cognitiveDepth?: string;
  hierarchy?: Partial<QuestionHierarchy>;

  // Monolithic design: type-specific extensions
  flashcardData?: FlashcardData;
  matchingData?: MatchingData;
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
  department?: string;
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
