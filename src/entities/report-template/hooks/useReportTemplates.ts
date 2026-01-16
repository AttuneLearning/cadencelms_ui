/**
 * React Query hooks for Report Templates
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createReportTemplate,
  listReportTemplates,
  getMyTemplates,
  getSystemTemplates,
  getReportTemplate,
  getReportTemplateBySlug,
  updateReportTemplate,
  deleteReportTemplate,
  duplicateReportTemplate,
  publishTemplateVersion,
  getTemplateVersions,
} from '../api/reportTemplateApi';
import { reportTemplateKeys } from '../model/reportTemplateKeys';
import type {
  ReportTemplate,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
  ListReportTemplatesParams,
  ListReportTemplatesResponse,
} from '../model/types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of report templates
 */
export function useReportTemplates(
  params?: ListReportTemplatesParams,
  options?: Omit<
    UseQueryOptions<
      ListReportTemplatesResponse,
      Error,
      ListReportTemplatesResponse,
      ReturnType<typeof reportTemplateKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportTemplateKeys.list(params || {}),
    queryFn: () => listReportTemplates(params),
    staleTime: 10 * 60 * 1000, // 10 minutes (templates change infrequently)
    ...options,
  });
}

/**
 * Hook to fetch user's personal templates
 */
export function useMyTemplates(
  options?: Omit<
    UseQueryOptions<ReportTemplate[], Error, ReportTemplate[], ReturnType<typeof reportTemplateKeys.my>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportTemplateKeys.my(),
    queryFn: () => getMyTemplates(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch system templates
 */
export function useSystemTemplates(
  options?: Omit<
    UseQueryOptions<
      ReportTemplate[],
      Error,
      ReportTemplate[],
      ReturnType<typeof reportTemplateKeys.system>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportTemplateKeys.system(),
    queryFn: () => getSystemTemplates(),
    staleTime: 15 * 60 * 1000, // 15 minutes (system templates rarely change)
    ...options,
  });
}

/**
 * Hook to fetch single report template by ID
 */
export function useReportTemplate(
  id: string,
  options?: Omit<
    UseQueryOptions<ReportTemplate, Error, ReportTemplate, ReturnType<typeof reportTemplateKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportTemplateKeys.detail(id),
    queryFn: () => getReportTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch template by slug
 */
export function useReportTemplateBySlug(
  slug: string,
  options?: Omit<
    UseQueryOptions<
      ReportTemplate,
      Error,
      ReportTemplate,
      readonly [string, 'slug', string]
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['report-templates', 'slug', slug] as const,
    queryFn: () => getReportTemplateBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch template version history
 */
export function useTemplateVersions(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ReportTemplate[],
      Error,
      ReportTemplate[],
      readonly [string, 'detail', string, 'versions']
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['report-templates', 'detail', id, 'versions'] as const,
    queryFn: () => getTemplateVersions(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a new report template
 */
export function useCreateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReportTemplateRequest) => createReportTemplate(request),
    onSuccess: () => {
      // Invalidate all template lists
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.my() });
    },
  });
}

/**
 * Hook to update a report template
 */
export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateReportTemplateRequest }) =>
      updateReportTemplate(id, request),
    onSuccess: (_data, { id }) => {
      // Invalidate specific template and all lists
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.my() });
    },
  });
}

/**
 * Hook to delete a report template
 */
export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReportTemplate(id),
    onSuccess: (_data, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: reportTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.my() });
    },
  });
}

/**
 * Hook to duplicate a report template
 */
export function useDuplicateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) => duplicateReportTemplate(id, name),
    onSuccess: () => {
      // Invalidate all template lists
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.my() });
    },
  });
}

/**
 * Hook to publish a new template version
 */
export function usePublishTemplateVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateReportTemplateRequest }) =>
      publishTemplateVersion(id, request),
    onSuccess: (_data, { id }) => {
      // Invalidate specific template, versions, and lists
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['report-templates', 'detail', id, 'versions'] });
      queryClient.invalidateQueries({ queryKey: reportTemplateKeys.lists() });
    },
  });
}
