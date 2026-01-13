/**
 * StaffCard Component Tests
 * Phase 5: Test person v2.0 data integration
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { StaffCard } from '../StaffCard';
import type { StaffListItem } from '../../model/types';
import type { IPerson } from '@/shared/types/person';

const mockStaff: StaffListItem = {
  _id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  title: 'Senior Instructor',
  departmentMemberships: [
    {
      departmentId: 'dept1',
      departmentName: 'Computer Science',
      departmentSlug: 'cs',
      roles: ['instructor'],
      accessRights: ['view-courses', 'edit-courses'],
      isPrimary: true,
      isActive: true,
      joinedAt: '2024-01-01T00:00:00Z',
    },
  ],
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockPerson: IPerson = {
  firstName: 'John',
  middleName: null,
  lastName: 'Smith',
  suffix: null,
  preferredFirstName: 'Johnny',
  preferredLastName: null,
  pronouns: 'he/him',
  emails: [
    {
      email: 'johnny.smith@example.com',
      type: 'institutional',
      isPrimary: true,
      verified: true,
      allowNotifications: true,
      label: null,
    },
  ],
  phones: [
    {
      number: '+12025551234',
      type: 'mobile',
      isPrimary: true,
      verified: true,
      allowSMS: true,
      label: null,
    },
  ],
  addresses: [],
  dateOfBirth: null,
  last4SSN: null,
  avatar: 'https://example.com/avatar.jpg',
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

describe('StaffCard', () => {
  const renderComponent = (staff: StaffListItem, person?: IPerson) => {
    return render(
      <BrowserRouter>
        <StaffCard staff={staff} person={person} />
      </BrowserRouter>
    );
  };

  it('should render staff card with legacy data', () => {
    renderComponent(mockStaff);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText('Senior Instructor')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should render staff card with person data', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText(/Johnny Smith/)).toBeInTheDocument();
    expect(screen.getByText('johnny.smith@example.com')).toBeInTheDocument();
  });

  it('should display pronouns when person data is available', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText('(he/him)')).toBeInTheDocument();
  });

  it('should display primary phone when person data is available', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText('+1 (202) 555-1234')).toBeInTheDocument();
  });

  it('should use preferred name when available', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText(/Johnny Smith/)).toBeInTheDocument();
    expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
  });

  it('should display professional title from staff data', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText('Senior Instructor')).toBeInTheDocument();
  });

  it('should display active status', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should display inactive status', () => {
    const inactiveStaff = { ...mockStaff, isActive: false };
    renderComponent(inactiveStaff);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should display department information', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText('Primary Department')).toBeInTheDocument();
  });

  it('should fallback to legacy data when person is not provided', () => {
    renderComponent(mockStaff);

    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john.smith@example.com')).toBeInTheDocument();
    expect(screen.queryByText('(he/him)')).not.toBeInTheDocument();
  });

  it('should not display phone when not available in legacy data', () => {
    renderComponent(mockStaff);

    expect(screen.queryByText('+1 (202) 555-1234')).not.toBeInTheDocument();
  });

  it('should handle staff with no preferred name', () => {
    const personNoPreferred = {
      ...mockPerson,
      preferredFirstName: null,
      preferredLastName: null,
    };
    renderComponent(mockStaff, personNoPreferred);

    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });

  it('should handle staff with no email', () => {
    const staffNoEmail = { ...mockStaff, email: undefined };
    const personNoEmail = { ...mockPerson, emails: [] };
    renderComponent(staffNoEmail, personNoEmail);

    expect(screen.queryByText('john.smith@example.com')).not.toBeInTheDocument();
  });

  it('should display department roles', () => {
    renderComponent(mockStaff, mockPerson);

    expect(screen.getByText('instructor')).toBeInTheDocument();
  });

  it('should handle multiple department memberships', () => {
    const staffMultipleDepts = {
      ...mockStaff,
      departmentMemberships: [
        ...mockStaff.departmentMemberships,
        {
          departmentId: 'dept2',
          departmentName: 'Mathematics',
          departmentSlug: 'math',
          roles: ['content-admin'],
          accessRights: ['view-courses'],
          isPrimary: false,
          isActive: true,
          joinedAt: '2024-02-01T00:00:00Z',
        },
      ],
    };
    renderComponent(staffMultipleDepts, mockPerson);

    expect(screen.getByText('instructor')).toBeInTheDocument();
    expect(screen.getByText('content-admin')).toBeInTheDocument();
  });
});
