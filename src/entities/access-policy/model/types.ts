/**
 * Access Policy Entity Types
 * Types for access duration, versioning policies, and enrollment management
 * Based on: COURSE_VERSIONING_TYPES.md, LEARNER_ACCESS_AND_NOTIFICATIONS.md
 */

// =====================
// ACCESS DURATION
// =====================

/**
 * Access duration configuration
 */
export type AccessDuration =
  | { type: 'months'; value: number }
  | { type: 'years'; value: number }
  | { type: 'perpetual' }
  | { type: 'custom'; expiresAt: string };

/**
 * Helper to get display string for access duration
 */
export function formatAccessDuration(duration: AccessDuration): string {
  switch (duration.type) {
    case 'months':
      return `${duration.value} month${duration.value !== 1 ? 's' : ''}`;
    case 'years':
      return `${duration.value} year${duration.value !== 1 ? 's' : ''}`;
    case 'perpetual':
      return 'Unlimited';
    case 'custom':
      return `Until ${new Date(duration.expiresAt).toLocaleDateString()}`;
  }
}

// =====================
// DEPARTMENT ACCESS POLICY
// =====================

/**
 * Department-level access policy configuration
 */
export interface DepartmentAccessPolicy {
  id: string;
  departmentId: string;

  // Program access duration
  defaultAccessDuration: AccessDuration;

  // Version access
  allowNewVersionAccess: boolean;
  newVersionAccessWindow: number; // Days after new version publishes

  // Upgrade policy
  allowCertificateUpgrade: boolean;
  certificateUpgradeWindow: number; // Days to upgrade after new version

  // Retake policy
  allowCourseRetakes: boolean;
  maxRetakesPerCourse: number | null; // null = unlimited
  retakeCooldownDays: number;

  // Notifications
  notifyOnNewCourseVersion: boolean;
  notifyOnNewCertificateVersion: boolean;
  notifyBeforeAccessExpiry: boolean;
  expiryNotificationDays: number[]; // e.g., [30, 7, 1]

  createdAt: string;
  updatedAt: string;
}

/**
 * Department access policy list item
 */
export interface DepartmentAccessPolicyListItem {
  id: string;
  department: {
    id: string;
    name: string;
  };
  defaultAccessDuration: AccessDuration;
  allowNewVersionAccess: boolean;
  allowCertificateUpgrade: boolean;
  allowCourseRetakes: boolean;
  updatedAt: string;
}

// =====================
// PROGRAM ACCESS OVERRIDE
// =====================

/**
 * Program-level access policy overrides
 */
export interface ProgramAccessOverride {
  id: string;
  programId: string;

  // Override any department policy field
  accessDuration?: AccessDuration;
  allowNewVersionAccess?: boolean;
  newVersionAccessWindow?: number;
  allowCertificateUpgrade?: boolean;
  certificateUpgradeWindow?: number;

  // Program-specific
  requireSequentialCompletion: boolean;

  createdAt: string;
  updatedAt: string;
}

/**
 * Program access override list item
 */
export interface ProgramAccessOverrideListItem {
  id: string;
  program: {
    id: string;
    name: string;
    code: string;
  };
  department: {
    id: string;
    name: string;
  };
  hasOverrides: boolean;
  accessDuration: AccessDuration | null;
  requireSequentialCompletion: boolean;
  updatedAt: string;
}

// =====================
// PROGRAM ENROLLMENT
// =====================

/**
 * Program enrollment status
 */
export type ProgramEnrollmentStatus = 'active' | 'completed' | 'expired' | 'withdrawn';

/**
 * Program enrollment with access tracking
 */
export interface ProgramEnrollment {
  id: string;
  learnerId: string;
  programId: string;

  // Certificate tracking
  certificateDefinitionId: string;

  // Access window
  enrolledAt: string;
  accessExpiresAt: string;
  accessExtendedAt: string | null;
  accessExtensionReason: string | null;

  // Status
  status: ProgramEnrollmentStatus;

  // Progress
  coursesCompleted: number;
  coursesTotal: number;
  currentCertificateProgress: number; // 0-100

  // Upgrade tracking
  hasUpgradedCertificate: boolean;
  upgradedFromDefinitionId: string | null;
  upgradedAt: string | null;

  // Completion
  certificateIssuanceId: string | null;
  completedAt: string | null;
}

/**
 * Program enrollment list item
 */
export interface ProgramEnrollmentListItem {
  id: string;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: string;
    name: string;
    code: string;
  };
  status: ProgramEnrollmentStatus;
  progress: number;
  coursesCompleted: number;
  coursesTotal: number;
  enrolledAt: string;
  accessExpiresAt: string;
  isExpiringSoon: boolean; // Within 30 days
  completedAt: string | null;
}

/**
 * Program enrollment detail
 */
export interface ProgramEnrollmentDetail extends ProgramEnrollment {
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: string;
    name: string;
    code: string;
    department: { id: string; name: string };
  };
  certificateDefinition: {
    id: string;
    version: number;
    title: string;
  };
  courseEnrollments: {
    courseVersionId: string;
    courseTitle: string;
    courseCode: string;
    version: number;
    status: 'not_started' | 'in_progress' | 'completed';
    progress: number;
    completedAt: string | null;
  }[];
  certificateIssuance: {
    id: string;
    issuedAt: string;
    verificationCode: string;
  } | null;
}

// =====================
// ACCESS EXTENSION
// =====================

/**
 * Access extension request status
 */
export type AccessExtensionStatus = 'pending' | 'approved' | 'denied';

/**
 * Access extension request
 */
export interface AccessExtensionRequest {
  id: string;
  learnerId: string;
  programEnrollmentId: string;

  requestedExtensionMonths: number;
  reason: string;

  status: AccessExtensionStatus;

  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;

  newExpiryDate: string | null;

  createdAt: string;
}

/**
 * Access extension request list item
 */
export interface AccessExtensionRequestListItem {
  id: string;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: string;
    name: string;
    code: string;
  };
  requestedExtensionMonths: number;
  reason: string;
  status: AccessExtensionStatus;
  currentExpiryDate: string;
  createdAt: string;
}

// =====================
// API PAYLOADS
// =====================

/**
 * Update department access policy
 */
export interface UpdateDepartmentAccessPolicyPayload {
  defaultAccessDuration?: AccessDuration;
  allowNewVersionAccess?: boolean;
  newVersionAccessWindow?: number;
  allowCertificateUpgrade?: boolean;
  certificateUpgradeWindow?: number;
  allowCourseRetakes?: boolean;
  maxRetakesPerCourse?: number | null;
  retakeCooldownDays?: number;
  notifyOnNewCourseVersion?: boolean;
  notifyOnNewCertificateVersion?: boolean;
  notifyBeforeAccessExpiry?: boolean;
  expiryNotificationDays?: number[];
}

/**
 * Create/update program access override
 */
export interface UpsertProgramAccessOverridePayload {
  accessDuration?: AccessDuration;
  allowNewVersionAccess?: boolean;
  newVersionAccessWindow?: number;
  allowCertificateUpgrade?: boolean;
  certificateUpgradeWindow?: number;
  requireSequentialCompletion?: boolean;
}

/**
 * Request access extension
 */
export interface RequestAccessExtensionPayload {
  requestedExtensionMonths: number;
  reason: string;
}

/**
 * Review access extension request
 */
export interface ReviewAccessExtensionPayload {
  decision: 'approved' | 'denied';
  reviewNotes?: string;
  newExpiryDate?: string; // Required if approved
}

/**
 * Manually extend access
 */
export interface ExtendAccessPayload {
  extensionMonths: number;
  reason: string;
}

// =====================
// FILTERS
// =====================

/**
 * Program enrollment filters
 */
export interface ProgramEnrollmentFilters {
  programId?: string;
  learnerId?: string;
  status?: ProgramEnrollmentStatus;
  isExpiringSoon?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Access extension request filters
 */
export interface AccessExtensionRequestFilters {
  programId?: string;
  learnerId?: string;
  status?: AccessExtensionStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

// =====================
// API RESPONSES
// =====================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface DepartmentAccessPoliciesListResponse {
  policies: DepartmentAccessPolicyListItem[];
  pagination: Pagination;
}

export interface ProgramAccessOverridesListResponse {
  overrides: ProgramAccessOverrideListItem[];
  pagination: Pagination;
}

export interface ProgramEnrollmentsListResponse {
  enrollments: ProgramEnrollmentListItem[];
  pagination: Pagination;
}

export interface AccessExtensionRequestsListResponse {
  requests: AccessExtensionRequestListItem[];
  pagination: Pagination;
}
