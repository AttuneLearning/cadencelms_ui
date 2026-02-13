/**
 * Flashcard Player Feature - Public API
 */

// Types
export type {
  CheckFrequency,
  SelectionMethod,
  RemediationStatus,
  FlashcardConfig,
  UpdateFlashcardConfigPayload,
  FlashcardItem,
  FlashcardSession,
  FlashcardResult,
  RecordResultResponse,
  FlashcardProgress,
  GetSessionParams,
  ResetProgressParams,
  PendingRetentionCheck,
  PendingRetentionChecksResponse,
  RetentionCheckCard,
  RetentionCheckDetail,
  SubmitRetentionCheckAnswer,
  SubmitRetentionCheckRequest,
  SubmitRetentionCheckResponse,
  RetentionHistoryItem,
  RetentionHistoryPagination,
  RetentionCheckHistoryResponse,
  GetRetentionHistoryParams,
  ActiveRemediation,
  ActiveRemediationsResponse,
} from './api/flashcardApi';

// Hooks
export {
  flashcardKeys,
  useFlashcardConfig,
  useUpdateFlashcardConfig,
  useFlashcardSession,
  useRecordFlashcardResult,
  useFlashcardProgress,
  useResetFlashcardProgress,
  usePendingRetentionChecks,
  useRetentionCheck,
  useSubmitRetentionCheck,
  useRetentionCheckHistory,
  useActiveRemediations,
} from './model/useFlashcard';

// API (for advanced use cases)
export * as flashcardApi from './api/flashcardApi';
