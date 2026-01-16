/**
 * Report Schedule API Client
 */

import { client } from '@/shared/api/client';
import type {
  ReportSchedule,
  CreateReportScheduleRequest,
  UpdateReportScheduleRequest,
  ListReportSchedulesParams,
  ListReportSchedulesResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Create a new report schedule
 */
export async function createReportSchedule(
  request: CreateReportScheduleRequest
): Promise<ReportSchedule> {
  const response = await client.post<ApiResponse<{ schedule: ReportSchedule }>>(
    '/api/v2/reports/schedules',
    request
  );
  return response.data.data.schedule;
}

/**
 * List report schedules with optional filtering
 */
export async function listReportSchedules(
  params?: ListReportSchedulesParams
): Promise<ListReportSchedulesResponse> {
  const response = await client.get<ApiResponse<ListReportSchedulesResponse>>(
    '/api/v2/reports/schedules',
    { params }
  );
  return response.data.data;
}

/**
 * Get a specific report schedule by ID
 */
export async function getReportSchedule(id: string): Promise<ReportSchedule> {
  const response = await client.get<ApiResponse<{ schedule: ReportSchedule }>>(
    `/api/v2/reports/schedules/${id}`
  );
  return response.data.data.schedule;
}

/**
 * Update a report schedule
 */
export async function updateReportSchedule(
  id: string,
  request: UpdateReportScheduleRequest
): Promise<ReportSchedule> {
  const response = await client.put<ApiResponse<{ schedule: ReportSchedule }>>(
    `/api/v2/reports/schedules/${id}`,
    request
  );
  return response.data.data.schedule;
}

/**
 * Delete a report schedule
 */
export async function deleteReportSchedule(id: string): Promise<void> {
  await client.delete<ApiResponse<void>>(`/api/v2/reports/schedules/${id}`);
}

/**
 * Activate a report schedule
 */
export async function activateReportSchedule(id: string): Promise<ReportSchedule> {
  const response = await client.post<ApiResponse<{ schedule: ReportSchedule }>>(
    `/api/v2/reports/schedules/${id}/activate`
  );
  return response.data.data.schedule;
}

/**
 * Deactivate a report schedule
 */
export async function deactivateReportSchedule(id: string): Promise<ReportSchedule> {
  const response = await client.post<ApiResponse<{ schedule: ReportSchedule }>>(
    `/api/v2/reports/schedules/${id}/deactivate`
  );
  return response.data.data.schedule;
}

/**
 * Trigger a schedule to run immediately
 */
export async function triggerReportSchedule(id: string): Promise<{ jobId: string }> {
  const response = await client.post<ApiResponse<{ jobId: string }>>(
    `/api/v2/reports/schedules/${id}/trigger`
  );
  return response.data.data;
}

/**
 * Get schedule execution history
 */
export async function getScheduleHistory(
  id: string,
  params?: { page?: number; limit?: number }
): Promise<{ jobs: Array<{ jobId: string; triggeredAt: string; status: string }> }> {
  const response = await client.get<
    ApiResponse<{ jobs: Array<{ jobId: string; triggeredAt: string; status: string }> }>
  >(`/api/v2/reports/schedules/${id}/history`, { params });
  return response.data.data;
}
