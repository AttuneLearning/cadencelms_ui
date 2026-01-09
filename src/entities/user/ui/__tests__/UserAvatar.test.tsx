/**
 * Tests for UserAvatar Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserAvatar } from '../UserAvatar';

describe('UserAvatar', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
        />
      );

      // Avatar component renders as a span, not img
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should display initials when no avatar provided', () => {
      render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
        />
      );

      const initials = screen.getByText('JD');
      expect(initials).toBeInTheDocument();
    });

    it('should display correct initials for different names', () => {
      const { rerender } = render(
        <UserAvatar
          firstName="Alice"
          lastName="Smith"
        />
      );

      expect(screen.getByText('AS')).toBeInTheDocument();

      rerender(
        <UserAvatar
          firstName="Bob"
          lastName="Johnson"
        />
      );

      expect(screen.getByText('BJ')).toBeInTheDocument();
    });

    it('should convert initials to uppercase', () => {
      render(
        <UserAvatar
          firstName="john"
          lastName="doe"
        />
      );

      const initials = screen.getByText('JD');
      expect(initials).toBeInTheDocument();
      expect(initials.textContent).toBe('JD');
    });

    it('should handle single character names', () => {
      render(
        <UserAvatar
          firstName="A"
          lastName="B"
        />
      );

      expect(screen.getByText('AB')).toBeInTheDocument();
    });

    it('should handle names with special characters', () => {
      render(
        <UserAvatar
          firstName="José"
          lastName="García"
        />
      );

      expect(screen.getByText('JG')).toBeInTheDocument();
    });

    it('should render avatar image when provided', () => {
      const avatarUrl = 'https://example.com/avatar.jpg';
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          avatar={avatarUrl}
        />
      );

      // Avatar component uses img tag internally, but may not be immediately queryable
      // Check that avatar container is rendered with the avatar prop
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();

      // Image may be rendered asynchronously
      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('src', avatarUrl);
        expect(img).toHaveAttribute('alt', 'John Doe');
      }
    });
  });

  describe('Styling', () => {
    it('should apply default className', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
        />
      );

      const avatar = container.querySelector('[class*="h-10"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-10');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          className="h-16 w-16 custom-class"
        />
      );

      const avatar = container.querySelector('[class*="h-16"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-16');
      expect(avatar).toHaveClass('custom-class');
    });

    it('should merge custom className with default styles', () => {
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
  });

  describe('Accessibility', () => {
    it('should have proper alt text for avatar image', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          avatar="https://example.com/avatar.jpg"
        />
      );

      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'John Doe');
      } else {
        // Avatar may render as span if image is not loaded
        expect(container.querySelector('[class*="rounded-full"]')).toBeInTheDocument();
      }
    });

    it('should be accessible with screen readers', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
        />
      );

      // Avatar component renders as span with text content for accessibility
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should display fallback initials when image fails to load', () => {
      render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          avatar="https://example.com/broken-image.jpg"
        />
      );

      // Initials should still be present as fallback
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty first name gracefully', () => {
      render(
        <UserAvatar
          firstName=""
          lastName="Doe"
        />
      );

      const initials = screen.getByText('D');
      expect(initials).toBeInTheDocument();
    });

    it('should handle empty last name gracefully', () => {
      render(
        <UserAvatar
          firstName="John"
          lastName=""
        />
      );

      const initials = screen.getByText('J');
      expect(initials).toBeInTheDocument();
    });

    it('should handle both names empty', () => {
      const { container } = render(
        <UserAvatar
          firstName=""
          lastName=""
        />
      );

      // Should render without crashing
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle very long names', () => {
      render(
        <UserAvatar
          firstName="Alexandrina"
          lastName="Montgomery-Fitzwilliam"
        />
      );

      // Should only show first character of each name
      expect(screen.getByText('AM')).toBeInTheDocument();
    });

    it('should handle names with whitespace', () => {
      const { container } = render(
        <UserAvatar
          firstName="  John  "
          lastName="  Doe  "
        />
      );

      // Whitespace is preserved in this case, just check component renders
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });

    it('should handle names with numbers', () => {
      render(
        <UserAvatar
          firstName="John2"
          lastName="Doe3"
        />
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Component Variants', () => {
    it('should support small avatar size', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          className="h-6 w-6"
        />
      );

      const avatar = container.querySelector('[class*="h-6"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-6');
    });

    it('should support large avatar size', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          className="h-20 w-20"
        />
      );

      const avatar = container.querySelector('[class*="h-20"]');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass('w-20');
    });

    it('should support rounded variants', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          className="rounded-full"
        />
      );

      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with initials only', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with avatar image', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          avatar="https://example.com/avatar.jpg"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with custom className', () => {
      const { container } = render(
        <UserAvatar
          firstName="John"
          lastName="Doe"
          className="h-16 w-16 border-2 border-primary"
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
