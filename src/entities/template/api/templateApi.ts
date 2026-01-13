/**
 * Template API Client
 * Implements endpoints from templates.contract.ts v1.0.0
 *
 * Covers all 7 template management endpoints
 */

import { client } from '@/shared/api/client';
import type {
  Template,
  TemplatesListResponse,
  TemplateFilters,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  DuplicateTemplatePayload,
  DuplicateTemplateResponse,
  DeleteTemplateResponse,
  TemplatePreviewParams,
  TemplatePreviewData,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// TEMPLATES
// =====================

/**
 * GET /templates - List all templates
 */
export async function listTemplates(filters?: TemplateFilters): Promise<TemplatesListResponse> {
  const response = await client.get<ApiResponse<TemplatesListResponse>>(
    '/templates',
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /templates/:id - Get template details
 */
export async function getTemplate(id: string): Promise<Template> {
  const response = await client.get<ApiResponse<Template>>(`/templates/${id}`);
  return response.data.data;
}

/**
 * POST /templates - Create new template
 */
export async function createTemplate(payload: CreateTemplatePayload): Promise<Template> {
  const response = await client.post<ApiResponse<Template>>('/templates', payload);
  return response.data.data;
}

/**
 * PUT /templates/:id - Update template
 */
export async function updateTemplate(id: string, payload: UpdateTemplatePayload): Promise<Template> {
  const response = await client.put<ApiResponse<Template>>(`/templates/${id}`, payload);
  return response.data.data;
}

/**
 * DELETE /templates/:id - Delete template
 */
export async function deleteTemplate(id: string, force?: boolean): Promise<DeleteTemplateResponse> {
  const response = await client.delete<ApiResponse<DeleteTemplateResponse>>(
    `/templates/${id}`,
    { params: { force } }
  );
  return response.data.data;
}

/**
 * POST /templates/:id/duplicate - Duplicate template
 */
export async function duplicateTemplate(
  id: string,
  payload: DuplicateTemplatePayload
): Promise<DuplicateTemplateResponse> {
  const response = await client.post<ApiResponse<DuplicateTemplateResponse>>(
    `/templates/${id}/duplicate`,
    payload
  );
  return response.data.data;
}

/**
 * GET /templates/:id/preview - Preview template
 */
export async function previewTemplate(
  id: string,
  params?: TemplatePreviewParams
): Promise<TemplatePreviewData | string> {
  const format = params?.format || 'json';

  const response = await client.get(
    `/templates/${id}/preview`,
    {
      params: {
        ...params,
        format,
      }
    }
  );

  // If format is 'html', return raw HTML string
  if (format === 'html') {
    return response.data as string;
  }

  // If format is 'json', return structured data
  return response.data.data as TemplatePreviewData;
}
