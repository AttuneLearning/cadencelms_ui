/**
 * React Query hooks for Certificates
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listCertificates,
  getCertificate,
  generateCertificate,
  downloadCertificatePDF,
  verifyCertificate,
  listCertificateTemplates,
  getCertificateTemplate,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
} from '../api/certificateApi';
import { certificateKeys } from '../model/certificateKeys';
import type {
  Certificate,
  CertificatesListResponse,
  CertificateFilters,
  GenerateCertificatePayload,
  DownloadCertificateResponse,
  VerifyCertificateResponse,
  CertificateTemplate,
  CertificateTemplatesListResponse,
  TemplateFilters,
  CreateCertificateTemplatePayload,
  UpdateCertificateTemplatePayload,
} from '../model/types';

// =====================
// CERTIFICATE QUERY HOOKS
// =====================

/**
 * Hook to fetch list of certificates
 */
export function useCertificates(
  filters?: CertificateFilters,
  options?: Omit<
    UseQueryOptions<
      CertificatesListResponse,
      Error,
      CertificatesListResponse,
      ReturnType<typeof certificateKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateKeys.list(filters),
    queryFn: () => listCertificates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single certificate
 */
export function useCertificate(
  id: string,
  options?: Omit<
    UseQueryOptions<Certificate, Error, Certificate, ReturnType<typeof certificateKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateKeys.detail(id),
    queryFn: () => getCertificate(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to download certificate PDF
 */
export function useDownloadCertificatePDF(
  id: string,
  options?: Omit<
    UseQueryOptions<
      DownloadCertificateResponse,
      Error,
      DownloadCertificateResponse,
      ReturnType<typeof certificateKeys.pdf>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateKeys.pdf(id),
    queryFn: () => downloadCertificatePDF(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes - PDF URLs are relatively static
    ...options,
  });
}

/**
 * Hook to verify certificate
 */
export function useVerifyCertificate(
  code: string,
  options?: Omit<
    UseQueryOptions<
      VerifyCertificateResponse,
      Error,
      VerifyCertificateResponse,
      ReturnType<typeof certificateKeys.verification>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateKeys.verification(code),
    queryFn: () => verifyCertificate(code),
    enabled: !!code,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// CERTIFICATE TEMPLATE QUERY HOOKS
// =====================

/**
 * Hook to fetch list of certificate templates
 */
export function useCertificateTemplates(
  filters?: TemplateFilters,
  options?: Omit<
    UseQueryOptions<
      CertificateTemplatesListResponse,
      Error,
      CertificateTemplatesListResponse,
      ReturnType<typeof certificateKeys.templates.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateKeys.templates.list(filters),
    queryFn: () => listCertificateTemplates(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - templates change infrequently
    ...options,
  });
}

/**
 * Hook to fetch single certificate template
 */
export function useCertificateTemplate(
  id: string,
  options?: Omit<
    UseQueryOptions<
      CertificateTemplate,
      Error,
      CertificateTemplate,
      ReturnType<typeof certificateKeys.templates.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: certificateKeys.templates.detail(id),
    queryFn: () => getCertificateTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// =====================
// CERTIFICATE MUTATION HOOKS
// =====================

/**
 * Hook to generate certificate
 */
export function useGenerateCertificate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateCertificatePayload) => generateCertificate(payload),
    onSuccess: () => {
      // Invalidate certificates list to show the new certificate
      queryClient.invalidateQueries({ queryKey: certificateKeys.lists() });
    },
  });
}

// =====================
// CERTIFICATE TEMPLATE MUTATION HOOKS
// =====================

/**
 * Hook to create certificate template
 */
export function useCreateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCertificateTemplatePayload) => createCertificateTemplate(payload),
    onSuccess: () => {
      // Invalidate templates list to show the new template
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates.lists() });
    },
  });
}

/**
 * Hook to update certificate template
 */
export function useUpdateCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCertificateTemplatePayload }) =>
      updateCertificateTemplate(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate the specific template and templates list
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates.lists() });
    },
  });
}

/**
 * Hook to delete certificate template
 */
export function useDeleteCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCertificateTemplate(id),
    onSuccess: () => {
      // Invalidate templates list after deletion
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates.lists() });
    },
  });
}
