/**
 * Template API Client
 * Implements endpoints from templates.contract.ts v1.0.0
 *
 * Covers all 7 template management endpoints
 */

import { client } from '@/shared/api/client';
import type {
  CourseRef,
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

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null ? (value as UnknownRecord) : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeVersionStatus(value: unknown): CourseRef['versionStatus'] | undefined {
  const raw = asString(value)?.toLowerCase();
  if (raw === 'draft' || raw === 'published' || raw === 'archived') return raw;
  return undefined;
}

function normalizeCourseRef(value: unknown): CourseRef | null {
  const course = asRecord(value);
  if (!course) return null;

  const id = asString(course.id) ?? asString(course.courseId) ?? asString(course._id);
  if (!id) return null;

  const code = asString(course.code) ?? asString(course.courseCode) ?? '';
  const title =
    asString(course.title) ??
    asString(course.courseTitle) ??
    asString(course.name) ??
    code;

  const versionId = asString(course.versionId) ?? asString(course.courseVersionId) ?? undefined;
  const version = asNumber(course.version);
  const versionStatus = normalizeVersionStatus(
    asString(course.versionStatus) ?? asString(course.courseVersionStatus)
  );

  return {
    id,
    code,
    title,
    ...(versionId ? { versionId } : {}),
    ...(version !== undefined ? { version } : {}),
    ...(versionStatus ? { versionStatus } : {}),
  };
}

function normalizeUsedByCourses(value: unknown): CourseRef[] | undefined {
  if (value === undefined) return undefined;
  return asArray(value)
    .map(normalizeCourseRef)
    .filter((course): course is CourseRef => !!course);
}

function normalizeTemplate(template: Template): Template {
  const record = asRecord(template);
  if (!record) return template;

  const normalizedUsedByCourses = normalizeUsedByCourses(record.usedByCourses);
  if (normalizedUsedByCourses === undefined) return template;

  return {
    ...template,
    usedByCourses: normalizedUsedByCourses,
  };
}

function normalizeDeleteTemplateResponse(raw: DeleteTemplateResponse): DeleteTemplateResponse {
  const record = asRecord(raw);
  if (!record) return raw;

  return {
    deletedId: asString(record.deletedId) ?? asString(record.id) ?? '',
    affectedCourses:
      asNumber(record.affectedCourses) ??
      asNumber(record.affectedCourseCount) ??
      0,
    replacedWith:
      asString(record.replacedWith) ??
      asString(record.replacementTemplateId) ??
      null,
  };
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
  return normalizeTemplate(response.data.data);
}

/**
 * POST /templates - Create new template
 */
export async function createTemplate(payload: CreateTemplatePayload): Promise<Template> {
  const response = await client.post<ApiResponse<Template>>('/templates', payload);
  return normalizeTemplate(response.data.data);
}

/**
 * PUT /templates/:id - Update template
 */
export async function updateTemplate(id: string, payload: UpdateTemplatePayload): Promise<Template> {
  const response = await client.put<ApiResponse<Template>>(`/templates/${id}`, payload);
  return normalizeTemplate(response.data.data);
}

/**
 * DELETE /templates/:id - Delete template
 */
export async function deleteTemplate(id: string, force?: boolean): Promise<DeleteTemplateResponse> {
  const response = await client.delete<ApiResponse<DeleteTemplateResponse>>(
    `/templates/${id}`,
    { params: { force } }
  );
  return normalizeDeleteTemplateResponse(response.data.data);
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
