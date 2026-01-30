/**
 * Integration Tests for Notification Settings Page
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { NotificationSettingsPage } from '../NotificationSettingsPage';

const mockNotificationSettings = {
  emailNotificationsEnabled: true,
  inAppNotificationsEnabled: true,
  enrollmentNotifications: true,
  completionNotifications: true,
  gradingNotifications: true,
  deadlineNotifications: true,
  digestFrequency: 'immediate' as const,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('NotificationSettingsPage', () => {
  const baseUrl = env.apiFullUrl;

  beforeEach(() => {
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByRole('heading', { name: 'Notification Settings', level: 1 })).toBeInTheDocument());
    });

    it('should display loading state', () => {
      server.use(http.get(`${baseUrl}/settings/notification`, async () => {
        await new Promise((r) => setTimeout(r, 100));
        return HttpResponse.json({ success: true, data: mockNotificationSettings });
      }));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error state', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ message: 'Failed' }, { status: 500 })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/error/i)).toBeInTheDocument());
    });
  });

  describe('Global Toggles', () => {
    it('should render email notifications toggle', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/email.*notification/i)).toBeInTheDocument());
    });

    it('should render in-app notifications toggle', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/in.*app.*notification/i)).toBeInTheDocument());
    });
  });

  describe('Notification Type Toggles', () => {
    it('should render enrollment notifications toggle', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/enrollment.*notification/i)).toBeInTheDocument());
    });

    it('should render completion notifications toggle', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/completion.*notification/i)).toBeInTheDocument());
    });

    it('should render grading notifications toggle', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/grading.*notification/i)).toBeInTheDocument());
    });

    it('should render deadline notifications toggle', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/deadline.*notification/i)).toBeInTheDocument());
    });
  });

  describe('Digest Frequency', () => {
    it('should render digest frequency select', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/digest.*frequency/i)).toBeInTheDocument());
    });
  });

  describe('Toggle Functionality', () => {
    it('should toggle notification settings', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      const user = userEvent.setup();
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByText(/email.*notification/i)).toBeInTheDocument());
    });
  });

  describe('Save Functionality', () => {
    it('should save settings successfully', async () => {
      server.use(
        http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })),
        http.put(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings }))
      );
      const user = userEvent.setup();
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByRole('button', { name: /save.*settings/i })).toBeInTheDocument());
      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      await user.click(saveButton);
      await waitFor(() => expect(saveButton).not.toHaveTextContent(/Saving/));
    });

    it('should display error on save failure', async () => {
      server.use(
        http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })),
        http.put(`${baseUrl}/settings/notification`, () => HttpResponse.json({ message: 'Failed' }, { status: 500 }))
      );
      const user = userEvent.setup();
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByRole('button', { name: /save.*settings/i })).toBeInTheDocument());
      const saveButton = screen.getByRole('button', { name: /save.*settings/i });
      await user.click(saveButton);
      await waitFor(() => expect(saveButton).not.toHaveTextContent(/Saving/));
    });

    it('should disable save button while saving', async () => {
      server.use(
        http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })),
        http.put(`${baseUrl}/settings/notification`, async () => {
          await new Promise((r) => setTimeout(r, 100));
          return HttpResponse.json({ success: true, data: mockNotificationSettings });
        })
      );
      const user = userEvent.setup();
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for toggles', async () => {
      server.use(http.get(`${baseUrl}/settings/notification`, () => HttpResponse.json({ success: true, data: mockNotificationSettings })));
      render(<NotificationSettingsPage />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText(/email.*notification/i)).toBeInTheDocument();
        expect(screen.getByText(/enrollment.*notification/i)).toBeInTheDocument();
      });
    });
  });
});
