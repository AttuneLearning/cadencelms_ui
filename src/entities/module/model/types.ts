/**
 * Module Entity Types
 * Generated from: api/contracts/api/modules.contract.ts v1.0.0
 *
 * Modules are logical groupings of learning units within a course.
 * They organize content into chapters/sections with completion criteria and presentation rules.
 *
 * Nested under /courses/:courseId/modules
 */

// =====================
// ENUMS & LITERAL TYPES
// =====================

export type CompletionCriteriaType = 'all_required' | 'percentage' | 'gate_learning_unit' | 'points';

export type PresentationMode = 'prescribed' | 'learner_choice' | 'random';

export type RepetitionMode = 'none' | 'until_passed' | 'until_mastery' | 'spaced';

export type LearningUnitCategory = 'topic' | 'practice' | 'assignment' | 'graded';

// =====================
// NESTED TYPES
// =====================

/**
 * Completion Criteria - Rules for when a module is considered complete
 */
export interface ModuleCompletionCriteria {
  type: CompletionCriteriaType;
  percentageRequired: number | null;
  pointsRequired: number | null;
  gateLearningUnitScore: number | null;
  requireAllExpositions: boolean;
}

/**
 * Repeat On Settings - When repetition is triggered
 */
export interface RepeatOnSettings {
  failedAttempt: boolean;
  belowMastery: boolean;
  learnerRequest: boolean;
}

/**
 * Presentation Rules - How learning units are presented to learners
 */
export interface ModulePresentationRules {
  presentationMode: PresentationMode;
  prescribedOrder?: string[];
  repetitionMode: RepetitionMode;
  masteryThreshold: number | null;
  maxRepetitions: number | null;
  cooldownBetweenRepetitions?: number;
  repeatOn?: RepeatOnSettings;
  repeatableCategories?: LearningUnitCategory[];
  showAllAvailable: boolean;
  allowSkip: boolean;
}

/**
 * Module Statistics - Aggregate metrics for staff view
 */
export interface ModuleStatistics {
  learnerCount: number;
  completionRate: number;
  averageScore: number | null;
}

/**
 * Prerequisite Reference - For displaying prerequisite module info
 */
export interface PrerequisiteRef {
  id: string;
  title: string;
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
 * Learning Unit Summary - Abbreviated info for module detail view
 */
export interface LearningUnitSummary {
  id: string;
  title: string;
  category: LearningUnitCategory | null;
  type: string;
  sequence: number;
  isRequired: boolean;
}

// =====================
// MODULE ENTITY TYPES
// =====================

/**
 * Module - Full detail type
 */
export interface Module {
  id: string;
  courseId: string;
  courseTitle?: string;
  title: string;
  description: string | null;
  order: number;
  prerequisites: PrerequisiteRef[] | string[];
  completionCriteria: ModuleCompletionCriteria;
  gateLearningUnitId: string | null;
  presentationRules: ModulePresentationRules;
  isPublished: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  estimatedDuration: number;
  objectives: string[];
  learningUnits?: LearningUnitSummary[] | null;
  learningUnitCount?: number | null;
  statistics?: ModuleStatistics;
  createdBy?: UserRef | string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Module List Item - Compact version for list views
 */
export interface ModuleListItem {
  id: string;
  title: string;
  description: string | null;
  order: number;
  prerequisites: string[];
  completionCriteria: ModuleCompletionCriteria;
  gateLearningUnitId: string | null;
  presentationRules: ModulePresentationRules;
  isPublished: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  estimatedDuration: number;
  objectives: string[];
  learningUnitCount: number | null;
  createdAt: string;
  updatedAt: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Create Module Payload
 */
export interface CreateModulePayload {
  title: string;
  description?: string;
  order?: number;
  prerequisites?: string[];
  completionCriteria?: Partial<ModuleCompletionCriteria>;
  gateLearningUnitId?: string;
  presentationRules?: Partial<ModulePresentationRules>;
  isPublished?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  estimatedDuration?: number;
  objectives?: string[];
}

/**
 * Update Module Payload
 */
export interface UpdateModulePayload {
  title?: string;
  description?: string;
  prerequisites?: string[];
  completionCriteria?: Partial<ModuleCompletionCriteria>;
  gateLearningUnitId?: string;
  presentationRules?: Partial<ModulePresentationRules>;
  isPublished?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  estimatedDuration?: number;
  objectives?: string[];
}

/**
 * Reorder Modules Payload
 */
export interface ReorderModulesPayload {
  moduleIds: string[];
}

// =====================
// QUERY FILTER TYPES
// =====================

/**
 * Module Query Filters
 */
export interface ModuleFilters {
  includeUnpublished?: boolean;
  includeLearningUnits?: boolean;
}

// =====================
// RESPONSE TYPES
// =====================

/**
 * Modules List Response
 */
export interface ModulesListResponse {
  courseId: string;
  courseTitle: string;
  modules: ModuleListItem[];
  totalModules: number;
}

/**
 * Reorder Modules Response
 */
export interface ReorderModulesResponse {
  courseId: string;
  modules: Array<{
    id: string;
    title: string;
    oldOrder: number;
    newOrder: number;
  }>;
}

/**
 * Delete Module Response
 */
export interface DeleteModuleResponse {
  id: string;
  title: string;
  deletedAt: string;
  learningUnitsRemoved: number;
}

// =====================
// FORM DATA TYPES
// =====================

/**
 * Module Form Data - Used for creating/updating modules in forms
 */
export interface ModuleFormData {
  title: string;
  description?: string;
  order?: number;
  prerequisites?: string[];
  completionCriteria?: Partial<ModuleCompletionCriteria>;
  gateLearningUnitId?: string;
  presentationRules?: Partial<ModulePresentationRules>;
  isPublished?: boolean;
  availableFrom?: string;
  availableUntil?: string;
  estimatedDuration?: number;
  objectives?: string[];
}

/**
 * Default completion criteria for new modules
 */
export const DEFAULT_COMPLETION_CRITERIA: ModuleCompletionCriteria = {
  type: 'all_required',
  percentageRequired: null,
  pointsRequired: null,
  gateLearningUnitScore: null,
  requireAllExpositions: false,
};

/**
 * Default presentation rules for new modules
 */
export const DEFAULT_PRESENTATION_RULES: ModulePresentationRules = {
  presentationMode: 'learner_choice',
  repetitionMode: 'none',
  masteryThreshold: null,
  maxRepetitions: null,
  showAllAvailable: true,
  allowSkip: false,
};
