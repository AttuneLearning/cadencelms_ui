/**
 * Mock access policy data for testing
 */

import type {
  DepartmentAccessPolicy,
  DepartmentAccessPolicyListItem,
  ProgramAccessOverride,
  ProgramAccessOverrideListItem,
  ProgramEnrollment,
  ProgramEnrollmentListItem,
  AccessExtensionRequest,
  AccessExtensionRequestListItem,
  AccessDuration,
} from '@/entities/access-policy';
import { mockDepartments } from './courses';

// =====================
// MOCK ACCESS DURATIONS
// =====================

export const mockAccessDuration12Months: AccessDuration = { type: 'months', value: 12 };
export const mockAccessDuration2Years: AccessDuration = { type: 'years', value: 2 };
export const mockAccessDurationPerpetual: AccessDuration = { type: 'perpetual' };

// =====================
// MOCK DEPARTMENT ACCESS POLICIES
// =====================

export const mockDepartmentAccessPolicies: DepartmentAccessPolicy[] = [
  {
    id: 'policy-1',
    departmentId: 'dept-1',
    defaultAccessDuration: mockAccessDuration12Months,
    allowNewVersionAccess: true,
    newVersionAccessWindow: 30, // 30 days
    allowCertificateUpgrade: true,
    certificateUpgradeWindow: 90, // 90 days
    allowCourseRetakes: true,
    maxRetakesPerCourse: 3,
    retakeCooldownDays: 7,
    notifyOnNewCourseVersion: true,
    notifyOnNewCertificateVersion: true,
    notifyBeforeAccessExpiry: true,
    expiryNotificationDays: [30, 7, 1],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'policy-2',
    departmentId: 'dept-2',
    defaultAccessDuration: mockAccessDuration2Years,
    allowNewVersionAccess: true,
    newVersionAccessWindow: 60,
    allowCertificateUpgrade: true,
    certificateUpgradeWindow: 180,
    allowCourseRetakes: true,
    maxRetakesPerCourse: null, // Unlimited
    retakeCooldownDays: 14,
    notifyOnNewCourseVersion: true,
    notifyOnNewCertificateVersion: true,
    notifyBeforeAccessExpiry: true,
    expiryNotificationDays: [60, 30, 7],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'policy-3',
    departmentId: 'dept-3',
    defaultAccessDuration: mockAccessDurationPerpetual,
    allowNewVersionAccess: true,
    newVersionAccessWindow: 0, // Immediate
    allowCertificateUpgrade: false,
    certificateUpgradeWindow: 0,
    allowCourseRetakes: false,
    maxRetakesPerCourse: 0,
    retakeCooldownDays: 0,
    notifyOnNewCourseVersion: true,
    notifyOnNewCertificateVersion: false,
    notifyBeforeAccessExpiry: false,
    expiryNotificationDays: [],
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

export const mockDepartmentAccessPolicyListItems: DepartmentAccessPolicyListItem[] = [
  {
    id: 'policy-1',
    department: mockDepartments[0],
    defaultAccessDuration: mockAccessDuration12Months,
    allowNewVersionAccess: true,
    allowCertificateUpgrade: true,
    allowCourseRetakes: true,
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'policy-2',
    department: mockDepartments[1],
    defaultAccessDuration: mockAccessDuration2Years,
    allowNewVersionAccess: true,
    allowCertificateUpgrade: true,
    allowCourseRetakes: true,
    updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'policy-3',
    department: mockDepartments[2],
    defaultAccessDuration: mockAccessDurationPerpetual,
    allowNewVersionAccess: true,
    allowCertificateUpgrade: false,
    allowCourseRetakes: false,
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// =====================
// MOCK PROGRAM ACCESS OVERRIDES
// =====================

export const mockProgramAccessOverrides: ProgramAccessOverride[] = [
  {
    id: 'override-1',
    programId: 'prog-1',
    accessDuration: mockAccessDuration2Years,
    allowNewVersionAccess: true,
    newVersionAccessWindow: 45,
    allowCertificateUpgrade: true,
    certificateUpgradeWindow: 120,
    requireSequentialCompletion: true,
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
];

export const mockProgramAccessOverrideListItems: ProgramAccessOverrideListItem[] = [
  {
    id: 'override-1',
    program: { id: 'prog-1', name: 'Bachelor of Science in Computer Science', code: 'BSCS' },
    department: mockDepartments[0],
    hasOverrides: true,
    accessDuration: mockAccessDuration2Years,
    requireSequentialCompletion: true,
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'no-override',
    program: { id: 'prog-2', name: 'Master of Business Administration', code: 'MBA' },
    department: mockDepartments[2],
    hasOverrides: false,
    accessDuration: null,
    requireSequentialCompletion: false,
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// =====================
// MOCK PROGRAM ENROLLMENTS
// =====================

export const mockProgramEnrollments: ProgramEnrollment[] = [
  {
    id: 'prog-enroll-1',
    learnerId: 'learner-1',
    programId: 'prog-1',
    certificateDefinitionId: 'cert-def-1',
    enrolledAt: '2025-09-01T00:00:00Z',
    accessExpiresAt: '2027-09-01T00:00:00Z',
    accessExtendedAt: null,
    accessExtensionReason: null,
    status: 'active',
    coursesCompleted: 1,
    coursesTotal: 2,
    currentCertificateProgress: 50,
    hasUpgradedCertificate: false,
    upgradedFromDefinitionId: null,
    upgradedAt: null,
    certificateIssuanceId: null,
    completedAt: null,
  },
  {
    id: 'prog-enroll-2',
    learnerId: 'learner-2',
    programId: 'prog-1',
    certificateDefinitionId: 'cert-def-1',
    enrolledAt: '2025-06-01T00:00:00Z',
    accessExpiresAt: '2027-06-01T00:00:00Z',
    accessExtendedAt: null,
    accessExtensionReason: null,
    status: 'completed',
    coursesCompleted: 2,
    coursesTotal: 2,
    currentCertificateProgress: 100,
    hasUpgradedCertificate: false,
    upgradedFromDefinitionId: null,
    upgradedAt: null,
    certificateIssuanceId: 'issuance-1',
    completedAt: '2026-01-28T16:45:00Z',
  },
  {
    id: 'prog-enroll-3',
    learnerId: 'learner-3',
    programId: 'prog-1',
    certificateDefinitionId: 'cert-def-1',
    enrolledAt: '2024-06-01T00:00:00Z',
    accessExpiresAt: '2026-02-10T00:00:00Z', // Expiring soon
    accessExtendedAt: null,
    accessExtensionReason: null,
    status: 'active',
    coursesCompleted: 0,
    coursesTotal: 2,
    currentCertificateProgress: 25,
    hasUpgradedCertificate: false,
    upgradedFromDefinitionId: null,
    upgradedAt: null,
    certificateIssuanceId: null,
    completedAt: null,
  },
];

export const mockProgramEnrollmentListItems: ProgramEnrollmentListItem[] = [
  {
    id: 'prog-enroll-1',
    learner: {
      id: 'learner-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
    },
    program: {
      id: 'prog-1',
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
    },
    status: 'active',
    progress: 50,
    coursesCompleted: 1,
    coursesTotal: 2,
    enrolledAt: '2025-09-01T00:00:00Z',
    accessExpiresAt: '2027-09-01T00:00:00Z',
    isExpiringSoon: false,
    completedAt: null,
  },
  {
    id: 'prog-enroll-2',
    learner: {
      id: 'learner-2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
    },
    program: {
      id: 'prog-1',
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
    },
    status: 'completed',
    progress: 100,
    coursesCompleted: 2,
    coursesTotal: 2,
    enrolledAt: '2025-06-01T00:00:00Z',
    accessExpiresAt: '2027-06-01T00:00:00Z',
    isExpiringSoon: false,
    completedAt: '2026-01-28T16:45:00Z',
  },
  {
    id: 'prog-enroll-3',
    learner: {
      id: 'learner-3',
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol.white@example.com',
    },
    program: {
      id: 'prog-1',
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
    },
    status: 'active',
    progress: 25,
    coursesCompleted: 0,
    coursesTotal: 2,
    enrolledAt: '2024-06-01T00:00:00Z',
    accessExpiresAt: '2026-02-10T00:00:00Z',
    isExpiringSoon: true,
    completedAt: null,
  },
];

// =====================
// MOCK ACCESS EXTENSION REQUESTS
// =====================

export const mockAccessExtensionRequests: AccessExtensionRequest[] = [
  {
    id: 'ext-req-1',
    learnerId: 'learner-3',
    programEnrollmentId: 'prog-enroll-3',
    requestedExtensionMonths: 6,
    reason: 'I had a medical issue that prevented me from completing the courses on time.',
    status: 'pending',
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    newExpiryDate: null,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ext-req-2',
    learnerId: 'learner-4',
    programEnrollmentId: 'prog-enroll-4',
    requestedExtensionMonths: 3,
    reason: 'Work commitments delayed my progress.',
    status: 'approved',
    reviewedBy: 'admin-1',
    reviewedAt: '2026-01-15T14:00:00Z',
    reviewNotes: 'Extension approved due to documented work circumstances.',
    newExpiryDate: '2026-06-15T00:00:00Z',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'ext-req-3',
    learnerId: 'learner-5',
    programEnrollmentId: 'prog-enroll-5',
    requestedExtensionMonths: 12,
    reason: 'Requesting longer extension.',
    status: 'denied',
    reviewedBy: 'admin-1',
    reviewedAt: '2026-01-20T11:00:00Z',
    reviewNotes: 'Extension request exceeds maximum allowed. Please submit a new request for 6 months or less.',
    newExpiryDate: null,
    createdAt: '2026-01-18T10:00:00Z',
  },
];

export const mockAccessExtensionRequestListItems: AccessExtensionRequestListItem[] = [
  {
    id: 'ext-req-1',
    learner: {
      id: 'learner-3',
      firstName: 'Carol',
      lastName: 'White',
      email: 'carol.white@example.com',
    },
    program: {
      id: 'prog-1',
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
    },
    requestedExtensionMonths: 6,
    reason: 'I had a medical issue that prevented me from completing the courses on time.',
    status: 'pending',
    currentExpiryDate: '2026-02-10T00:00:00Z',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'ext-req-2',
    learner: {
      id: 'learner-4',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@example.com',
    },
    program: {
      id: 'prog-1',
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
    },
    requestedExtensionMonths: 3,
    reason: 'Work commitments delayed my progress.',
    status: 'approved',
    currentExpiryDate: '2026-03-15T00:00:00Z',
    createdAt: '2026-01-10T10:00:00Z',
  },
];

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockDepartmentAccessPolicy = (
  overrides?: Partial<DepartmentAccessPolicy>
): DepartmentAccessPolicy => {
  const id = `policy-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    departmentId: 'dept-1',
    defaultAccessDuration: mockAccessDuration12Months,
    allowNewVersionAccess: true,
    newVersionAccessWindow: 30,
    allowCertificateUpgrade: true,
    certificateUpgradeWindow: 90,
    allowCourseRetakes: true,
    maxRetakesPerCourse: 3,
    retakeCooldownDays: 7,
    notifyOnNewCourseVersion: true,
    notifyOnNewCertificateVersion: true,
    notifyBeforeAccessExpiry: true,
    expiryNotificationDays: [30, 7, 1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockProgramEnrollmentListItem = (
  overrides?: Partial<ProgramEnrollmentListItem>
): ProgramEnrollmentListItem => {
  const id = `prog-enroll-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    learner: {
      id: 'learner-1',
      firstName: 'Test',
      lastName: 'Learner',
      email: 'test@example.com',
    },
    program: {
      id: 'prog-1',
      name: 'Test Program',
      code: 'TP',
    },
    status: 'active',
    progress: 0,
    coursesCompleted: 0,
    coursesTotal: 1,
    enrolledAt: new Date().toISOString(),
    accessExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isExpiringSoon: false,
    completedAt: null,
    ...overrides,
  };
};
