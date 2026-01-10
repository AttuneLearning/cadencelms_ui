/**
 * Tests for Report React Query Hooks
 * Following TDD approach - write tests first, then implement
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import {
  useReports,
  useReport,
  useCreateReport,
  useDeleteReport,
  useDownloadReport,
  useReportTemplates,
  useReportTemplate,
  useCreateReportTemplate,
  useUpdateReportTemplate,
  useDeleteReportTemplate,
} from '../useReports';
import type {
  ReportsListResponse,
  Report,
  GenerateReportResponse,
  DownloadReportResponse,
  ReportTemplatesListResponse,
  ReportTemplate,
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

describe('Report Hooks', () => {
  const baseUrl = env.apiBaseUrl;

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
  // QUERY HOOKS - REPORTS
  // =====================

  describe('useReports', () => {
    it('should fetch list of reports', async () => {
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

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.reports).toHaveLength(2);
    });

    it('should fetch reports with filters', async () => {
      const filters = { type: 'enrollment' as const, page: 1, limit: 10 };
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
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

      const { result } = renderHook(() => useReports(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.reports.every((r) => r.type === 'enrollment')).toBe(true);
    });

    it('should filter by status', async () => {
      const filters = { status: 'ready' as const };
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
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

      const { result } = renderHook(() => useReports(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.reports.every((r) => r.status === 'ready')).toBe(true);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should use correct stale time', async () => {
      const mockResponse: ReportsListResponse = {
        reports: [mockReport],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
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

      const { result } = renderHook(() => useReports(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });
  });

  describe('useReport', () => {
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

      const { result } = renderHook(() => useReport(reportId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockReport);
      expect(result.current.data?.status).toBe('ready');
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useReport(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error', async () => {
      const reportId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Report not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useReport(reportId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useDownloadReport', () => {
    it('should fetch download URL', async () => {
      const reportId = 'report-1';
      const format = 'pdf';

      const mockResponse: DownloadReportResponse = {
        url: 'https://cdn.example.com/reports/report-1.pdf',
      };

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, () => {
          return HttpResponse.json({
            success: true,
            data: mockResponse,
          });
        })
      );

      const { result } = renderHook(() => useDownloadReport(reportId, format), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.url).toContain('.pdf');
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useDownloadReport('', 'pdf'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle report not ready error', async () => {
      const reportId = 'report-2';
      const format = 'pdf';

      server.use(
        http.get(`${baseUrl}/reports/${reportId}/download`, () => {
          return HttpResponse.json(
            { success: false, message: 'Report is not ready yet' },
            { status: 422 }
          );
        })
      );

      const { result } = renderHook(() => useDownloadReport(reportId, format), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // =====================
  // QUERY HOOKS - TEMPLATES
  // =====================

  describe('useReportTemplates', () => {
    it('should fetch list of templates', async () => {
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

      const { result } = renderHook(() => useReportTemplates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.templates).toHaveLength(2);
    });

    it('should fetch templates with filters', async () => {
      const filters = { type: 'enrollment' as const };
      const mockResponse: ReportTemplatesListResponse = {
        templates: [mockTemplate],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
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

      const { result } = renderHook(() => useReportTemplates(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.templates.every((t) => t.type === 'enrollment')).toBe(true);
    });

    it('should filter by default status', async () => {
      const filters = { isDefault: true };
      const mockResponse: ReportTemplatesListResponse = {
        templates: [mockTemplate],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
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

      const { result } = renderHook(() => useReportTemplates(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.templates.every((t) => t.isDefault)).toBe(true);
    });

    it('should handle error', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useReportTemplates(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useReportTemplate', () => {
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

      const { result } = renderHook(() => useReportTemplate(templateId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTemplate);
    });

    it('should not fetch when ID is empty', () => {
      const { result } = renderHook(() => useReportTemplate(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(result.current.data).toBeUndefined();
    });

    it('should handle error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.get(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useReportTemplate(templateId), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // =====================
  // MUTATION HOOKS - REPORTS
  // =====================

  describe('useCreateReport', () => {
    it('should create report', async () => {
      const mockResponse: GenerateReportResponse = {
        report: mockReport,
        message: 'Report generation started',
      };

      server.use(
        http.post(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: mockResponse,
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useCreateReport(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New Report',
        type: 'enrollment',
        filters: {},
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.report.name).toBe('Q4 2025 Enrollment Report');
    });

    it('should create report with template', async () => {
      const mockResponse: GenerateReportResponse = {
        report: { ...mockReport, id: 'report-3' },
        message: 'Report generation started',
      };

      server.use(
        http.post(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            {
              success: true,
              data: mockResponse,
            },
            { status: 201 }
          );
        })
      );

      const { result } = renderHook(() => useCreateReport(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'Report from Template',
        type: 'enrollment',
        filters: {},
        templateId: 'template-1',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.report.id).toBeDefined();
    });

    it('should handle generation error', async () => {
      server.use(
        http.post(`${baseUrl}/reports`, () => {
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

      const { result } = renderHook(() => useCreateReport(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: '',
        type: 'enrollment',
        filters: {},
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useDeleteReport', () => {
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

      const { result } = renderHook(() => useDeleteReport(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(reportId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should handle not found error', async () => {
      const reportId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Report not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteReport(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(reportId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle unauthorized error', async () => {
      const reportId = 'report-1';

      server.use(
        http.delete(`${baseUrl}/reports/${reportId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Unauthorized' },
            { status: 403 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteReport(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(reportId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // =====================
  // MUTATION HOOKS - TEMPLATES
  // =====================

  describe('useCreateReportTemplate', () => {
    it('should create template', async () => {
      const newTemplate: ReportTemplate = {
        id: 'template-3',
        name: 'New Template',
        description: 'A new report template',
        type: 'custom',
        defaultFilters: {},
        columns: ['col1', 'col2'],
        isDefault: false,
        isShared: false,
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

      const { result } = renderHook(() => useCreateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'New Template',
        description: 'A new report template',
        type: 'custom',
        defaultFilters: {},
        columns: ['col1', 'col2'],
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(newTemplate);
    });

    it('should handle validation error', async () => {
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

      const { result } = renderHook(() => useCreateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: '',
        description: 'Invalid',
        type: 'enrollment',
        defaultFilters: {},
        columns: [],
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle duplicate name error', async () => {
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

      const { result } = renderHook(() => useCreateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: 'Standard Enrollment Report',
        description: 'Duplicate',
        type: 'enrollment',
        defaultFilters: {},
        columns: ['col1'],
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useUpdateReportTemplate', () => {
    it('should update template', async () => {
      const templateId = 'template-2';
      const updatedTemplate: ReportTemplate = {
        ...mockTemplate2,
        name: 'Updated Performance Dashboard',
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

      const { result } = renderHook(() => useUpdateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: templateId,
        payload: {
          name: 'Updated Performance Dashboard',
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(updatedTemplate);
      expect(result.current.data?.name).toBe('Updated Performance Dashboard');
    });

    it('should update template columns', async () => {
      const templateId = 'template-2';
      const updatedTemplate: ReportTemplate = {
        ...mockTemplate2,
        columns: ['col1', 'col2', 'col3'],
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

      const { result } = renderHook(() => useUpdateReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        id: templateId,
        payload: {
          columns: ['col1', 'col2', 'col3'],
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.columns).toEqual(['col1', 'col2', 'col3']);
    });

    it('should handle not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.patch(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useUpdateReportTemplate(), {
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

  describe('useDeleteReportTemplate', () => {
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

      const { result } = renderHook(() => useDeleteReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });

    it('should handle not found error', async () => {
      const templateId = 'non-existent';

      server.use(
        http.delete(`${baseUrl}/report-templates/${templateId}`, () => {
          return HttpResponse.json(
            { success: false, message: 'Template not found' },
            { status: 404 }
          );
        })
      );

      const { result } = renderHook(() => useDeleteReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should handle cannot delete default error', async () => {
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

      const { result } = renderHook(() => useDeleteReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
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

      const { result } = renderHook(() => useDeleteReportTemplate(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(templateId);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
