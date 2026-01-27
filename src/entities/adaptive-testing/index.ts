/**
 * Adaptive Testing Entity
 * API and hooks for adaptive question selection and response recording
 */

// Types
export type {
  SelectQuestionParams,
  SelectQuestionsParams,
  RecordResponseParams,
  AdaptiveQuestionResponse,
  AdaptiveMetadata,
  RecordResponseResult,
} from './model/types';

// API
export {
  selectQuestion,
  selectQuestions,
  recordResponse,
} from './api/adaptiveApi';

// Hooks
export {
  useSelectQuestion,
  useSelectQuestions,
  useRecordResponse,
} from './model/useAdaptiveTesting';
