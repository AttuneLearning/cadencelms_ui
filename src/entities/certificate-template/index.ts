/**
 * Certificate Template Entity - Public API
 */

export * from './api/certificateTemplateApi';
export * from './hooks';
export type {
  CertificateTemplate,
  CertificateTemplateListItem,
  CertificateTemplateFormData,
  CertificateTemplateFilters,
  CertificateTemplateListResponse,
} from './model/types';
export { TEMPLATE_VARIABLES, SAMPLE_CERTIFICATE_DATA } from './model/types';
