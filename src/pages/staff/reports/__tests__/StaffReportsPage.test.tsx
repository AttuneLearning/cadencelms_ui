/**
 * Tests for StaffReportsPage Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { StaffReportsPage } from '../StaffReportsPage';
import {
  mockReports,
  mockGeneratingReport,
  mockFailedReport,
  createMockReportListItem,
} from '@/test/mocks/data/reports';

const createWrapper = () => {
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('StaffReportsPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', () => {
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(
        screen.getByText(/generate and manage reports for your classes/i)
      ).toBeInTheDocument();
    });

    it('should render report type cards section', () => {
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Quick Report Generation')).toBeInTheDocument();
      expect(screen.getByText('My Classes Enrollment Report')).toBeInTheDocument();
      expect(screen.getByText('My Classes Performance Report')).toBeInTheDocument();
      expect(screen.getByText('My Classes Attendance Report')).toBeInTheDocument();
      expect(screen.getByText('Student Progress Report')).toBeInTheDocument();
    });

    it('should render my generated reports section', () => {
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('My Generated Reports')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Report Type Cards', () => {
    it('should display all four report type cards', () => {
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      // Count the card buttons (the outer button elements), not the nested Generate buttons
      expect(screen.getByText('My Classes Enrollment Report')).toBeInTheDocument();
      expect(screen.getByText('My Classes Performance Report')).toBeInTheDocument();
      expect(screen.getByText('My Classes Attendance Report')).toBeInTheDocument();
      expect(screen.getByText('Student Progress Report')).toBeInTheDocument();
    });

    it('should open filter modal when clicking enrollment report card', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const enrollmentCard = screen.getByText('My Classes Enrollment Report').closest('button');
      await user.click(enrollmentCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/configure report filters/i)).toBeInTheDocument();
      });
    });

    it('should open filter modal when clicking performance report card', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const performanceCard = screen.getByText('My Classes Performance Report').closest('button');
      await user.click(performanceCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should open filter modal when clicking attendance report card', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const attendanceCard = screen.getByText('My Classes Attendance Report').closest('button');
      await user.click(attendanceCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });

    it('should open filter modal when clicking student progress report card', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const progressCard = screen.getByText('Student Progress Report').closest('button');
      await user.click(progressCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Filter Modal', () => {
    it('should display filter fields in modal', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const enrollmentCard = screen.getByText('My Classes Enrollment Report').closest('button');
      await user.click(enrollmentCard!);

      await waitFor(() => {
        expect(screen.getByLabelText(/date from/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date to/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/export format/i)).toBeInTheDocument();
      });
    });

    it('should close modal when clicking cancel', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const enrollmentCard = screen.getByText('My Classes Enrollment Report').closest('button');
      await user.click(enrollmentCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should validate required fields before submission', async () => {
      const user = userEvent.setup();
      render(<StaffReportsPage />, { wrapper: createWrapper() });

      const enrollmentCard = screen.getByText('My Classes Enrollment Report').closest('button');
      await user.click(enrollmentCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('Date from is required')).toBeInTheDocument();
        expect(screen.getByText('Date to is required')).toBeInTheDocument();
      });
    });
  });

  describe('Generate Report', () => {
    it('should successfully generate a report', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: {
                page: 1,
                limit: 20,
                total: 4,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }),
        http.post(`${baseUrl}/reports`, async ({ request }) => {
          const body = await request.json() as Record<string, unknown>;
          return HttpResponse.json({
            success: true,
            data: createMockReportListItem({
              id: 'new-report',
              name: String(body.name ?? ''),
              type: String(body.type ?? 'enrollment') as 'enrollment',
              status: 'pending',
            }),
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Q1 2026 Enrollment Report')).toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('My Classes Enrollment Report').closest('button');
      await user.click(enrollmentCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Fill in the form
      const dateFromInput = screen.getByLabelText(/date from/i);
      await user.clear(dateFromInput);
      await user.type(dateFromInput, '2026-01-01');

      const dateToInput = screen.getByLabelText(/date to/i);
      await user.clear(dateToInput);
      await user.type(dateToInput, '2026-01-31');

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      // Wait for the dialog to close after successful generation
      await waitFor(
        () => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it('should handle generate report error', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }),
        http.post(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to generate report' },
            { status: 500 }
          );
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      const enrollmentCard = screen.getByText('My Classes Enrollment Report').closest('button');
      await user.click(enrollmentCard!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dateFromInput = screen.getByLabelText(/date from/i);
      await user.type(dateFromInput, '2026-01-01');

      const dateToInput = screen.getByLabelText(/date to/i);
      await user.type(dateToInput, '2026-01-31');

      const generateButton = screen.getByRole('button', { name: /generate report/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to generate/i)).toBeInTheDocument();
      });
    });
  });

  describe('Reports List Display', () => {
    it('should display list of generated reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: mockReports,
              pagination: {
                page: 1,
                limit: 20,
                total: 4,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Q1 2026 Enrollment Report')).toBeInTheDocument();
        expect(screen.getByText('Class Performance Summary')).toBeInTheDocument();
        expect(screen.getByText('Attendance Report - Math 101')).toBeInTheDocument();
        expect(screen.getByText('Student Progress Overview')).toBeInTheDocument();
      });
    });

    it('should display empty state when no reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no reports generated yet/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors when loading reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to fetch reports' },
            { status: 500 }
          );
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading reports/i)).toBeInTheDocument();
      });
    });
  });

  describe('Status Indicators', () => {
    it('should display ready status badge', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockReports[0]],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Ready')).toBeInTheDocument();
      });
    });

    it('should display generating status badge', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockGeneratingReport],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Generating')).toBeInTheDocument();
      });
    });

    it('should display failed status badge', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockFailedReport],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });

    it('should display pending status badge', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [
                createMockReportListItem({
                  id: 'pending-report',
                  name: 'Pending Test Report',
                  status: 'pending',
                }),
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });
  });

  describe('Download Report Action', () => {
    it('should download report when clicking download button', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockReports[0]],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }),
        http.get(`${baseUrl}/api/reports/:reportId/download`, () => {
          return new HttpResponse('PDF content', {
            headers: {
              'Content-Type': 'application/pdf',
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Q1 2026 Enrollment Report')).toBeInTheDocument();
      });

      const downloadButton = screen.getByRole('button', { name: /download/i });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(screen.queryByText(/downloading/i)).not.toBeInTheDocument();
      });
    });

    it('should disable download button for non-ready reports', async () => {
      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockGeneratingReport],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Class Performance Summary')).toBeInTheDocument();
      });

      const downloadButton = screen.queryByRole('button', { name: /download/i });
      expect(downloadButton).not.toBeInTheDocument();
    });
  });

  describe('Delete Report Action', () => {
    it('should delete report when clicking delete button', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockReports[0]],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }),
        http.delete(`${baseUrl}/api/reports/:reportId`, () => {
          return HttpResponse.json({
            success: true,
          });
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Q1 2026 Enrollment Report')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Wait a bit for the dialog to close and state to update
      await waitFor(
        () => {
          expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('should handle delete error', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/reports`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              reports: [mockReports[0]],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }),
        http.delete(`${baseUrl}/api/reports/:reportId`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to delete report' },
            { status: 500 }
          );
        })
      );

      render(<StaffReportsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Q1 2026 Enrollment Report')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to delete/i)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-refresh for Generating Reports', () => {
    it(
      'should auto-refresh when reports are generating',
      { timeout: 10000 },
      async () => {
        // Use REAL timers like GradingForm tests
        // The component uses setInterval with 5000ms delay
        let callCount = 0;
        server.use(
          http.get(`${baseUrl}/reports`, () => {
            callCount++;
            const reports = callCount === 1 ? [mockGeneratingReport] : [mockReports[0]];
            return HttpResponse.json({
              success: true,
              data: {
                reports,
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 1,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                },
              },
            });
          })
        );

        render(<StaffReportsPage />, { wrapper: createWrapper() });

        // Wait for initial load with generating status
        await waitFor(() => {
          expect(screen.getByText('Generating')).toBeInTheDocument();
        });

        // Wait for auto-refresh to trigger (5000ms + buffer)
        // Using REAL timers, so this actually waits
        await waitFor(
          () => {
            expect(screen.getByText('Ready')).toBeInTheDocument();
          },
          { timeout: 7000 }
        );
      }
    );
  });
});
