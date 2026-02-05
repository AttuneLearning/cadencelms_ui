/**
 * React Query keys for Credentials
 */

import type {
  CredentialGroupFilters,
  CertificateDefinitionFilters,
  CertificateIssuanceFilters,
} from './types';

export const credentialGroupKeys = {
  // All credential group queries
  all: ['credential-groups'] as const,

  // Lists
  lists: () => [...credentialGroupKeys.all, 'list'] as const,
  list: (filters?: CredentialGroupFilters) =>
    [...credentialGroupKeys.lists(), filters] as const,

  // Details
  details: () => [...credentialGroupKeys.all, 'detail'] as const,
  detail: (id: string) => [...credentialGroupKeys.details(), id] as const,
};

export const certificateDefinitionKeys = {
  // All certificate definition queries
  all: ['certificate-definitions'] as const,

  // Lists
  lists: () => [...certificateDefinitionKeys.all, 'list'] as const,
  list: (filters?: CertificateDefinitionFilters) =>
    [...certificateDefinitionKeys.lists(), filters] as const,

  // For a specific credential group
  forGroup: (credentialGroupId: string) =>
    [...certificateDefinitionKeys.all, 'group', credentialGroupId] as const,

  // Details
  details: () => [...certificateDefinitionKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateDefinitionKeys.details(), id] as const,
};

export const certificateIssuanceKeys = {
  // All certificate issuance queries
  all: ['certificate-issuances'] as const,

  // Lists
  lists: () => [...certificateIssuanceKeys.all, 'list'] as const,
  list: (filters?: CertificateIssuanceFilters) =>
    [...certificateIssuanceKeys.lists(), filters] as const,

  // For a specific learner
  forLearner: (learnerId: string, includeRevoked?: boolean) =>
    [...certificateIssuanceKeys.all, 'learner', learnerId, { includeRevoked }] as const,

  // Details
  details: () => [...certificateIssuanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateIssuanceKeys.details(), id] as const,

  // Upgrade eligibility
  upgradeEligibility: (issuanceId: string) =>
    [...certificateIssuanceKeys.all, 'upgrade-eligibility', issuanceId] as const,
};

export const certificateVerificationKeys = {
  // All verification queries
  all: ['certificate-verification'] as const,

  // Verify by code
  verify: (verificationCode: string) =>
    [...certificateVerificationKeys.all, verificationCode] as const,
};
