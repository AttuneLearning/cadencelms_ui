/**
 * Certificate Template Entity - Type Definitions
 */

/**
 * Certificate Template
 */
export interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  htmlTemplate: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Certificate Template List Item (for table display)
 */
export interface CertificateTemplateListItem {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Certificate Template Form Data
 */
export interface CertificateTemplateFormData {
  name: string;
  description: string;
  htmlTemplate: string;
  isDefault?: boolean;
  isActive?: boolean;
}

/**
 * Certificate Template Filters
 */
export interface CertificateTemplateFilters {
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Certificate Template List Response
 */
export interface CertificateTemplateListResponse {
  templates: CertificateTemplateListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Template Variables
 */
export const TEMPLATE_VARIABLES = [
  { key: '{{learnerName}}', description: 'Full name of the learner' },
  { key: '{{courseName}}', description: 'Name of the course' },
  { key: '{{courseCode}}', description: 'Code of the course' },
  { key: '{{issueDate}}', description: 'Date the certificate was issued' },
  { key: '{{expiryDate}}', description: 'Expiry date of the certificate' },
  { key: '{{grade}}', description: 'Grade achieved (A, B, C, etc.)' },
  { key: '{{gradePercentage}}', description: 'Grade as percentage' },
  { key: '{{verificationCode}}', description: 'Unique verification code' },
  { key: '{{certificateId}}', description: 'Certificate ID' },
] as const;

/**
 * Sample data for preview
 */
export const SAMPLE_CERTIFICATE_DATA = {
  learnerName: 'John Doe',
  courseName: 'Introduction to Web Development',
  courseCode: 'WEB-101',
  issueDate: '2024-01-15',
  expiryDate: '2025-01-15',
  grade: 'A',
  gradePercentage: '95%',
  verificationCode: 'CERT-12345-ABCDE',
  certificateId: 'CERT-2024-001',
};
