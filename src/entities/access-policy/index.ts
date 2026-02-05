/**
 * Access Policy Entity
 * Public API for access policies, program enrollments, and access extensions
 */

// Types
export type {
  // Access Duration
  AccessDuration,
  // Department Access Policy
  DepartmentAccessPolicy,
  DepartmentAccessPolicyListItem,
  // Program Access Override
  ProgramAccessOverride,
  ProgramAccessOverrideListItem,
  // Program Enrollment
  ProgramEnrollmentStatus,
  ProgramEnrollment,
  ProgramEnrollmentListItem,
  ProgramEnrollmentDetail,
  // Access Extension
  AccessExtensionStatus,
  AccessExtensionRequest,
  AccessExtensionRequestListItem,
  // API Payloads
  UpdateDepartmentAccessPolicyPayload,
  UpsertProgramAccessOverridePayload,
  RequestAccessExtensionPayload,
  ReviewAccessExtensionPayload,
  ExtendAccessPayload,
  // Filters
  ProgramEnrollmentFilters,
  AccessExtensionRequestFilters,
  // API Responses
  Pagination,
  DepartmentAccessPoliciesListResponse,
  ProgramAccessOverridesListResponse,
  ProgramEnrollmentsListResponse,
  AccessExtensionRequestsListResponse,
} from './model/types';

// Functions
export { formatAccessDuration } from './model/types';

// API
export {
  // Department Access Policies
  listDepartmentAccessPolicies,
  getDepartmentAccessPolicy,
  updateDepartmentAccessPolicy,
  // Program Access Overrides
  listProgramAccessOverrides,
  getProgramAccessOverride,
  upsertProgramAccessOverride,
  deleteProgramAccessOverride,
  // Program Enrollments
  listProgramEnrollments,
  getProgramEnrollment,
  getLearnerProgramEnrollments,
  extendProgramAccess,
  // Access Extension Requests
  listAccessExtensionRequests,
  getAccessExtensionRequest,
  requestAccessExtension,
  reviewAccessExtensionRequest,
} from './api/accessPolicyApi';

// Query Keys
export {
  departmentAccessPolicyKeys,
  programAccessOverrideKeys,
  programEnrollmentKeys,
  accessExtensionRequestKeys,
} from './model/accessPolicyKeys';

// Hooks
export {
  // Department Access Policy hooks
  useDepartmentAccessPolicies,
  useDepartmentAccessPolicy,
  useUpdateDepartmentAccessPolicy,
  // Program Access Override hooks
  useProgramAccessOverrides,
  useProgramAccessOverride,
  useUpsertProgramAccessOverride,
  useDeleteProgramAccessOverride,
  // Program Enrollment hooks
  useProgramEnrollments,
  useProgramEnrollment,
  useLearnerProgramEnrollments,
  useExtendProgramAccess,
  // Access Extension Request hooks
  useAccessExtensionRequests,
  useAccessExtensionRequest,
  useRequestAccessExtension,
  useReviewAccessExtensionRequest,
} from './hooks/useAccessPolicies';
