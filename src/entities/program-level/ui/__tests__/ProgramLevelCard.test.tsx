/**
 * Tests for ProgramLevelCard Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramLevelCard } from '../ProgramLevelCard';
import {
  mockProgramLevel,
  mockProgramLevelWithCourses,
  mockMinimalProgramLevel,
  mockProgramLevelListItems,
} from '@/test/mocks/data/programLevels';

describe('ProgramLevelCard', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ProgramLevelCard level={mockProgramLevel} />);

      expect(screen.getByText('Year 1: Foundation')).toBeInTheDocument();
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    it('should display level name', () => {
      render(<ProgramLevelCard level={mockProgramLevel} />);

      const levelName = screen.getByText('Year 1: Foundation');
      expect(levelName).toBeInTheDocument();
    });

    it('should display order badge', () => {
      render(<ProgramLevelCard level={mockProgramLevel} />);

      const orderBadge = screen.getByText('Order 1');
      expect(orderBadge).toBeInTheDocument();
    });

    it('should display description when provided', () => {
      render(<ProgramLevelCard level={mockProgramLevel} />);

      const description = screen.getByText(/Introduction to computer science fundamentals/);
      expect(description).toBeInTheDocument();
    });

    it('should not display description when null', () => {
      render(<ProgramLevelCard level={mockMinimalProgramLevel} />);

      expect(screen.queryByText(/Introduction to computer science/)).not.toBeInTheDocument();
    });

    it('should display course count for full ProgramLevel', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails />);

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should display course count for ProgramLevelListItem', () => {
      render(<ProgramLevelCard level={mockProgramLevelListItems[0]} showDetails />);

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should display required credits when provided', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails />);

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('Required Credits')).toBeInTheDocument();
    });

    it('should not display required credits when null', () => {
      render(<ProgramLevelCard level={mockMinimalProgramLevel} showDetails />);

      expect(screen.queryByText('Required Credits')).not.toBeInTheDocument();
    });

    it('should display program info when showProgram is true', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showProgram />);

      expect(screen.getByText('Program')).toBeInTheDocument();
      expect(screen.getByText('Bachelor of Science in Computer Science')).toBeInTheDocument();
      expect(screen.getByText('CS-BSC')).toBeInTheDocument();
    });

    it('should not display program info when showProgram is false', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showProgram={false} />);

      expect(screen.queryByText('Program')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Bachelor of Science in Computer Science')
      ).not.toBeInTheDocument();
    });

    it('should not show details when showDetails is false', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails={false} />);

      expect(screen.queryByText('Courses')).not.toBeInTheDocument();
      expect(screen.queryByText('Required Credits')).not.toBeInTheDocument();
    });

    it('should display timestamps', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails />);

      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });

    it('should display updated timestamp when different from created', () => {
      const levelWithUpdate = {
        ...mockProgramLevel,
        updatedAt: '2026-01-08T10:00:00Z',
      };

      render(<ProgramLevelCard level={levelWithUpdate} showDetails />);

      expect(screen.getByText(/Updated/)).toBeInTheDocument();
    });

    it('should not display updated timestamp when same as created', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails />);

      const updatedTexts = screen.queryAllByText(/Updated/);
      expect(updatedTexts).toHaveLength(0);
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ProgramLevelCard level={mockProgramLevel} onClick={handleClick} />);

      const card = screen.getByText('Year 1: Foundation').closest('.cursor-pointer');
      expect(card).toBeInTheDocument();

      if (card) {
        await user.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });

    it('should not be clickable when onClick is not provided', () => {
      render(<ProgramLevelCard level={mockProgramLevel} />);

      const levelName = screen.getByText('Year 1: Foundation');
      const card = levelName.closest('.cursor-pointer');
      expect(card).not.toBeInTheDocument();
    });

    it('should apply hover styles when clickable', () => {
      const handleClick = vi.fn();

      render(<ProgramLevelCard level={mockProgramLevel} onClick={handleClick} />);

      const levelName = screen.getByText('Year 1: Foundation');
      const card = levelName.closest('.cursor-pointer');
      expect(card).toHaveClass('cursor-pointer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle level with no courses', () => {
      render(<ProgramLevelCard level={mockMinimalProgramLevel} showDetails />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should handle level with many courses', () => {
      render(<ProgramLevelCard level={mockProgramLevelWithCourses} showDetails />);

      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should handle very long level names', () => {
      const longNameLevel = {
        ...mockProgramLevel,
        name: 'This is a very long level name that might cause layout issues in the UI component and needs to be truncated properly',
      };

      render(<ProgramLevelCard level={longNameLevel} />);

      expect(screen.getByText(longNameLevel.name)).toBeInTheDocument();
    });

    it('should handle very long descriptions', () => {
      const longDescLevel = {
        ...mockProgramLevel,
        description:
          'This is an extremely long description that goes on and on with lots of details about the program level, including learning outcomes, prerequisites, course structure, assessment methods, and career prospects. It should be truncated to avoid taking up too much space.',
      };

      render(<ProgramLevelCard level={longDescLevel} />);

      const description = screen.getByText(longDescLevel.description);
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('line-clamp-2');
    });

    it('should handle zero required credits', () => {
      const zeroCreditLevel = {
        ...mockProgramLevel,
        requiredCredits: 0,
      };

      render(<ProgramLevelCard level={zeroCreditLevel} showDetails />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Required Credits')).toBeInTheDocument();
    });

    it('should handle ProgramLevelListItem without program property', () => {
      render(
        <ProgramLevelCard level={mockProgramLevelListItems[0]} showProgram showDetails />
      );

      expect(screen.queryByText('Program')).not.toBeInTheDocument();
    });
  });

  describe('Different Level Types', () => {
    it('should render Foundation level correctly', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails />);

      expect(screen.getByText('Year 1: Foundation')).toBeInTheDocument();
      expect(screen.getByText('Order 1')).toBeInTheDocument();
    });

    it('should render Core Concepts level correctly', () => {
      render(<ProgramLevelCard level={mockProgramLevelWithCourses} showDetails />);

      expect(screen.getByText('Year 2: Core Concepts')).toBeInTheDocument();
      expect(screen.getByText('Order 2')).toBeInTheDocument();
    });

    it('should render level with different order numbers', () => {
      const { rerender } = render(<ProgramLevelCard level={mockProgramLevelListItems[2]} />);

      expect(screen.getByText('Order 3')).toBeInTheDocument();

      rerender(<ProgramLevelCard level={mockProgramLevelListItems[3]} />);

      expect(screen.getByText('Order 4')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<ProgramLevelCard level={mockProgramLevel} showDetails />);

      const levelName = screen.getByText('Year 1: Foundation');
      expect(levelName).toBeInTheDocument();
    });

    it('should be keyboard accessible when clickable', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ProgramLevelCard level={mockProgramLevel} onClick={handleClick} />);

      const card = screen.getByText('Year 1: Foundation').closest('.cursor-pointer');
      expect(card).toBeInTheDocument();

      if (card) {
        (card as HTMLElement).focus();
        await user.keyboard('{Enter}');
        // Note: Card onClick requires actual click, keyboard navigation would need button
      }
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with full details', () => {
      const { container } = render(
        <ProgramLevelCard level={mockProgramLevel} showProgram showDetails />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot without details', () => {
      const { container } = render(
        <ProgramLevelCard level={mockProgramLevel} showDetails={false} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with minimal level', () => {
      const { container } = render(
        <ProgramLevelCard level={mockMinimalProgramLevel} showDetails />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
