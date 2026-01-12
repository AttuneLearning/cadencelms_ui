/**
 * Certificate Entity Types
 * Types for certificate and certificate template management
 */

// =====================
// SHARED TYPES
// =====================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// =====================
// CERTIFICATE TYPES
// =====================

/**
 * Certificate
 * Represents an issued certificate for a learner's course completion
 */
export interface Certificate {
  id: string;
  learnerId: string;
  learnerName: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  templateId: string;
  issueDate: string;
  expiryDate?: string;
  grade?: number;
  gradePercentage?: number;
  verificationCode: string;
  pdfUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Certificate Template
 * Template used to generate certificates
 */
export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  html: string;
  variables: string[]; // Available variables: {{learnerName}}, {{courseName}}, etc.
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// =====================
// REQUEST PAYLOAD TYPES
// =====================

/**
 * Generate Certificate Payload
 */
export interface GenerateCertificatePayload {
  learnerId: string;
  courseId: string;
  enrollmentId: string;
  templateId?: string; // Uses default if not provided
}

/**
 * Certificate Query Filters
 */
export interface CertificateFilters {
  learnerId?: string;
  courseId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Template Query Filters
 */
export interface TemplateFilters {
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

/**
 * Create Certificate Template Payload
 */
export interface CreateCertificateTemplatePayload {
  name: string;
  description: string;
  html: string;
  variables?: string[];
  isDefault?: boolean;
  isActive?: boolean;
}

/**
 * Update Certificate Template Payload
 */
export interface UpdateCertificateTemplatePayload {
  name?: string;
  description?: string;
  html?: string;
  variables?: string[];
  isDefault?: boolean;
  isActive?: boolean;
}

// =====================
// API RESPONSE TYPES
// =====================

/**
 * List Certificates Response
 */
export interface CertificatesListResponse {
  certificates: Certificate[];
  pagination: Pagination;
}

/**
 * List Certificate Templates Response
 */
export interface CertificateTemplatesListResponse {
  templates: CertificateTemplate[];
  pagination: Pagination;
}

/**
 * Generate Certificate Response
 */
export interface GenerateCertificateResponse {
  certificate: Certificate;
  message: string;
}

/**
 * Verify Certificate Response
 */
export interface VerifyCertificateResponse {
  valid: boolean;
  certificate?: Certificate;
  message: string;
}

/**
 * Download Certificate Response
 */
export interface DownloadCertificateResponse {
  pdfUrl: string;
  certificate: Certificate;
}
