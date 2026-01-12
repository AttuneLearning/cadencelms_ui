/**
 * Tests for Report API Client
 * Tests all report and report template management endpoints
 * Following TDD approach - write tests first, then implement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  listReports,
  getReport,
  createReport,
  deleteReport,
  downloadReport,
  listReportTemplates,
  getReportTemplate,
  createReportTemplate,
  updateReportTemplate,
  deleteReportTemplate,
} from '../reportApi';
import type {
  ReportsListResponse,
  Report,
  GenerateReportResponse,
  DownloadReportResponse,
  ReportTemplatesListResponse,
  ReportTemplate,
} from '../../model/types';

describe('reportApi', () => {
  const baseUrl = env.apiBaseUrl; // Already includes /api/v2

  // Mock data
  const mockReport: Report = {
    id: 'report-1',
    name: 'Q4 2025 Enrollment Report',
    description: 'Quarterly enrollment statistics',
    type: 'enrollment',
    filters: {
      dateRange: {
        start: '2025-10-01',
        end: '2025-12-31',
      },
      departments: ['engineering', 'business'],
    },
    status: 'ready',
    fileUrl: 'https://cdn.example.com/reports/report-1.pdf',
    createdBy: 'admin-1',
    createdByName: 'John Admin',
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-08T00:00:00.000Z',
    generatedAt: '2026-01-08T00:05:00.000Z',
    rowCount: 150,
  };

  const mockReport2: Report = {
    id: 'report-2',
    name: 'Course Completion Analysis',
    description: 'Analysis of course completion rates',
    type: 'completion',
    filters: {
      dateRange: {
        start: '2025-01-01',
        end: '2025-12-31',
      },
      courses: ['course-1', 'course-2'],
    },
    status: 'generating',
    createdBy: 'admin-1',
    createdByName: 'John Admin',
    createdAt: '2026-01-09T00:00:00.000Z',
    updatedAt: '2026-01-09T00:00:00.000Z',
  };

  const mockTemplate: ReportTemplate = {
    id: 'template-1',
    name: 'Standard Enrollment Report',
    description: 'Default template for enrollment reports',
    type: 'enrollment',
    defaultFilters: {
      dateRange: {
        start: '2025-01-01',
        end: '2025-12-31',
      },
    },
    columns: ['learnerName', 'courseName', 'enrollmentDate', 'status'],
    isDefault: true,
    isShared: true,
    createdBy: 'admin-1',
    createdByName: 'John Admin',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  const mockTemplate2: ReportTemplate = {
    id: 'template-2',
    name: 'Performance Dashboard',
    description: 'Performance metrics template',
    type: 'performance',
    defaultFilters: {
      minGrade: 70,
    },
    columns: ['learnerName', 'courseName', 'grade', 'completionDate'],
    isDefault: false,
    isShared: true,
    createdBy: 'admin-1',
    createdByName: 'John Admin',
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
  // LIST REPORTS
  // =====================

  describe('listReports', () => {
    it('should fetch paginated list of reports without filters', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport, mockReport2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReports();

      expect(result).toEqual(mockResponse);
      expect(result.reports).toHaveLength(2);
    });

    it('should fetch reports with pagination params', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 1,
          total: 2,
          totalPages: 2,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReports({ page: 1, limit: 1 });

      expect(result).toEqual(mockResponse);
      expect(capturedParams).not.toBeNull();
      expect(capturedParams!.get('page')).toBe('1');
      expect(capturedParams!.get('limit')).toBe('1');
    });

    it('should filter reports by type', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReports({ type: 'enrollment' });

      expect(result.reports.every((r) => r.type === 'enrollment')).toBe(true);
      expect(capturedParams!.get('type')).toBe('enrollment');
    });

    it('should filter reports by status', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReports({ status: 'ready' });

      expect(result.reports.every((r) => r.status === 'ready')).toBe(true);
      expect(capturedParams!.get('status')).toBe('ready');
    });

    it('should filter reports by creator', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport, mockReport2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReports({ createdBy: 'admin-1' });

      expect(result.reports.every((r) => r.createdBy === 'admin-1')).toBe(true);
      expect(capturedParams!.get('createdBy')).toBe('admin-1');
    });

    it('should filter reports by date range', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReports({
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      });

      expect(result.reports).toHaveLength(1);
      expect(capturedParams!.get('dateFrom')).toBe('2026-01-01');
      expect(capturedParams!.get('dateTo')).toBe('2026-01-31');
    });

    it('should search reports', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await listReports({ search: 'Enrollment' });

      expect(capturedParams!.get('search')).toBe('Enrollment');
    });

    it('should sort reports', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport2, mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/reports`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      await listReports({ sort: '-createdAt' });

      expect(capturedParams!.get('sort')).toBe('-createdAt');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listReports()).rejects.toThrow();
    });
  });

  // =====================
  // GET REPORT
  // =====================

  describe('getReport', () => {
    it('should fetch single report by ID', async () => {
      const reportId = 'report-1';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockReport,
          });
        })
      );

      const result = await getReport(reportId);

      expect(result).toEqual(mockReport);
      expect(result.id).toBe(reportId);
      expect(result.status).toBe('ready');
    });

    it('should handle report not found error', async () => {
      const reportId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Report not found' },
            { status: 404 }
          );
        })
      );

      await expect(getReport(reportId)).rejects.toThrow();
    });

    it('should handle unauthorized access', async () => {
      const reportId = 'report-1';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(getReport(reportId)).rejects.toThrow();
    });
  });

  // =====================
  // CREATE REPORT
  // =====================

  describe('createReport', () => {
    it('should create report with basic payload', async () => {
      const payload = {
        name: 'New Report',
        type: 'enrollment' as const,
        filters: {
          dateRange: {
            start: '2026-01-01',
            end: '2026-01-31',
          },
        },
      };

      const mockResponse: GenerateReportResponse = {
        report: { ...mockReport, ...payload, id: 'report-3', status: 'pending' as const },
        message: 'Report generation started',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/reports`, async ({ request }) => {
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

      const result = await createReport(payload);

      expect(result).toEqual(mockResponse);
      expect(result.report.name).toBe('New Report');
      expect(capturedRequestBody).toMatchObject(payload);
    });

    it('should create report with template', async () => {
      const payload = {
        name: 'Report from Template',
        type: 'enrollment' as const,
        filters: {},
        templateId: 'template-1',
      };

      const mockResponse: GenerateReportResponse = {
        report: { ...mockReport, ...payload, id: 'report-4', status: 'pending' as const },
        message: 'Report generation started',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/reports`, async ({ request }) => {
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

      const result = await createReport(payload);

      expect(result.report.id).toBeDefined();
      expect(capturedRequestBody.templateId).toBe('template-1');
    });

    it('should create report with description', async () => {
      const payload = {
        name: 'Detailed Report',
        description: 'A detailed analysis report',
        type: 'performance' as const,
        filters: {
          minGrade: 80,
        },
      };

      const mockResponse: GenerateReportResponse = {
        report: { ...mockReport, ...payload, id: 'report-5', status: 'pending' as const },
        message: 'Report generation started',
      };

      server.use(
        http.post(`${baseUrl}/reports`, async ({ request }) => {
          return HttpResponse.json(
            {
              success: true,
              data: mockResponse,
            },
            { status: 201 }
          );
        })
      );

      const result = await createReport(payload);

      expect(result.report.description).toBe('A detailed analysis report');
    });

    it('should handle validation error', async () => {
      const payload = {
        name: '',
        type: 'enrollment' as const,
        filters: {},
      };

      server.use(
        http.post(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Validation error: name is required',
              code: 'VALIDATION_ERROR',
            },
            { status: 422 }
          );
        })
      );

      await expect(createReport(payload)).rejects.toThrow();
    });

    it('should handle template not found error', async () => {
      const payload = {
        name: 'Report',
        type: 'enrollment' as const,
        filters: {},
        templateId: 'non-existent',
      };

      server.use(
        http.post(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(createReport(payload)).rejects.toThrow();
    });
  });

  // =====================
  // DELETE REPORT
  // =====================

  describe('deleteReport', () => {
    it('should delete report', async () => {
      const reportId = 'report-1';

      server.use(
        http.delete(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Report deleted successfully',
          });
        })
      );

      await expect(deleteReport(reportId)).resolves.not.toThrow();
    });

    it('should handle report not found error', async () => {
      const reportId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Report not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteReport(reportId)).rejects.toThrow();
    });

    it('should handle unauthorized deletion', async () => {
      const reportId = 'report-1';

      server.use(
        http.delete(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 403 }
          );
        })
      );

      await expect(deleteReport(reportId)).rejects.toThrow();
    });
  });

  // =====================
  // DOWNLOAD REPORT
  // =====================

  describe('downloadReport', () => {
    it('should get download URL for PDF', async () => {
      const reportId = 'report-1';
      const format = 'pdf';

      const mockResponse: DownloadReportResponse = {
        url: 'https://cdn.example.com/reports/report-1.pdf',
      };

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('format')).toBe(format);
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await downloadReport(reportId, format);

      expect(result).toEqual(mockResponse);
      expect(result.url).toContain('.pdf');
    });

    it('should get download URL for Excel', async () => {
      const reportId = 'report-1';
      const format = 'excel';

      const mockResponse: DownloadReportResponse = {
        url: 'https://cdn.example.com/reports/report-1.xlsx',
      };

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, ({ request }) => {
          const url = new URL(request.url);
          expect(url.searchParams.get('format')).toBe(format);
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await downloadReport(reportId, format);

      expect(result.url).toContain('.xlsx');
    });

    it('should get download URL for CSV', async () => {
      const reportId = 'report-1';
      const format = 'csv';

      const mockResponse: DownloadReportResponse = {
        url: 'https://cdn.example.com/reports/report-1.csv',
      };

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await downloadReport(reportId, format);

      expect(result.url).toContain('.csv');
    });

    it('should handle report not ready error', async () => {
      const reportId = 'report-2';
      const format = 'pdf';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Report is not ready yet',
              code: 'REPORT_NOT_READY',
            },
            { status: 422 }
          );
        })
      );

      await expect(downloadReport(reportId, format)).rejects.toThrow();
    });

    it('should handle report not found error', async () => {
      const reportId = 'non-existent';
      const format = 'pdf';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, () => {
          return HttpResponse.json(
            { success: false, message: 'Report not found' },
            { status: 404 }
          );
        })
      );

      await expect(downloadReport(reportId, format)).rejects.toThrow();
    });
  });

  // =====================
  // LIST REPORT TEMPLATES
  // =====================

  describe('listReportTemplates', () => {
    it('should fetch list of templates without filters', async () => {
      const mockResponse: ReportTemplatesListResponse = {
        templates: [mockTemplate, mockTemplate2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReportTemplates();

      expect(result).toEqual(mockResponse);
      expect(result.templates).toHaveLength(2);
    });

    it('should filter templates by type', async () => {
      const mockResponse: ReportTemplatesListResponse = {
        templates: [mockTemplate],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/report-templates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReportTemplates({ type: 'enrollment' });

      expect(result.templates.every((t) => t.type === 'enrollment')).toBe(true);
      expect(capturedParams!.get('type')).toBe('enrollment');
    });

    it('should filter templates by default status', async () => {
      const mockResponse: ReportTemplatesListResponse = {
        templates: [mockTemplate],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/report-templates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReportTemplates({ isDefault: true });

      expect(result.templates.every((t) => t.isDefault)).toBe(true);
      expect(capturedParams!.get('isDefault')).toBe('true');
    });

    it('should filter templates by shared status', async () => {
      const mockResponse: ReportTemplatesListResponse = {
        templates: [mockTemplate, mockTemplate2],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      let capturedParams: URLSearchParams | null = null;

      server.use(
        http.get(`${baseUrl}/report-templates`, ({ request }) => {
          capturedParams = new URL(request.url).searchParams;
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const result = await listReportTemplates({ isShared: true });

      expect(result.templates.every((t) => t.isShared)).toBe(true);
      expect(capturedParams!.get('isShared')).toBe('true');
    });

    it('should handle API error', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(listReportTemplates()).rejects.toThrow();
    });
  });

  // =====================
  // GET REPORT TEMPLATE
  // =====================

  describe('getReportTemplate', () => {
    it('should fetch single template by ID', async () => {
      const templateId = 'template-1';

      server.use(
        http.get(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json({
            success: true,
            data: mockTemplate,
          });
        })
      );

      const result = await getReportTemplate(templateId);

      expect(result).toEqual(mockTemplate);
      expect(result.id).toBe(templateId);
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(getReportTemplate(templateId)).rejects.toThrow();
    });
  });

  // =====================
  // CREATE REPORT TEMPLATE
  // =====================

  describe('createReportTemplate', () => {
    it('should create new template', async () => {
      const payload = {
        name: 'New Template',
        description: 'A new report template',
        type: 'custom' as const,
        defaultFilters: {},
        columns: ['col1', 'col2'],
      };

      const newTemplate: ReportTemplate = {
        id: 'template-3',
        ...payload,
        isDefault: false,
        isShared: false,
        createdBy: 'admin-1',
        createdByName: 'John Admin',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.post(`${baseUrl}/report-templates`, async ({ request }) => {
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

      const result = await createReportTemplate(payload);

      expect(result).toEqual(newTemplate);
      expect(capturedRequestBody).toMatchObject(payload);
    });

    it('should create template with default and shared flags', async () => {
      const payload = {
        name: 'Shared Default Template',
        description: 'A shared default template',
        type: 'enrollment' as const,
        defaultFilters: {},
        columns: ['col1'],
        isDefault: true,
        isShared: true,
      };

      const newTemplate: ReportTemplate = {
        id: 'template-4',
        ...payload,
        createdBy: 'admin-1',
        createdByName: 'John Admin',
        createdAt: '2026-01-09T00:00:00.000Z',
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      server.use(
        http.post(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: newTemplate,
            },
            { status: 201 }
          );
        })
      );

      const result = await createReportTemplate(payload);

      expect(result.isDefault).toBe(true);
      expect(result.isShared).toBe(true);
    });

    it('should handle validation error', async () => {
      const payload = {
        name: '',
        description: 'Invalid',
        type: 'enrollment' as const,
        defaultFilters: {},
        columns: [],
      };

      server.use(
        http.post(`${baseUrl}/report-templates`, () => {
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

      await expect(createReportTemplate(payload)).rejects.toThrow();
    });

    it('should handle duplicate name error', async () => {
      const payload = {
        name: 'Standard Enrollment Report',
        description: 'Duplicate',
        type: 'enrollment' as const,
        defaultFilters: {},
        columns: ['col1'],
      };

      server.use(
        http.post(`${baseUrl}/report-templates`, () => {
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

      await expect(createReportTemplate(payload)).rejects.toThrow();
    });
  });

  // =====================
  // UPDATE REPORT TEMPLATE
  // =====================

  describe('updateReportTemplate', () => {
    it('should update template', async () => {
      const templateId = 'template-2';
      const payload = {
        name: 'Updated Performance Dashboard',
        description: 'Updated description',
      };

      const updatedTemplate: ReportTemplate = {
        ...mockTemplate2,
        ...payload,
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      let capturedRequestBody: any = null;

      server.use(
        http.patch(
          `${baseUrl}/report-templates/${templateId}`,
          async ({ request }) => {
            capturedRequestBody = await request.json();
            return HttpResponse.json({
              success: true,
              data: updatedTemplate,
            });
          }
        )
      );

      const result = await updateReportTemplate(templateId, payload);

      expect(result).toEqual(updatedTemplate);
      expect(result.name).toBe(payload.name);
      expect(capturedRequestBody).toMatchObject(payload);
    });

    it('should update template columns', async () => {
      const templateId = 'template-2';
      const payload = {
        columns: ['col1', 'col2', 'col3'],
      };

      const updatedTemplate: ReportTemplate = {
        ...mockTemplate2,
        columns: payload.columns,
        updatedAt: '2026-01-09T00:00:00.000Z',
      };

      server.use(
        http.patch(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json({
            success: true,
            data: updatedTemplate,
          });
        })
      );

      const result = await updateReportTemplate(templateId, payload);

      expect(result.columns).toEqual(payload.columns);
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent';
      const payload = { name: 'Updated' };

      server.use(
        http.patch(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(updateReportTemplate(templateId, payload)).rejects.toThrow();
    });
  });

  // =====================
  // DELETE REPORT TEMPLATE
  // =====================

  describe('deleteReportTemplate', () => {
    it('should delete template', async () => {
      const templateId = 'template-2';

      server.use(
        http.delete(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Template deleted successfully',
          });
        })
      );

      await expect(deleteReportTemplate(templateId)).resolves.not.toThrow();
    });

    it('should handle template not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      await expect(deleteReportTemplate(templateId)).rejects.toThrow();
    });

    it('should handle cannot delete default template error', async () => {
      const templateId = 'template-1';

      server.use(
        http.delete(`${baseUrl}/report-templates/${templateId}`, () => {
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

      await expect(deleteReportTemplate(templateId)).rejects.toThrow();
    });

    it('should handle template in use error', async () => {
      const templateId = 'template-1';

      server.use(
        http.delete(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Template is in use by existing reports',
              code: 'TEMPLATE_IN_USE',
            },
            { status: 422 }
          );
        })
      );

      await expect(deleteReportTemplate(templateId)).rejects.toThrow();
    });
  });
});
