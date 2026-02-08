/**
 * Credential Entity
 * Public API for credential groups, certificate definitions, and issuances
 */

// Types
export type {
  // Credential Group
  CredentialType,
  CredentialGroup,
  CredentialGroupListItem,
  // Certificate Definition
  CertificateDefinitionStatus,
  CertificateDefinition,
  CertificateRequirement,
  CertificateRequirementItem,
  CertificateDefinitionListItem,
  CertificateDefinitionDetail,
  // Certificate Issuance
  CertificateIssuance,
  CompletedRequirement,
  CertificateIssuanceListItem,
  CertificateVerificationResult,
  // Certificate Upgrade
  CertificateUpgradeEligibility,
  // API Payloads
  CreateCredentialGroupPayload,
  UpdateCredentialGroupPayload,
  CreateCertificateDefinitionPayload,
  CreateCertificateRequirementPayload,
  UpdateCertificateDefinitionPayload,
  ActivateCertificateDefinitionPayload,
  DeprecateCertificateDefinitionPayload,
  IssueCertificatePayload,
  RevokeCertificatePayload,
  InitiateCertificateUpgradePayload,
  // Filters
  CredentialGroupFilters,
  CertificateDefinitionFilters,
  CertificateIssuanceFilters,
  // API Responses
  Pagination,
  CredentialGroupsListResponse,
  CertificateDefinitionsListResponse,
  CertificateIssuancesListResponse,
  IssueCertificateResponse,
  UpgradeCertificateResponse,
} from './model/types';

// API
export {
  // Credential Groups
  listCredentialGroups,
  getCredentialGroup,
  createCredentialGroup,
  updateCredentialGroup,
  deleteCredentialGroup,
  // Certificate Definitions
  listCertificateDefinitions,
  getCertificateDefinition,
  createCertificateDefinition,
  updateCertificateDefinition,
  activateCertificateDefinition,
  deprecateCertificateDefinition,
  deleteCertificateDefinition,
  // Certificate Issuances
  listCertificateIssuances,
  getCertificateIssuance,
  issueCertificate,
  revokeCertificate,
  // Verification & Upgrades
  verifyCertificate,
  checkUpgradeEligibility,
  initiateCertificateUpgrade,
  getLearnerCertificates,
  downloadCertificatePDF,
} from './api/credentialApi';

// Query Keys
export {
  credentialGroupKeys,
  certificateDefinitionKeys,
  certificateIssuanceKeys,
  certificateVerificationKeys,
} from './model/credentialKeys';

// Hooks
export {
  // Credential Group hooks
  useCredentialGroups,
  useCredentialGroup,
  useCreateCredentialGroup,
  useUpdateCredentialGroup,
  useDeleteCredentialGroup,
  // Certificate Definition hooks
  useCertificateDefinitions,
  useCertificateDefinition,
  useCreateCertificateDefinition,
  useUpdateCertificateDefinition,
  useActivateCertificateDefinition,
  useDeprecateCertificateDefinition,
  useDeleteCertificateDefinition,
  // Certificate Issuance hooks
  useCertificateIssuances,
  useCertificateIssuance,
  useLearnerCertificates,
  useIssueCertificate,
  useRevokeCertificate,
  useDownloadCertificatePDF,
  // Verification & Upgrade hooks
  useVerifyCertificate,
  useUpgradeEligibility,
  useInitiateCertificateUpgrade,
} from './hooks/useCredentials';
