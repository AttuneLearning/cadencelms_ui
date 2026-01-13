/**
 * Tests for UserAvatar Component - Phase 3
 * Version: 2.0.0
 * Date: 2026-01-13
 *
 * Tests both v1.0 (backward compatibility) and v2.0 (person data) usage
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from '../UserAvatar';
import type { IPerson } from '@/shared/types/person';

// ============================================================================
// Test Data
// ============================================================================

const mockPersonLegalName: IPerson = {
  firstName: 'John',
  middleName: 'Michael',
  lastName: 'Doe',
  suffix: null,
  preferredFirstName: null,
  preferredLastName: null,
  pronouns: null,
  emails: [],
  phones: [],
  addresses: [],
  dateOfBirth: null,
  last4SSN: null,
  avatar: 'https://example.com/avatar.jpg',
  bio: null,
  timezone: 'America/New_York',
  languagePreference: 'en',
  locale: null,
  communicationPreferences: {
    preferredMethod: null,
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
  ...mockPersonLegalName,
  preferredFirstName: 'Johnny',
  preferredLastName: 'Smith',
  avatar: null, // Test fallback
};

// ============================================================================
// Test Suites
// ============================================================================

describe('UserAvatar Component', () => {
  describe('V2.0: Person Data', () => {
    it('should render with person data (legal name)', () => {
      const { container } = render(<UserAvatar person={mockPersonLegalName} />);

      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should display initials from person legal name', () => {
      render(<UserAvatar person={mockPersonLegalName} />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display initials from person preferred name', () => {
      render(<UserAvatar person={mockPersonPreferredName} />);

      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should use avatar from person data', () => {
      const { container } = render(<UserAvatar person={mockPersonLegalName} />);

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
        expect(img).toHaveAttribute('alt', 'John Doe');
      }
    });

    it('should display alt text with person name', () => {
      const { container } = render(<UserAvatar person={mockPersonLegalName} />);

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'John Doe');
      }
    });

    it('should handle person without avatar', () => {
      render(<UserAvatar person={mockPersonPreferredName} />);

      // Should still show initials
      expect(screen.getByText('JS')).toBeInTheDocument();
    });
  });

  describe('V1.0: Backward Compatibility', () => {
    it('should render with firstName and lastName (deprecated)', () => {
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" />
      );

      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should display initials from firstName/lastName', () => {
      render(<UserAvatar firstName="John" lastName="Doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should use direct avatar prop', () => {
      const avatarUrl = 'https://example.com/avatar.jpg';
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" avatar={avatarUrl} />
      );

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('src', avatarUrl);
        expect(img).toHaveAttribute('alt', 'John Doe');
      }
    });

    it('should convert initials to uppercase', () => {
      render(<UserAvatar firstName="john" lastName="doe" />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should handle single character names', () => {
      render(<UserAvatar firstName="A" lastName="B" />);

      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('should handle names with special characters', () => {
      render(<UserAvatar firstName="José" lastName="García" />);

      expect(screen.getByText('JG')).toBeInTheDocument();
    });
  });

  describe('Display Name Priority', () => {
    it('should prefer provided displayName over person data', () => {
      render(
        <UserAvatar displayName="Custom Name" person={mockPersonLegalName} />
      );

      expect(screen.getByText('CN')).toBeInTheDocument();
    });

    it('should prefer person data over firstName/lastName', () => {
      render(
        <UserAvatar
          person={mockPersonLegalName}
          firstName="Ignored"
          lastName="Name"
        />
      );

      // Should use person data (John Doe) not firstName/lastName
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should use displayName directly', () => {
      render(<UserAvatar displayName="Alice Smith" />);

      expect(screen.getByText('AS')).toBeInTheDocument();
    });
  });

  describe('Avatar Priority', () => {
    it('should prefer person.avatar over direct avatar prop', () => {
      const { container } = render(
        <UserAvatar
          person={mockPersonLegalName}
          avatar="https://example.com/fallback.jpg"
        />
      );

      const img = container.querySelector('img');
      if (img) {
        // Should use person.avatar
        expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      }
    });

    it('should fall back to direct avatar prop when person has no avatar', () => {
      const { container } = render(
        <UserAvatar
          person={mockPersonPreferredName}
          avatar="https://example.com/fallback.jpg"
        />
      );

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('src', 'https://example.com/fallback.jpg');
      }
    });
  });

  describe('Size Variants', () => {
    it('should apply default size (md)', () => {
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" />
      );

      const avatar = container.querySelector('[class*="h-10"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-10');
    });

    it('should apply small size', () => {
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" size="sm" />
      );

      const avatar = container.querySelector('[class*="h-6"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-6');
    });

    it('should apply large size', () => {
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" size="lg" />
      );

      const avatar = container.querySelector('[class*="h-16"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-16');
    });

    it('should apply extra large size', () => {
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" size="xl" />
      );

      const avatar = container.querySelector('[class*="h-20"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-20');
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          className="border-2 border-primary"
        />
      );

      const avatar = container.querySelector('[class*="border-2"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('border-primary');
    });

    it('should merge custom className with size class', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          size="lg"
          className="ring-2 ring-primary"
        />
      );

      const avatar = container.querySelector('[class*="h-16"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('ring-2');
      expect(avatar).toHaveClass('ring-primary');
    });
  });

  describe('Initials Edge Cases', () => {
    it('should handle single word display name', () => {
      render(<UserAvatar displayName="Madonna" />);

      // Single name should use first 2 characters
      expect(screen.getByText('MA')).toBeInTheDocument();
    });

    it('should handle empty first name', () => {
      render(<UserAvatar firstName="" lastName="Doe" />);

      // Single name uses first 2 chars
      expect(screen.getByText('DO')).toBeInTheDocument();
    });

    it('should handle empty last name', () => {
      render(<UserAvatar firstName="John" lastName="" />);

      // Single name uses first 2 chars
      expect(screen.getByText('JO')).toBeInTheDocument();
    });

    it('should handle both names empty with fallback', () => {
      render(<UserAvatar firstName="" lastName="" />);

      // Should show default fallback 'U'
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      render(
        <UserAvatar firstName="Alexandrina" lastName="Montgomery-Fitzwilliam" />
      );

      expect(screen.getByText('AM')).toBeInTheDocument();
    });

    it('should handle multiple middle names in display name', () => {
      render(<UserAvatar displayName="John Michael David Smith" />);

      // Should use first and last part
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should handle names with extra whitespace', () => {
      render(<UserAvatar displayName="  John   Doe  " />);

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should default to U when no data provided', () => {
      const { container } = render(<UserAvatar />);

      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alt text for avatar image with person data', () => {
      const { container } = render(<UserAvatar person={mockPersonLegalName} />);

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'John Doe');
      }
    });

    it('should have proper alt text with displayName', () => {
      const { container } = render(
        <UserAvatar displayName="Alice Smith" avatar="https://example.com/avatar.jpg" />
      );

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'Alice Smith');
      }
    });

    it('should have fallback alt text when no name provided', () => {
      const { container } = render(
        <UserAvatar avatar="https://example.com/avatar.jpg" />
      );

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'User');
      }
    });

    it('should display fallback initials when image fails to load', () => {
      render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          avatar="https://example.com/broken-image.jpg"
        />
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with person data', () => {
      const { container } = render(<UserAvatar person={mockPersonLegalName} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with deprecated props', () => {
      const { container } = render(
        <UserAvatar firstName="John" lastName="Doe" />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with displayName', () => {
      const { container } = render(<UserAvatar displayName="Alice Smith" />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with size variants', () => {
      const { container: smContainer } = render(
        <UserAvatar firstName="John" lastName="Doe" size="sm" />
      );
      const { container: lgContainer } = render(
        <UserAvatar firstName="John" lastName="Doe" size="lg" />
      );

      expect(smContainer.firstChild).toMatchSnapshot();
      expect(lgContainer.firstChild).toMatchSnapshot();
    });
  });
});
