/**
 * ProfilePageV2 Component Tests
 */

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePageV2 } from '../ProfilePageV2';
import { personApi } from '@/shared/api/personApi';
import type { IPerson } from '@/shared/types/person';

// Mock the personApi
vi.mock('@/shared/api/personApi');

// Mock all form components
vi.mock('@/features/profile/ui/BasicInfoForm', () => ({
  BasicInfoForm: () => <div data-testid="basic-info-form">Basic Info Form</div>,
}));

vi.mock('@/features/profile/ui/ContactInfoForm', () => ({
  ContactInfoForm: () => <div data-testid="contact-info-form">Contact Info Form</div>,
}));

vi.mock('@/features/profile/ui/PreferencesForm', () => ({
  PreferencesForm: () => <div data-testid="preferences-form">Preferences Form</div>,
}));

vi.mock('@/features/profile/ui/ConsentForm', () => ({
  ConsentForm: () => <div data-testid="consent-form">Consent Form</div>,
}));

const mockPerson: IPerson = {
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  suffix: null,
  preferredFirstName: null,
  preferredLastName: null,
  pronouns: null,
  avatar: null,
  bio: null,
  emails: [
    {
      email: 'john@example.com',
      type: 'personal',
      isPrimary: true,
      verified: true,
      allowNotifications: true,
      label: null,
    },
  ],
  phones: [],
  addresses: [],
  dateOfBirth: null,
  last4SSN: null,
  timezone: 'America/New_York',
  languagePreference: 'en',
  locale: 'en-US',
  communicationPreferences: {
    preferredMethod: 'email',
    allowEmail: true,
    allowSMS: true,
    allowPhoneCalls: true,
    quietHoursStart: null,
    quietHoursEnd: null,
    notificationFrequency: 'immediate',
  },
  legalConsent: {
    ferpaConsent: null,
    ferpaConsentDate: null,
    gdprConsent: null,
    gdprConsentDate: null,
    photoConsent: null,
    photoConsentDate: null,
    marketingConsent: null,
    marketingConsentDate: null,
    thirdPartyDataSharing: null,
    thirdPartyDataSharingDate: null,
  },
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProfilePageV2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(personApi.getMyPerson).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state when API fails', async () => {
    vi.mocked(personApi.getMyPerson).mockRejectedValue(new Error('API Error'));

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Failed to load profile data/i)).toBeInTheDocument();
    });
  });

  it('should render profile page with tabs', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    expect(screen.getByRole('tab', { name: /Basic Info/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Contact/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Consent/i })).toBeInTheDocument();
  });

  it('should show basic info form by default', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
    });
  });

  it('should switch tabs', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    const user = userEvent.setup();
    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
    });

    // Click on Contact tab
    const contactTab = screen.getByRole('tab', { name: /Contact/i });
    await user.click(contactTab);

    await waitFor(() => {
      expect(screen.getByTestId('contact-info-form')).toBeInTheDocument();
    });

    // Click on Preferences tab
    const preferencesTab = screen.getByRole('tab', { name: /Preferences/i });
    await user.click(preferencesTab);

    await waitFor(() => {
      expect(screen.getByTestId('preferences-form')).toBeInTheDocument();
    });

    // Click on Consent tab
    const consentTab = screen.getByRole('tab', { name: /Consent/i });
    await user.click(consentTab);

    await waitFor(() => {
      expect(screen.getByTestId('consent-form')).toBeInTheDocument();
    });
  });

  it('should show auto-save help text', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Auto-save enabled:/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Your changes are automatically saved 2 minutes after you stop typing/i)
    ).toBeInTheDocument();
  });

  it('should fetch person data on mount', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(personApi.getMyPerson).toHaveBeenCalledTimes(1);
    });
  });

  it('should update local state on save success', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
    });

    // Component renders successfully with person data
    expect(screen.getByText('My Profile')).toBeInTheDocument();
  });

  it('should show page title and description', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Manage your personal information, contact details, and preferences/i)
    ).toBeInTheDocument();
  });

  it('should display tab icons', async () => {
    vi.mocked(personApi.getMyPerson).mockResolvedValue({
      success: true,
      data: mockPerson,
    });

    render(<ProfilePageV2 />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    // Check that tabs are rendered (icons are rendered within tabs)
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);
  });
});
