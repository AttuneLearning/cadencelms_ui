/**
 * Mock credential data for testing
 */

import type {
  CredentialGroup,
  CredentialGroupListItem,
  CertificateDefinition,
  CertificateDefinitionListItem,
  CertificateDefinitionDetail,
  CertificateIssuance,
  CertificateIssuanceListItem,
  CertificateRequirementItem,
  CertificateUpgradeEligibility,
} from '@/entities/credential';
import { mockDepartments, mockPrograms } from './courses';

// =====================
// MOCK CREDENTIAL GROUPS
// =====================

export const mockCredentialGroups: CredentialGroup[] = [
  {
    id: 'cred-group-1',
    name: 'Certified Web Developer',
    code: 'CWD',
    description: 'Professional certification for web development skills',
    type: 'certificate',
    badgeImageUrl: '/badges/web-developer.svg',
    badgeColor: '#3B82F6',
    departmentId: 'dept-1',
    programId: 'prog-1',
    isActive: true,
    createdBy: 'user-admin-1',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-06-01T10:00:00Z',
  },
  {
    id: 'cred-group-2',
    name: 'Data Analytics Professional',
    code: 'DAP',
    description: 'Certification for data analytics and business intelligence',
    type: 'certificate',
    badgeImageUrl: '/badges/data-analytics.svg',
    badgeColor: '#10B981',
    departmentId: 'dept-3',
    programId: 'prog-2',
    isActive: true,
    createdBy: 'user-admin-1',
    createdAt: '2025-03-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'cred-group-3',
    name: 'Database Administration Badge',
    code: 'DBA',
    description: 'Badge for completing database administration training',
    type: 'badge',
    badgeImageUrl: '/badges/database-admin.svg',
    badgeColor: '#8B5CF6',
    departmentId: 'dept-1',
    programId: null,
    isActive: true,
    createdBy: 'user-admin-1',
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-10-01T10:00:00Z',
  },
];

export const mockCredentialGroupListItems: CredentialGroupListItem[] = [
  {
    id: 'cred-group-1',
    name: 'Certified Web Developer',
    code: 'CWD',
    type: 'certificate',
    department: mockDepartments[0],
    program: mockPrograms[0],
    badgeImageUrl: '/badges/web-developer.svg',
    badgeColor: '#3B82F6',
    activeDefinitionsCount: 2,
    totalIssuances: 245,
    isActive: true,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'cred-group-2',
    name: 'Data Analytics Professional',
    code: 'DAP',
    type: 'certificate',
    department: mockDepartments[2],
    program: mockPrograms[1],
    badgeImageUrl: '/badges/data-analytics.svg',
    badgeColor: '#10B981',
    activeDefinitionsCount: 1,
    totalIssuances: 89,
    isActive: true,
    createdAt: '2025-03-01T10:00:00Z',
  },
  {
    id: 'cred-group-3',
    name: 'Database Administration Badge',
    code: 'DBA',
    type: 'badge',
    department: mockDepartments[0],
    program: null,
    badgeImageUrl: '/badges/database-admin.svg',
    badgeColor: '#8B5CF6',
    activeDefinitionsCount: 1,
    totalIssuances: 156,
    isActive: true,
    createdAt: '2025-05-01T10:00:00Z',
  },
];

// =====================
// MOCK CERTIFICATE DEFINITIONS
// =====================

export const mockCertificateDefinitions: CertificateDefinition[] = [
  {
    id: 'cert-def-1',
    credentialGroupId: 'cred-group-1',
    version: 2,
    parentDefinitionId: 'cert-def-1-v1',
    title: 'Certified Web Developer 2026',
    description: 'Complete the web development curriculum to earn this certification',
    requirements: [
      {
        id: 'req-1',
        certificateDefinitionId: 'cert-def-1',
        courseVersionId: 'course-1',
        isRequired: true,
        minimumScore: 70,
        order: 1,
        electiveGroupId: null,
        electiveGroupName: null,
        electiveMinCount: null,
      },
      {
        id: 'req-2',
        certificateDefinitionId: 'cert-def-1',
        courseVersionId: 'course-2',
        isRequired: true,
        minimumScore: 70,
        order: 2,
        electiveGroupId: null,
        electiveGroupName: null,
        electiveMinCount: null,
      },
    ],
    status: 'active',
    isCompatible: true,
    compatibilityBreakReason: null,
    deprecatedAt: null,
    deprecatedReason: null,
    supersededByDefinitionId: null,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    expiresAfterMonths: 24,
    autoIssue: true,
    createdBy: 'user-admin-1',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2025-12-15T10:00:00Z',
  },
  {
    id: 'cert-def-1-v1',
    credentialGroupId: 'cred-group-1',
    version: 1,
    parentDefinitionId: null,
    title: 'Certified Web Developer 2025',
    description: 'Complete the web development curriculum to earn this certification',
    requirements: [
      {
        id: 'req-3',
        certificateDefinitionId: 'cert-def-1-v1',
        courseVersionId: 'course-1-v1',
        isRequired: true,
        minimumScore: 70,
        order: 1,
        electiveGroupId: null,
        electiveGroupName: null,
        electiveMinCount: null,
      },
    ],
    status: 'deprecated',
    isCompatible: true,
    compatibilityBreakReason: null,
    deprecatedAt: '2025-12-01T10:00:00Z',
    deprecatedReason: 'Superseded by 2026 version with updated curriculum',
    supersededByDefinitionId: 'cert-def-1',
    validFrom: '2025-01-01T00:00:00Z',
    validUntil: '2025-12-31T23:59:59Z',
    expiresAfterMonths: 24,
    autoIssue: true,
    createdBy: 'user-admin-1',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
];

export const mockCertificateDefinitionListItems: CertificateDefinitionListItem[] = [
  {
    id: 'cert-def-1',
    credentialGroupId: 'cred-group-1',
    credentialGroupName: 'Certified Web Developer',
    credentialGroupCode: 'CWD',
    version: 2,
    title: 'Certified Web Developer 2026',
    status: 'active',
    isCompatible: true,
    requirementCount: 2,
    totalIssuances: 45,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2026-12-31T23:59:59Z',
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'cert-def-1-v1',
    credentialGroupId: 'cred-group-1',
    credentialGroupName: 'Certified Web Developer',
    credentialGroupCode: 'CWD',
    version: 1,
    title: 'Certified Web Developer 2025',
    status: 'deprecated',
    isCompatible: true,
    requirementCount: 1,
    totalIssuances: 200,
    validFrom: '2025-01-01T00:00:00Z',
    validUntil: '2025-12-31T23:59:59Z',
    createdAt: '2024-12-01T10:00:00Z',
  },
];

export const mockCertificateRequirementItems: CertificateRequirementItem[] = [
  {
    id: 'req-1',
    certificateDefinitionId: 'cert-def-1',
    courseVersionId: 'course-1',
    isRequired: true,
    minimumScore: 70,
    order: 1,
    electiveGroupId: null,
    electiveGroupName: null,
    electiveMinCount: null,
    courseVersion: {
      id: 'course-1',
      version: 2,
      title: 'Introduction to Web Development',
      canonicalCourseId: 'canonical-web101',
      canonicalCourseCode: 'WEB101',
      status: 'published',
    },
  },
  {
    id: 'req-2',
    certificateDefinitionId: 'cert-def-1',
    courseVersionId: 'course-2',
    isRequired: true,
    minimumScore: 70,
    order: 2,
    electiveGroupId: null,
    electiveGroupName: null,
    electiveMinCount: null,
    courseVersion: {
      id: 'course-2',
      version: 1,
      title: 'Advanced Database Design',
      canonicalCourseId: 'canonical-db301',
      canonicalCourseCode: 'DB301',
      status: 'published',
    },
  },
];

// =====================
// MOCK CERTIFICATE ISSUANCES
// =====================

export const mockCertificateIssuances: CertificateIssuance[] = [
  {
    id: 'issuance-1',
    certificateDefinitionId: 'cert-def-1',
    credentialGroupId: 'cred-group-1',
    learnerId: 'learner-1',
    completedRequirements: [
      {
        courseVersionId: 'course-1',
        courseTitle: 'Introduction to Web Development',
        courseCode: 'WEB101',
        version: 2,
        completedAt: '2026-01-15T14:30:00Z',
        finalScore: 92,
        enrollmentId: 'enroll-1',
      },
      {
        courseVersionId: 'course-2',
        courseTitle: 'Advanced Database Design',
        courseCode: 'DB301',
        version: 1,
        completedAt: '2026-01-28T16:45:00Z',
        finalScore: 88,
        enrollmentId: 'enroll-2',
      },
    ],
    issuedAt: '2026-01-28T16:50:00Z',
    issuedBy: null,
    verificationCode: 'CWD-2026-ABC123XYZ',
    pdfUrl: '/certificates/issuance-1.pdf',
    expiresAt: '2028-01-28T16:50:00Z',
    revokedAt: null,
    revokedReason: null,
    metadata: null,
  },
];

export const mockCertificateIssuanceListItems: CertificateIssuanceListItem[] = [
  {
    id: 'issuance-1',
    learner: {
      id: 'learner-1',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
    },
    credentialGroup: {
      id: 'cred-group-1',
      name: 'Certified Web Developer',
      code: 'CWD',
      type: 'certificate',
      badgeImageUrl: '/badges/web-developer.svg',
    },
    certificateDefinition: {
      id: 'cert-def-1',
      version: 2,
      title: 'Certified Web Developer 2026',
    },
    verificationCode: 'CWD-2026-ABC123XYZ',
    issuedAt: '2026-01-28T16:50:00Z',
    expiresAt: '2028-01-28T16:50:00Z',
    isRevoked: false,
  },
  {
    id: 'issuance-2',
    learner: {
      id: 'learner-2',
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob.smith@example.com',
    },
    credentialGroup: {
      id: 'cred-group-1',
      name: 'Certified Web Developer',
      code: 'CWD',
      type: 'certificate',
      badgeImageUrl: '/badges/web-developer.svg',
    },
    certificateDefinition: {
      id: 'cert-def-1-v1',
      version: 1,
      title: 'Certified Web Developer 2025',
    },
    verificationCode: 'CWD-2025-DEF456GHI',
    issuedAt: '2025-06-15T10:30:00Z',
    expiresAt: '2027-06-15T10:30:00Z',
    isRevoked: false,
  },
];

// =====================
// MOCK UPGRADE ELIGIBILITY
// =====================

export const mockCertificateUpgradeEligibility: CertificateUpgradeEligibility = {
  isEligible: true,
  reason: null,
  currentIssuance: {
    id: 'issuance-2',
    definitionId: 'cert-def-1-v1',
    version: 1,
  },
  availableUpgrades: [
    {
      definitionId: 'cert-def-1',
      version: 2,
      title: 'Certified Web Developer 2026',
      additionalRequirements: [
        {
          courseVersionId: 'course-2',
          courseTitle: 'Advanced Database Design',
          isNewCourse: true,
          isNewVersion: false,
        },
      ],
      upgradeDeadline: '2026-06-15T10:30:00Z',
    },
  ],
  blockers: [],
};

export const mockCertificateUpgradeNotEligible: CertificateUpgradeEligibility = {
  isEligible: false,
  reason: 'Upgrade window has closed',
  currentIssuance: {
    id: 'issuance-3',
    definitionId: 'cert-def-1-v1',
    version: 1,
  },
  availableUpgrades: [],
  blockers: [
    {
      type: 'window_closed',
      message: 'The upgrade window for this certificate closed on 2025-12-31',
    },
  ],
};

// =====================
// FACTORY FUNCTIONS
// =====================

export const createMockCredentialGroup = (
  overrides?: Partial<CredentialGroup>
): CredentialGroup => {
  const id = `cred-group-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    name: 'Test Credential',
    code: `TC${Math.floor(100 + Math.random() * 900)}`,
    description: 'A test credential for unit testing',
    type: 'certificate',
    badgeImageUrl: null,
    badgeColor: '#3B82F6',
    departmentId: 'dept-1',
    programId: null,
    isActive: true,
    createdBy: 'user-admin-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

export const createMockCertificateIssuanceListItem = (
  overrides?: Partial<CertificateIssuanceListItem>
): CertificateIssuanceListItem => {
  const id = `issuance-${Math.random().toString(36).substr(2, 9)}`;
  return {
    id,
    learner: {
      id: 'learner-1',
      firstName: 'Test',
      lastName: 'Learner',
      email: 'test@example.com',
    },
    credentialGroup: {
      id: 'cred-group-1',
      name: 'Test Credential',
      code: 'TC',
      type: 'certificate',
      badgeImageUrl: null,
    },
    certificateDefinition: {
      id: 'cert-def-1',
      version: 1,
      title: 'Test Certificate',
    },
    verificationCode: `TC-${Date.now()}`,
    issuedAt: new Date().toISOString(),
    expiresAt: null,
    isRevoked: false,
    ...overrides,
  };
};
