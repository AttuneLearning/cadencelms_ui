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
import type { DataShapeWarningDetails } from '@/shared/types/data-shape-warning';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

let hasLoggedShapeWarning = false;

/**
 * Create a new report job
 */
export async function createReportJob(
  request: CreateReportJobRequest
): Promise<ReportJob> {
  const response = await client.post<ApiResponse<{ job: ReportJob }>>(
    '/reports/jobs',
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
  const response = await client.get<ApiResponse<ListReportJobsResponse | ReportJob[]>>(
    '/reports/jobs',
    { params }
  );
  const payload = response.data?.data;
  let shapeWarning: DataShapeWarningDetails | undefined;

  const isLegacyArray = Array.isArray(payload);
  const legacyLimit = params?.limit ?? 50;
  const legacyJobs = isLegacyArray ? payload : [];
  const jobs = isLegacyArray
    ? legacyLimit > 0
      ? legacyJobs.slice(0, legacyLimit)
      : []
    : Array.isArray(payload?.jobs)
      ? payload.jobs
      : [];
  const pagination = !isLegacyArray ? payload?.pagination : undefined;
  const page = !isLegacyArray
    ? payload?.page ?? pagination?.page ?? params?.page ?? 1
    : params?.page ?? 1;
  const limit = !isLegacyArray
    ? payload?.limit ?? pagination?.limit ?? params?.limit ?? jobs.length
    : legacyLimit;
  const totalCount = !isLegacyArray
    ? payload?.totalCount ?? pagination?.total ?? jobs.length
    : legacyJobs.length;

  if (!isLegacyArray && !Array.isArray(payload?.jobs)) {
    if (!hasLoggedShapeWarning) {
      console.warn('[reportJobApi] Unexpected list response shape', {
        data: payload,
      });
      hasLoggedShapeWarning = true;
    }
    shapeWarning = {
      endpoint: '/reports/jobs',
      method: 'GET',
      expected: 'data.jobs: ReportJob[] (or legacy data: ReportJob[])',
      received: payload,
    };
  }
  const totalPages = !isLegacyArray
    ? payload?.totalPages ??
      pagination?.totalPages ??
      (limit > 0 ? Math.ceil(totalCount / limit) : 1)
    : limit > 0
      ? Math.ceil(totalCount / limit)
      : 1;

  return {
    jobs,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: pagination?.hasNext ?? page < totalPages,
      hasPrev: pagination?.hasPrev ?? page > 1,
    },
    totalCount,
    page,
    limit,
    totalPages,
    shapeWarning,
  };
}

/**
 * Get a specific report job by ID
 */
export async function getReportJob(id: string): Promise<ReportJob> {
  const response = await client.get<ApiResponse<{ job: ReportJob }>>(
    `/reports/jobs/${id}`
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
    `/reports/jobs/${id}/status`
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
    `/reports/jobs/${id}/download`
  );
  return response.data.data;
}

/**
 * Cancel a pending or processing report job
 */
export async function cancelReportJob(id: string): Promise<void> {
  await client.post<ApiResponse<void>>(`/reports/jobs/${id}/cancel`);
}

/**
 * Retry a failed report job
 */
export async function retryReportJob(id: string): Promise<ReportJob> {
  const response = await client.post<ApiResponse<{ job: ReportJob }>>(
    `/reports/jobs/${id}/retry`
  );
  return response.data.data.job;
}

/**
 * Delete a report job
 */
export async function deleteReportJob(id: string): Promise<void> {
  await client.delete<ApiResponse<void>>(`/reports/jobs/${id}`);
}

/**
 * Bulk delete report jobs
 */
export async function bulkDeleteReportJobs(ids: string[]): Promise<void> {
  await client.post<ApiResponse<void>>('/reports/jobs/bulk-delete', {
    jobIds: ids,
  });
}
