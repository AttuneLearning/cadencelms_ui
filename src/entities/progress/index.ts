/**
 * Progress Entity
 * Public API for progress entity
 * Based on progress.contract.ts v1.0.0
 */

// Types
export * from './model/types';

// API Client Functions
export {
  getProgramProgress,
  getCourseProgress,
  getClassProgress,
  getLearnerProgress,
  getLearnerProgramProgress,
  updateProgress,
  getProgressSummary,
  getDetailedProgressReport,
} from './api/progressApi';

// React Query Hooks
export {
  useProgramProgress,
  useCourseProgress,
  useClassProgress,
  useLearnerProgress,
  useLearnerProgramProgress,
  useUpdateProgress,
  useProgressSummary,
  useDetailedProgressReport,
  PROGRESS_KEYS,
} from './hooks/useProgress';

// UI Components (existing)
export * from './ui';
