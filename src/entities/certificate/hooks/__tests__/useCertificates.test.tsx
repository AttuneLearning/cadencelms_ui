/**
 * Tests for Certificate React Query Hooks
 * Following TDD approach - write tests first, then implement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  useCertificates,
  useCertificate,
  useGenerateCertificate,
  useDownloadCertificatePDF,
  useVerifyCertificate,
  useCertificateTemplates,
  useCertificateTemplate,
  useCreateCertificateTemplate,
  useUpdateCertificateTemplate,
  useDeleteCertificateTemplate,
} from '../useCertificates';
import type {
  CertificatesListResponse,
  Certificate,
  GenerateCertificateResponse,
  DownloadCertificateResponse,
  VerifyCertificateResponse,
  CertificateTemplatesListResponse,
  CertificateTemplate,
} from '../../model/types';

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Certificate Hooks', () => {
  const baseUrl = env.apiBaseUrl;

  // Mock data
  const mockCertificate: Certificate = {
    id: 'cert-1',
    learnerId: 'learner-1',
    learnerName: 'John Doe',
    courseId: 'course-1',
    courseName: 'Advanced JavaScript Programming',
    courseCode: 'CS301',
    templateId: 'template-1',
    issueDate: '2026-01-08T00:00:00.000Z',
    expiryDate: '2029-01-08T00:00:00.000Z',
    grade: 92.5,
    gradePercentage: 92.5,
    verificationCode: 'CERT-2026-ABC123XYZ',
    pdfUrl: 'https://cdn.example.com/certificates/cert-1.pdf',
    metadata: {
      instructor: 'Jane Smith',
    },
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-08T00:00:00.000Z',
  };

  const mockCertificate2: Certificate = {
    id: 'cert-2',
    learnerId: 'learner-1',
    learnerName: 'John Doe',
    courseId: 'course-2',
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    templateId: 'template-1',
    issueDate: '2025-12-15T00:00:00.000Z',
    grade: 88.0,
    gradePercentage: 88.0,
    verificationCode: 'CERT-2025-DEF456ABC',
    pdfUrl: 'https://cdn.example.com/certificates/cert-2.pdf',
    createdAt: '2025-12-15T00:00:00.000Z',
    updatedAt: '2025-12-15T00:00:00.000Z',
  };

  const mockTemplate: CertificateTemplate = {
    id: 'template-1',
    name: 'Standard Certificate',
    description: 'Default certificate template',
    html: '<div>{{learnerName}} completed {{courseName}}</div>',
    variables: ['learnerName', 'courseName', 'courseCode', 'issueDate', 'grade'],
    isDefault: true,
    isActive: true,
    createdBy: 'admin-1',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockTemplate2: CertificateTemplate = {
    id: 'template-2',
    name: 'Premium Certificate',
    description: 'Premium certificate template',
    html: '<div class="premium">{{learnerName}} - {{courseName}}</div>',
    variables: ['learnerName', 'courseName', 'courseCode', 'issueDate', 'grade', 'instructor'],
    isDefault: false,
    isActive: true,
    createdBy: 'admin-1',
    createdAt: '2025-06-01T00:00:00.000Z',
    updatedAt: '2025-06-01T00:00:00.000Z',
  };

  beforeEach(() => {
    server.resetHandlers();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  // =====================
  // QUERY HOOKS
  // =====================

  describe('useCertificates', () => {
    it('should fetch list of certificates', async () => {
      const mockResponse: CertificatesListResponse = {
        certificates: [mockCertificate, mockCertificate2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/certificates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useCertificates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.certificates).toHaveLength(2);
    });

    it('should fetch certificates with filters', async () => {
      const filters = { learnerId: 'learner-1', page: 1, limit: 10 };
      const mockResponse: CertificatesListResponse = {
        certificates: [mockCertificate, mockCertificate2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/certificates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useCertificates(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.certificates.every((c) => c.learnerId === 'learner-1')).toBe(
        true
      );
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/certificates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useCertificates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should use correct stale time', async () => {
      const mockResponse: CertificatesListResponse = {
        certificates: [mockCertificate],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/certificates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useCertificates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useCertificate', () => {
    it('should fetch single certificate by ID', async () => {
      const certificateId = 'cert-1';

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockCertificate,
          });
        })
      );

      const { result } = renderHook(() => useCertificate(certificateId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCertificate);
      expect(result.current.data?.verificationCode).toBeDefined();
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useCertificate(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error', async () => {
      const certificateId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Certificate not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useCertificate(certificateId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useDownloadCertificatePDF', () => {
    it('should fetch certificate PDF URL', async () => {
      const certificateId = 'cert-1';

      const mockResponse: DownloadCertificateResponse = {
        pdfUrl: 'https://cdn.example.com/certificates/cert-1.pdf',
        certificate: mockCertificate,
      };

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}/pdf`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useDownloadCertificatePDF(certificateId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.pdfUrl).toContain('.pdf');
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useDownloadCertificatePDF(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useVerifyCertificate', () => {
    it('should verify valid certificate', async () => {
      const verificationCode = 'CERT-2026-ABC123XYZ';

      const mockResponse: VerifyCertificateResponse = {
        valid: true,
        certificate: mockCertificate,
        message: 'Certificate is valid',
      };

      server.use(
        http.get(`${baseUrl}/certificates/verify/${verificationCode}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useVerifyCertificate(verificationCode), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.valid).toBe(true);
      expect(result.current.data?.certificate).toBeDefined();
    });

    it('should handle invalid certificate', async () => {
      const verificationCode = 'INVALID-CODE';

      const mockResponse: VerifyCertificateResponse = {
        valid: false,
        message: 'Certificate not found or invalid',
      };

      server.use(
        http.get(`${baseUrl}/certificates/verify/${verificationCode}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useVerifyCertificate(verificationCode), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.valid).toBe(false);
      expect(result.current.data?.certificate).toBeUndefined();
    });

    it('should not fetch when code is empty', () => {
      const { result } = renderHook(() => useVerifyCertificate(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCertificateTemplates', () => {
    it('should fetch list of templates', async () => {
      const mockResponse: CertificateTemplatesListResponse = {
        templates: [mockTemplate, mockTemplate2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useCertificateTemplates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.templates).toHaveLength(2);
    });

    it('should fetch templates with filters', async () => {
      const filters = { isActive: true };
      const mockResponse: CertificateTemplatesListResponse = {
        templates: [mockTemplate, mockTemplate2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      server.use(
        http.get(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useCertificateTemplates(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.templates.every((t) => t.isActive)).toBe(true);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useCertificateTemplates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCertificateTemplate', () => {
    it('should fetch single template by ID', async () => {
      const templateId = 'template-1';

      server.use(
        http.get(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockTemplate,
          });
        })
      );

      const { result } = renderHook(() => useCertificateTemplate(templateId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTemplate);
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useCertificateTemplate(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  // =====================
  // MUTATION HOOKS
  // =====================

  describe('useGenerateCertificate', () => {
    it('should generate certificate', async () => {
      const mockResponse: GenerateCertificateResponse = {
        certificate: mockCertificate,
        message: 'Certificate generated successfully',
      };

      server.use(
        http.post(`${baseUrl}/certificates/generate`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: mockResponse,
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useGenerateCertificate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.certificate.id).toBe('cert-1');
    });

    it('should handle generation error', async () => {
      server.use(
        http.post(`${baseUrl}/certificates/generate`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Course not completed',
              code: 'ENROLLMENT_NOT_COMPLETED',
            },
            { status: 422 }
          );
        })
      );

      const { result } = renderHook(() => useGenerateCertificate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle already exists error', async () => {
      server.use(
        http.post(`${baseUrl}/certificates/generate`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Certificate already exists',
              code: 'CERTIFICATE_ALREADY_EXISTS',
            },
            { status: 409 }
          );
        })
      );

      const { result } = renderHook(() => useGenerateCertificate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCreateCertificateTemplate', () => {
    it('should create template', async () => {
      const newTemplate: CertificateTemplate = {
        id: 'template-3',
        name: 'New Template',
        description: 'A new certificate template',
        html: '<div>{{learnerName}}</div>',
        variables: ['learnerName', 'courseName'],
        isDefault: false,
        isActive: true,
        createdBy: 'admin-1',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      server.use(
        http.post(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: newTemplate,
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useCreateCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New Template',
        description: 'A new certificate template',
        html: '<div>{{learnerName}}</div>',
        variables: ['learnerName', 'courseName'],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(newTemplate);
    });

    it('should handle validation error', async () => {
      server.use(
        http.post(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation error',
              code: 'VALIDATION_ERROR',
            },
            { status: 422 }
          );
        })
      );

      const { result } = renderHook(() => useCreateCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: '',
        description: 'Invalid',
        html: '',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useUpdateCertificateTemplate', () => {
    it('should update template', async () => {
      const templateId = 'template-2';
      const updatedTemplate: CertificateTemplate = {
        ...mockTemplate2,
        name: 'Updated Premium Certificate',
        isActive: false,
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      server.use(
        http.patch(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const { result } = renderHook(() => useUpdateCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: templateId,
        payload: {
          name: 'Updated Premium Certificate',
          isActive: false,
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(updatedTemplate);
      expect(result.current.data?.name).toBe('Updated Premium Certificate');
    });

    it('should handle not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.patch(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useUpdateCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: templateId,
        payload: { name: 'Updated' },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useDeleteCertificateTemplate', () => {
    it('should delete template', async () => {
      const templateId = 'template-2';

      server.use(
        http.delete(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Template deleted successfully',
          });
        })
      );

      const { result } = renderHook(() => useDeleteCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should handle not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle cannot delete default error', async () => {
      const templateId = 'template-1';

      server.use(
        http.delete(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot delete default template',
              code: 'CANNOT_DELETE_DEFAULT',
            },
            { status: 422 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteCertificateTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
