/**
 * Learning Unit Entity Types
 * Generated from: api/contracts/api/learning-units.contract.ts v1.0.0
 *
 * Learning units are individual pieces of content/activities within modules.
 * Categorized as exposition (instructional), practice, or assessment.
 *
 * Nested under /modules/:moduleId/learning-units
 */

// =====================
// ENUMS & LITERAL TYPES
// =====================

/**
 * Learning Unit Content Type
 * - media replaces legacy video
 */
export type LearningUnitType =
  | 'video'
  | 'media'
  | 'document'
  | 'scorm'
  | 'custom'
  | 'exercise'
  | 'assessment'
  | 'assignment';

/**
 * Learning Unit Category
 * - topic: Instructional content (videos, documents, presentations)
 * - practice: Practice exercises (exercises, simulations)
 * - assignment: Ungraded assignments or submissions
 * - graded: Graded evaluations (quizzes, exams)
 */
export type LearningUnitCategory = 'topic' | 'practice' | 'assignment' | 'graded';

// =====================
// NESTED TYPES
// =====================

/**
 * Learning Unit Settings - Configuration for how the unit behaves
 */
export interface LearningUnitSettings {
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
  timeLimit?: number; // in minutes
  showFeedback?: boolean;
  shuffleQuestions?: boolean;
  passingScore?: number; // 0-100
}

/**
 * Learning Unit Statistics - Aggregate metrics for staff view
 */
export interface LearningUnitStatistics {
  completionCount: number;
  averageScore: number | null;
  averageTimeSeconds: number | null;
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
 * Category Counts - Summary of learning units by category
 */
export interface CategoryCounts {
  topic: number;
  practice: number;
  assignment: number;
  graded: number;
}

// =====================
// LEARNING UNIT ENTITY TYPES
// =====================

/**
 * Learning Unit - Full detail type
 */
export interface LearningUnit {
  id: string;
  moduleId: string;
  moduleTitle?: string;
  courseId?: string;
  courseTitle?: string;
  title: string;
  description: string | null;
  type: LearningUnitType;
  contentId: string | null;
  content?: unknown | null;
  category: LearningUnitCategory | null;
  isRequired: boolean;
  isReplayable: boolean;
  weight: number; // 0-100, used for module completion calculation
  sequence: number;
  settings?: LearningUnitSettings;
  estimatedDuration: number | null; // in minutes
  availableFrom?: string | null;
  availableUntil?: string | null;
  isActive: boolean;
  statistics?: LearningUnitStatistics;
  createdBy?: UserRef | string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Learning Unit List Item - Compact version for list views
 */
export interface LearningUnitListItem {
  id: string;
  title: string;
  description: string | null;
  type: LearningUnitType;
  contentId: string | null;
  category: LearningUnitCategory | null;
  isRequired: boolean;
  isReplayable: boolean;
  weight: number;
  sequence: number;
  estimatedDuration: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Create Learning Unit Payload
 */
export interface CreateLearningUnitPayload {
  title: string;
  description?: string;
  type: LearningUnitType;
  contentId?: string;
  category?: LearningUnitCategory | null;
  isRequired?: boolean;
  isReplayable?: boolean;
  weight?: number;
  sequence?: number;
  settings?: LearningUnitSettings;
  estimatedDuration?: number;
  availableFrom?: string;
  availableUntil?: string;
}

/**
 * Update Learning Unit Payload
 */
export interface UpdateLearningUnitPayload {
  title?: string;
  description?: string;
  type?: LearningUnitType;
  contentId?: string;
  category?: LearningUnitCategory | null;
  isRequired?: boolean;
  isReplayable?: boolean;
  weight?: number;
  settings?: LearningUnitSettings;
  estimatedDuration?: number;
  availableFrom?: string;
  availableUntil?: string;
  isActive?: boolean;
}

/**
 * Reorder Learning Units Payload
 */
export interface ReorderLearningUnitsPayload {
  learningUnitIds: string[];
}

/**
 * Move Learning Unit Payload
 */
export interface MoveLearningUnitPayload {
  targetModuleId: string;
  sequence?: number;
}

// =====================
// QUERY FILTER TYPES
// =====================

/**
 * Learning Unit Query Filters
 */
export interface LearningUnitFilters {
  category?: LearningUnitCategory;
  type?: LearningUnitType;
  isRequired?: boolean;
}

// =====================
// RESPONSE TYPES
// =====================

/**
 * Learning Units List Response
 */
export interface LearningUnitsListResponse {
  moduleId: string;
  moduleTitle: string;
  learningUnits: LearningUnitListItem[];
  totalCount: number;
  categoryCounts: CategoryCounts;
}

/**
 * Reorder Learning Units Response
 */
export interface ReorderLearningUnitsResponse {
  moduleId: string;
  learningUnits: Array<{
    id: string;
    title: string;
    oldSequence: number;
    newSequence: number;
  }>;
}

/**
 * Move Learning Unit Response
 */
export interface MoveLearningUnitResponse {
  learningUnitId: string;
  sourceModuleId: string;
  targetModuleId: string;
  newSequence: number;
}

/**
 * Delete Learning Unit Response
 */
export interface DeleteLearningUnitResponse {
  id: string;
  title: string;
  deletedAt: string;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Learning Unit Form Data - Used for creating/updating learning units in forms
 */
export interface LearningUnitFormData {
  title: string;
  description?: string;
  type: LearningUnitType;
  contentId?: string;
  category?: LearningUnitCategory | null;
  isRequired?: boolean;
  isReplayable?: boolean;
  weight?: number;
  sequence?: number;
  settings?: LearningUnitSettings;
  estimatedDuration?: number;
  availableFrom?: string;
  availableUntil?: string;
}

/**
 * Default settings for new learning units
 */
export const DEFAULT_LEARNING_UNIT_SETTINGS: LearningUnitSettings = {
  allowMultipleAttempts: true,
  maxAttempts: undefined,
  timeLimit: undefined,
  showFeedback: true,
  shuffleQuestions: false,
  passingScore: undefined,
};

/**
 * Type guard to check if a learning unit is an assessment
 */
export function isAssessmentUnit(unit: LearningUnit | LearningUnitListItem): boolean {
  return unit.category === 'graded' || unit.type === 'assessment';
}

/**
 * Type guard to check if a learning unit is required for completion
 */
export function isRequiredUnit(unit: LearningUnit | LearningUnitListItem): boolean {
  return unit.isRequired;
}
