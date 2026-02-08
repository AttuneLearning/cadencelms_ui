/**
 * React Query hooks for Credentials
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listCredentialGroups,
  getCredentialGroup,
  createCredentialGroup,
  updateCredentialGroup,
  deleteCredentialGroup,
  listCertificateDefinitions,
  getCertificateDefinition,
  createCertificateDefinition,
  updateCertificateDefinition,
  activateCertificateDefinition,
  deprecateCertificateDefinition,
  deleteCertificateDefinition,
  listCertificateIssuances,
  getCertificateIssuance,
  issueCertificate,
  revokeCertificate,
  verifyCertificate,
  checkUpgradeEligibility,
  initiateCertificateUpgrade,
  getLearnerCertificates,
  downloadCertificatePDF,
} from '../api/credentialApi';
import {
  credentialGroupKeys,
  certificateDefinitionKeys,
  certificateIssuanceKeys,
  certificateVerificationKeys,
} from '../model/credentialKeys';
import type {
  CredentialGroup,
  CredentialGroupsListResponse,
  CredentialGroupFilters,
  CreateCredentialGroupPayload,
  UpdateCredentialGroupPayload,
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
  RevokeCertificatePayload,
  CertificateVerificationResult,
  CertificateUpgradeEligibility,
  InitiateCertificateUpgradePayload,
} from '../model/types';

// =====================
// CREDENTIAL GROUP HOOKS
// =====================

/**
 * Hook to fetch list of credential groups
 */
export function useCredentialGroups(
  filters?: CredentialGroupFilters,
  options?: Omit<
    UseQueryOptions<
      CredentialGroupsListResponse,
      Error,
      CredentialGroupsListResponse,
      ReturnType<typeof credentialGroupKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: credentialGroupKeys.list(filters),
    queryFn: () => listCredentialGroups(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single credential group
 */
export function useCredentialGroup(
  id: string,
  options?: Omit<
    UseQueryOptions<
      CredentialGroup,
      Error,
      CredentialGroup,
      ReturnType<typeof credentialGroupKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: credentialGroupKeys.detail(id),
    queryFn: () => getCredentialGroup(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create a credential group
 */
export function useCreateCredentialGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCredentialGroupPayload) => createCredentialGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialGroupKeys.lists() });
    },
  });
}

/**
 * Hook to update a credential group
 */
export function useUpdateCredentialGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCredentialGroupPayload;
    }) => updateCredentialGroup(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: credentialGroupKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: credentialGroupKeys.lists() });
    },
  });
}

/**
 * Hook to delete a credential group
 */
export function useDeleteCredentialGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCredentialGroup(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: credentialGroupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: credentialGroupKeys.lists() });
    },
  });
}

// =====================
// CERTIFICATE DEFINITION HOOKS
// =====================

/**
 * Hook to fetch list of certificate definitions
 */
export function useCertificateDefinitions(
  filters?: CertificateDefinitionFilters,
  options?: Omit<
    UseQueryOptions<
      CertificateDefinitionsListResponse,
      Error,
      CertificateDefinitionsListResponse,
      ReturnType<typeof certificateDefinitionKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateDefinitionKeys.list(filters),
    queryFn: () => listCertificateDefinitions(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single certificate definition
 */
export function useCertificateDefinition(
  id: string,
  options?: Omit<
    UseQueryOptions<
      CertificateDefinitionDetail,
      Error,
      CertificateDefinitionDetail,
      ReturnType<typeof certificateDefinitionKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateDefinitionKeys.detail(id),
    queryFn: () => getCertificateDefinition(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to create a certificate definition
 */
export function useCreateCertificateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCertificateDefinitionPayload) =>
      createCertificateDefinition(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: certificateDefinitionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: certificateDefinitionKeys.forGroup(data.credentialGroupId),
      });
    },
  });
}

/**
 * Hook to update a certificate definition (draft only)
 */
export function useUpdateCertificateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateCertificateDefinitionPayload;
    }) => updateCertificateDefinition(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: certificateDefinitionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: certificateDefinitionKeys.lists() });
    },
  });
}

/**
 * Hook to activate a certificate definition
 */
export function useActivateCertificateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: ActivateCertificateDefinitionPayload;
    }) => activateCertificateDefinition(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: certificateDefinitionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: certificateDefinitionKeys.lists() });
    },
  });
}

/**
 * Hook to deprecate a certificate definition
 */
export function useDeprecateCertificateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: DeprecateCertificateDefinitionPayload;
    }) => deprecateCertificateDefinition(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: certificateDefinitionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: certificateDefinitionKeys.lists() });
    },
  });
}

/**
 * Hook to delete a certificate definition (draft only)
 */
export function useDeleteCertificateDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCertificateDefinition(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: certificateDefinitionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: certificateDefinitionKeys.lists() });
    },
  });
}

// =====================
// CERTIFICATE ISSUANCE HOOKS
// =====================

/**
 * Hook to fetch list of certificate issuances
 */
export function useCertificateIssuances(
  filters?: CertificateIssuanceFilters,
  options?: Omit<
    UseQueryOptions<
      CertificateIssuancesListResponse,
      Error,
      CertificateIssuancesListResponse,
      ReturnType<typeof certificateIssuanceKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateIssuanceKeys.list(filters),
    queryFn: () => listCertificateIssuances(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch single certificate issuance
 */
export function useCertificateIssuance(
  id: string,
  options?: Omit<
    UseQueryOptions<
      CertificateIssuance,
      Error,
      CertificateIssuance,
      ReturnType<typeof certificateIssuanceKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateIssuanceKeys.detail(id),
    queryFn: () => getCertificateIssuance(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch learner's certificates
 */
export function useLearnerCertificates(
  learnerId: string,
  includeRevoked?: boolean,
  options?: Omit<
    UseQueryOptions<
      CertificateIssuanceListItem[],
      Error,
      CertificateIssuanceListItem[],
      ReturnType<typeof certificateIssuanceKeys.forLearner>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateIssuanceKeys.forLearner(learnerId, includeRevoked),
    queryFn: () => getLearnerCertificates(learnerId, { includeRevoked }),
    enabled: !!learnerId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to issue a certificate manually
 */
export function useIssueCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IssueCertificatePayload) => issueCertificate(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: certificateIssuanceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: certificateIssuanceKeys.forLearner(variables.learnerId),
      });
    },
  });
}

/**
 * Hook to revoke a certificate
 */
export function useRevokeCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RevokeCertificatePayload;
    }) => revokeCertificate(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: certificateIssuanceKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: certificateIssuanceKeys.lists() });
    },
  });
}

/**
 * Hook to download/generate certificate PDF
 */
export function useDownloadCertificatePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issuanceId: string) => downloadCertificatePDF(issuanceId),
    onSuccess: (_, issuanceId) => {
      queryClient.invalidateQueries({ queryKey: certificateIssuanceKeys.detail(issuanceId) });
    },
  });
}

// =====================
// VERIFICATION & UPGRADE HOOKS
// =====================

/**
 * Hook to verify a certificate
 */
export function useVerifyCertificate(
  verificationCode: string,
  options?: Omit<
    UseQueryOptions<
      CertificateVerificationResult,
      Error,
      CertificateVerificationResult,
      ReturnType<typeof certificateVerificationKeys.verify>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateVerificationKeys.verify(verificationCode),
    queryFn: () => verifyCertificate(verificationCode),
    enabled: !!verificationCode,
    staleTime: 60 * 60 * 1000, // 1 hour - verification result unlikely to change
    ...options,
  });
}

/**
 * Hook to check upgrade eligibility
 */
export function useUpgradeEligibility(
  issuanceId: string,
  options?: Omit<
    UseQueryOptions<
      CertificateUpgradeEligibility,
      Error,
      CertificateUpgradeEligibility,
      ReturnType<typeof certificateIssuanceKeys.upgradeEligibility>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateIssuanceKeys.upgradeEligibility(issuanceId),
    queryFn: () => checkUpgradeEligibility(issuanceId),
    enabled: !!issuanceId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to initiate certificate upgrade
 */
export function useInitiateCertificateUpgrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issuanceId,
      payload,
    }: {
      issuanceId: string;
      payload: InitiateCertificateUpgradePayload;
    }) => initiateCertificateUpgrade(issuanceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: certificateIssuanceKeys.detail(variables.issuanceId),
      });
      queryClient.invalidateQueries({
        queryKey: certificateIssuanceKeys.upgradeEligibility(variables.issuanceId),
      });
      queryClient.invalidateQueries({ queryKey: certificateIssuanceKeys.lists() });
    },
  });
}
