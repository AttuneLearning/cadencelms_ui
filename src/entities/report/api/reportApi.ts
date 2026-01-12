/**
 * Report API Client
 * Implements all report and report template management endpoints
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  Report,
  ReportsListResponse,
  ReportFilters,
  CreateReportPayload,
  GenerateReportResponse,
  DownloadReportResponse,
  ReportTemplate,
  ReportTemplatesListResponse,
  TemplateFilters,
  CreateReportTemplatePayload,
  UpdateReportTemplatePayload,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// REPORTS
// =====================

/**
 * GET /reports - List all reports
 */
export async function listReports(filters?: ReportFilters): Promise<ReportsListResponse> {
  const response = await client.get<ApiResponse<ReportsListResponse>>(endpoints.reports.list, {
    params: filters,
  });
  return response.data.data;
}

/**
 * GET /reports/:id - Get report details
 */
export async function getReport(id: string): Promise<Report> {
  const response = await client.get<ApiResponse<Report>>(endpoints.reports.byId(id));
  return response.data.data;
}

/**
 * POST /reports - Create report
 */
export async function createReport(
  payload: CreateReportPayload
): Promise<GenerateReportResponse> {
  const response = await client.post<ApiResponse<GenerateReportResponse>>(
    endpoints.reports.create,
    payload
  );
  return response.data.data;
}

/**
 * DELETE /reports/:id - Delete report
 */
export async function deleteReport(id: string): Promise<void> {
  await client.delete(endpoints.reports.delete(id));
}

/**
 * GET /reports/:id/download?format=:format - Download report
 */
export async function downloadReport(
  id: string,
  format: string
): Promise<DownloadReportResponse> {
  const response = await client.get<ApiResponse<DownloadReportResponse>>(
    endpoints.reports.download(id, format)
  );
  return response.data.data;
}

// =====================
// REPORT TEMPLATES
// =====================

/**
 * GET /report-templates - List all report templates
 */
export async function listReportTemplates(
  filters?: TemplateFilters
): Promise<ReportTemplatesListResponse> {
  const response = await client.get<ApiResponse<ReportTemplatesListResponse>>(
    endpoints.reportTemplates.list,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /report-templates/:id - Get report template details
 */
export async function getReportTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.get<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.byId(id)
  );
  return response.data.data;
}

/**
 * POST /report-templates - Create report template
 */
export async function createReportTemplate(
  payload: CreateReportTemplatePayload
): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.create,
    payload
  );
  return response.data.data;
}

/**
 * PATCH /report-templates/:id - Update report template
 */
export async function updateReportTemplate(
  id: string,
  payload: UpdateReportTemplatePayload
): Promise<ReportTemplate> {
  const response = await client.patch<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.update(id),
    payload
  );
  return response.data.data;
}

/**
 * DELETE /report-templates/:id - Delete report template
 */
export async function deleteReportTemplate(id: string): Promise<void> {
  await client.delete(endpoints.reportTemplates.delete(id));
}

/**
 * POST /report-templates/:id/set-default - Set template as default
 */
export async function setAsDefaultTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.setDefault(id)
  );
  return response.data.data;
}

/**
 * POST /report-templates/:id/toggle-shared - Toggle template shared status
 */
export async function toggleSharedTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<ReportTemplate>>(
    endpoints.reportTemplates.toggleShared(id)
  );
  return response.data.data;
}
