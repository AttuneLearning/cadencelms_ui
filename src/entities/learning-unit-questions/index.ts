/**
 * Learning Unit Questions Entity
 * Public API for managing questions linked to exercises and assessments
 */

// Types
export type {
  LinkedQuestion,
  LinkedQuestionsResponse,
  LinkQuestionPayload,
  LinkQuestionResponse,
  BulkLinkPayload,
  BulkLinkResponse,
  UpdateLinkPayload,
} from './model/types';

// Query Keys
export { learningUnitQuestionsKeys } from './model/learningUnitQuestionsKeys';

// Hooks
export {
  useLinkedQuestions,
  useLinkQuestion,
  useBulkLinkQuestions,
  useUpdateLinkedQuestion,
  useUnlinkQuestion,
} from './hooks/useLearningUnitQuestions';

// API (for advanced use cases)
export * as learningUnitQuestionsApi from './api/learningUnitQuestionsApi';
