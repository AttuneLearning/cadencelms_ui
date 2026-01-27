/**
 * Learning Activity Editor Types
 * Types specific to the editor feature
 */

import type { LearningUnitType, LearningUnitCategory } from '@/entities/learning-unit';

/**
 * Props for type-specific editor components
 */
export interface EditorProps {
  /** Module ID the activity belongs to */
  moduleId: string;
  /** Course ID for context */
  courseId: string;
  /** Form submission handler */
  onSubmit: (data: ActivityFormData) => void;
  /** Loading state during save */
  isLoading?: boolean;
  /** Existing activity data for edit mode */
  initialData?: ActivityFormData;
}

/**
 * Base form data for all activity types
 */
export interface ActivityFormData {
  title: string;
  description?: string;
  type: LearningUnitType;
  category?: LearningUnitCategory;
  estimatedDuration?: number;
  isRequired?: boolean;
  isReplayable?: boolean;
  weight?: number;
  contentId?: string;
  // Type-specific fields
  fileUrl?: string;
  embedCode?: string;
  embedUrl?: string;
  settings?: ActivitySettings;
}

/**
 * Activity settings for quiz/assessment types
 */
export interface ActivitySettings {
  timeLimit?: number;
  attemptLimit?: number;
  passingScore?: number;
  showFeedback?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  allowBackNavigation?: boolean;
  showCorrectAnswers?: 'never' | 'after_submission' | 'after_due_date';
}

/**
 * File upload state
 */
export interface FileUploadState {
  file: File | null;
  progress: number;
  url: string | null;
  error: string | null;
  isUploading: boolean;
}

/**
 * Question link for quiz/assessment types
 */
export interface QuestionLink {
  questionId: string;
  order: number;
  points?: number;
}

/**
 * Editor mode
 */
export type EditorMode = 'create' | 'edit';

/**
 * Editor state for managing unsaved changes
 */
export interface EditorState {
  mode: EditorMode;
  isDirty: boolean;
  isSubmitting: boolean;
  lastSavedAt?: Date;
}
