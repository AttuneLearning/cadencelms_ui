/**
 * Assessment Entity Types
 * Generated from: api/contracts/api/assessments.contract.ts v1.0.0
 *
 * Assessments are quiz and exam configurations that can be used as learning unit content.
 * They define question selection rules, timing, attempt limits, and scoring.
 *
 * Endpoint: /assessments
 */

// =====================
// ENUMS & LITERAL TYPES
// =====================

/**
 * Assessment Style
 * - quiz: Lighter assessments, typically more attempts allowed
 * - exam: Formal assessments, typically stricter settings
 */
export type AssessmentStyle = 'quiz' | 'exam';

/**
 * Question Selection Mode
 */
export type SelectionMode = 'random' | 'sequential' | 'weighted';

/**
 * Retake Policy
 */
export type RetakePolicy = 'anytime' | 'after_cooldown' | 'instructor_unlock';

/**
 * Show Correct Answers Policy
 */
export type ShowCorrectAnswersPolicy = 'never' | 'after_submit' | 'after_all_attempts';

/**
 * Feedback Timing
 */
export type FeedbackTiming = 'immediate' | 'after_submit' | 'after_grading';

/**
 * Question Difficulty Level
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// =====================
// NESTED TYPES
// =====================

/**
 * Question Selection Configuration
 */
export interface QuestionSelection {
  questionBankIds: string[];
  questionCount: number;
  selectionMode: SelectionMode;
  filterByTags?: string[];
  filterByDifficulty?: DifficultyLevel[];
}

/**
 * Timing Configuration
 */
export interface AssessmentTiming {
  timeLimit: number | null; // in minutes, null = unlimited
  showTimer: boolean;
  autoSubmitOnExpiry: boolean;
}

/**
 * Attempts Configuration
 */
export interface AssessmentAttempts {
  maxAttempts: number | null; // null = unlimited
  cooldownMinutes: number | null;
  retakePolicy: RetakePolicy;
}

/**
 * Scoring Configuration
 */
export interface AssessmentScoring {
  passingScore: number; // 0-100
  showScore: boolean;
  showCorrectAnswers: ShowCorrectAnswersPolicy;
  partialCredit: boolean;
}

/**
 * Feedback Configuration
 */
export interface AssessmentFeedback {
  showFeedback: boolean;
  feedbackTiming: FeedbackTiming;
  showExplanations: boolean;
}

/**
 * Assessment Statistics - Aggregate metrics for staff view
 */
export interface AssessmentStatistics {
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeMinutes: number;
}

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

/**
 * Pagination
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// ASSESSMENT ENTITY TYPES
// =====================

/**
 * Assessment - Full detail type
 */
export interface Assessment {
  id: string;
  departmentId: string;
  department?: DepartmentRef;
  departmentName?: string;
  title: string;
  description: string | null;
  style: AssessmentStyle;
  questionSelection: QuestionSelection;
  timing: AssessmentTiming;
  attempts: AssessmentAttempts;
  scoring: AssessmentScoring;
  feedback: AssessmentFeedback;
  gradingPolicy?: 'best' | 'last' | 'average';
  isPublished: boolean;
  isArchived: boolean;
  usedInLearningUnits?: number;
  statistics?: AssessmentStatistics;
  createdBy: UserRef | string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Assessment List Item - Compact version for list views
 */
export interface AssessmentListItem {
  id: string;
  departmentId: string;
  departmentName: string;
  title: string;
  description: string | null;
  style: AssessmentStyle;
  questionSelection: QuestionSelection;
  timing: AssessmentTiming;
  attempts: AssessmentAttempts;
  scoring: AssessmentScoring;
  isPublished: boolean;
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Create Assessment Payload
 */
export interface CreateAssessmentPayload {
  departmentId: string;
  title: string;
  description?: string;
  style: AssessmentStyle;
  questionSelection: {
    questionBankIds: string[];
    questionCount: number;
    selectionMode?: SelectionMode;
    filterByTags?: string[];
    filterByDifficulty?: DifficultyLevel[];
  };
  timing?: Partial<AssessmentTiming>;
  attempts?: Partial<AssessmentAttempts>;
  scoring?: Partial<AssessmentScoring>;
  feedback?: Partial<AssessmentFeedback>;
}

/**
 * Update Assessment Payload
 */
export interface UpdateAssessmentPayload {
  title?: string;
  description?: string;
  style?: AssessmentStyle;
  questionSelection?: Partial<QuestionSelection>;
  timing?: Partial<AssessmentTiming>;
  attempts?: Partial<AssessmentAttempts>;
  scoring?: Partial<AssessmentScoring>;
  feedback?: Partial<AssessmentFeedback>;
}

// =====================
// QUERY FILTER TYPES
// =====================

/**
 * Assessment Query Filters
 */
export interface AssessmentFilters {
  page?: number;
  limit?: number;
  departmentId?: string;
  style?: AssessmentStyle;
  isPublished?: boolean;
  search?: string;
  sort?: string;
}

// =====================
// RESPONSE TYPES
// =====================

/**
 * Assessments List Response
 */
export interface AssessmentsListResponse {
  assessments: AssessmentListItem[];
  pagination: Pagination;
}

/**
 * Publish Assessment Response
 */
export interface PublishAssessmentResponse {
  id: string;
  isPublished: true;
  publishedAt: string;
}

/**
 * Archive Assessment Response
 */
export interface ArchiveAssessmentResponse {
  id: string;
  isArchived: true;
  archivedAt: string;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Assessment Form Data - Used for creating/updating assessments in forms
 */
export interface AssessmentFormData {
  departmentId: string;
  title: string;
  description?: string;
  style: AssessmentStyle;
  questionSelection: {
    questionBankIds: string[];
    questionCount: number;
    selectionMode?: SelectionMode;
    filterByTags?: string[];
    filterByDifficulty?: DifficultyLevel[];
  };
  timing?: Partial<AssessmentTiming>;
  attempts?: Partial<AssessmentAttempts>;
  scoring?: Partial<AssessmentScoring>;
  feedback?: Partial<AssessmentFeedback>;
}

/**
 * Default timing settings
 */
export const DEFAULT_ASSESSMENT_TIMING: AssessmentTiming = {
  timeLimit: null,
  showTimer: true,
  autoSubmitOnExpiry: true,
};

/**
 * Default attempts settings
 */
export const DEFAULT_ASSESSMENT_ATTEMPTS: AssessmentAttempts = {
  maxAttempts: null,
  cooldownMinutes: null,
  retakePolicy: 'anytime',
};

/**
 * Default scoring settings
 */
export const DEFAULT_ASSESSMENT_SCORING: AssessmentScoring = {
  passingScore: 70,
  showScore: true,
  showCorrectAnswers: 'after_submit',
  partialCredit: false,
};

/**
 * Default feedback settings
 */
export const DEFAULT_ASSESSMENT_FEEDBACK: AssessmentFeedback = {
  showFeedback: true,
  feedbackTiming: 'after_submit',
  showExplanations: true,
};

/**
 * Type guard to check if assessment is a quiz
 */
export function isQuiz(assessment: Assessment | AssessmentListItem): boolean {
  return assessment.style === 'quiz';
}

/**
 * Type guard to check if assessment is an exam
 */
export function isExam(assessment: Assessment | AssessmentListItem): boolean {
  return assessment.style === 'exam';
}

/**
 * Type guard to check if assessment is published
 */
export function isPublished(assessment: Assessment | AssessmentListItem): boolean {
  return assessment.isPublished && !assessment.isArchived;
}
