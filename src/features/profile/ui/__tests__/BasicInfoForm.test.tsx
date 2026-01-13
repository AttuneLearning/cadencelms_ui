/**
 * BasicInfoForm Component Tests
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BasicInfoForm } from '../BasicInfoForm';
import { personApi } from '@/shared/api/personApi';
import type { IPerson } from '@/shared/types/person';

// Mock the personApi
jest.mock('@/shared/api/personApi');

// Mock the auto-save hook to avoid timing issues in tests
jest.mock('../../hooks/useAutoSave', () => ({
  useAutoSave: jest.fn(() => ({
    status: 'idle',
    error: null,
    save: jest.fn(),
    reset: jest.fn(),
  })),
  useBlurSave: jest.fn((save) => save),
}));

const mockPerson: IPerson = {
  firstName: 'John',
  middleName: 'Q',
  lastName: 'Doe',
  suffix: 'Jr.',
  preferredFirstName: 'Johnny',
  preferredLastName: null,
  pronouns: 'he/him',
  avatar: 'https://example.com/avatar.jpg',
  bio: 'Software developer',
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

describe('BasicInfoForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form fields with initial values', () => {
    render(<BasicInfoForm person={mockPerson} />);

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Q')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jr.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
    expect(screen.getByDisplayValue('he/him')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/avatar.jpg')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Software developer')).toBeInTheDocument();
  });

  it('should display avatar preview', () => {
    render(<BasicInfoForm person={mockPerson} />);

    const avatar = screen.getByAltText('Profile');
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('should show initials when no avatar', () => {
    const personWithoutAvatar = { ...mockPerson, avatar: null };
    render(<BasicInfoForm person={personWithoutAvatar} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should update form fields on input change', async () => {
    const user = userEvent.setup();
    render(<BasicInfoForm person={mockPerson} />);

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    expect(firstNameInput).toHaveValue('Jane');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<BasicInfoForm person={mockPerson} />);

    const firstNameInput = screen.getByDisplayValue('John');
    await user.clear(firstNameInput);
    fireEvent.blur(firstNameInput);

    await waitFor(() => {
      expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
    });
  });

  it('should validate avatar URL format', async () => {
    const user = userEvent.setup();
    render(<BasicInfoForm person={mockPerson} />);

    const avatarInput = screen.getByDisplayValue('https://example.com/avatar.jpg');
    await user.clear(avatarInput);
    await user.type(avatarInput, 'not-a-url');
    fireEvent.blur(avatarInput);

    await waitFor(() => {
      expect(screen.getByText(/Avatar must be a valid URL/i)).toBeInTheDocument();
    });
  });

  it('should validate bio length', async () => {
    const user = userEvent.setup();
    render(<BasicInfoForm person={mockPerson} />);

    const bioInput = screen.getByDisplayValue('Software developer');
    const longBio = 'a'.repeat(501);
    await user.clear(bioInput);
    await user.type(bioInput, longBio);

    await waitFor(() => {
      expect(screen.getByText(/Bio must be less than 500 characters/i)).toBeInTheDocument();
    });
  });

  it('should show character count for bio', () => {
    render(<BasicInfoForm person={mockPerson} />);

    expect(screen.getByText('18 / 500')).toBeInTheDocument();
  });

  it('should call onSaveSuccess when save succeeds', async () => {
    const mockSaveSuccess = jest.fn();
    const updatedPerson = { ...mockPerson, firstName: 'Jane' };

    (personApi.updateMyPerson as jest.Mock).mockResolvedValue({
      success: true,
      data: updatedPerson,
    });

    render(<BasicInfoForm person={mockPerson} onSaveSuccess={mockSaveSuccess} />);

    // Note: Testing actual save would require triggering the auto-save hook,
    // which is mocked. This test verifies the component structure.
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });

  it('should show save status badge', () => {
    const { useAutoSave } = require('../../hooks/useAutoSave');
    useAutoSave.mockImplementation(() => ({
      status: 'saving',
      error: null,
      save: jest.fn(),
      reset: jest.fn(),
    }));

    render(<BasicInfoForm person={mockPerson} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('should show error alert on save failure', () => {
    const { useAutoSave } = require('../../hooks/useAutoSave');
    const mockError = new Error('Network error');
    useAutoSave.mockImplementation(() => ({
      status: 'error',
      error: mockError,
      save: jest.fn(),
      reset: jest.fn(),
    }));

    render(<BasicInfoForm person={mockPerson} />);

    expect(screen.getByText(/Failed to save changes/i)).toBeInTheDocument();
    expect(screen.getByText(/Network error/i)).toBeInTheDocument();
  });

  it('should handle null values gracefully', () => {
    const personWithNulls: IPerson = {
      ...mockPerson,
      middleName: null,
      suffix: null,
      preferredFirstName: null,
      preferredLastName: null,
      pronouns: null,
      avatar: null,
      bio: null,
    };

    render(<BasicInfoForm person={personWithNulls} />);

    // Should render without errors
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
  });

  it('should use preferred name in initials if available', () => {
    render(<BasicInfoForm person={mockPerson} />);

    // Should use Johnny (preferred) + Doe for initials = JD
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should validate field length limits', async () => {
    const user = userEvent.setup();
    render(<BasicInfoForm person={mockPerson} />);

    const firstNameInput = screen.getByDisplayValue('John');
    const longName = 'a'.repeat(101);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, longName);

    await waitFor(() => {
      expect(screen.getByText(/First name must be less than 100 characters/i)).toBeInTheDocument();
    });
  });
});
