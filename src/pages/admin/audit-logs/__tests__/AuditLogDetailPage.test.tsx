/**
 * Integration Tests for Audit Log Detail Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { AuditLogDetailPage } from '../AuditLogDetailPage';
import { mockAuditLogDetail, mockRelatedAuditLogs } from '@/test/mocks/data/auditLogs';

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
          <Route path="/admin/audit-logs/:logId" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AuditLogDetailPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Audit Log Details')).toBeInTheDocument();
      });
    });

    it('should render back to logs button', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /back.*logs/i })
        ).toBeInTheDocument();
      });
    });

    it('should render export button', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      });
    });

    it('should render copy log ID button', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copy.*id/i })).toBeInTheDocument();
      });
    });
  });

  describe('Log Details Display', () => {
    it('should display timestamp with relative time', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Jan 10, 2026/i)).toBeInTheDocument();
      });
    });

    it('should display user information', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });
    });

    it('should display action badge', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('create')).toBeInTheDocument();
      });
    });

    it('should display severity badge', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('info')).toBeInTheDocument();
      });
    });

    it('should display entity type and entity information', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('course')).toBeInTheDocument();
        expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
      });
    });

    it('should display IP address', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
      });
    });

    it('should display user agent', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/Mozilla/i)).toBeInTheDocument();
      });
    });

    it('should display description', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('Created new course')).toBeInTheDocument();
      });
    });
  });

  describe('Changes Display', () => {
    it('should display changes section when changes exist', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/changes/i)).toBeInTheDocument();
      });
    });

    it('should display before and after comparison', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/before/i)).toBeInTheDocument();
        expect(screen.getByText(/after/i)).toBeInTheDocument();
      });
    });

    it('should display changed field names', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText('name')).toBeInTheDocument();
        expect(screen.getByText('status')).toBeInTheDocument();
      });
    });
  });

  describe('Related Logs', () => {
    it('should display related logs section', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: mockRelatedAuditLogs });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/related.*logs/i)).toBeInTheDocument();
      });
    });

    it('should display related logs list', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: mockRelatedAuditLogs });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        const johnDoeElements = screen.getAllByText('John Doe');
        expect(johnDoeElements.length).toBeGreaterThan(1);
      });
    });

    it('should show no related logs message when empty', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/no related logs/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    it('should export log when export button is clicked', async () => {
      const user = userEvent.setup();
      let exportCalled = false;

      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        }),
        http.post(`${baseUrl}/api/audit-logs/log-1/export`, () => {
          exportCalled = true;
          return HttpResponse.json({
            url: 'https://example.com/export.json',
            expiresAt: '2026-01-11T00:00:00Z',
          });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      const exportButton = await screen.findByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(exportCalled).toBe(true);
      });
    });
  });

  describe('Copy Log ID', () => {
    it('should copy log ID when button is clicked', async () => {
      const user = userEvent.setup();
      const writeText = vi.fn();
      Object.assign(navigator, {
        clipboard: {
          writeText,
        },
      });

      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(mockAuditLogDetail);
        }),
        http.get(`${baseUrl}/api/audit-logs/log-1/related`, () => {
          return HttpResponse.json({ logs: [] });
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      const copyButton = await screen.findByRole('button', { name: /copy.*id/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(writeText).toHaveBeenCalledWith('log-1');
      });
    });
  });

  describe('Loading State', () => {
    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(mockAuditLogDetail);
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading log', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.json(
            { message: 'Log not found' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-1`, () => {
          return HttpResponse.error();
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-1');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Not Found Handling', () => {
    it('should display not found message when log does not exist', async () => {
      server.use(
        http.get(`${baseUrl}/api/audit-logs/log-999`, () => {
          return HttpResponse.json(
            { message: 'Audit log not found' },
            { status: 404 }
          );
        })
      );

      const Wrapper = createWrapper('/admin/audit-logs/log-999');
      render(<AuditLogDetailPage />, { wrapper: Wrapper });

      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });
  });
});
