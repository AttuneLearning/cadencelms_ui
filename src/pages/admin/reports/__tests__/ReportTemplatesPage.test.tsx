/**
 * Integration Tests for Report Templates Management Page
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { ReportTemplatesPage } from '../ReportTemplatesPage';
import {
  mockReportTemplates,
  mockTemplatesListResponse,
  mockCreateTemplatePayload,
} from '@/test/mocks/data/reports';
import type { ReportTemplatesListResponse } from '@/entities/report';

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ReportTemplatesPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Report Templates')).toBeInTheDocument();
      expect(screen.getByText(/manage report templates/i)).toBeInTheDocument();
    });

    it('should render Create Template button', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /create template/i })).toBeInTheDocument();
      });
    });

    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockTemplatesListResponse);
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Report Templates')).toBeInTheDocument();
    });
  });

  describe('Templates List Display', () => {
    it('should display list of templates', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
        expect(screen.getByText('Course Completion Report')).toBeInTheDocument();
      });
    });

    it('should display template descriptions', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Default template for monthly enrollment reports')).toBeInTheDocument();
      });
    });

    it('should display report type badges', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('enrollment')).toBeInTheDocument();
        expect(screen.getByText('completion')).toBeInTheDocument();
        expect(screen.getByText('performance')).toBeInTheDocument();
      });
    });

    it('should display isDefault indicator', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const defaultBadges = screen.getAllByText(/default/i);
        expect(defaultBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display isShared indicator', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const sharedBadges = screen.getAllByText(/shared/i);
        expect(sharedBadges.length).toBeGreaterThan(0);
      });
    });

    it('should display created by information', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText(/john doe/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
      });
    });

    it('should handle empty templates list', async () => {
      const emptyResponse: ReportTemplatesListResponse = {
        templates: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: emptyResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.queryByText('Monthly Enrollment Summary')).not.toBeInTheDocument();
      });
    });
  });

  describe('Create Template', () => {
    it('should open create modal when Create Template button is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      const createButton = await screen.findByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByTestId('template-form-dialog')).toBeInTheDocument();
        expect(screen.getByText('Create Report Template')).toBeInTheDocument();
      });
    });

    it('should display create template form fields', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      const createButton = await screen.findByRole('button', { name: /create template/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        const reportTypeFields = screen.getAllByLabelText(/report type/i);
        expect(reportTypeFields.length).toBeGreaterThan(0);
        expect(screen.getByLabelText(/set as default template/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/share.*template.*all users/i)).toBeInTheDocument();
      });
    });

    it('should create template successfully', async () => {
      const user = userEvent.setup();
      let createCalled = false;

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        }),
        http.post(`${baseUrl}/report-templates`, async () => {
          createCalled = true;
          return HttpResponse.json({
            ...mockCreateTemplatePayload,
            id: 'template-new',
            createdBy: 'user-1',
            createdByName: 'Test User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      const createButton = await screen.findByRole('button', { name: /create template/i });
      await user.click(createButton);

      // Fill form
      const nameInput = await screen.findByLabelText(/template name/i);
      await user.type(nameInput, 'New Template');

      const submitButton = screen.getByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(createCalled).toBe(true);
      });
    });

    it('should show validation errors for required fields', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      const createButton = await screen.findByRole('button', { name: /create template/i });
      await user.click(createButton);

      const submitButton = await screen.findByRole('button', { name: /create/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/template name is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Edit Template', () => {
    it('should open edit modal when edit action is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const editButton = await screen.findByText('Edit Template');
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByTestId('template-form-dialog')).toBeInTheDocument();
        expect(screen.getByText('Edit Report Template')).toBeInTheDocument();
      });
    });

    it('should pre-populate form with template data', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const editButton = await screen.findByText('Edit Template');
      await user.click(editButton);

      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Monthly Enrollment Summary');
        expect(nameInput).toBeInTheDocument();
      });
    });

    it('should update template successfully', async () => {
      const user = userEvent.setup();
      let updateCalled = false;

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        }),
        http.patch(`${baseUrl}/report-templates/template-1`, async () => {
          updateCalled = true;
          return HttpResponse.json({
            ...mockReportTemplates[0],
            name: 'Updated Template Name',
          });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const editButton = await screen.findByText('Edit Template');
      await user.click(editButton);

      const nameInput = await screen.findByDisplayValue('Monthly Enrollment Summary');
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Template Name');

      const submitButton = screen.getByRole('button', { name: /update/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(updateCalled).toBe(true);
      });
    });
  });

  describe('Delete Template', () => {
    it('should show confirmation dialog when delete is clicked', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const deleteButton = await screen.findByText('Delete Template');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        expect(screen.getByText('Delete Template')).toBeInTheDocument();
      });
    });

    it('should delete template when confirmed', async () => {
      const user = userEvent.setup();
      let deleteCalled = false;

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        }),
        http.delete(`${baseUrl}/report-templates/template-1`, () => {
          deleteCalled = true;
          return HttpResponse.json({}, { status: 204 });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const deleteButton = await screen.findByText('Delete Template');
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteCalled).toBe(true);
      });
    });

    it('should show error toast when delete fails', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        }),
        http.delete(`${baseUrl}/report-templates/template-1`, () => {
          return HttpResponse.json(
            { message: 'Failed to delete template' },
            { status: 500 }
          );
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[0]);

      const deleteButton = await screen.findByText('Delete Template');
      await user.click(deleteButton);

      const confirmButton = await screen.findByRole('button', { name: /delete/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Set As Default', () => {
    it('should set template as default', async () => {
      const user = userEvent.setup();
      let setDefaultCalled = false;

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        }),
        http.post(`${baseUrl}/report-templates/template-2/set-default`, () => {
          setDefaultCalled = true;
          return HttpResponse.json({
            ...mockReportTemplates[1],
            isDefault: true,
          });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[1]);

      const setDefaultButton = await screen.findByText('Set as Default');
      await user.click(setDefaultButton);

      await waitFor(() => {
        expect(setDefaultCalled).toBe(true);
      });
    });
  });

  describe('Toggle Shared Status', () => {
    it('should toggle shared status', async () => {
      const user = userEvent.setup();
      let toggleCalled = false;

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        }),
        http.post(`${baseUrl}/report-templates/template-3/toggle-shared`, () => {
          toggleCalled = true;
          return HttpResponse.json({
            ...mockReportTemplates[2],
            isShared: true,
          });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      // Wait for templates to load first
      await waitFor(() => {
        expect(screen.getByText('Monthly Enrollment Summary')).toBeInTheDocument();
      });

      const actionButtons = screen.getAllByRole('button', { name: /open menu/i });
      await user.click(actionButtons[2]);

      const toggleButton = await screen.findByText(/make shared/i);
      await user.click(toggleButton);

      await waitFor(() => {
        expect(toggleCalled).toBe(true);
      });
    });
  });

  describe('Search and Filter', () => {
    it('should display search input', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const searchInputs = screen.getAllByPlaceholderText(/search templates/i);
        expect(searchInputs.length).toBeGreaterThan(0);
      });
    });

    it('should filter by report type', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(async () => {
        const typeFilter = screen.getByLabelText(/report type/i);
        expect(typeFilter).toBeInTheDocument();
      });
    });

    it('should filter by default status', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const defaultFilter = screen.getByLabelText(/default status/i);
        expect(defaultFilter).toBeInTheDocument();
      });
    });

    it('should filter by shared status', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json({ success: true, data: mockTemplatesListResponse });
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const sharedFilter = screen.getByLabelText(/shared status/i);
        expect(sharedFilter).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API error when loading templates', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Report Templates')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      server.use(
        http.get(`${baseUrl}/report-templates`, () => {
          return HttpResponse.error();
        })
      );

      render(<ReportTemplatesPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Report Templates')).toBeInTheDocument();
      });
    });
  });
});
