/**
 * Learner Management Entity - Public API
 */

// Types
export type {
  LearnerStatus,
  Address,
  LearnerDepartment,
  LearnerSummary,
  ProgramEnrollment,
  CourseEnrollment,
  LearnerStatistics,
  LearnerDetails,
  Pagination,
  ListLearnersParams,
  ListLearnersResponse,
  RegisterLearnerPayload,
  LearnerResponse,
  UpdateLearnerPayload,
  DeleteLearnerResponse,
} from './model/types';

// Hooks
export {
  useListLearners,
  useRegisterLearner,
  useLearnerDetails,
  useUpdateLearner,
  useDeleteLearner,
} from './model/useLearner';

// Query Keys
export { learnerKeys } from './model/learnerKeys';

// API (for advanced use cases)
export * as learnerApi from './api/learnerApi';

// UI Components
export { LearnerCard } from './ui/LearnerCard';
export { LearnerList } from './ui/LearnerList';
export { LearnerForm } from './ui/LearnerForm';
