/**
 * Exercise Entity
 * Public API for exercise entity
 */

// Types
export type {
  Exercise,
  ExerciseListItem,
  ExerciseType,
  ExerciseStatus,
  ExerciseDifficulty,
  QuestionType,
  ExerciseQuestion,
  QuestionReference,
  ExerciseStatistics,
  DepartmentRef,
  UserRef,
  CreateExercisePayload,
  UpdateExercisePayload,
  AddQuestionPayload,
  BulkAddQuestionsPayload,
  ReorderQuestionsPayload,
  ExerciseFilters,
  GetQuestionsQuery,
  ExercisesListResponse,
  ExerciseQuestionsResponse,
  AddQuestionResponse,
  BulkAddQuestionsResponse,
  RemoveQuestionResponse,
  ReorderQuestionsResponse,
  ExerciseFormData,
  QuestionFormData,
  Pagination,
} from './model/types';

// API
export {
  listExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  publishExercise,
  unpublishExercise,
  archiveExercise,
  getExerciseQuestions,
  addExerciseQuestion,
  bulkAddExerciseQuestions,
  removeExerciseQuestion,
  reorderExerciseQuestions,
} from './api/exerciseApi';

// Query Keys
export { exerciseKeys } from './model/exerciseKeys';

// Hooks
export {
  useExercises,
  useExercise,
  useExerciseQuestions,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
  usePublishExercise,
  useUnpublishExercise,
  useArchiveExercise,
  useAddExerciseQuestion,
  useBulkAddExerciseQuestions,
  useRemoveExerciseQuestion,
  useReorderExerciseQuestions,
} from './model/useExercise';

// UI Components
export { ExerciseCard } from './ui/ExerciseCard';
export { ExerciseList } from './ui/ExerciseList';
export { ExerciseForm } from './ui/ExerciseForm';
export { QuestionSelector } from './ui/QuestionSelector';
