/**
 * Tests for UserCard Component - Phase 3
 * Version: 2.0.0
 * Date: 2026-01-13
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from '../UserCard';
import type { IPerson } from '@/shared/types/person';

// ============================================================================
// Test Data
// ============================================================================

const mockPerson: IPerson = {
  firstName: 'Jane',
  middleName: 'Marie',
  lastName: 'Smith',
  suffix: null,
  preferredFirstName: null,
  preferredLastName: null,
  pronouns: 'she/her',
  emails: [
    {
      email: 'jane.smith@example.com',
      type: 'institutional',
      isPrimary: true,
      verified: true,
      allowNotifications: true,
      label: null,
    },
    {
      email: 'jane.personal@example.com',
      type: 'personal',
      isPrimary: false,
      verified: false,
      allowNotifications: false,
      label: null,
    },
  ],
  phones: [
    {
      number: '+1-555-123-4567',
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
  avatar: 'https://example.com/jane-avatar.jpg',
  bio: 'Software engineer and educator passionate about technology and learning.',
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

const mockPersonPreferredName: IPerson = {
  ...mockPerson,
  preferredFirstName: 'Janey',
  preferredLastName: 'Jones',
  pronouns: 'they/them',
};

// ============================================================================
// Test Suites
// ============================================================================

describe('UserCard Component', () => {
  describe('Basic Rendering', () => {
    it('should render with person data', () => {
      render(<UserCard person={mockPerson} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should render with display name override', () => {
      render(<UserCard displayName="Custom Name" person={mockPerson} />);

      expect(screen.getByText('Custom Name')).toBeInTheDocument();
    });

    it('should show Unknown User when no data provided', () => {
      render(<UserCard />);

      expect(screen.getByText('Unknown User')).toBeInTheDocument();
    });

    it('should render user avatar', () => {
      const { container } = render(<UserCard person={mockPerson} />);

      // Check for avatar component
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Display Name', () => {
    it('should display legal name when no preferred name', () => {
      render(<UserCard person={mockPerson} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display preferred name when set', () => {
      render(<UserCard person={mockPersonPreferredName} />);

      expect(screen.getByText('Janey Jones')).toBeInTheDocument();
    });

    it('should prefer displayName prop over person data', () => {
      render(<UserCard displayName="Override Name" person={mockPerson} />);

      expect(screen.getByText('Override Name')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  describe('Pronouns', () => {
    it('should not show pronouns by default', () => {
      render(<UserCard person={mockPerson} />);

      expect(screen.queryByText('(she/her)')).not.toBeInTheDocument();
    });

    it('should show pronouns when showPronouns is true', () => {
      render(<UserCard person={mockPerson} showPronouns />);

      expect(screen.getByText('(she/her)')).toBeInTheDocument();
    });

    it('should handle different pronouns', () => {
      render(<UserCard person={mockPersonPreferredName} showPronouns />);

      expect(screen.getByText('(they/them)')).toBeInTheDocument();
    });

    it('should not show pronouns section when pronouns are null', () => {
      const personWithoutPronouns = { ...mockPerson, pronouns: null };
      render(<UserCard person={personWithoutPronouns} showPronouns />);

      expect(screen.queryByText(/\(/)).not.toBeInTheDocument();
    });
  });

  describe('Contact Information', () => {
    it('should show primary email by default', () => {
      render(<UserCard person={mockPerson} />);

      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('should show primary phone by default', () => {
      render(<UserCard person={mockPerson} />);

      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
    });

    it('should hide contact info when showContact is false', () => {
      render(<UserCard person={mockPerson} showContact={false} />);

      expect(screen.queryByText('jane.smith@example.com')).not.toBeInTheDocument();
      expect(screen.queryByText('+1-555-123-4567')).not.toBeInTheDocument();
    });

    it('should use email override when provided', () => {
      render(<UserCard person={mockPerson} email="override@example.com" />);

      expect(screen.getByText('override@example.com')).toBeInTheDocument();
      expect(screen.queryByText('jane.smith@example.com')).not.toBeInTheDocument();
    });

    it('should use phone override when provided', () => {
      render(<UserCard person={mockPerson} phone="+1-999-888-7777" />);

      expect(screen.getByText('+1-999-888-7777')).toBeInTheDocument();
      expect(screen.queryByText('+1-555-123-4567')).not.toBeInTheDocument();
    });

    it('should handle person with no email', () => {
      const personNoEmail = { ...mockPerson, emails: [] };
      render(<UserCard person={personNoEmail} />);

      expect(screen.queryByText('@')).not.toBeInTheDocument();
    });

    it('should handle person with no phone', () => {
      const personNoPhone = { ...mockPerson, phones: [] };
      render(<UserCard person={personNoPhone} />);

      // Phone number should not be present
      expect(screen.queryByText('555')).not.toBeInTheDocument();
    });
  });

  describe('Bio', () => {
    it('should not show bio by default', () => {
      render(<UserCard person={mockPerson} />);

      expect(screen.queryByText(/Software engineer/)).not.toBeInTheDocument();
    });

    it('should show bio when showBio is true', () => {
      render(<UserCard person={mockPerson} showBio />);

      expect(screen.getByText(/Software engineer and educator/)).toBeInTheDocument();
    });

    it('should not show bio section when bio is null', () => {
      const personNoBio = { ...mockPerson, bio: null };
      render(<UserCard person={personNoBio} showBio />);

      expect(screen.queryByText(/Software/)).not.toBeInTheDocument();
    });
  });

  describe('Layout', () => {
    it('should use vertical layout by default', () => {
      const { container } = render(<UserCard person={mockPerson} />);

      const content = container.querySelector('[class*="flex-col"]');
      expect(content).toBeInTheDocument();
    });

    it('should use horizontal layout when specified', () => {
      const { container } = render(<UserCard person={mockPerson} layout="horizontal" />);

      const content = container.querySelector('[class*="flex"]');
      expect(content).toBeInTheDocument();
      expect(content).not.toHaveClass('flex-col');
    });
  });

  describe('Avatar Size', () => {
    it('should use large avatar by default', () => {
      const { container } = render(<UserCard person={mockPerson} />);

      const avatar = container.querySelector('[class*="h-16"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should support small avatar size', () => {
      const { container } = render(<UserCard person={mockPerson} avatarSize="sm" />);

      const avatar = container.querySelector('[class*="h-6"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should support medium avatar size', () => {
      const { container } = render(<UserCard person={mockPerson} avatarSize="md" />);

      const avatar = container.querySelector('[class*="h-10"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should support extra large avatar size', () => {
      const { container } = render(<UserCard person={mockPerson} avatarSize="xl" />);

      const avatar = container.querySelector('[class*="h-20"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<UserCard person={mockPerson} onClick={handleClick} />);

      const card = screen.getByText('Jane Smith').closest('[class*="cursor-pointer"]');
      expect(card).toBeInTheDocument();

      if (card) {
        await user.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should not be clickable when onClick is not provided', () => {
      const { container } = render(<UserCard person={mockPerson} />);

      const card = container.querySelector('[class*="cursor-pointer"]');
      expect(card).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <UserCard person={mockPerson} className="custom-class" />
      );

      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should merge custom className with default classes', () => {
      const { container } = render(
        <UserCard person={mockPerson} className="border-4 border-primary" />
      );

      const card = container.querySelector('[class*="border-4"]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle person with minimal data', () => {
      const minimalPerson: IPerson = {
        firstName: 'Test',
        middleName: null,
        lastName: 'User',
        suffix: null,
        preferredFirstName: null,
        preferredLastName: null,
        pronouns: null,
        emails: [],
        phones: [],
        addresses: [],
        dateOfBirth: null,
        last4SSN: null,
        avatar: null,
        bio: null,
        timezone: 'UTC',
        languagePreference: 'en',
        locale: null,
        communicationPreferences: {
          preferredMethod: null,
          allowEmail: false,
          allowSMS: false,
          allowPhoneCalls: false,
          quietHoursStart: null,
          quietHoursEnd: null,
          notificationFrequency: 'none',
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

      render(<UserCard person={minimalPerson} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should handle empty props gracefully', () => {
      const { container } = render(<UserCard />);

      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('Unknown User')).toBeInTheDocument();
    });

    it('should render all features together', () => {
      render(
        <UserCard
          person={mockPerson}
          showPronouns
          showContact
          showBio
          layout="horizontal"
          avatarSize="xl"
        />
      );

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('(she/her)')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText(/Software engineer/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<UserCard person={mockPerson} />);

      // Should have heading for name
      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('Jane Smith');
    });

    it('should include icons for contact info', () => {
      const { container } = render(<UserCard person={mockPerson} />);

      // Mail and Phone icons should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with full person data', () => {
      const { container } = render(<UserCard person={mockPerson} showPronouns showBio />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with horizontal layout', () => {
      const { container } = render(<UserCard person={mockPerson} layout="horizontal" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with minimal data', () => {
      const { container } = render(<UserCard displayName="Test User" />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
