/**
 * React Query hooks for Reports
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  listReports,
  getReport,
  createReport,
  deleteReport,
  downloadReport,
  listReportTemplates,
  getReportTemplate,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from '../api/reportApi';
import { reportKeys } from '../model/reportKeys';
import type {
  Report,
  ReportsListResponse,
  ReportFilters,
  CreateReportPayload,
  DownloadReportResponse,
  ReportTemplate,
  ReportTemplatesListResponse,
  TemplateFilters,
  CreateReportTemplatePayload,
  UpdateReportTemplatePayload,
} from '../model/types';

// =====================
// REPORT QUERY HOOKS
// =====================

/**
 * Hook to fetch list of reports
 */
export function useReports(
  filters?: ReportFilters,
  options?: Omit<
    UseQueryOptions<
      ReportsListResponse,
      Error,
      ReportsListResponse,
      ReturnType<typeof reportKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportKeys.list(filters),
    queryFn: () => listReports(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - reports change frequently
    ...options,
  });
}

/**
 * Hook to fetch single report
 */
export function useReport(
  id: string,
  options?: Omit<
    UseQueryOptions<Report, Error, Report, ReturnType<typeof reportKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => getReport(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to download report
 */
export function useDownloadReport(
  id: string,
  format: string,
  options?: Omit<
    UseQueryOptions<
      DownloadReportResponse,
      Error,
      DownloadReportResponse,
      ReturnType<typeof reportKeys.download>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportKeys.download(id, format),
    queryFn: () => downloadReport(id, format),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes - download URLs are relatively static
    ...options,
  });
}

// =====================
// REPORT TEMPLATE QUERY HOOKS
// =====================

/**
 * Hook to fetch list of report templates
 */
export function useReportTemplates(
  filters?: TemplateFilters,
  options?: Omit<
    UseQueryOptions<
      ReportTemplatesListResponse,
      Error,
      ReportTemplatesListResponse,
      ReturnType<typeof reportKeys.templates.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportKeys.templates.list(filters),
    queryFn: () => listReportTemplates(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes - templates change infrequently
    ...options,
  });
}

/**
 * Hook to fetch single report template
 */
export function useReportTemplate(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ReportTemplate,
      Error,
      ReportTemplate,
      ReturnType<typeof reportKeys.templates.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportKeys.templates.detail(id),
    queryFn: () => getReportTemplate(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

// =====================
// REPORT MUTATION HOOKS
// =====================

/**
 * Hook to create report
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportPayload) => createReport(payload),
    onSuccess: () => {
      // Invalidate reports list to show the new report
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

/**
 * Hook to delete report
 */
export function useDeleteReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReport(id),
    onSuccess: () => {
      // Invalidate reports list after deletion
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
    },
  });
}

// =====================
// REPORT TEMPLATE MUTATION HOOKS
// =====================

/**
 * Hook to create report template
 */
export function useCreateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportTemplatePayload) => createReportTemplate(payload),
    onSuccess: () => {
      // Invalidate templates list to show the new template
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() });
    },
  });
}

/**
 * Hook to update report template
 */
export function useUpdateReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportTemplatePayload }) =>
      updateReportTemplate(id, payload),
    onSuccess: (_, variables) => {
      // Invalidate the specific template and templates list
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() });
    },
  });
}

/**
 * Hook to delete report template
 */
export function useDeleteReportTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReportTemplate(id),
    onSuccess: () => {
      // Invalidate templates list after deletion
      queryClient.invalidateQueries({ queryKey: reportKeys.templates.lists() });
    },
  });
}
