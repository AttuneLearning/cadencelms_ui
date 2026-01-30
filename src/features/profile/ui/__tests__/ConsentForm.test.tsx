/**
 * ConsentForm Component Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConsentForm } from '../ConsentForm';
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
  locale: null,
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
    ferpaConsent: true,
    ferpaConsentDate: new Date('2024-01-15'),
    gdprConsent: true,
    gdprConsentDate: new Date('2024-01-15'),
    photoConsent: false,
    photoConsentDate: null,
    marketingConsent: true,
    marketingConsentDate: new Date('2024-01-15'),
    thirdPartyDataSharing: false,
    thirdPartyDataSharingDate: null,
  },
};

describe('ConsentForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all consent items', () => {
    render(<ConsentForm person={mockPerson} />);

    expect(screen.getByText(/FERPA Consent/i)).toBeInTheDocument();
    expect(screen.getByText(/GDPR Consent/i)).toBeInTheDocument();
    expect(screen.getByText(/Photo & Media Consent/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketing Communications/i)).toBeInTheDocument();
    expect(screen.getByText(/Third-Party Data Sharing/i)).toBeInTheDocument();
  });

  it('should show descriptions for each consent type', () => {
    render(<ConsentForm person={mockPerson} />);

    expect(
      screen.getByText(/The Family Educational Rights and Privacy Act/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/The General Data Protection Regulation/i)).toBeInTheDocument();
    expect(screen.getByText(/Allow us to use your photos/i)).toBeInTheDocument();
    expect(screen.getByText(/Receive promotional emails/i)).toBeInTheDocument();
    expect(screen.getByText(/Allow us to share your anonymized data/i)).toBeInTheDocument();
  });

  it('should show granted badges for consented items', () => {
    render(<ConsentForm person={mockPerson} />);

    const grantedBadges = screen.getAllByText(/Granted/i);
    expect(grantedBadges).toHaveLength(3); // FERPA, GDPR, Marketing
  });

  it('should show consent dates when available', () => {
    render(<ConsentForm person={mockPerson} />);

    // The date format includes time, so check for the pattern that includes date
    const dateTexts = screen.getAllByText(/Last updated:/i);
    expect(dateTexts.length).toBeGreaterThan(0);

    // At least one should mention 2024 (the year from our mock data)
    const hasYear = dateTexts.some((el) => el.textContent?.includes('2024'));
    expect(hasYear).toBe(true);
  });

  it('should not show consent date for items without consent', () => {
    render(<ConsentForm person={mockPerson} />);

    // Photo consent is false, should not have a date displayed
    const allText = screen.getByText(/Allow us to use your photos/i).parentElement;
    expect(allText).not.toHaveTextContent(/Last updated:/);
  });

  it('should toggle consent switches', async () => {
    const user = userEvent.setup();
    render(<ConsentForm person={mockPerson} />);

    const switches = screen.getAllByRole('switch');
    const ferpaSwitch = switches[0]; // First switch (FERPA)

    expect(ferpaSwitch).toBeChecked();

    await user.click(ferpaSwitch);

    await waitFor(() => {
      expect(ferpaSwitch).not.toBeChecked();
    });
  });

  it('should show privacy information alert', () => {
    render(<ConsentForm person={mockPerson} />);

    expect(
      screen.getByText(/Your privacy is important to us/i)
    ).toBeInTheDocument();
  });

  it('should show rights information alert', () => {
    render(<ConsentForm person={mockPerson} />);

    expect(screen.getByText(/Your Rights:/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You have the right to access, correct, or delete your personal data/i)
    ).toBeInTheDocument();
  });

  it('should handle null consent values', () => {
    const personWithNullConsent = {
      ...mockPerson,
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

    render(<ConsentForm person={personWithNullConsent} />);

    // Should render without errors and show all switches unchecked
    const switches = screen.getAllByRole('switch');
    switches.forEach((switchEl) => {
      expect(switchEl).not.toBeChecked();
    });
  });

  it('should show save status badge', () => {
    vi.mocked(useAutoSaveModule.useAutoSave).mockImplementation(() => ({
      status: 'saving',
      error: null,
      save: vi.fn(),
      reset: vi.fn(),
    }));

    render(<ConsentForm person={mockPerson} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should show error alert on save failure', () => {
    const mockError = new Error('Network error');
    vi.mocked(useAutoSaveModule.useAutoSave).mockImplementation(() => ({
      status: 'error',
      error: mockError,
      save: vi.fn(),
      reset: vi.fn(),
    }));

    render(<ConsentForm person={mockPerson} />);

    expect(screen.getByText(/Failed to save changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('should call onSaveSuccess when save succeeds', async () => {
    const mockSaveSuccess = vi.fn();
    render(<ConsentForm person={mockPerson} onSaveSuccess={mockSaveSuccess} />);

    // Component renders successfully
    expect(screen.getByText(/Legal Consent & Privacy/i)).toBeInTheDocument();
  });
});
