/**
 * Academic Year Entity - Public API
 * Complete academic calendar management including years, terms, and cohorts
 */

// =====================
// TYPE EXPORTS
// =====================

// Academic Year types
export type {
  AcademicYear,
  AcademicYearListItem,
  CreateYearPayload,
  UpdateYearPayload,
  YearFilters,
  YearsListResponse,
  YearStatus,
  AcademicYearFormData,
  AcademicYearFilters,
} from './model/types';

// Term types
export type {
  Term,
  TermListItem,
  CreateTermPayload,
  UpdateTermPayload,
  TermFilters,
  TermsListResponse,
  TermStatus,
  TermType,
  TermClass,
} from './model/types';

// Cohort types
export type {
  Cohort,
  CohortListItem,
  CreateCohortPayload,
  UpdateCohortPayload,
  CohortFilters,
  CohortsListResponse,
  CohortStatus,
  CohortLearner,
} from './model/types';

// Shared types
export type { Pagination } from './model/types';

// =====================
// HOOKS EXPORTS
// =====================

// Academic Year hooks
export {
  useAcademicYears,
  useAcademicYear,
  useCurrentAcademicYear,
  useCreateAcademicYear,
  useUpdateAcademicYear,
  useDeleteAcademicYear,
} from './hooks';

// Term hooks
export {
  useTerms,
  useTermsByYear,
  useTerm,
  useCreateTerm,
  useUpdateTerm,
  useDeleteTerm,
} from './hooks';

// Cohort hooks
export {
  useCohorts,
  useCohortsByYear,
  useCohortsByProgram,
  useCohort,
  useCreateCohort,
  useUpdateCohort,
  useDeleteCohort,
} from './hooks';

// Query keys
export { academicYearKeys } from './model/academicYearKeys';

// =====================
// API EXPORTS (for advanced use)
// =====================

export * as academicYearApi from './api/academicYearApi';

// =====================
// UI COMPONENT EXPORTS
// =====================

export {
  AcademicYearCard,
  AcademicYearList,
  AcademicYearCalendar,
  AcademicYearForm,
  TermList,
  CohortList,
} from './ui';
