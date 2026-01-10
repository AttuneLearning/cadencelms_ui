/**
 * Integration Tests for Appearance Settings Page
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { AppearanceSettingsPage } from '../AppearanceSettingsPage';

const mockAppearanceSettings = {
  logoUrl: 'https://example.com/logo.png',
  faviconUrl: 'https://example.com/favicon.ico',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  customCss: '/* Custom styles */',
};

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}><BrowserRouter>{children}</BrowserRouter></QueryClientProvider>
  );
};

describe('AppearanceSettingsPage', () => {
  const baseUrl = env.apiBaseUrl;
  beforeEach(() => server.resetHandlers());

  it('should render page title', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('Appearance Settings')).toBeInTheDocument();
  });

  it('should render logo upload field', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText(/logo/i)).toBeInTheDocument());
  });

  it('should render favicon upload field', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByText(/favicon/i)).toBeInTheDocument());
  });

  it('should render primary color picker', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/primary.*color/i)).toBeInTheDocument());
  });

  it('should render secondary color picker', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/secondary.*color/i)).toBeInTheDocument());
  });

  it('should render custom CSS textarea', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByLabelText(/custom.*css/i)).toBeInTheDocument());
  });

  it('should render preview button', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /preview/i })).toBeInTheDocument());
  });

  it('should render reset to defaults button', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /reset.*default/i })).toBeInTheDocument());
  });

  it('should save settings successfully', async () => {
    server.use(
      http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })),
      http.put(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings }))
    );
    const user = userEvent.setup();
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.getByText(/saved|updated/i)).toBeInTheDocument());
  });

  it('should display error on save failure', async () => {
    server.use(
      http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })),
      http.put(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ message: 'Failed' }, { status: 500 }))
    );
    const user = userEvent.setup();
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(screen.getByText(/failed|error/i)).toBeInTheDocument());
  });

  it('should reset settings to defaults', async () => {
    server.use(
      http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })),
      http.post(`${baseUrl}/settings/appearance/reset`, () => HttpResponse.json({ ...mockAppearanceSettings, primaryColor: '#000000' }))
    );
    const user = userEvent.setup();
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => expect(screen.getByRole('button', { name: /reset.*default/i })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /reset.*default/i }));
    await waitFor(() => expect(screen.getByText(/are you sure|confirm/i)).toBeInTheDocument());
  });

  it('should have proper accessibility labels', async () => {
    server.use(http.get(`${baseUrl}/settings/appearance`, () => HttpResponse.json({ success: true, data: mockAppearanceSettings })));
    render(<AppearanceSettingsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByLabelText(/primary.*color/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/secondary.*color/i)).toBeInTheDocument();
    });
  });
});
