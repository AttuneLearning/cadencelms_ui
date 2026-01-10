/**
 * Certificate API Client
 * Implements all certificate and certificate template management endpoints
 */

import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type {
  Certificate,
  CertificatesListResponse,
  CertificateFilters,
  GenerateCertificatePayload,
  GenerateCertificateResponse,
  DownloadCertificateResponse,
  VerifyCertificateResponse,
  CertificateTemplate,
  CertificateTemplatesListResponse,
  TemplateFilters,
  CreateCertificateTemplatePayload,
  UpdateCertificateTemplatePayload,
} from '../model/types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// =====================
// CERTIFICATES
// =====================

/**
 * GET /certificates - List all certificates
 */
export async function listCertificates(
  filters?: CertificateFilters
): Promise<CertificatesListResponse> {
  const response = await client.get<ApiResponse<CertificatesListResponse>>(
    endpoints.certificates.list,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /certificates/:id - Get certificate details
 */
export async function getCertificate(id: string): Promise<Certificate> {
  const response = await client.get<ApiResponse<Certificate>>(
    endpoints.certificates.byId(id)
  );
  return response.data.data;
}

/**
 * POST /certificates/generate - Generate certificate
 */
export async function generateCertificate(
  payload: GenerateCertificatePayload
): Promise<GenerateCertificateResponse> {
  const response = await client.post<ApiResponse<GenerateCertificateResponse>>(
    endpoints.certificates.generate,
    payload
  );
  return response.data.data;
}

/**
 * GET /certificates/:id/pdf - Download certificate PDF
 */
export async function downloadCertificatePDF(
  id: string
): Promise<DownloadCertificateResponse> {
  const response = await client.get<ApiResponse<DownloadCertificateResponse>>(
    endpoints.certificates.pdf(id)
  );
  return response.data.data;
}

/**
 * GET /certificates/verify/:code - Verify certificate
 */
export async function verifyCertificate(
  code: string
): Promise<VerifyCertificateResponse> {
  const response = await client.get<ApiResponse<VerifyCertificateResponse>>(
    endpoints.certificates.verify(code)
  );
  return response.data.data;
}

// =====================
// CERTIFICATE TEMPLATES
// =====================

/**
 * GET /certificate-templates - List all certificate templates
 */
export async function listCertificateTemplates(
  filters?: TemplateFilters
): Promise<CertificateTemplatesListResponse> {
  const response = await client.get<ApiResponse<CertificateTemplatesListResponse>>(
    endpoints.certificateTemplates.list,
    { params: filters }
  );
  return response.data.data;
}

/**
 * GET /certificate-templates/:id - Get certificate template details
 */
export async function getCertificateTemplate(id: string): Promise<CertificateTemplate> {
  const response = await client.get<ApiResponse<CertificateTemplate>>(
    endpoints.certificateTemplates.byId(id)
  );
  return response.data.data;
}

/**
 * POST /certificate-templates - Create certificate template
 */
export async function createCertificateTemplate(
  payload: CreateCertificateTemplatePayload
): Promise<CertificateTemplate> {
  const response = await client.post<ApiResponse<CertificateTemplate>>(
    endpoints.certificateTemplates.create,
    payload
  );
  return response.data.data;
}

/**
 * PATCH /certificate-templates/:id - Update certificate template
 */
export async function updateCertificateTemplate(
  id: string,
  payload: UpdateCertificateTemplatePayload
): Promise<CertificateTemplate> {
  const response = await client.patch<ApiResponse<CertificateTemplate>>(
    endpoints.certificateTemplates.update(id),
    payload
  );
  return response.data.data;
}

/**
 * DELETE /certificate-templates/:id - Delete certificate template
 */
export async function deleteCertificateTemplate(id: string): Promise<void> {
  await client.delete(endpoints.certificateTemplates.delete(id));
}
