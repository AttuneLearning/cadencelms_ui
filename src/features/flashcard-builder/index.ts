/**
 * Flashcard Builder Feature
 * Module-level flashcard authoring components
 */

// API
export {
  type FlashcardItem,
  type FlashcardMedia,
  type CreateFlashcardRequest,
  type UpdateFlashcardRequest,
  type BulkFlashcardItem,
  type BulkImportRequest,
  type BulkImportResponse,
  type ReorderRequest,
  type FlashcardsListResponse,
} from './api/flashcardBuilderApi';

// Hooks
export {
  flashcardBuilderKeys,
  useFlashcards,
  useCreateFlashcard,
  useUpdateFlashcard,
  useDeleteFlashcard,
  useBulkImportFlashcards,
  useReorderFlashcards,
} from './model/useFlashcardBuilder';

// UI Components
export { FlashcardEditor } from './ui/FlashcardEditor';
export { FlashcardList } from './ui/FlashcardList';
export { FlashcardBulkImport } from './ui/FlashcardBulkImport';
export { FlashcardPreview } from './ui/FlashcardPreview';
