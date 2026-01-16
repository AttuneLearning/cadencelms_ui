/**
 * Report Job API Client
 */

import { client } from '@/shared/api/client';
import type {
  ReportJob,
  CreateReportJobRequest,
  ListReportJobsParams,
  ListReportJobsResponse,
  ReportJobStatusResponse,
  ReportJobDownloadResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Create a new report job
 */
export async function createReportJob(
  request: CreateReportJobRequest
): Promise<ReportJob> {
  const response = await client.post<ApiResponse<{ job: ReportJob }>>(
    '/api/v2/reports/jobs',
    request
  );
  return response.data.data.job;
}

/**
 * List report jobs with optional filtering
 */
export async function listReportJobs(
  params?: ListReportJobsParams
): Promise<ListReportJobsResponse> {
  const response = await client.get<ApiResponse<ListReportJobsResponse>>(
    '/api/v2/reports/jobs',
    { params }
  );
  return response.data.data;
}

/**
 * Get a specific report job by ID
 */
export async function getReportJob(id: string): Promise<ReportJob> {
  const response = await client.get<ApiResponse<{ job: ReportJob }>>(
    `/api/v2/reports/jobs/${id}`
  );
  return response.data.data.job;
}

/**
 * Get report job status
 */
export async function getReportJobStatus(
  id: string
): Promise<ReportJobStatusResponse> {
  const response = await client.get<ApiResponse<ReportJobStatusResponse>>(
    `/api/v2/reports/jobs/${id}/status`
  );
  return response.data.data;
}

/**
 * Get report job download information
 */
export async function getReportJobDownload(
  id: string
): Promise<ReportJobDownloadResponse> {
  const response = await client.get<ApiResponse<ReportJobDownloadResponse>>(
    `/api/v2/reports/jobs/${id}/download`
  );
  return response.data.data;
}

/**
 * Cancel a pending or processing report job
 */
export async function cancelReportJob(id: string): Promise<void> {
  await client.post<ApiResponse<void>>(`/api/v2/reports/jobs/${id}/cancel`);
}

/**
 * Retry a failed report job
 */
export async function retryReportJob(id: string): Promise<ReportJob> {
  const response = await client.post<ApiResponse<{ job: ReportJob }>>(
    `/api/v2/reports/jobs/${id}/retry`
  );
  return response.data.data.job;
}

/**
 * Delete a report job
 */
export async function deleteReportJob(id: string): Promise<void> {
  await client.delete<ApiResponse<void>>(`/api/v2/reports/jobs/${id}`);
}

/**
 * Bulk delete report jobs
 */
export async function bulkDeleteReportJobs(ids: string[]): Promise<void> {
  await client.post<ApiResponse<void>>('/api/v2/reports/jobs/bulk-delete', {
    jobIds: ids,
  });
}
