/**
 * Flashcard Player Feature - Public API
 */

// Types
export type {
  FlashcardConfig,
  UpdateFlashcardConfigPayload,
  FlashcardItem,
  FlashcardSession,
  FlashcardResult,
  RecordResultResponse,
  FlashcardProgress,
  GetSessionParams,
} from './api/flashcardApi';

// Hooks
export {
  flashcardKeys,
  useFlashcardConfig,
  useUpdateFlashcardConfig,
  useFlashcardSession,
  useRecordFlashcardResult,
  useCompleteFlashcardSession,
  useFlashcardProgress,
  useResetFlashcardProgress,
} from './model/useFlashcard';

// API (for advanced use cases)
export * as flashcardApi from './api/flashcardApi';
