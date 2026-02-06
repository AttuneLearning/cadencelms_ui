/**
 * Matching Builder Feature
 * Module-level matching exercise authoring components
 */

// API
export {
  type MatchingMedia,
  type MatchingPairItem,
  type MatchingExercise,
  type CreateMatchingExerciseRequest,
  type UpdateMatchingExerciseRequest,
  type UpdatePairsRequest,
  type BulkMatchingPairItem,
  type BulkImportRequest,
  type BulkImportResponse,
  type ReorderRequest,
  type MatchingExercisesListResponse,
  type MatchingExerciseResponse,
} from './api/matchingBuilderApi';

// Hooks
export {
  matchingBuilderKeys,
  useMatchingExercises,
  useMatchingExercise,
  useCreateMatchingExercise,
  useUpdateMatchingExercise,
  useDeleteMatchingExercise,
  useUpdateMatchingPairs,
  useBulkImportMatchingPairs,
  useReorderMatchingPairs,
} from './model/useMatchingBuilder';

// UI Components
export { MatchingPairList } from './ui/MatchingPairList';
export { MatchingPairEditor } from './ui/MatchingPairEditor';
export { MatchingBulkImport } from './ui/MatchingBulkImport';
