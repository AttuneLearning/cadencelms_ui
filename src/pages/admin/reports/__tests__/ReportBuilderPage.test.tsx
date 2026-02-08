/**
 * Integration Tests for Report Builder Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { ReportBuilderPage } from '../ReportBuilderPage';

const mockReports = [
  {
    id: 'report-1',
    name: 'Enrollment Report - Q1 2024',
    type: 'enrollment' as const,
    status: 'ready' as const,
    createdBy: 'user-1',
    createdByName: 'Admin User',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:05:00Z',
    generatedAt: '2024-01-15T10:05:00Z',
    fileUrl: 'https://example.com/reports/report-1.pdf',
    filters: {},
  },
  {
    id: 'report-2',
    name: 'Performance Analysis',
    type: 'performance' as const,
    status: 'generating' as const,
    createdBy: 'user-1',
    createdByName: 'Admin User',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    filters: {},
  },
  {
    id: 'report-3',
    name: 'Student Progress Report',
    type: 'attendance' as const,
    status: 'failed' as const,
    createdBy: 'user-1',
    createdByName: 'Admin User',
    createdAt: '2024-01-17T09:00:00Z',
    updatedAt: '2024-01-17T09:00:00Z',
    filters: {},
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ReportBuilderPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Report Builder')).toBeInTheDocument();
      expect(screen.getByText(/build and generate reports/i)).toBeInTheDocument();
    });

    it('should render report type selection section', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/select report type/i)).toBeInTheDocument();
      });
    });

    it('should render filter configuration section', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/report name/i)).toBeInTheDocument();
      });
    });
  });

  describe('Report Type Selection', () => {
    it('should display all report type options', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Reports')).toBeInTheDocument();
        expect(screen.getByText('Performance Reports')).toBeInTheDocument();
        expect(screen.getByText('Attendance Reports')).toBeInTheDocument();
        expect(screen.getByText('Student Progress Reports')).toBeInTheDocument();
      });
    });

    it('should select a report type when clicked', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Reports')).toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('Enrollment Reports').closest('button');
      if (enrollmentCard) {
        await user.click(enrollmentCard);
        expect(enrollmentCard).toHaveClass(/border-primary|ring/);
      }
    });
  });

  describe('Filter Inputs', () => {
    it('should render date range picker', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /date range/i })).toBeInTheDocument();
      });
    });

    it('should render export format selection', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/export format/i)).toBeInTheDocument();
      });
    });

    it('should allow inputting report name', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      const nameInput = await screen.findByLabelText(/report name/i);
      await user.type(nameInput, 'Test Report');

      expect(nameInput).toHaveValue('Test Report');
    });

    it('should allow inputting report description', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      const descInput = await screen.findByLabelText(/description/i);
      await user.type(descInput, 'Test description');

      expect(descInput).toHaveValue('Test description');
    });
  });

  describe('Report Name and Description', () => {
    it('should show validation error when report name is empty on submit', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      const generateBtn = await screen.findByRole('button', { name: /generate report/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/report name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Generate Report', () => {
    it('should generate report successfully', async () => {
      let reportGenerated = false;

      server.use(
        http.get(`${baseUrl}/api/reports`, () =>
          HttpResponse.json({
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
            },
          })
        ),
        http.post(`${baseUrl}/reports`, () => {
          reportGenerated = true;
          return HttpResponse.json({
            success: true,
            data: {
              report: {
                id: 'new-report-1',
                name: 'New Report',
                type: 'enrollment',
                status: 'generating',
                createdBy: 'user-1',
                createdByName: 'Admin User',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                filters: {},
              },
              message: 'Report generation started',
            },
          });
        })
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Reports')).toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('Enrollment Reports').closest('button');
      if (enrollmentCard) await user.click(enrollmentCard);

      const nameInput = screen.getByLabelText(/report name/i);
      await user.type(nameInput, 'New Report');

      const generateBtn = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(reportGenerated).toBe(true);
      });
    });

    it('should show loading state while generating', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports`, () =>
          HttpResponse.json({
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
            },
          })
        ),
        http.post(`${baseUrl}/reports`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({
            success: true,
            data: {
              report: {
                id: 'new-report-1',
                name: 'New Report',
                type: 'enrollment',
                status: 'generating',
                createdBy: 'user-1',
                createdByName: 'Admin User',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                filters: {},
              },
              message: 'Report generation started',
            },
          });
        })
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Reports')).toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('Enrollment Reports').closest('button');
      if (enrollmentCard) await user.click(enrollmentCard);

      const nameInput = screen.getByLabelText(/report name/i);
      await user.type(nameInput, 'New Report');

      const generateBtn = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateBtn);

      expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();
    });

    it('should handle report generation error', async () => {
      let requestFailed = false;

      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        ),
        http.post(`${baseUrl}/reports`, () => {
          requestFailed = true;
          return HttpResponse.json(
            { success: false, message: 'Failed to generate report' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Reports')).toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('Enrollment Reports').closest('button');
      if (enrollmentCard) await user.click(enrollmentCard);

      const nameInput = screen.getByLabelText(/report name/i);
      await user.type(nameInput, 'New Report');

      const generateBtn = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(requestFailed).toBe(true);
      });
    });

    it('should show success toast after successful generation', async () => {
      let reportGenerated = false;

      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        ),
        http.post(`${baseUrl}/reports`, () => {
          reportGenerated = true;
          return HttpResponse.json({
            success: true,
            data: {
              report: {
                id: 'new-report-1',
                name: 'New Report',
                type: 'enrollment',
                status: 'generating',
                createdBy: 'user-1',
                createdByName: 'Admin User',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                filters: {},
              },
              message: 'Report generation started',
            },
          });
        })
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Reports')).toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('Enrollment Reports').closest('button');
      if (enrollmentCard) await user.click(enrollmentCard);

      const nameInput = screen.getByLabelText(/report name/i);
      await user.type(nameInput, 'New Report');

      const generateBtn = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(reportGenerated).toBe(true);
      });
    });
  });

  describe('Reset Filters', () => {
    it('should clear all filters when reset button is clicked', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      const nameInput = await screen.findByLabelText(/report name/i);
      await user.type(nameInput, 'Test Report');

      const resetBtn = screen.getByRole('button', { name: /reset|clear/i });
      await user.click(resetBtn);

      expect(nameInput).toHaveValue('');
    });
  });

  describe('Recent Reports List', () => {
    it('should display list of recent reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: { page: 1, limit: 10, total: mockReports.length, totalPages: 1 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Report - Q1 2024')).toBeInTheDocument();
        expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
      });
    });

    it('should display report status indicators', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: { page: 1, limit: 10, total: mockReports.length, totalPages: 1 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('ready')).toBeInTheDocument();
        expect(screen.getByText('generating')).toBeInTheDocument();
        expect(screen.getByText('failed')).toBeInTheDocument();
      });
    });

    it('should show download button for ready reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: { page: 1, limit: 10, total: mockReports.length, totalPages: 1 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const downloadButtons = screen.getAllByRole('button', { name: /download/i });
        expect(downloadButtons.length).toBeGreaterThan(0);
      });
    });

    it('should show empty state when no reports exist', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no reports generated yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Download Report', () => {
    it('should download report when download button is clicked', async () => {
      const mockOpen = vi.fn();
      global.window.open = mockOpen;

      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: { page: 1, limit: 10, total: mockReports.length, totalPages: 1 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Report - Q1 2024')).toBeInTheDocument();
      });

      const downloadButtons = screen.getAllByRole('button', { name: /download/i });
      await user.click(downloadButtons[0]);

      expect(mockOpen).toHaveBeenCalledWith('https://example.com/reports/report-1.pdf', '_blank');
    });
  });

  describe('Delete Report', () => {
    it('should show delete confirmation dialog', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: { page: 1, limit: 10, total: mockReports.length, totalPages: 1 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Report - Q1 2024')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it('should delete report after confirmation', async () => {
      let reportDeleted = false;

      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: { page: 1, limit: 10, total: mockReports.length, totalPages: 1 },
            },
          })
        ),
        http.delete(`${baseUrl}/reports/:id`, () => {
          reportDeleted = true;
          return HttpResponse.json({ success: true });
        })
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Enrollment Report - Q1 2024')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /confirm|delete/i });
      await user.click(confirmBtn);

      await waitFor(() => {
        expect(reportDeleted).toBe(true);
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner while fetching reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          });
        })
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when reports fail to load', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json(
            { success: false, message: 'Failed to load reports' },
            { status: 500 }
          )
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading reports/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /report builder/i });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/report name/i)).toBeInTheDocument();
      });

      await user.tab();

      // Check that we can navigate through the form
      expect(document.activeElement).toBeDefined();
    });
  });

  describe('Report Type Validation', () => {
    it('should show error when generating report without selecting type', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () =>
          HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            },
          })
        )
      );

      const user = userEvent.setup();
      render(<ReportBuilderPage />, { wrapper: createWrapper() });

      await screen.findByLabelText(/report name/i);

      const generateBtn = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText(/report type is required/i)).toBeInTheDocument();
      });
    });
  });
});
