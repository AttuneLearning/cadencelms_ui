/**
 * Integration Tests for Report Viewer Page
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { ReportViewerPage } from '../ReportViewerPage';
import {
  mockReadyReport,
  mockGeneratingReport,
  mockFailedReport,
  mockPendingReport,
} from '@/test/mocks/data/reports';
import type { Report } from '@/entities/report';

// Mock the ConfirmDialog component
vi.mock('@/shared/ui/confirm-dialog', () => ({
  ConfirmDialog: ({ open, onConfirm, title, confirmText }: any) => {
    if (!open) return null;
    return (
      <div data-testid="confirm-dialog">
        <div>{title}</div>
        <button onClick={onConfirm}>{confirmText}</button>
      </div>
    );
  },
}));

const createWrapper = (initialRoute: string) => {
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
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/admin/reports/:reportId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ReportViewerPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Page Rendering - Ready Report', () => {
    it('should render report metadata for ready report', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(mockReadyReport.name)).toBeInTheDocument();
        expect(screen.getByText(/enrollment/i)).toBeInTheDocument();
        expect(screen.getByText(/ready/i)).toBeInTheDocument();
      });
    });

    it('should display report description', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        if (mockReadyReport.description) {
          expect(screen.getByText(mockReadyReport.description)).toBeInTheDocument();
        }
      });
    });

    it('should display report type badge', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(mockReadyReport.type)).toBeInTheDocument();
      });
    });

    it('should display status indicator', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/ready/i)).toBeInTheDocument();
      });
    });

    it('should display created by and date', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        expect(screen.getByText(/jan/i)).toBeInTheDocument();
      });
    });

    it('should display row count', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/150.*rows/i)).toBeInTheDocument();
      });
    });

    it('should display applied filters summary', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/filters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Download Actions - Ready Report', () => {
    it('should display download PDF button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /pdf/i })).toBeInTheDocument();
      });
    });

    it('should display download Excel button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /excel/i })).toBeInTheDocument();
      });
    });

    it('should display download CSV button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /csv/i })).toBeInTheDocument();
      });
    });

    it('should download PDF when PDF button is clicked', async () => {
      const user = userEvent.setup();
      let downloadCalled = false;

      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        }),
        http.get(`${baseUrl}/api/reports/report-1/download`, () => {
          downloadCalled = true;
          return HttpResponse.arrayBuffer(new ArrayBuffer(0));
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const pdfButton = await screen.findByRole('button', { name: /pdf/i });
      await user.click(pdfButton);

      await waitFor(() => {
        expect(downloadCalled).toBe(true);
      });
    });

    it('should download Excel when Excel button is clicked', async () => {
      const user = userEvent.setup();
      let downloadCalled = false;

      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        }),
        http.get(`${baseUrl}/api/reports/report-1/download`, () => {
          downloadCalled = true;
          return HttpResponse.arrayBuffer(new ArrayBuffer(0));
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const excelButton = await screen.findByRole('button', { name: /excel/i });
      await user.click(excelButton);

      await waitFor(() => {
        expect(downloadCalled).toBe(true);
      });
    });

    it('should download CSV when CSV button is clicked', async () => {
      const user = userEvent.setup();
      let downloadCalled = false;

      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        }),
        http.get(`${baseUrl}/api/reports/report-1/download`, () => {
          downloadCalled = true;
          return HttpResponse.arrayBuffer(new ArrayBuffer(0));
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const csvButton = await screen.findByRole('button', { name: /csv/i });
      await user.click(csvButton);

      await waitFor(() => {
        expect(downloadCalled).toBe(true);
      });
    });
  });

  describe('Generating Status', () => {
    it('should display generating status indicator', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-2`, () => {
          return HttpResponse.json(mockGeneratingReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-2');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/generating/i)).toBeInTheDocument();
      });
    });

    it('should display progress indicator', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-2`, () => {
          return HttpResponse.json(mockGeneratingReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-2');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should auto-refresh every 5 seconds', async () => {
      let fetchCount = 0;

      server.use(
        http.get(`${baseUrl}/api/reports/report-2`, () => {
          fetchCount++;
          return HttpResponse.json(mockGeneratingReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-2');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(0);
      });

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(fetchCount).toBeGreaterThan(1);
      });
    });

    it('should not display download buttons when generating', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-2`, () => {
          return HttpResponse.json(mockGeneratingReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-2');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /pdf/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /excel/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /csv/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Failed Status', () => {
    it('should display failed status indicator', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-4`, () => {
          return HttpResponse.json(mockFailedReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-4');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/failed/i)).toBeInTheDocument();
      });
    });

    it('should display error message', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-4`, () => {
          return HttpResponse.json(mockFailedReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-4');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        if (mockFailedReport.error) {
          expect(screen.getByText(mockFailedReport.error)).toBeInTheDocument();
        }
      });
    });

    it('should display retry button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-4`, () => {
          return HttpResponse.json(mockFailedReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-4');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });
    });

    it('should retry report generation when retry button is clicked', async () => {
      const user = userEvent.setup();
      let retryCalled = false;

      server.use(
        http.get(`${baseUrl}/api/reports/report-4`, () => {
          return HttpResponse.json(mockFailedReport);
        }),
        http.post(`${baseUrl}/api/reports/report-4/retry`, () => {
          retryCalled = true;
          return HttpResponse.json({
            ...mockFailedReport,
            status: 'generating',
          });
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-4');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const retryButton = await screen.findByRole('button', { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(retryCalled).toBe(true);
      });
    });
  });

  describe('Pending Status', () => {
    it('should display pending status indicator', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-5`, () => {
          return HttpResponse.json(mockPendingReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-5');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/pending/i)).toBeInTheDocument();
      });
    });

    it('should display waiting message', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-5`, () => {
          return HttpResponse.json(mockPendingReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-5');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/waiting/i)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Report', () => {
    it('should display delete button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Report')).toBeInTheDocument();
      });
    });

    it('should delete report when confirmed', async () => {
      const user = userEvent.setup();
      let deleteCalled = false;

      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        }),
        http.delete(`${baseUrl}/api/reports/report-1`, () => {
          deleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const deleteButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
      });
    });
  });

  describe('Generate Again (Clone)', () => {
    it('should display generate again button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /generate again/i })).toBeInTheDocument();
      });
    });

    it('should clone report when generate again is clicked', async () => {
      const user = userEvent.setup();
      let generateCalled = false;

      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        }),
        http.post(`${baseUrl}/api/reports`, () => {
          generateCalled = true;
          return HttpResponse.json({
            ...mockReadyReport,
            id: 'report-new',
            status: 'pending',
          });
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      const generateButton = await screen.findByRole('button', { name: /generate again/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(generateCalled).toBe(true);
      });
    });
  });

  describe('Navigation', () => {
    it('should display back to reports button', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back.*reports/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading report', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.json(
            { message: 'Report not found' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, () => {
          return HttpResponse.error();
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/api/reports/report-1`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockReadyReport);
        })
      );

      const Wrapper = createWrapper('/admin/reports/report-1');
      render(<ReportViewerPage />, { wrapper: Wrapper });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
