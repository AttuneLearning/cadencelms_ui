/**
 * Credential Entity Types
 * Types for credential groups, certificate definitions, and issuances
 * Based on: COURSE_VERSIONING_TYPES.md
 */

import type { CourseVersionStatus } from '@/entities/course-version';

// =====================
// CREDENTIAL GROUP
// =====================

/**
 * Credential type
 */
export type CredentialType = 'certificate' | 'diploma' | 'degree' | 'badge';

/**
 * CredentialGroup - Groups compatible certificates that earn the same credential.
 * All CertificateDefinitions in a group with isCompatible=true earn the same badge.
 */
export interface CredentialGroup {
  id: string;

  // Identity
  name: string;
  code: string;
  description: string;

  // Type
  type: CredentialType;

  // Badge display
  badgeImageUrl: string | null;
  badgeColor: string | null;

  // Ownership
  departmentId: string;
  programId: string | null;

  // State
  isActive: boolean;

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * CredentialGroup list item
 */
export interface CredentialGroupListItem {
  id: string;
  name: string;
  code: string;
  type: CredentialType;
  department: { id: string; name: string };
  program: { id: string; name: string } | null;
  badgeImageUrl: string | null;
  badgeColor: string | null;
  activeDefinitionsCount: number;
  totalIssuances: number;
  isActive: boolean;
  createdAt: string;
}

// =====================
// CERTIFICATE DEFINITION
// =====================

/**
 * Certificate definition status
 */
export type CertificateDefinitionStatus = 'draft' | 'active' | 'deprecated';

/**
 * CertificateDefinition - Versioned requirements for earning a credential.
 */
export interface CertificateDefinition {
  id: string;
  credentialGroupId: string;

  // Versioning
  version: number;
  parentDefinitionId: string | null;

  // Metadata
  title: string;
  description: string;

  // Requirements
  requirements: CertificateRequirement[];

  // Lifecycle
  status: CertificateDefinitionStatus;

  // Compatibility
  isCompatible: boolean;
  compatibilityBreakReason: string | null;

  // Deprecation
  deprecatedAt: string | null;
  deprecatedReason: string | null;
  supersededByDefinitionId: string | null;

  // Validity period
  validFrom: string | null;
  validUntil: string | null;

  // Settings
  expiresAfterMonths: number | null;
  autoIssue: boolean;

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Requirement within a certificate definition
 */
export interface CertificateRequirement {
  id: string;
  certificateDefinitionId: string;

  // Points to specific course VERSION
  courseVersionId: string;

  // Requirement details
  isRequired: boolean;
  minimumScore: number | null;
  order: number;

  // For elective groups
  electiveGroupId: string | null;
  electiveGroupName: string | null;
  electiveMinCount: number | null;
}

/**
 * CertificateRequirement with course details for display
 */
export interface CertificateRequirementItem extends CertificateRequirement {
  courseVersion: {
    id: string;
    version: number;
    title: string;
    canonicalCourseId: string;
    canonicalCourseCode: string;
    status: CourseVersionStatus;
  };
}

/**
 * CertificateDefinition list item
 */
export interface CertificateDefinitionListItem {
  id: string;
  credentialGroupId: string;
  credentialGroupName: string;
  credentialGroupCode: string;
  version: number;
  title: string;
  status: CertificateDefinitionStatus;
  isCompatible: boolean;
  requirementCount: number;
  totalIssuances: number;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

/**
 * CertificateDefinition detail with full requirements
 */
export interface CertificateDefinitionDetail extends CertificateDefinition {
  credentialGroup: CredentialGroupListItem;
  requirementItems: CertificateRequirementItem[];
  parentDefinition: {
    id: string;
    version: number;
    title: string;
  } | null;
  statistics: {
    totalIssuances: number;
    activeIssuances: number;
    revokedIssuances: number;
  };
}

// =====================
// CERTIFICATE ISSUANCE
// =====================

/**
 * CertificateIssuance - Record of a certificate issued to a learner.
 * Immutable record of exactly what was completed.
 */
export interface CertificateIssuance {
  id: string;

  // What was earned
  certificateDefinitionId: string;
  credentialGroupId: string;

  // Who earned it
  learnerId: string;

  // Completion snapshot (immutable)
  completedRequirements: CompletedRequirement[];

  // Issuance
  issuedAt: string;
  issuedBy: string | null;

  // Verification
  verificationCode: string;
  pdfUrl: string | null;

  // Validity
  expiresAt: string | null;
  revokedAt: string | null;
  revokedReason: string | null;

  // Metadata
  metadata: Record<string, unknown> | null;
}

/**
 * Snapshot of a completed requirement
 */
export interface CompletedRequirement {
  courseVersionId: string;
  courseTitle: string;
  courseCode: string;
  version: number;
  completedAt: string;
  finalScore: number | null;
  enrollmentId: string;
}

/**
 * CertificateIssuance list item
 */
export interface CertificateIssuanceListItem {
  id: string;
  learner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  credentialGroup: {
    id: string;
    name: string;
    code: string;
    type: CredentialType;
    badgeImageUrl: string | null;
  };
  certificateDefinition: {
    id: string;
    version: number;
    title: string;
  };
  verificationCode: string;
  issuedAt: string;
  expiresAt: string | null;
  isRevoked: boolean;
}

/**
 * Certificate verification result
 */
export interface CertificateVerificationResult {
  valid: boolean;
  issuance: CertificateIssuance | null;
  learner: {
    firstName: string;
    lastName: string;
  } | null;
  credential: {
    name: string;
    type: CredentialType;
    badgeImageUrl: string | null;
  } | null;
  message: string;
}

// =====================
// CERTIFICATE UPGRADE
// =====================

/**
 * Certificate upgrade eligibility check result
 */
export interface CertificateUpgradeEligibility {
  isEligible: boolean;
  reason: string | null;

  currentIssuance: {
    id: string;
    definitionId: string;
    version: number;
  };

  availableUpgrades: {
    definitionId: string;
    version: number;
    title: string;
    additionalRequirements: {
      courseVersionId: string;
      courseTitle: string;
      isNewCourse: boolean;
      isNewVersion: boolean;
    }[];
    upgradeDeadline: string | null;
  }[];

  blockers: {
    type: 'access_expired' | 'window_closed' | 'policy_disabled' | 'incompatible';
    message: string;
  }[];
}

// =====================
// API PAYLOADS
// =====================

/**
 * Create a credential group
 */
export interface CreateCredentialGroupPayload {
  name: string;
  code: string;
  description?: string;
  type: CredentialType;
  departmentId: string;
  programId?: string;
  badgeImageUrl?: string;
  badgeColor?: string;
}

/**
 * Update a credential group
 */
export interface UpdateCredentialGroupPayload {
  name?: string;
  description?: string;
  badgeImageUrl?: string;
  badgeColor?: string;
  isActive?: boolean;
}

/**
 * Create a certificate definition
 */
export interface CreateCertificateDefinitionPayload {
  credentialGroupId: string;
  title: string;
  description?: string;
  requirements: CreateCertificateRequirementPayload[];
  validFrom?: string;
  validUntil?: string;
  expiresAfterMonths?: number;
  autoIssue?: boolean;
}

export interface CreateCertificateRequirementPayload {
  courseVersionId: string;
  isRequired: boolean;
  minimumScore?: number;
  order: number;
  electiveGroupId?: string;
  electiveGroupName?: string;
  electiveMinCount?: number;
}

/**
 * Update a certificate definition (draft only)
 */
export interface UpdateCertificateDefinitionPayload {
  title?: string;
  description?: string;
  requirements?: CreateCertificateRequirementPayload[];
  validFrom?: string;
  validUntil?: string;
  expiresAfterMonths?: number;
  autoIssue?: boolean;
}

/**
 * Activate a certificate definition
 */
export interface ActivateCertificateDefinitionPayload {
  activationNotes?: string;
}

/**
 * Deprecate a certificate definition
 */
export interface DeprecateCertificateDefinitionPayload {
  reason: string;
  supersededByDefinitionId?: string;
}

/**
 * Issue a certificate manually
 */
export interface IssueCertificatePayload {
  learnerId: string;
  certificateDefinitionId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Revoke a certificate
 */
export interface RevokeCertificatePayload {
  reason: string;
}

/**
 * Initiate certificate upgrade
 */
export interface InitiateCertificateUpgradePayload {
  targetDefinitionId: string;
}

// =====================
// FILTERS
// =====================

/**
 * Credential group filters
 */
export interface CredentialGroupFilters {
  departmentId?: string;
  programId?: string;
  type?: CredentialType;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Certificate definition filters
 */
export interface CertificateDefinitionFilters {
  credentialGroupId?: string;
  status?: CertificateDefinitionStatus;
  isCompatible?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Certificate issuance filters
 */
export interface CertificateIssuanceFilters {
  learnerId?: string;
  credentialGroupId?: string;
  certificateDefinitionId?: string;
  isRevoked?: boolean;
  issuedAfter?: string;
  issuedBefore?: string;
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

export interface CredentialGroupsListResponse {
  credentialGroups: CredentialGroupListItem[];
  pagination: Pagination;
}

export interface CertificateDefinitionsListResponse {
  definitions: CertificateDefinitionListItem[];
  pagination: Pagination;
}

export interface CertificateIssuancesListResponse {
  issuances: CertificateIssuanceListItem[];
  pagination: Pagination;
}

export interface IssueCertificateResponse {
  issuance: CertificateIssuance;
  message: string;
}

export interface UpgradeCertificateResponse {
  newIssuance: CertificateIssuance;
  previousIssuance: {
    id: string;
    definitionId: string;
    version: number;
  };
  message: string;
}
