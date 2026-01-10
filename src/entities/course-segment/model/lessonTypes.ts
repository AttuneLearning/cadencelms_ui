/**
 * Lesson-specific types for course segments
 * Extends course segments with lesson/content organization features
 */

export type CompletionCriteriaType =
  | 'view_time'      // Must view X% of content
  | 'quiz_score'     // Must achieve X% score
  | 'manual'         // Staff manually marks complete
  | 'auto';          // Auto-complete on launch

export interface CompletionCriteria {
  type: CompletionCriteriaType;

  // For view_time type
  requiredPercentage?: number; // 0-100, e.g., 80 = must view 80%

  // For quiz_score type
  minimumScore?: number; // 0-100

  // For all types
  allowEarlyCompletion?: boolean; // Can complete before criteria met
}

export interface LessonSettings {
  isRequired: boolean;
  completionCriteria: CompletionCriteria;
  unlockConditions?: {
    previousLessonId?: string; // Must complete this lesson first
    delayMinutes?: number;     // Must wait X minutes after enrollment
  };
  customTitle?: string; // Override content title
}

export interface Lesson {
  id: string;
  moduleId: string;
  contentId: string | null;
  order: number;
  title: string;
  description: string | null;
  type: 'scorm' | 'media' | 'exercise' | 'custom' | 'video' | 'document';
  duration: number | null; // seconds
  settings: LessonSettings;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LessonListItem {
  id: string;
  order: number;
  title: string;
  type: 'scorm' | 'media' | 'exercise' | 'custom' | 'video' | 'document';
  duration: number | null;
  settings: LessonSettings;
  isPublished: boolean;
}

export interface CreateLessonPayload {
  contentId?: string;
  order: number;
  title: string;
  description?: string;
  type: 'scorm' | 'media' | 'exercise' | 'custom' | 'video' | 'document';
  duration?: number;
  settings: LessonSettings;
  isPublished?: boolean;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
  duration?: number;
  settings?: Partial<LessonSettings>;
  isPublished?: boolean;
}

export interface ReorderLessonsPayload {
  lessonIds: string[];
}

export interface LessonSettingsFormData {
  customTitle?: string;
  isRequired: boolean;
  completionCriteriaType: CompletionCriteriaType;
  requiredPercentage?: number;
  minimumScore?: number;
  allowEarlyCompletion: boolean;
  previousLessonId?: string;
  delayMinutes?: number;
}
