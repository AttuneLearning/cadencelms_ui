/**
 * Certificate Template API
 */

import { client } from '@/shared/api/client';
import type {
  CertificateTemplate,
  CertificateTemplateListResponse,
  CertificateTemplateFormData,
  CertificateTemplateFilters,
} from '../model/types';

/**
 * Fetch list of certificate templates
 */
export async function fetchCertificateTemplates(
  filters: CertificateTemplateFilters = {}
): Promise<CertificateTemplateListResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.isDefault !== undefined) params.append('isDefault', String(filters.isDefault));
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const response = await client.get<CertificateTemplateListResponse>(
    `/certificate-templates?${params.toString()}`
  );
  return response.data;
}

/**
 * Fetch single certificate template by ID
 */
export async function fetchCertificateTemplate(id: string): Promise<CertificateTemplate> {
  const response = await client.get<CertificateTemplate>(`/certificate-templates/${id}`);
  return response.data;
}

/**
 * Create new certificate template
 */
export async function createCertificateTemplate(
  data: CertificateTemplateFormData
): Promise<CertificateTemplate> {
  const response = await client.post<CertificateTemplate>('/certificate-templates', data);
  return response.data;
}

/**
 * Update certificate template
 */
export async function updateCertificateTemplate(
  id: string,
  data: Partial<CertificateTemplateFormData>
): Promise<CertificateTemplate> {
  const response = await client.patch<CertificateTemplate>(
    `/certificate-templates/${id}`,
    data
  );
  return response.data;
}

/**
 * Delete certificate template
 */
export async function deleteCertificateTemplate(id: string): Promise<void> {
  await client.delete(`/certificate-templates/${id}`);
}

/**
 * Set template as default
 */
export async function setDefaultTemplate(id: string): Promise<CertificateTemplate> {
  const response = await client.patch<CertificateTemplate>(
    `/certificate-templates/${id}/set-default`
  );
  return response.data;
}

/**
 * Toggle template active status
 */
export async function toggleTemplateActive(
  id: string,
  isActive: boolean
): Promise<CertificateTemplate> {
  const response = await client.patch<CertificateTemplate>(
    `/certificate-templates/${id}/toggle-active`,
    { isActive }
  );
  return response.data;
}
