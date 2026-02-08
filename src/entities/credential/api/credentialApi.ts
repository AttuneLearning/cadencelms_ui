/**
 * Credential API Client
 * Implements credential management endpoints
 *
 * Endpoint base: /api/v2/credential-groups, /api/v2/certificate-definitions, /api/v2/certificate-issuances
 */

import { client } from '@/shared/api/client';
import type {
  CredentialGroup,
  CredentialGroupsListResponse,
  CredentialGroupFilters,
  CreateCredentialGroupPayload,
  UpdateCredentialGroupPayload,
  CertificateDefinition,
  CertificateDefinitionDetail,
  CertificateDefinitionsListResponse,
  CertificateDefinitionFilters,
  CreateCertificateDefinitionPayload,
  UpdateCertificateDefinitionPayload,
  ActivateCertificateDefinitionPayload,
  DeprecateCertificateDefinitionPayload,
  CertificateIssuance,
  CertificateIssuanceListItem,
  CertificateIssuancesListResponse,
  CertificateIssuanceFilters,
  IssueCertificatePayload,
  IssueCertificateResponse,
  RevokeCertificatePayload,
  CertificateVerificationResult,
  CertificateUpgradeEligibility,
  InitiateCertificateUpgradePayload,
  UpgradeCertificateResponse,
} from '../model/types';

interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}

// =====================
// CREDENTIAL GROUPS
// =====================

/**
 * GET /api/v2/credential-groups - List credential groups
 */
export async function listCredentialGroups(
  filters?: CredentialGroupFilters
): Promise<CredentialGroupsListResponse> {
  const response = await client.get<ApiResponse<CredentialGroupsListResponse>>(
    '/api/v2/credential-groups',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/credential-groups/:id - Get credential group details
 */
export async function getCredentialGroup(id: string): Promise<CredentialGroup> {
  const response = await client.get<ApiResponse<CredentialGroup>>(
    `/api/v2/credential-groups/${id}`
  );
  return response.data.data;
}

/**
 * POST /api/v2/credential-groups - Create credential group
 */
export async function createCredentialGroup(
  payload: CreateCredentialGroupPayload
): Promise<CredentialGroup> {
  const response = await client.post<ApiResponse<CredentialGroup>>(
    '/api/v2/credential-groups',
    payload
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/credential-groups/:id - Update credential group
 */
export async function updateCredentialGroup(
  id: string,
  payload: UpdateCredentialGroupPayload
): Promise<CredentialGroup> {
  const response = await client.patch<ApiResponse<CredentialGroup>>(
    `/api/v2/credential-groups/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/credential-groups/:id - Delete credential group
 */
export async function deleteCredentialGroup(id: string): Promise<void> {
  await client.delete(`/api/v2/credential-groups/${id}`);
}

// =====================
// CERTIFICATE DEFINITIONS
// =====================

/**
 * GET /api/v2/certificate-definitions - List certificate definitions
 */
export async function listCertificateDefinitions(
  filters?: CertificateDefinitionFilters
): Promise<CertificateDefinitionsListResponse> {
  const response = await client.get<ApiResponse<CertificateDefinitionsListResponse>>(
    '/api/v2/certificate-definitions',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/certificate-definitions/:id - Get certificate definition details
 */
export async function getCertificateDefinition(
  id: string
): Promise<CertificateDefinitionDetail> {
  const response = await client.get<ApiResponse<CertificateDefinitionDetail>>(
    `/api/v2/certificate-definitions/${id}`
  );
  return response.data.data;
}

/**
 * POST /api/v2/certificate-definitions - Create certificate definition
 */
export async function createCertificateDefinition(
  payload: CreateCertificateDefinitionPayload
): Promise<CertificateDefinition> {
  const response = await client.post<ApiResponse<CertificateDefinition>>(
    '/api/v2/certificate-definitions',
    payload
  );
  return response.data.data;
}

/**
 * PATCH /api/v2/certificate-definitions/:id - Update certificate definition (draft only)
 */
export async function updateCertificateDefinition(
  id: string,
  payload: UpdateCertificateDefinitionPayload
): Promise<CertificateDefinition> {
  const response = await client.patch<ApiResponse<CertificateDefinition>>(
    `/api/v2/certificate-definitions/${id}`,
    payload
  );
  return response.data.data;
}

/**
 * POST /api/v2/certificate-definitions/:id/activate - Activate a certificate definition
 */
export async function activateCertificateDefinition(
  id: string,
  payload?: ActivateCertificateDefinitionPayload
): Promise<CertificateDefinition> {
  const response = await client.post<ApiResponse<CertificateDefinition>>(
    `/api/v2/certificate-definitions/${id}/activate`,
    payload || {}
  );
  return response.data.data;
}

/**
 * POST /api/v2/certificate-definitions/:id/deprecate - Deprecate a certificate definition
 */
export async function deprecateCertificateDefinition(
  id: string,
  payload: DeprecateCertificateDefinitionPayload
): Promise<CertificateDefinition> {
  const response = await client.post<ApiResponse<CertificateDefinition>>(
    `/api/v2/certificate-definitions/${id}/deprecate`,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /api/v2/certificate-definitions/:id - Delete certificate definition (draft only)
 */
export async function deleteCertificateDefinition(id: string): Promise<void> {
  await client.delete(`/api/v2/certificate-definitions/${id}`);
}

// =====================
// CERTIFICATE ISSUANCES
// =====================

/**
 * GET /api/v2/certificate-issuances - List certificate issuances
 */
export async function listCertificateIssuances(
  filters?: CertificateIssuanceFilters
): Promise<CertificateIssuancesListResponse> {
  const response = await client.get<ApiResponse<CertificateIssuancesListResponse>>(
    '/api/v2/certificate-issuances',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /api/v2/certificate-issuances/:id - Get certificate issuance details
 */
export async function getCertificateIssuance(id: string): Promise<CertificateIssuance> {
  const response = await client.get<ApiResponse<CertificateIssuance>>(
    `/api/v2/certificate-issuances/${id}`
  );
  return response.data.data;
}

/**
 * POST /api/v2/certificate-issuances - Issue a certificate manually
 */
export async function issueCertificate(
  payload: IssueCertificatePayload
): Promise<IssueCertificateResponse> {
  const response = await client.post<ApiResponse<IssueCertificateResponse>>(
    '/api/v2/certificate-issuances',
    payload
  );
  return response.data.data;
}

/**
 * POST /api/v2/certificate-issuances/:id/revoke - Revoke a certificate
 */
export async function revokeCertificate(
  id: string,
  payload: RevokeCertificatePayload
): Promise<CertificateIssuance> {
  const response = await client.post<ApiResponse<CertificateIssuance>>(
    `/api/v2/certificate-issuances/${id}/revoke`,
    payload
  );
  return response.data.data;
}

// =====================
// VERIFICATION & UPGRADES
// =====================

/**
 * GET /api/v2/certificates/verify/:code - Verify a certificate by code
 */
export async function verifyCertificate(
  verificationCode: string
): Promise<CertificateVerificationResult> {
  const response = await client.get<ApiResponse<CertificateVerificationResult>>(
    `/api/v2/certificates/verify/${verificationCode}`
  );
  return response.data.data;
}

/**
 * GET /api/v2/certificate-issuances/:id/upgrade-eligibility - Check upgrade eligibility
 */
export async function checkUpgradeEligibility(
  issuanceId: string
): Promise<CertificateUpgradeEligibility> {
  const response = await client.get<ApiResponse<CertificateUpgradeEligibility>>(
    `/api/v2/certificate-issuances/${issuanceId}/upgrade-eligibility`
  );
  return response.data.data;
}

/**
 * POST /api/v2/certificate-issuances/:id/upgrade - Initiate certificate upgrade
 */
export async function initiateCertificateUpgrade(
  issuanceId: string,
  payload: InitiateCertificateUpgradePayload
): Promise<UpgradeCertificateResponse> {
  const response = await client.post<ApiResponse<UpgradeCertificateResponse>>(
    `/api/v2/certificate-issuances/${issuanceId}/upgrade`,
    payload
  );
  return response.data.data;
}

/**
 * GET /api/v2/certificate-issuances/:issuanceId/pdf - Download/generate certificate PDF
 */
export async function downloadCertificatePDF(
  issuanceId: string
): Promise<{ pdfUrl: string }> {
  const response = await client.get<ApiResponse<{ pdfUrl: string }>>(
    `/api/v2/certificate-issuances/${issuanceId}/pdf`
  );
  return response.data.data;
}

/**
 * GET /api/v2/learners/:learnerId/certificates - Get learner's certificates
 */
export async function getLearnerCertificates(
  learnerId: string,
  filters?: { includeRevoked?: boolean }
): Promise<CertificateIssuanceListItem[]> {
  const response = await client.get<ApiResponse<CertificateIssuanceListItem[]>>(
    `/api/v2/learners/${learnerId}/certificates`,
    { params: filters }
  );
  return response.data.data;
}
