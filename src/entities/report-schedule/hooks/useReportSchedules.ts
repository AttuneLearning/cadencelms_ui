/**
 * React Query hooks for Report Schedules
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createReportSchedule,
  listReportSchedules,
  getReportSchedule,
  updateReportSchedule,
  deleteReportSchedule,
  activateReportSchedule,
  deactivateReportSchedule,
  triggerReportSchedule,
  getScheduleHistory,
} from '../api/reportScheduleApi';
import { reportScheduleKeys } from '../model/reportScheduleKeys';
import type {
  ReportSchedule,
  CreateReportScheduleRequest,
  UpdateReportScheduleRequest,
  ListReportSchedulesParams,
  ListReportSchedulesResponse,
} from '../model/types';

// =====================
// QUERY HOOKS
// =====================

/**
 * Hook to fetch list of report schedules
 */
export function useReportSchedules(
  params?: ListReportSchedulesParams,
  options?: Omit<
    UseQueryOptions<
      ListReportSchedulesResponse,
      Error,
      ListReportSchedulesResponse,
      ReturnType<typeof reportScheduleKeys.list>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportScheduleKeys.list(params || {}),
    queryFn: () => listReportSchedules(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch single report schedule
 */
export function useReportSchedule(
  id: string,
  options?: Omit<
    UseQueryOptions<
      ReportSchedule,
      Error,
      ReportSchedule,
      ReturnType<typeof reportScheduleKeys.detail>
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: reportScheduleKeys.detail(id),
    queryFn: () => getReportSchedule(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch schedule execution history
 */
export function useReportScheduleExecutions(
  id: string,
  params?: { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<
      { jobs: Array<{ jobId: string; triggeredAt: string; status: string }> },
      Error,
      { jobs: Array<{ jobId: string; triggeredAt: string; status: string }> },
      readonly [string, 'detail', string, 'history']
    >,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: ['report-schedules', 'detail', id, 'history'] as const,
    queryFn: () => getScheduleHistory(id, params),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

// =====================
// MUTATION HOOKS
// =====================

/**
 * Hook to create a new report schedule
 */
export function useCreateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReportScheduleRequest) => createReportSchedule(request),
    onSuccess: () => {
      // Invalidate all schedule lists
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.lists() });
    },
  });
}

/**
 * Hook to update a report schedule
 */
export function useUpdateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateReportScheduleRequest }) =>
      updateReportSchedule(id, request),
    onSuccess: (_data, { id }) => {
      // Invalidate specific schedule and all lists
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.lists() });
    },
  });
}

/**
 * Hook to delete a report schedule
 */
export function useDeleteReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReportSchedule(id),
    onSuccess: (_data, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: reportScheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.lists() });
    },
  });
}

/**
 * Hook to activate a report schedule
 */
export function useActivateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => activateReportSchedule(id),
    onSuccess: (_data, id) => {
      // Invalidate specific schedule and all lists
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.lists() });
    },
  });
}

/**
 * Hook to deactivate a report schedule
 */
export function useDeactivateReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deactivateReportSchedule(id),
    onSuccess: (_data, id) => {
      // Invalidate specific schedule and all lists
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.lists() });
    },
  });
}

/**
 * Hook to toggle a report schedule active/inactive
 */
export function useToggleReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, isActive }: { scheduleId: string; isActive: boolean }) =>
      isActive ? activateReportSchedule(scheduleId) : deactivateReportSchedule(scheduleId),
    onSuccess: (_data, { scheduleId }) => {
      // Invalidate specific schedule and all lists
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.detail(scheduleId) });
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.lists() });
    },
  });
}

/**
 * Hook to trigger a schedule to run immediately
 */
export function useTriggerReportSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => triggerReportSchedule(id),
    onSuccess: (_data, id) => {
      // Invalidate schedule and its history
      queryClient.invalidateQueries({ queryKey: reportScheduleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['report-schedules', 'detail', id, 'history'] });
      // Also invalidate report jobs list since a new job was created
      queryClient.invalidateQueries({ queryKey: ['report-jobs', 'list'] });
    },
  });
}
