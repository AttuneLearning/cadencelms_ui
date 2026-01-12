/**
 * Exercise Entity Types
 * Generated from: /contracts/api/exercises.contract.ts v1.0.0
 *
 * Types for exercise/exam management including questions, scoring, and assessments.
 */

// =====================
// SHARED TYPES
// =====================

export type ExerciseType = 'quiz' | 'exam' | 'practice' | 'assessment';
export type ExerciseStatus = 'draft' | 'published' | 'archived';
export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching';

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// REFERENCE TYPES
// =====================

/**
 * Department Reference
 */
export interface DepartmentRef {
  id: string;
  name: string;
}

/**
 * User Reference
 */
export interface UserRef {
  id: string;
  firstName: string;
  lastName: string;
}

// =====================
// QUESTION TYPES
// =====================

/**
 * Exercise Question
 */
export interface ExerciseQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  order: number;
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  difficulty: ExerciseDifficulty;
  tags?: string[];
  createdAt: string;
}

/**
 * Question Reference (for create/update)
 */
export interface QuestionReference {
  questionId?: string; // Existing question from bank
  questionText?: string; // New question text
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  order?: number;
  explanation?: string;
  difficulty?: ExerciseDifficulty;
  tags?: string[];
}

// =====================
// EXERCISE TYPES
// =====================

/**
 * Exercise Statistics
 */
export interface ExerciseStatistics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
}

/**
 * Exercise - Full detail type
 */
export interface Exercise {
  id: string;
  title: string;
  description?: string;
  type: ExerciseType;
  department: DepartmentRef;
  difficulty: ExerciseDifficulty;
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  questionCount: number;
  shuffleQuestions: boolean;
  showFeedback: boolean;
  allowReview: boolean;
  instructions?: string;
  status: ExerciseStatus;
  createdBy: UserRef;
  createdAt: string;
  updatedAt: string;
  statistics?: ExerciseStatistics;
}

/**
 * Exercise List Item - Compact version for list views
 */
export interface ExerciseListItem {
  id: string;
  title: string;
  description?: string;
  type: ExerciseType;
  department: string; // ObjectId
  difficulty: ExerciseDifficulty;
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  questionCount: number;
  shuffleQuestions: boolean;
  showFeedback: boolean;
  allowReview: boolean;
  status: ExerciseStatus;
  createdBy: string; // ObjectId
  createdAt: string;
  updatedAt: string;
}

// =====================
// PAYLOAD TYPES
// =====================

/**
 * Create Exercise Payload
 */
export interface CreateExercisePayload {
  title: string;
  description?: string;
  type: ExerciseType;
  department: string;
  difficulty?: ExerciseDifficulty;
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showFeedback?: boolean;
  allowReview?: boolean;
  instructions?: string;
}

/**
 * Update Exercise Payload
 */
export interface UpdateExercisePayload {
  title?: string;
  description?: string;
  type?: ExerciseType;
  difficulty?: ExerciseDifficulty;
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showFeedback?: boolean;
  allowReview?: boolean;
  instructions?: string;
  status?: ExerciseStatus;
}

/**
 * Add Question Payload
 */
export interface AddQuestionPayload extends QuestionReference {}

/**
 * Bulk Add Questions Payload
 */
export interface BulkAddQuestionsPayload {
  questions: QuestionReference[];
  mode?: 'append' | 'replace';
}

/**
 * Reorder Questions Payload
 */
export interface ReorderQuestionsPayload {
  questionIds: string[];
}

// =====================
// FILTER TYPES
// =====================

/**
 * Exercise Query Filters
 */
export interface ExerciseFilters {
  page?: number;
  limit?: number;
  type?: ExerciseType;
  department?: string;
  difficulty?: ExerciseDifficulty;
  search?: string;
  sort?: string;
  status?: ExerciseStatus;
}

/**
 * Get Questions Query
 */
export interface GetQuestionsQuery {
  includeAnswers?: boolean;
}

// =====================
// RESPONSE TYPES
// =====================

/**
 * Exercises List Response
 */
export interface ExercisesListResponse {
  exercises: ExerciseListItem[];
  pagination: Pagination;
}

/**
 * Questions Response
 */
export interface ExerciseQuestionsResponse {
  exerciseId: string;
  exerciseTitle: string;
  questionCount: number;
  totalPoints: number;
  questions: ExerciseQuestion[];
}

/**
 * Add Question Response
 */
export interface AddQuestionResponse {
  exerciseId: string;
  question: ExerciseQuestion;
  updatedTotals: {
    questionCount: number;
    totalPoints: number;
  };
}

/**
 * Bulk Add Questions Response
 */
export interface BulkAddQuestionsResponse {
  exerciseId: string;
  added: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
  updatedTotals: {
    questionCount: number;
    totalPoints: number;
  };
}

/**
 * Remove Question Response
 */
export interface RemoveQuestionResponse {
  exerciseId: string;
  removedQuestionId: string;
  updatedTotals: {
    questionCount: number;
    totalPoints: number;
  };
}

/**
 * Reorder Questions Response
 */
export interface ReorderQuestionsResponse {
  exerciseId: string;
  questionCount: number;
  updatedOrder: Array<{
    questionId: string;
    order: number;
  }>;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Exercise Form Data
 * Used for creating/updating exercises in forms
 */
export interface ExerciseFormData {
  title: string;
  description?: string;
  type: ExerciseType;
  department: string;
  difficulty?: ExerciseDifficulty;
  timeLimit?: number;
  passingScore?: number;
  shuffleQuestions?: boolean;
  showFeedback?: boolean;
  allowReview?: boolean;
  instructions?: string;
}

/**
 * Question Form Data
 * Used for adding questions in forms
 */
export interface QuestionFormData {
  questionId?: string;
  questionText?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
  order?: number;
  explanation?: string;
  difficulty?: ExerciseDifficulty;
  tags?: string[];
}
