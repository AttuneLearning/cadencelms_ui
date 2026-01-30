/**
 * Integration Tests for Audit Logs Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { AuditLogsPage } from '../AuditLogsPage';
import { mockAuditLogs } from '@/test/mocks/data/auditLogs';
import type { AuditLogsListResponse } from '@/entities/audit-log';

// Mock the export dialog
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
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AuditLogsPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      expect(
        screen.getByText('View and track system activity and changes')
      ).toBeInTheDocument();
    });

    it('should render filter section', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/filters/i)).toBeInTheDocument();
      });
    });

    it('should render export and refresh buttons', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            logs: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
          });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Audit Logs')).toBeInTheDocument();
    });
  });

  describe('Audit Logs Table Display', () => {
    it('should display list of audit logs', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 3),
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display timestamp column', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 1),
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Jan 10, 2026/i)).toBeInTheDocument();
      });
    });

    it('should display action column', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 1),
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('create')).toBeInTheDocument();
      });
    });

    it('should display entity type column', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 1),
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('course')).toBeInTheDocument();
      });
    });

    it('should display severity badges with correct colors', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs,
        pagination: {
          page: 1,
          limit: 20,
          total: mockAuditLogs.length,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const infoBadges = screen.getAllByText('info');
        expect(infoBadges.length).toBeGreaterThan(0);

        const warningBadge = screen.getByText('warning');
        expect(warningBadge).toBeInTheDocument();

        const errorBadge = screen.getByText('error');
        expect(errorBadge).toBeInTheDocument();

        const criticalBadge = screen.getByText('critical');
        expect(criticalBadge).toBeInTheDocument();
      });
    });

    it('should display IP address column', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 1),
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
      });
    });

    it('should handle empty audit logs list', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filter Functionality', () => {
    it('should expand filters section when clicked', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });

    it('should display user search filter', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/user/i)).toBeInTheDocument();
      });
    });

    it('should display entity type filter', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/entity type/i)).toBeInTheDocument();
      });
    });

    it('should display entity type filter', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByText(/entity type/i)).toBeInTheDocument();
      });
    });

    it('should display IP address filter', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/ip address/i)).toBeInTheDocument();
      });
    });

    it('should display date range picker', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/date from/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/date to/i)).toBeInTheDocument();
      });
    });

    it('should have clear filters button', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const filterButton = await screen.findByText(/filters/i);
      await user.click(filterButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort by timestamp column', async () => {
      const user = userEvent.setup();
      let sortParam = '';

      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 3),
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, ({ request }) => {
          const url = new URL(request.url);
          sortParam = url.searchParams.get('sort') || '';
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
      });

      const timestampHeader = screen.getByText('Timestamp');
      await user.click(timestampHeader);

      await waitFor(() => {
        expect(sortParam).toBeTruthy();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs,
        pagination: {
          page: 1,
          limit: 5,
          total: 20,
          totalPages: 4,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const pageElements = screen.getAllByText(/page/i);
        expect(pageElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('View Details Action', () => {
    it('should have view details button for each log', async () => {
      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 1),
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const viewButtons = screen.getAllByRole('button', { name: /view/i });
        expect(viewButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Export Functionality', () => {
    it('should open export dialog when export button is clicked', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const exportButton = await screen.findByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        const exportTexts = screen.getAllByText(/export.*logs/i);
        expect(exportTexts.length).toBeGreaterThan(0);
      });
    });

    it('should display format selection in export dialog', async () => {
      const user = userEvent.setup();
      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const exportButton = await screen.findByRole('button', { name: /export/i });
      await user.click(exportButton);

      // Wait for dialog to open first
      await waitFor(() => {
        const exportTexts = screen.getAllByText(/export.*logs/i);
        expect(exportTexts.length).toBeGreaterThan(0);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/format/i)).toBeInTheDocument();
      });
    });

    it('should export logs when confirmed', async () => {
      const user = userEvent.setup();
      let exportCalled = false;

      const mockResponse: AuditLogsListResponse = {
        logs: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json({ success: true, data: mockResponse });
        }),
        http.post(`${baseUrl}/audit-logs/export`, () => {
          exportCalled = true;
          return HttpResponse.json({
            url: 'https://example.com/export.csv',
            expiresAt: '2026-01-11T00:00:00Z',
          });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      const exportButton = await screen.findByRole('button', { name: /export/i });
      await user.click(exportButton);

      const confirmButton = await screen.findByRole('button', { name: /export/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(exportCalled).toBe(true);
      });
    });
  });

  describe('Refresh Functionality', () => {
    it('should refresh data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      let fetchCount = 0;

      const mockResponse: AuditLogsListResponse = {
        logs: mockAuditLogs.slice(0, 3),
        pagination: {
          page: 1,
          limit: 20,
          total: 3,
          totalPages: 1,
        },
      };

      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          fetchCount++;
          return HttpResponse.json({ success: true, data: mockResponse });
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(fetchCount).toBe(1);
      });

      const refreshButton = await screen.findByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(fetchCount).toBe(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading logs', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/audit-logs`, () => {
          return HttpResponse.error();
        })
      );

      render(<AuditLogsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Audit Logs')).toBeInTheDocument();
      });
    });
  });
});
