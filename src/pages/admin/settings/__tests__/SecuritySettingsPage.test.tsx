/**
 * Integration Tests for Security Settings Page
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { SecuritySettingsPage } from '../SecuritySettingsPage';

const mockSecuritySettings = {
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  twoFactorEnabled: false,
  ipWhitelist: ['192.168.1.0/24'],
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
  );
};

describe('SecuritySettingsPage', () => {
  const baseUrl = env.apiBaseUrl;
  beforeEach(() => server.resetHandlers());

  it('should render page title', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Security Settings')).toBeInTheDocument();
  });

  it('should render password min length input', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/min.*length|password.*length/i)).toBeInTheDocument());
  });

  it('should render password policy checkboxes', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/uppercase|require.*uppercase/i)).toBeInTheDocument();
      expect(screen.getByText(/lowercase|require.*lowercase/i)).toBeInTheDocument();
      expect(screen.getByText(/numbers|require.*numbers/i)).toBeInTheDocument();
      expect(screen.getByText(/special.*char/i)).toBeInTheDocument();
    });
  });

  it('should render session timeout input', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/session.*timeout/i)).toBeInTheDocument());
  });

  it('should render max login attempts input', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/max.*login.*attempts/i)).toBeInTheDocument());
  });

  it('should render two-factor toggle', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText(/two.*factor|2fa/i)).toBeInTheDocument());
  });

  it('should render IP whitelist textarea', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/ip.*whitelist/i)).toBeInTheDocument());
  });

  it('should validate min password length', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    const user = userEvent.setup();
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/min.*length|password.*length/i)).toBeInTheDocument());
    const input = screen.getByLabelText(/min.*length|password.*length/i);
    await user.clear(input);
    await user.type(input, '3');
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);
    await waitFor(() => expect(screen.getByText(/at least 6|minimum.*6/i)).toBeInTheDocument());
  });

  it('should save settings successfully', async () => {
    server.use(
      http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })),
      http.put(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings }))
    );
    const user = userEvent.setup();
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.getByText(/saved|updated/i)).toBeInTheDocument());
  });

  it('should display error on save failure', async () => {
    server.use(
      http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })),
      http.put(`${baseUrl}/settings/security`, () => HttpResponse.json({ message: 'Failed' }, { status: 500 }))
    );
    const user = userEvent.setup();
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.getByText(/failed|error/i)).toBeInTheDocument());
  });

  it('should have proper accessibility labels', async () => {
    server.use(http.get(`${baseUrl}/settings/security`, () => HttpResponse.json({ success: true, data: mockSecuritySettings })));
    render(<SecuritySettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByLabelText(/min.*length|password.*length/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/session.*timeout/i)).toBeInTheDocument();
    });
  });
});
