/**
 * Question Bank Entity
 * Public API for question bank management
 */

// Types
export type {
  QuestionBank,
  QuestionBankListItem,
  QuestionBankListParams,
  QuestionBankListResponse,
  CreateQuestionBankPayload,
  UpdateQuestionBankPayload,
} from './model/types';

// API
export {
  getQuestionBanks,
  getQuestionBank,
  createQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
} from './api/questionBankApi';

// Hooks
export {
  useQuestionBanks,
  useQuestionBank,
  useCreateQuestionBank,
  useUpdateQuestionBank,
  useDeleteQuestionBank,
} from './model/useQuestionBank';

// Query Keys
export { questionBankKeys } from './model/questionBankKeys';
