/**
 * React Query hooks for Report Jobs
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createReportJob,
  listReportJobs,
  getReportJob,
  getReportJobStatus,
  getReportJobDownload,
  cancelReportJob,
  retryReportJob,
  deleteReportJob,
  bulkDeleteReportJobs,
} from '../api/reportJobApi';
import { reportJobKeys } from '../model/reportJobKeys';
import type {
  ReportJob,
  CreateReportJobRequest,
  ListReportJobsParams,
  ListReportJobsResponse,
  ReportJobStatusResponse,
  ReportJobDownloadResponse,
} from '../model/types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of report jobs
 */
export function useReportJobs(
  params?: ListReportJobsParams,
  options?: Omit<
    UseQueryOptions<
      ListReportJobsResponse,
      Error,
      ListReportJobsResponse,
      ReturnType<typeof reportJobKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportJobKeys.list(params || {}),
    queryFn: () => listReportJobs(params),
    staleTime: 30 * 1000, // 30 seconds (jobs change frequently)
    ...options,
  });
}

/**
 * Hook to fetch single report job
 */
export function useReportJob(
  id: string,
  options?: Omit<
    UseQueryOptions<ReportJob, Error, ReportJob, ReturnType<typeof reportJobKeys.detail>>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportJobKeys.detail(id),
    queryFn: () => getReportJob(id),
    enabled: !!id,
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch report job status
 */
export function useReportJobStatus(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ReportJobStatusResponse,
      Error,
      ReportJobStatusResponse,
      ReturnType<typeof reportJobKeys.status>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportJobKeys.status(id),
    queryFn: () => getReportJobStatus(id),
    enabled: !!id,
    staleTime: 10 * 1000, // 10 seconds (status changes frequently)
    refetchInterval: (query) => {
      const data = query.state.data;
      // Auto-refresh if job is processing
      if (data && ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(data.state)) {
        return 5000; // Poll every 5 seconds
      }
      return false; // Don't poll if job is in terminal state
    },
    ...options,
  });
}

/**
 * Hook to fetch report job download information
 */
export function useReportJobDownload(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ReportJobDownloadResponse,
      Error,
      ReportJobDownloadResponse,
      ReturnType<typeof reportJobKeys.download>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportJobKeys.download(id),
    queryFn: () => getReportJobDownload(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a new report job
 */
export function useCreateReportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReportJobRequest) => createReportJob(request),
    onSuccess: () => {
      // Invalidate all report job lists
      queryClient.invalidateQueries({ queryKey: reportJobKeys.lists() });
    },
  });
}

/**
 * Hook to cancel a report job
 */
export function useCancelReportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelReportJob(id),
    onSuccess: (_data, id) => {
      // Invalidate specific job and all lists
      queryClient.invalidateQueries({ queryKey: reportJobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportJobKeys.status(id) });
      queryClient.invalidateQueries({ queryKey: reportJobKeys.lists() });
    },
  });
}

/**
 * Hook to retry a failed report job
 */
export function useRetryReportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => retryReportJob(id),
    onSuccess: (_data, id) => {
      // Invalidate specific job and all lists
      queryClient.invalidateQueries({ queryKey: reportJobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportJobKeys.status(id) });
      queryClient.invalidateQueries({ queryKey: reportJobKeys.lists() });
    },
  });
}

/**
 * Hook to delete a report job
 */
export function useDeleteReportJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReportJob(id),
    onSuccess: (_data, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: reportJobKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportJobKeys.lists() });
    },
  });
}

/**
 * Hook to bulk delete report jobs
 */
export function useBulkDeleteReportJobs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => bulkDeleteReportJobs(ids),
    onSuccess: (_data, ids) => {
      // Remove all from cache and invalidate lists
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: reportJobKeys.detail(id) });
      });
      queryClient.invalidateQueries({ queryKey: reportJobKeys.lists() });
    },
  });
}
