/**
 * Report Template API Client
 */

import { client } from '@/shared/api/client';
import type {
  ReportTemplate,
  CreateReportTemplateRequest,
  UpdateReportTemplateRequest,
  ListReportTemplatesParams,
  ListReportTemplatesResponse,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Create a new report template
 */
export async function createReportTemplate(
  request: CreateReportTemplateRequest
): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<{ template: ReportTemplate }>>(
    '/reports/templates',
    request
  );
  return response.data.data.template;
}

/**
 * List report templates with optional filtering
 */
export async function listReportTemplates(
  params?: ListReportTemplatesParams
): Promise<ListReportTemplatesResponse> {
  const response = await client.get<ApiResponse<ListReportTemplatesResponse>>(
    '/reports/templates',
    { params }
  );
  return response.data.data;
}

/**
 * Get user's personal templates
 */
export async function getMyTemplates(): Promise<ReportTemplate[]> {
  const response = await client.get<ApiResponse<{ templates: ReportTemplate[] }>>(
    '/reports/templates/my'
  );
  return response.data.data.templates;
}

/**
 * Get system templates
 */
export async function getSystemTemplates(): Promise<ReportTemplate[]> {
  const response = await client.get<ApiResponse<{ templates: ReportTemplate[] }>>(
    '/reports/templates/system'
  );
  return response.data.data.templates;
}

/**
 * Get a specific report template by ID
 */
export async function getReportTemplate(id: string): Promise<ReportTemplate> {
  const response = await client.get<ApiResponse<{ template: ReportTemplate }>>(
    `/reports/templates/${id}`
  );
  return response.data.data.template;
}

/**
 * Get a report template by slug
 */
export async function getReportTemplateBySlug(slug: string): Promise<ReportTemplate> {
  const response = await client.get<ApiResponse<{ template: ReportTemplate }>>(
    `/reports/templates/slug/${slug}`
  );
  return response.data.data.template;
}

/**
 * Update a report template
 */
export async function updateReportTemplate(
  id: string,
  request: UpdateReportTemplateRequest
): Promise<ReportTemplate> {
  const response = await client.put<ApiResponse<{ template: ReportTemplate }>>(
    `/reports/templates/${id}`,
    request
  );
  return response.data.data.template;
}

/**
 * Delete a report template
 */
export async function deleteReportTemplate(id: string): Promise<void> {
  await client.delete<ApiResponse<void>>(`/reports/templates/${id}`);
}

/**
 * Duplicate a report template
 */
export async function duplicateReportTemplate(
  id: string,
  name?: string
): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<{ template: ReportTemplate }>>(
    `/reports/templates/${id}/duplicate`,
    { name }
  );
  return response.data.data.template;
}

/**
 * Publish a new version of a template
 */
export async function publishTemplateVersion(
  id: string,
  request: UpdateReportTemplateRequest
): Promise<ReportTemplate> {
  const response = await client.post<ApiResponse<{ template: ReportTemplate }>>(
    `/reports/templates/${id}/versions`,
    request
  );
  return response.data.data.template;
}

/**
 * Get template version history
 */
export async function getTemplateVersions(id: string): Promise<ReportTemplate[]> {
  const response = await client.get<ApiResponse<{ versions: ReportTemplate[] }>>(
    `/reports/templates/${id}/versions`
  );
  return response.data.data.versions;
}
