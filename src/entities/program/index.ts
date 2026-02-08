/**
 * Program Entity - Public API
 * Generated from: programs.contract.ts v1.0.0
 */

// =====================
// TYPE EXPORTS
// =====================

export type {
  Program,
  ProgramListItem,
  ProgramStatus,
  ProgramCredential,
  DurationUnit,
  CreateProgramPayload,
  UpdateProgramPayload,
  ProgramFilters,
  ProgramsListResponse,
  ProgramLevel,
  ProgramStatistics,
  ProgramLevelDetail,
  ProgramLevelsResponse,
  ProgramEnrollment,
  ProgramEnrollmentFilters,
  ProgramEnrollmentsResponse,
  ProgramFormData,
  Pagination,
} from './model/types';

// =====================
// HOOKS EXPORTS
// =====================

export {
  usePrograms,
  useProgram,
  useProgramLevels,
  useProgramEnrollments,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  usePublishProgram,
  useUnpublishProgram,
  useDuplicateProgram,
  // Certificate hooks
  useCertificateTemplates,
  useUpdateProgramCertificate,
  // Learner hooks
  useMyPrograms,
  useProgramForLearner,
  useEnrollProgram,
} from './hooks';

// Query keys
export { programKeys, certificateTemplateKeys } from './model/programKeys';

// =====================
// API EXPORTS (for advanced use)
// =====================

export * as programApi from './api/programApi';

// =====================
// UI COMPONENT EXPORTS
// =====================

export { ProgramCard, ProgramList, ProgramForm, CertificateConfigForm } from './ui';
