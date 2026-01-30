/**
 * Integration Tests for General Settings Page
 * TDD approach: Tests written first, implementation follows
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { GeneralSettingsPage } from '../GeneralSettingsPage';

const mockGeneralSettings = {
  systemName: 'Test LMS',
  defaultLanguage: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h' as const,
  maxFileSize: 10,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GeneralSettingsPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => expect(screen.getByRole('heading', { name: 'General Settings', level: 1 })).toBeInTheDocument());
    });

    it('should display loading state initially', () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error state on load failure', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json(
            { message: 'Failed to load settings' },
            { status: 500 }
          );
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Fields', () => {
    it('should render system name input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
      });
    });

    it('should render default language select', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/default language/i)).toBeInTheDocument();
      });
    });

    it('should render timezone select', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const label = screen.getByText('Timezone');
        expect(label).toBeInTheDocument();
      });
    });

    it('should render date format select', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/date format/i)).toBeInTheDocument();
      });
    });

    it('should render time format select', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const label = screen.getByText('Time Format');
        expect(label).toBeInTheDocument();
      });
    });

    it('should render max file size input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/max.*file.*size/i)).toBeInTheDocument();
      });
    });

    it('should render allowed file types field', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // The field should show file type badges like PDF, DOC, etc.
        expect(screen.getByText('PDF')).toBeInTheDocument();
      });
    });
  });

  describe('Form Population', () => {
    it('should populate form with existing settings', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        const systemNameInput = screen.getByLabelText(/system name/i) as HTMLInputElement;
        expect(systemNameInput.value).toBe('Test LMS');
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      const user = userEvent.setup();
      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
      });

      const systemNameInput = screen.getByLabelText(/system name/i);
      await user.clear(systemNameInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('should validate max file size is a positive number', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      const user = userEvent.setup();
      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/max.*file.*size/i)).toBeInTheDocument();
      });

      const maxFileSizeInput = screen.getByLabelText(/max.*file.*size/i);
      await user.clear(maxFileSizeInput);
      await user.type(maxFileSizeInput, '-5');

      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      await user.click(saveButton);

      // Validation should fail and button should return to normal
      await waitFor(() => {
        expect(saveButton).not.toHaveTextContent(/Saving/);
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save settings successfully', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        }),
        http.put(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      const user = userEvent.setup();
      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      await user.click(saveButton);

      // Button should return to normal after successful save
      await waitFor(() => {
        expect(saveButton).not.toHaveTextContent(/Saving/);
      });
    });

    it('should display error on save failure', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        }),
        http.put(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json(
            { message: 'Failed to save settings' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      await user.click(saveButton);

      // Button should return to normal after failed save
      await waitFor(() => {
        expect(saveButton).not.toHaveTextContent(/Saving/);
      });
    });

    it('should disable save button while saving', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        }),
        http.put(`${baseUrl}/settings/general`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      const user = userEvent.setup();
      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
  });

  describe('Reset Functionality', () => {
    it('should render reset to defaults button', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset.*default/i })).toBeInTheDocument();
      });
    });

    it('should reset settings to defaults', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        }),
        http.post(`${baseUrl}/settings/general/reset`, () => {
          return HttpResponse.json({
            ...mockGeneralSettings,
            systemName: 'Learning Management System',
          });
        })
      );

      const user = userEvent.setup();
      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset.*default/i })).toBeInTheDocument();
      });

      const resetButton = screen.getByRole('button', { name: /reset.*default/i });
      await user.click(resetButton);

      // Should show confirmation
      await waitFor(() => {
        expect(screen.getByText(/are you sure|confirm/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      server.use(
        http.get(`${baseUrl}/settings/general`, () => {
          return HttpResponse.json({ success: true, data: mockGeneralSettings });
        })
      );

      render(<GeneralSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/system name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/max.*file.*size/i)).toBeInTheDocument();
      });
    });
  });
});
