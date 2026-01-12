/**
 * Question Entity - Public API
 * Generated from: questions.contract.ts v1.0.0
 */

// Types
export type {
  Question,
  QuestionType,
  QuestionDifficulty,
  QuestionListItem,
  QuestionDetails,
  QuestionListParams,
  QuestionListResponse,
  CreateQuestionPayload,
  UpdateQuestionPayload,
  AnswerOption,
  BulkImportQuestionItem,
  BulkImportPayload,
  BulkImportResponse,
  BulkImportResultItem,
  QuestionFilters,
  QuestionFormData,
  Pagination,
} from './model/types';

// Hooks
export {
  useQuestions,
  useQuestion,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
  useBulkImportQuestions,
  useDuplicateQuestion,
} from './model/useQuestion';

export { questionKeys } from './model/questionKeys';

// API (for advanced use cases)
export * as questionApi from './api/questionApi';

// UI Components
export { QuestionCard } from './ui/QuestionCard';
export { QuestionList } from './ui/QuestionList';
export { QuestionForm } from './ui/QuestionForm';
