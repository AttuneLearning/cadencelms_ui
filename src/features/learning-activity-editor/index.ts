/**
 * Learning Activity Editor Feature
 * Components and utilities for creating/editing learning activities
 */

// Model exports
export * from './model/editor-config';
export * from './model/types';
export * from './model/question-types';

// Validation exports
export * from './lib/validation';

// UI exports - Main components
export { TypeSelectionModal } from './ui/TypeSelectionModal';
export { ActivityEditorDrawer } from './ui/ActivityEditorDrawer';
export { ActivityEditorPage } from './ui/ActivityEditorPage';

// UI exports - Drawer editors
export {
  MediaEditor,
  DocumentEditor,
  SCORMEditor,
  CustomEmbedEditor,
} from './ui/editors';

// UI exports - Page editors
export {
  ExerciseEditor,
  AssessmentEditor,
  AssignmentEditor,
} from './ui/page-editors';

// Shared components
export { MetadataSection, FileUploadSection } from './ui/shared';
