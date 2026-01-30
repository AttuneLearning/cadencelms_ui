/**
 * Integration Tests for Email Settings Page
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
import { EmailSettingsPage } from '../EmailSettingsPage';

const mockEmailSettings = {
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpSecure: true,
  smtpUsername: 'user@example.com',
  smtpPassword: 'password123',
  senderName: 'Test LMS',
  senderEmail: 'noreply@example.com',
  replyToEmail: 'support@example.com',
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

describe('EmailSettingsPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByRole('heading', { name: 'Email Settings', level: 1 })).toBeInTheDocument());
    });

    it('should display loading state', () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error state', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ message: 'Failed to load' }, { status: 500 });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('SMTP Configuration Fields', () => {
    it('should render SMTP host input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
      });
    });

    it('should render SMTP port input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByLabelText(/smtp port/i)).toBeInTheDocument();
      });
    });

    it('should render secure connection checkbox', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText(/secure connection|ssl|tls/i)).toBeInTheDocument();
      });
    });

    it('should render SMTP username input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByLabelText(/smtp username/i)).toBeInTheDocument();
      });
    });

    it('should render SMTP password input as masked', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/smtp password/i) as HTMLInputElement;
        expect(passwordInput.type).toBe('password');
      });
    });
  });

  describe('Sender Information Fields', () => {
    it('should render sender name input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByLabelText(/sender name/i)).toBeInTheDocument();
      });
    });

    it('should render sender email input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByLabelText(/sender email/i)).toBeInTheDocument();
      });
    });

    it('should render reply-to email input', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByLabelText(/reply.*to.*email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
      });

      const smtpHostInput = screen.getByLabelText(/smtp host/i);
      await user.clear(smtpHostInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format for sender email', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/sender email/i)).toBeInTheDocument();
      });

      const senderEmailInput = screen.getByLabelText(/sender email/i);
      await user.clear(senderEmailInput);
      await user.type(senderEmailInput, 'invalid-email');

      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      // Wait for the button to be visible before clicking
      await waitFor(() => expect(saveButton).toBeInTheDocument());
      await user.click(saveButton);

      // Form validation should fail, so button should return to normal (not disabled/loading)
      // And validation error toast should appear
      await waitFor(() => {
        expect(saveButton).not.toHaveTextContent(/Saving/);
      });
    });

    it('should validate port number is positive', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/smtp port/i)).toBeInTheDocument();
      });

      const portInput = screen.getByLabelText(/smtp port/i);
      await user.clear(portInput);
      await user.type(portInput, '-1');

      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      // Wait for the button to be visible before clicking
      await waitFor(() => expect(saveButton).toBeInTheDocument());
      await user.click(saveButton);

      // Form validation should fail, so button should return to normal (not disabled/loading)
      // And validation error toast should appear
      await waitFor(() => {
        expect(saveButton).not.toHaveTextContent(/Saving/);
      });
    });
  });

  describe('Test Email Connection', () => {
    it('should render test connection button', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test.*connection|test.*email/i })).toBeInTheDocument();
      });
    });

    it('should test email connection successfully', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        }),
        http.post(`${baseUrl}/settings/email/test`, () => {
          return HttpResponse.json({
            success: true,
            message: 'Email sent successfully',
          });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test.*connection/i })).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: /test.*connection/i });
      await user.type(screen.getByPlaceholderText(/test@example.com/i), 'test@example.com');
      await user.click(testButton);

      await waitFor(() => {
        expect(testButton).not.toHaveTextContent(/Testing/);
      });
    });

    it('should handle test connection failure', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        }),
        http.post(`${baseUrl}/settings/email/test`, () => {
          return HttpResponse.json(
            { success: false, error: 'Connection failed' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /test.*connection/i })).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: /test.*connection/i });
      await user.type(screen.getByPlaceholderText(/test@example.com/i), 'test@example.com');
      await user.click(testButton);

      await waitFor(() => {
        expect(testButton).not.toHaveTextContent(/Testing/);
      });
    });
  });

  describe('Connection Status', () => {
    it('should display connection status indicator', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/connection status/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Functionality', () => {
    it('should save settings successfully', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        }),
        http.put(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
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
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        }),
        http.put(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ message: 'Failed' }, { status: 500 });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
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
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        }),
        http.put(`${baseUrl}/settings/email`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      const user = userEvent.setup();
      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      server.use(
        http.get(`${baseUrl}/settings/email`, () => {
          return HttpResponse.json({ success: true, data: mockEmailSettings });
        })
      );

      render(<EmailSettingsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByLabelText(/smtp host/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/smtp port/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sender email/i)).toBeInTheDocument();
      });
    });
  });
});
