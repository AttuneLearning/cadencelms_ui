/**
 * Certificate Template Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  CertificateTemplate,
  CertificateTemplateListResponse,
  CertificateTemplateFormData,
  CertificateTemplateFilters,
} from '../model/types';
import * as api from '../api/certificateTemplateApi';

/**
 * Query keys
 */
export const CERTIFICATE_TEMPLATE_KEYS = {
  all: ['certificate-templates'] as const,
  lists: () => [...CERTIFICATE_TEMPLATE_KEYS.all, 'list'] as const,
  list: (filters: CertificateTemplateFilters) =>
    [...CERTIFICATE_TEMPLATE_KEYS.lists(), filters] as const,
  details: () => [...CERTIFICATE_TEMPLATE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CERTIFICATE_TEMPLATE_KEYS.details(), id] as const,
};

/**
 * Fetch certificate templates list
 */
export function useCertificateTemplateList(filters: CertificateTemplateFilters = {}) {
  return useQuery<CertificateTemplateListResponse>({
    queryKey: CERTIFICATE_TEMPLATE_KEYS.list(filters),
    queryFn: () => api.fetchCertificateTemplates(filters),
  });
}

/**
 * Fetch single certificate template
 */
export function useCertificateTemplateDetail(id: string) {
  return useQuery<CertificateTemplate>({
    queryKey: CERTIFICATE_TEMPLATE_KEYS.detail(id),
    queryFn: () => api.fetchCertificateTemplate(id),
    enabled: !!id,
  });
}

/**
 * Create certificate template mutation
 */
export function useCreateCertificateTemplate(options?: {
  onSuccess?: (data: CertificateTemplate) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CertificateTemplateFormData) => api.createCertificateTemplate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_TEMPLATE_KEYS.lists() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Update certificate template mutation
 */
export function useUpdateCertificateTemplate(options?: {
  onSuccess?: (data: CertificateTemplate) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CertificateTemplateFormData> }) =>
      api.updateCertificateTemplate(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_TEMPLATE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_TEMPLATE_KEYS.detail(data.id) });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Delete certificate template mutation
 */
export function useDeleteCertificateTemplate(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteCertificateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_TEMPLATE_KEYS.lists() });
      options?.onSuccess?.();
    },
    onError: options?.onError,
  });
}

/**
 * Set default template mutation
 */
export function useSetDefaultTemplate(options?: {
  onSuccess?: (data: CertificateTemplate) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.setDefaultTemplate(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_TEMPLATE_KEYS.lists() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}

/**
 * Toggle template active status mutation
 */
export function useToggleTemplateActive(options?: {
  onSuccess?: (data: CertificateTemplate) => void;
  onError?: (error: Error) => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.toggleTemplateActive(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CERTIFICATE_TEMPLATE_KEYS.lists() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
}
