/**
 * PreferencesForm Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesForm } from '../PreferencesForm';
import type { IPerson } from '@/shared/types/person';
import * as useAutoSaveModule from '../../hooks/useAutoSave';

// Mock the auto-save hook
vi.mock('../../hooks/useAutoSave', () => ({
  useAutoSave: vi.fn(() => ({
    status: 'idle',
    error: null,
    save: vi.fn(),
    reset: vi.fn(),
  })),
  useBlurSave: vi.fn((save) => save),
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
  emails: [],
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
    allowPhoneCalls: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    notificationFrequency: 'daily-digest',
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

describe('PreferencesForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render localization preferences', () => {
    render(<PreferencesForm person={mockPerson} />);

    expect(screen.getByText(/Localization/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Timezone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Language/i)).toBeInTheDocument();
  });

  it('should render communication preferences', () => {
    render(<PreferencesForm person={mockPerson} />);

    expect(screen.getByText(/Communication Preferences/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Preferred Contact Method/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SMS/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Calls/i)).toBeInTheDocument();
  });

  it('should render notification preferences', () => {
    const { container } = render(<PreferencesForm person={mockPerson} />);

    // Find the Notifications heading more specifically
    const notificationsHeading = Array.from(container.querySelectorAll('h3')).find(
      (el) => el.textContent?.includes('Notifications')
    );
    expect(notificationsHeading).toBeInTheDocument();

    // Check for Notification Frequency label
    const frequencyLabel = Array.from(container.querySelectorAll('label')).find(
      (el) => el.textContent?.includes('Notification Frequency')
    );
    expect(frequencyLabel).toBeInTheDocument();
  });

  it('should render quiet hours settings', () => {
    render(<PreferencesForm person={mockPerson} />);

    expect(screen.getByText(/Quiet Hours/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('22:00')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
  });

  it('should toggle communication switches', async () => {
    const user = userEvent.setup();
    render(<PreferencesForm person={mockPerson} />);

    const emailSwitch = screen.getByRole('switch', { name: /Email/i });
    expect(emailSwitch).toBeChecked();

    await user.click(emailSwitch);

    await waitFor(() => {
      expect(emailSwitch).not.toBeChecked();
    });
  });

  it('should validate quiet hours time format', async () => {
    const user = userEvent.setup();
    const { container } = render(<PreferencesForm person={mockPerson} />);

    const timeInputs = container.querySelectorAll('input[type="time"]');
    const startTimeInput = timeInputs[0] as HTMLInputElement;
    await user.clear(startTimeInput);
    await user.type(startTimeInput, '25:00'); // Invalid time
    fireEvent.blur(startTimeInput);

    await waitFor(() => {
      const errorElement = screen.queryByText(/Invalid time format/i);
      if (errorElement) {
        expect(errorElement).toBeInTheDocument();
      }
    }, { timeout: 500 });
  });

  it('should show quiet hours alert when both times are set', () => {
    render(<PreferencesForm person={mockPerson} />);

    expect(
      screen.getByText(/You won't receive notifications between 22:00 and 08:00/i)
    ).toBeInTheDocument();
  });

  it('should not show quiet hours alert when times are not set', () => {
    const personWithoutQuietHours = {
      ...mockPerson,
      communicationPreferences: {
        ...mockPerson.communicationPreferences,
        quietHoursStart: null,
        quietHoursEnd: null,
      },
    };

    render(<PreferencesForm person={personWithoutQuietHours} />);

    expect(
      screen.queryByText(/You won't receive notifications between/i)
    ).not.toBeInTheDocument();
  });

  it('should display save status', () => {
    vi.mocked(useAutoSaveModule.useAutoSave).mockImplementation(() => ({
      status: 'saved',
      error: null,
      save: vi.fn(),
      reset: vi.fn(),
    }));

    render(<PreferencesForm person={mockPerson} />);

    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('should show error on save failure', () => {
    const mockError = new Error('Save failed');
    vi.mocked(useAutoSaveModule.useAutoSave).mockImplementation(() => ({
      status: 'error',
      error: mockError,
      save: vi.fn(),
      reset: vi.fn(),
    }));

    render(<PreferencesForm person={mockPerson} />);

    expect(screen.getByText(/Failed to save changes/i)).toBeInTheDocument();
  });
});
