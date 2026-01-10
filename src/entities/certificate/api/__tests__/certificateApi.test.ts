/**
 * Tests for Certificate API Client
 * Tests all certificate and certificate template management endpoints
 * Following TDD approach - write tests first, then implement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listCertificates,
  getCertificate,
  generateCertificate,
  downloadCertificatePDF,
  verifyCertificate,
  listCertificateTemplates,
  getCertificateTemplate,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
} from '../certificateApi';
import type {
  CertificatesListResponse,
  Certificate,
  GenerateCertificateResponse,
  VerifyCertificateResponse,
  DownloadCertificateResponse,
  CertificateTemplatesListResponse,
  CertificateTemplate,
} from '../../model/types';

describe('certificateApi', () => {
  const baseUrl = env.apiBaseUrl; // Already includes /api/v2

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
      completionDate: '2026-01-07T00:00:00.000Z',
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
    description: 'Default certificate template for course completion',
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
    description: 'Premium certificate template with advanced styling',
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
  // LIST CERTIFICATES
  // =====================

  describe('listCertificates', () => {
    it('should fetch paginated list of certificates without filters', async () => {
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

      const result = await listCertificates();

      expect(result).toEqual(mockResponse);
      expect(result.certificates).toHaveLength(2);
    });

    it('should fetch certificates with pagination params', async () => {
      const mockResponse: CertificatesListResponse = {
        certificates: [mockCertificate],
        pagination: {
          page: 1,
          limit: 1,
          total: 2,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCertificates({ page: 1, limit: 1 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('1');
    });

    it('should filter certificates by learner', async () => {
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

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCertificates({ learnerId: 'learner-1' });

      expect(result.certificates.every((c) => c.learnerId === 'learner-1')).toBe(true);
      expect(capturedParams!.get('learnerId')).toBe('learner-1');
    });

    it('should filter certificates by course', async () => {
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

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCertificates({ courseId: 'course-1' });

      expect(result.certificates.every((c) => c.courseId === 'course-1')).toBe(true);
      expect(capturedParams!.get('courseId')).toBe('course-1');
    });

    it('should filter certificates by date range', async () => {
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

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCertificates({
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      });

      expect(result.certificates).toHaveLength(1);
      expect(capturedParams!.get('startDate')).toBe('2026-01-01');
      expect(capturedParams!.get('endDate')).toBe('2026-12-31');
    });

    it('should search certificates', async () => {
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

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await listCertificates({ search: 'JavaScript' });

      expect(capturedParams!.get('search')).toBe('JavaScript');
    });

    it('should sort certificates', async () => {
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

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await listCertificates({ sort: '-issueDate' });

      expect(capturedParams!.get('sort')).toBe('-issueDate');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/certificates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listCertificates()).rejects.toThrow();
    });
  });

  // =====================
  // GET CERTIFICATE
  // =====================

  describe('getCertificate', () => {
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

      const result = await getCertificate(certificateId);

      expect(result).toEqual(mockCertificate);
      expect(result.id).toBe(certificateId);
      expect(result.verificationCode).toBeDefined();
    });

    it('should handle certificate not found error', async () => {
      const certificateId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Certificate not found' },
            { status: 404 }
          );
        })
      );

      await expect(getCertificate(certificateId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const certificateId = 'cert-1';

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getCertificate(certificateId)).rejects.toThrow();
    });
  });

  // =====================
  // GENERATE CERTIFICATE
  // =====================

  describe('generateCertificate', () => {
    it('should generate certificate with default template', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
      };

      const mockResponse: GenerateCertificateResponse = {
        certificate: mockCertificate,
        message: 'Certificate generated successfully',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/certificates/generate`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              data: mockResponse,
            },
            { status: 201 }
          );
        })
      );

      const result = await generateCertificate(payload);

      expect(result).toEqual(mockResponse);
      expect(result.certificate.id).toBe('cert-1');
      expect(capturedRequestBody).toMatchObject(payload);
    });

    it('should generate certificate with specific template', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
        templateId: 'template-2',
      };

      const mockResponse: GenerateCertificateResponse = {
        certificate: { ...mockCertificate, templateId: 'template-2' },
        message: 'Certificate generated successfully',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/certificates/generate`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              data: mockResponse,
            },
            { status: 201 }
          );
        })
      );

      const result = await generateCertificate(payload);

      expect(result.certificate.templateId).toBe('template-2');
      expect(capturedRequestBody.templateId).toBe('template-2');
    });

    it('should handle enrollment not completed error', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
      };

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

      await expect(generateCertificate(payload)).rejects.toThrow();
    });

    it('should handle certificate already exists error', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'enrollment-1',
      };

      server.use(
        http.post(`${baseUrl}/certificates/generate`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Certificate already exists for this enrollment',
              code: 'CERTIFICATE_ALREADY_EXISTS',
            },
            { status: 409 }
          );
        })
      );

      await expect(generateCertificate(payload)).rejects.toThrow();
    });

    it('should handle enrollment not found error', async () => {
      const payload = {
        learnerId: 'learner-1',
        courseId: 'course-1',
        enrollmentId: 'non-existent',
      };

      server.use(
        http.post(`${baseUrl}/certificates/generate`, () => {
          return HttpResponse.json(
            { success: false, message: 'Enrollment not found' },
            { status: 404 }
          );
        })
      );

      await expect(generateCertificate(payload)).rejects.toThrow();
    });
  });

  // =====================
  // DOWNLOAD CERTIFICATE PDF
  // =====================

  describe('downloadCertificatePDF', () => {
    it('should get PDF download URL', async () => {
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

      const result = await downloadCertificatePDF(certificateId);

      expect(result).toEqual(mockResponse);
      expect(result.pdfUrl).toContain('.pdf');
    });

    it('should handle certificate not found error', async () => {
      const certificateId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}/pdf`, () => {
          return HttpResponse.json(
            { success: false, message: 'Certificate not found' },
            { status: 404 }
          );
        })
      );

      await expect(downloadCertificatePDF(certificateId)).rejects.toThrow();
    });

    it('should handle PDF generation error', async () => {
      const certificateId = 'cert-1';

      server.use(
        http.get(`${baseUrl}/certificates/${certificateId}/pdf`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Failed to generate PDF',
              code: 'PDF_GENERATION_FAILED',
            },
            { status: 500 }
          );
        })
      );

      await expect(downloadCertificatePDF(certificateId)).rejects.toThrow();
    });
  });

  // =====================
  // VERIFY CERTIFICATE
  // =====================

  describe('verifyCertificate', () => {
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

      const result = await verifyCertificate(verificationCode);

      expect(result).toEqual(mockResponse);
      expect(result.valid).toBe(true);
      expect(result.certificate).toBeDefined();
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

      const result = await verifyCertificate(verificationCode);

      expect(result.valid).toBe(false);
      expect(result.certificate).toBeUndefined();
    });

    it('should handle expired certificate', async () => {
      const verificationCode = 'CERT-2020-EXPIRED';

      const expiredCert = {
        ...mockCertificate,
        expiryDate: '2024-01-01T00:00:00.000Z',
      };

      const mockResponse: VerifyCertificateResponse = {
        valid: false,
        certificate: expiredCert,
        message: 'Certificate has expired',
      };

      server.use(
        http.get(`${baseUrl}/certificates/verify/${verificationCode}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await verifyCertificate(verificationCode);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('expired');
    });
  });

  // =====================
  // LIST CERTIFICATE TEMPLATES
  // =====================

  describe('listCertificateTemplates', () => {
    it('should fetch list of templates without filters', async () => {
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

      const result = await listCertificateTemplates();

      expect(result).toEqual(mockResponse);
      expect(result.templates).toHaveLength(2);
    });

    it('should filter templates by active status', async () => {
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

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificate-templates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCertificateTemplates({ isActive: true });

      expect(result.templates.every((t) => t.isActive)).toBe(true);
      expect(capturedParams!.get('isActive')).toBe('true');
    });

    it('should filter templates by default status', async () => {
      const mockResponse: CertificateTemplatesListResponse = {
        templates: [mockTemplate],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/certificate-templates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listCertificateTemplates({ isDefault: true });

      expect(result.templates.every((t) => t.isDefault)).toBe(true);
      expect(capturedParams!.get('isDefault')).toBe('true');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listCertificateTemplates()).rejects.toThrow();
    });
  });

  // =====================
  // GET CERTIFICATE TEMPLATE
  // =====================

  describe('getCertificateTemplate', () => {
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

      const result = await getCertificateTemplate(templateId);

      expect(result).toEqual(mockTemplate);
      expect(result.id).toBe(templateId);
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(getCertificateTemplate(templateId)).rejects.toThrow();
    });
  });

  // =====================
  // CREATE CERTIFICATE TEMPLATE
  // =====================

  describe('createCertificateTemplate', () => {
    it('should create new template', async () => {
      const payload = {
        name: 'New Template',
        description: 'A new certificate template',
        html: '<div>{{learnerName}}</div>',
        variables: ['learnerName', 'courseName'],
        isDefault: false,
        isActive: true,
      };

      const newTemplate: CertificateTemplate = {
        id: 'template-3',
        ...payload,
        createdBy: 'admin-1',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/certificate-templates`, async ({ request }) => {
          capturedRequestBody = await request.json();
          return HttpResponse.json(
            {
              success: true,
              data: newTemplate,
            },
            { status: 201 }
          );
        })
      );

      const result = await createCertificateTemplate(payload);

      expect(result).toEqual(newTemplate);
      expect(capturedRequestBody).toMatchObject(payload);
    });

    it('should handle validation error', async () => {
      const payload = {
        name: '',
        description: 'Invalid template',
        html: '',
      };

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

      await expect(createCertificateTemplate(payload)).rejects.toThrow();
    });

    it('should handle duplicate name error', async () => {
      const payload = {
        name: 'Standard Certificate',
        description: 'Duplicate name',
        html: '<div>Test</div>',
      };

      server.use(
        http.post(`${baseUrl}/certificate-templates`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template name already exists',
              code: 'DUPLICATE_NAME',
            },
            { status: 409 }
          );
        })
      );

      await expect(createCertificateTemplate(payload)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE CERTIFICATE TEMPLATE
  // =====================

  describe('updateCertificateTemplate', () => {
    it('should update template', async () => {
      const templateId = 'template-2';
      const payload = {
        name: 'Updated Premium Certificate',
        description: 'Updated description',
        isActive: false,
      };

      const updatedTemplate: CertificateTemplate = {
        ...mockTemplate2,
        ...payload,
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(
          `${baseUrl}/certificate-templates/${templateId}`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: updatedTemplate,
            });
          }
        )
      );

      const result = await updateCertificateTemplate(templateId, payload);

      expect(result).toEqual(updatedTemplate);
      expect(result.name).toBe(payload.name);
      expect(result.isActive).toBe(false);
      expect(capturedRequestBody).toMatchObject(payload);
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent';
      const payload = { name: 'Updated' };

      server.use(
        http.patch(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(updateCertificateTemplate(templateId, payload)).rejects.toThrow();
    });

    it('should handle cannot update default template error', async () => {
      const templateId = 'template-1';
      const payload = { isActive: false };

      server.use(
        http.patch(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Cannot deactivate default template',
              code: 'CANNOT_MODIFY_DEFAULT',
            },
            { status: 422 }
          );
        })
      );

      await expect(updateCertificateTemplate(templateId, payload)).rejects.toThrow();
    });
  });

  // =====================
  // DELETE CERTIFICATE TEMPLATE
  // =====================

  describe('deleteCertificateTemplate', () => {
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

      await expect(deleteCertificateTemplate(templateId)).resolves.not.toThrow();
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteCertificateTemplate(templateId)).rejects.toThrow();
    });

    it('should handle cannot delete default template error', async () => {
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

      await expect(deleteCertificateTemplate(templateId)).rejects.toThrow();
    });

    it('should handle template in use error', async () => {
      const templateId = 'template-2';

      server.use(
        http.delete(`${baseUrl}/certificate-templates/${templateId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template is in use by existing certificates',
              code: 'TEMPLATE_IN_USE',
            },
            { status: 422 }
          );
        })
      );

      await expect(deleteCertificateTemplate(templateId)).rejects.toThrow();
    });
  });
});
