/**
 * NotificationSettingsPage Tests
 * Phase 5: Test person v2.0 communication preferences integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationSettingsPage } from '../NotificationSettingsPage';
import * as usePersonDataModule from '@/features/auth/hooks/usePersonData';
import type { IPerson } from '@/shared/types/person';

// Mock the usePersonData hook
vi.mock('@/features/auth/hooks/usePersonData');

// Mock the toast hook
vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockPerson: IPerson = {
  firstName: 'John',
  middleName: null,
  lastName: 'Doe',
  suffix: null,
  preferredFirstName: null,
  preferredLastName: null,
  pronouns: 'he/him',
  emails: [
    {
      email: 'john.doe@example.com',
      type: 'institutional',
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
  avatar: null,
  bio: null,
  timezone: 'America/New_York',
  languagePreference: 'en',
  locale: 'en-US',
  communicationPreferences: {
    preferredMethod: 'email',
    allowEmail: true,
    allowSMS: false,
    allowPhoneCalls: false,
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

describe('NotificationSettingsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <NotificationSettingsPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it('should render the notification settings page', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage how and when you receive notifications')).toBeInTheDocument();
  });

  it('should display alert when user is not logged in', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(null);

    renderComponent();

    expect(screen.getByText('Please log in to access notification settings.')).toBeInTheDocument();
  });

  it('should initialize form with person communication preferences', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const emailSwitch = screen.getByRole('switch', { name: /Email Notifications/i });
    const smsSwitch = screen.getByRole('switch', { name: /SMS Notifications/i });
    const phoneSwitch = screen.getByRole('switch', { name: /Phone Calls/i });

    expect(emailSwitch).toBeChecked();
    expect(smsSwitch).not.toBeChecked();
    expect(phoneSwitch).not.toBeChecked();
  });

  it('should toggle email notifications', async () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const emailSwitch = screen.getByRole('switch', { name: /Email Notifications/i });

    expect(emailSwitch).toBeChecked();
    fireEvent.click(emailSwitch);
    expect(emailSwitch).not.toBeChecked();
  });

  it('should toggle SMS notifications', async () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const smsSwitch = screen.getByRole('switch', { name: /SMS Notifications/i });

    expect(smsSwitch).not.toBeChecked();
    fireEvent.click(smsSwitch);
    expect(smsSwitch).toBeChecked();
  });

  it('should toggle phone call notifications', async () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const phoneSwitch = screen.getByRole('switch', { name: /Phone Calls/i });

    expect(phoneSwitch).not.toBeChecked();
    fireEvent.click(phoneSwitch);
    expect(phoneSwitch).toBeChecked();
  });

  it('should display notification frequency options', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByText('Notification Frequency')).toBeInTheDocument();
    expect(screen.getByText('Control how often you receive notifications')).toBeInTheDocument();
  });

  it('should display quiet hours settings', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
    expect(screen.getByLabelText('End Time')).toBeInTheDocument();
  });

  it('should set quiet hours', async () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const startTimeInput = screen.getByLabelText('Start Time') as HTMLInputElement;
    const endTimeInput = screen.getByLabelText('End Time') as HTMLInputElement;

    fireEvent.change(startTimeInput, { target: { value: '22:00' } });
    fireEvent.change(endTimeInput, { target: { value: '08:00' } });

    expect(startTimeInput.value).toBe('22:00');
    expect(endTimeInput.value).toBe('08:00');
  });

  it('should navigate back when back button is clicked', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const backButton = screen.getAllByRole('button', { name: /Back/i })[0];
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should show save button', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
  });

  it('should show cancel button', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    const saveButton = screen.getByRole('button', { name: /Save Settings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    });
  });

  it('should display preferred contact method selector', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByText('Preferred Contact Method')).toBeInTheDocument();
    expect(screen.getByText('Choose your preferred way to be contacted')).toBeInTheDocument();
  });

  it('should display communication channels section', () => {
    vi.spyOn(usePersonDataModule, 'usePersonData').mockReturnValue(mockPerson);

    renderComponent();

    expect(screen.getByText('Communication Channels')).toBeInTheDocument();
    expect(screen.getByText('Enable or disable different communication methods')).toBeInTheDocument();
  });
});
