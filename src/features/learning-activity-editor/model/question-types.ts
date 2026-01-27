/**
 * Question Bank Types
 * TypeScript types derived from API contracts
 */

/**
 * Question types supported by the system
 */
export type QuestionType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'matching'
  | 'flashcard'
  | 'fill_in_blank';

/**
 * Question difficulty levels
 */
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Question option for choice-based questions
 */
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string;
}

/**
 * Matching pair for matching questions
 */
export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

/**
 * Flashcard content
 */
export interface FlashcardContent {
  front: string;
  back: string;
}

/**
 * Question hierarchy for adaptive learning
 */
export interface QuestionHierarchy {
  parentQuestionId: string | null;
  relatedQuestionIds: string[];
  prerequisiteQuestionIds: string[];
  conceptTag: string | null;
  difficultyProgression: number | null;
}

/**
 * Question Bank entity
 */
export interface QuestionBank {
  id: string;
  departmentId: string;
  name: string;
  description: string | null;
  questionCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Fill in the blank definition
 */
export interface BlankDefinition {
  position: number;
  acceptedAnswers: string[];
}

/**
 * Question entity
 * Note: `types` is an array to support multiple presentation formats per question
 * The adaptive engine chooses which format to present based on learner progress
 */
export interface Question {
  id: string;
  departmentId: string;
  bankId: string | null;
  bankName: string | null;
  /** Array of supported presentation types for this question */
  types: QuestionType[];
  text: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  points: number;
  explanation: string | null;
  // Type-specific answer fields (populated based on types array)
  options: QuestionOption[] | null; // For multiple_choice, multiple_select, true_false
  matchingPairs?: MatchingPair[]; // For matching
  flashcard?: FlashcardContent; // For flashcard
  correctAnswer?: string; // For true_false
  acceptedAnswers?: string[]; // For short_answer
  matchThreshold?: number; // For short_answer fuzzy matching
  sampleAnswer?: string; // For long_answer
  rubric?: string; // For long_answer grading
  blanks?: BlankDefinition[]; // For fill_in_blank
  hierarchy: QuestionHierarchy;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Linked question in a learning unit
 */
export interface LinkedQuestion {
  id: string; // Link ID
  questionId: string;
  learningUnitId: string;
  sequence: number;
  pointsOverride: number | null;
  question: Question;
}

/**
 * Create question request body
 */
export interface CreateQuestionRequest {
  bankId?: string;
  /** Array of presentation types this question supports */
  types: QuestionType[];
  text: string;
  difficulty?: QuestionDifficulty;
  tags?: string[];
  points?: number;
  explanation?: string;
  // Type-specific answer fields
  options?: Omit<QuestionOption, 'id'>[]; // For multiple_choice, multiple_select, true_false
  matchingPairs?: Omit<MatchingPair, 'id'>[]; // For matching
  flashcard?: FlashcardContent; // For flashcard
  correctAnswer?: string; // For true_false
  acceptedAnswers?: string[]; // For short_answer
  matchThreshold?: number; // For short_answer fuzzy matching
  sampleAnswer?: string; // For long_answer
  rubric?: string; // For long_answer grading
  blanks?: BlankDefinition[]; // For fill_in_blank
}

/**
 * Link question request body
 */
export interface LinkQuestionRequest {
  questionId: string;
  sequence?: number;
  pointsOverride?: number | null;
}

/**
 * Bulk link questions request body
 */
export interface BulkLinkQuestionsRequest {
  replaceExisting?: boolean;
  questions: LinkQuestionRequest[];
}

/**
 * Question list response
 */
export interface QuestionsListResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Linked questions response
 */
export interface LinkedQuestionsResponse {
  learningUnitId: string;
  learningUnitTitle: string;
  questions: LinkedQuestion[];
  totalQuestions: number;
  totalPoints: number;
}

/**
 * Question type display config
 */
export interface QuestionTypeConfig {
  type: QuestionType;
  label: string;
  description: string;
  icon: string;
  hasOptions: boolean;
  hasMatchingPairs: boolean;
  hasFlashcard: boolean;
  hasCorrectAnswer: boolean;
}

/**
 * Question type configurations
 */
export const QUESTION_TYPE_CONFIGS: Record<QuestionType, QuestionTypeConfig> = {
  multiple_choice: {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Single correct answer from options',
    icon: '○',
    hasOptions: true,
    hasMatchingPairs: false,
    hasFlashcard: false,
    hasCorrectAnswer: false,
  },
  multiple_select: {
    type: 'multiple_select',
    label: 'Multiple Select',
    description: 'Multiple correct answers from options',
    icon: '☑',
    hasOptions: true,
    hasMatchingPairs: false,
    hasFlashcard: false,
    hasCorrectAnswer: false,
  },
  true_false: {
    type: 'true_false',
    label: 'True/False',
    description: 'Binary true or false answer',
    icon: '⊤',
    hasOptions: false,
    hasMatchingPairs: false,
    hasFlashcard: false,
    hasCorrectAnswer: true,
  },
  short_answer: {
    type: 'short_answer',
    label: 'Short Answer',
    description: 'Brief text response with auto-grading',
    icon: '✎',
    hasOptions: false,
    hasMatchingPairs: false,
    hasFlashcard: false,
    hasCorrectAnswer: true,
  },
  long_answer: {
    type: 'long_answer',
    label: 'Long Answer',
    description: 'Extended response requiring manual grading',
    icon: '¶',
    hasOptions: false,
    hasMatchingPairs: false,
    hasFlashcard: false,
    hasCorrectAnswer: false,
  },
  matching: {
    type: 'matching',
    label: 'Matching',
    description: 'Match items from two columns',
    icon: '↔',
    hasOptions: false,
    hasMatchingPairs: true,
    hasFlashcard: false,
    hasCorrectAnswer: false,
  },
  flashcard: {
    type: 'flashcard',
    label: 'Flashcard',
    description: 'Front/back study card',
    icon: '🗂',
    hasOptions: false,
    hasMatchingPairs: false,
    hasFlashcard: true,
    hasCorrectAnswer: false,
  },
  fill_in_blank: {
    type: 'fill_in_blank',
    label: 'Fill in the Blank',
    description: 'Complete the sentence',
    icon: '___',
    hasOptions: false,
    hasMatchingPairs: false,
    hasFlashcard: false,
    hasCorrectAnswer: true,
  },
};

/**
 * Get display label for question type
 */
export function getQuestionTypeLabel(type: QuestionType): string {
  return QUESTION_TYPE_CONFIGS[type]?.label || type;
}

/**
 * Get all question types as array
 */
export function getQuestionTypes(): QuestionTypeConfig[] {
  return Object.values(QUESTION_TYPE_CONFIGS);
}

/**
 * Get short code for question type (for compact display)
 */
export function getQuestionTypeCode(type: QuestionType): string {
  const codes: Record<QuestionType, string> = {
    multiple_choice: 'MC',
    multiple_select: 'MS',
    true_false: 'TF',
    short_answer: 'SA',
    long_answer: 'LA',
    matching: 'MA',
    flashcard: 'FC',
    fill_in_blank: 'FB',
  };
  return codes[type] || type.substring(0, 2).toUpperCase();
}

/**
 * Get display labels for multiple question types
 */
export function getQuestionTypesLabels(types: QuestionType[]): string {
  return types.map(getQuestionTypeLabel).join(', ');
}

/**
 * Get short codes for multiple question types (for badges)
 */
export function getQuestionTypesCodes(types: QuestionType[]): string[] {
  return types.map(getQuestionTypeCode);
}

/**
 * Get primary type (first in array) for display purposes
 */
export function getPrimaryType(types: QuestionType[]): QuestionType {
  return types[0] || 'multiple_choice';
}

/**
 * Check if question supports a specific type
 */
export function questionSupportsType(question: Question, type: QuestionType): boolean {
  return question.types.includes(type);
}

/**
 * Get required fields for a set of question types
 */
export function getRequiredFieldsForTypes(types: QuestionType[]): {
  needsOptions: boolean;
  needsMatchingPairs: boolean;
  needsFlashcard: boolean;
  needsCorrectAnswer: boolean;
  needsAcceptedAnswers: boolean;
  needsSampleAnswer: boolean;
  needsBlanks: boolean;
} {
  return {
    needsOptions: types.some(t => ['multiple_choice', 'multiple_select', 'true_false'].includes(t)),
    needsMatchingPairs: types.includes('matching'),
    needsFlashcard: types.includes('flashcard'),
    needsCorrectAnswer: types.includes('true_false'),
    needsAcceptedAnswers: types.includes('short_answer'),
    needsSampleAnswer: types.includes('long_answer'),
    needsBlanks: types.includes('fill_in_blank'),
  };
}
