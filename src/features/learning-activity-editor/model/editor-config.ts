/**
 * Learning Activity Editor Configuration
 * Maps activity types to their UI patterns and capabilities
 */

import type { LearningUnitType, LearningUnitCategory } from '@/entities/learning-unit';

/**
 * UI Pattern for editor display
 * - drawer: Side panel for simple types (quick edit)
 * - page: Full page for complex types (multi-tab editors)
 */
export type EditorUIPattern = 'drawer' | 'page';

/**
 * Configuration for each activity type editor
 */
export interface EditorConfig {
  /** Activity type identifier */
  type: LearningUnitType;
  /** Display label */
  label: string;
  /** Short description shown in type selector */
  description: string;
  /** Icon emoji for type selector cards */
  icon: string;
  /** UI pattern: drawer for simple, page for complex */
  uiPattern: EditorUIPattern;
  /** Default category when creating this type */
  defaultCategory: LearningUnitCategory;
  /** Whether this type supports questions (quiz-like) */
  hasQuestions: boolean;
  /** Whether this type requires file upload */
  hasFileUpload: boolean;
  /** Whether this type supports rubric grading */
  hasRubric: boolean;
  /** Accepted file types for upload (if hasFileUpload) */
  acceptedFileTypes?: string[];
  /** Maximum file size in bytes (if hasFileUpload) */
  maxFileSize?: number;
}

/**
 * Editor configurations for all learning unit types
 */
export const EDITOR_CONFIGS: Record<LearningUnitType, EditorConfig> = {
  video: {
    type: 'video',
    label: 'Video',
    description: 'Video content (legacy)',
    icon: '🎥',
    uiPattern: 'drawer',
    defaultCategory: 'topic',
    hasQuestions: false,
    hasFileUpload: true,
    hasRubric: false,
    acceptedFileTypes: ['.mp4', '.webm'],
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
  media: {
    type: 'media',
    label: 'Media',
    description: 'Video or audio content',
    icon: '🎬',
    uiPattern: 'drawer',
    defaultCategory: 'topic',
    hasQuestions: false,
    hasFileUpload: true,
    hasRubric: false,
    acceptedFileTypes: ['.mp4', '.webm', '.mp3', '.wav', '.m4a', '.ogg'],
    maxFileSize: 500 * 1024 * 1024, // 500MB
  },
  document: {
    type: 'document',
    label: 'Document',
    description: 'PDF, slides, or documents',
    icon: '📄',
    uiPattern: 'drawer',
    defaultCategory: 'topic',
    hasQuestions: false,
    hasFileUpload: true,
    hasRubric: false,
    acceptedFileTypes: ['.pdf', '.pptx', '.ppt', '.docx', '.doc', '.xlsx', '.xls'],
    maxFileSize: 100 * 1024 * 1024, // 100MB
  },
  scorm: {
    type: 'scorm',
    label: 'SCORM',
    description: 'SCORM package upload',
    icon: '📦',
    uiPattern: 'drawer',
    defaultCategory: 'topic',
    hasQuestions: false,
    hasFileUpload: true,
    hasRubric: false,
    acceptedFileTypes: ['.zip'],
    maxFileSize: 200 * 1024 * 1024, // 200MB
  },
  custom: {
    type: 'custom',
    label: 'Custom Embed',
    description: 'External link or embed code',
    icon: '🔗',
    uiPattern: 'drawer',
    defaultCategory: 'topic',
    hasQuestions: false,
    hasFileUpload: false,
    hasRubric: false,
  },
  exercise: {
    type: 'exercise',
    label: 'Exercise',
    description: 'Practice questions (ungraded)',
    icon: '📝',
    uiPattern: 'page',
    defaultCategory: 'practice',
    hasQuestions: true,
    hasFileUpload: false,
    hasRubric: false,
  },
  assessment: {
    type: 'assessment',
    label: 'Assessment',
    description: 'Graded quiz or exam',
    icon: '📋',
    uiPattern: 'page',
    defaultCategory: 'graded',
    hasQuestions: true,
    hasFileUpload: false,
    hasRubric: false,
  },
  assignment: {
    type: 'assignment',
    label: 'Assignment',
    description: 'File submission with rubric',
    icon: '📤',
    uiPattern: 'page',
    defaultCategory: 'assignment',
    hasQuestions: false,
    hasFileUpload: false,
    hasRubric: true,
  },
};

/**
 * Get editor configuration for a specific type
 */
export function getEditorConfig(type: LearningUnitType): EditorConfig {
  return EDITOR_CONFIGS[type];
}

/**
 * Get UI pattern for a specific type
 */
export function getEditorUIPattern(type: LearningUnitType): EditorUIPattern {
  return EDITOR_CONFIGS[type].uiPattern;
}

/**
 * Get all editor configs as an array (for iteration in UI)
 */
export function getEditorConfigList(): EditorConfig[] {
  return Object.values(EDITOR_CONFIGS);
}

/**
 * Get drawer-based editor configs
 */
export function getDrawerEditorConfigs(): EditorConfig[] {
  return getEditorConfigList().filter((config) => config.uiPattern === 'drawer');
}

/**
 * Get page-based editor configs
 */
export function getPageEditorConfigs(): EditorConfig[] {
  return getEditorConfigList().filter((config) => config.uiPattern === 'page');
}

/**
 * Check if a type uses drawer UI
 */
export function isDrawerType(type: LearningUnitType): boolean {
  return EDITOR_CONFIGS[type].uiPattern === 'drawer';
}

/**
 * Check if a type uses page UI
 */
export function isPageType(type: LearningUnitType): boolean {
  return EDITOR_CONFIGS[type].uiPattern === 'page';
}
