/**
 * React Query keys for Certificates
 */

import type { CertificateFilters, TemplateFilters } from './types';

export const certificateKeys = {
  // All certificates
  all: ['certificates'] as const,

  // Certificate Lists
  lists: () => [...certificateKeys.all, 'list'] as const,
  list: (filters?: CertificateFilters) => [...certificateKeys.lists(), filters] as const,

  // Certificate Details
  details: () => [...certificateKeys.all, 'detail'] as const,
  detail: (id: string) => [...certificateKeys.details(), id] as const,

  // Certificate PDF
  pdf: (id: string) => [...certificateKeys.all, 'pdf', id] as const,

  // Certificate Verification
  verification: (code: string) => [...certificateKeys.all, 'verify', code] as const,

  // Certificate Templates
  templates: {
    all: ['certificateTemplates'] as const,
    lists: () => [...certificateKeys.templates.all, 'list'] as const,
    list: (filters?: TemplateFilters) => [...certificateKeys.templates.lists(), filters] as const,
    details: () => [...certificateKeys.templates.all, 'detail'] as const,
    detail: (id: string) => [...certificateKeys.templates.details(), id] as const,
  },
};
