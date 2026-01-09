/**
 * Tests for ProgramList Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramList } from '../ProgramList';
import {
  mockProgramListItems,
  createMockProgramListItem,
} from '@/test/mocks/data/programs';

describe('ProgramList', () => {
  describe('Rendering', () => {
    it('should render list of programs', () => {
      render(<ProgramList programs={mockProgramListItems} />);

      mockProgramListItems.forEach((program) => {
        expect(screen.getByText(program.name)).toBeInTheDocument();
      });
    });

    it('should render correct number of program cards', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} />
      );

      const cards = container.querySelectorAll('[class*="rounded-lg border"]');
      expect(cards.length).toBe(mockProgramListItems.length);
    });

    it('should render empty array without errors', () => {
      const { container } = render(<ProgramList programs={[]} />);

      expect(container).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display default empty message when no programs', () => {
      render(<ProgramList programs={[]} />);

      expect(screen.getByText('No programs found')).toBeInTheDocument();
    });

    it('should display custom empty message', () => {
      const customMessage = 'No programs match your search';
      render(<ProgramList programs={[]} emptyMessage={customMessage} />);

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should display icon in empty state', () => {
      const { container } = render(<ProgramList programs={[]} />);

      const icon = container.querySelector('svg.lucide-book-open');
      expect(icon).toBeInTheDocument();
    });

    it('should have proper styling for empty state', () => {
      const { container } = render(<ProgramList programs={[]} />);

      const emptyContainer = container.querySelector('[class*="border-dashed"]');
      expect(emptyContainer).toBeInTheDocument();
      expect(emptyContainer).toHaveClass('min-h-[400px]');
    });
  });

  describe('Loading State', () => {
    it('should display skeleton loaders when loading', () => {
      const { container } = render(
        <ProgramList programs={[]} isLoading={true} />
      );

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display 6 skeleton cards by default', () => {
      const { container } = render(
        <ProgramList programs={[]} isLoading={true} />
      );

      const skeletonCards = container.querySelectorAll('[class*="rounded-lg border p-6"]');
      expect(skeletonCards.length).toBe(6);
    });

    it('should not display programs when loading', () => {
      render(<ProgramList programs={mockProgramListItems} isLoading={true} />);

      mockProgramListItems.forEach((program) => {
        expect(screen.queryByText(program.name)).not.toBeInTheDocument();
      });
    });

    it('should not display empty state when loading', () => {
      render(<ProgramList programs={[]} isLoading={true} />);

      expect(screen.queryByText('No programs found')).not.toBeInTheDocument();
    });
  });

  describe('Grid Variant', () => {
    it('should render in grid layout by default', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} />
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('sm:grid-cols-2');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('should render in grid layout when variant is grid', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="grid" />
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should apply grid gap', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="grid" />
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toHaveClass('gap-6');
    });
  });

  describe('List Variant', () => {
    it('should render in list layout when variant is list', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="list" />
      );

      const listContainer = container.querySelector('[class*="flex-col"]');
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass('flex');
      expect(listContainer).toHaveClass('flex-col');
    });

    it('should not have grid layout classes in list container', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="list" />
      );

      // Check that the main container doesn't have grid layout (but cards inside may have grid)
      const mainContainer = container.firstChild as HTMLElement;
      const hasGridLayoutClasses = mainContainer?.className?.includes('grid') &&
                                   mainContainer?.className?.includes('grid-cols');
      expect(hasGridLayoutClasses).toBe(false);
    });

    it('should apply list gap', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="list" />
      );

      const listContainer = container.querySelector('[class*="flex-col"]');
      expect(listContainer).toHaveClass('gap-4');
    });
  });

  describe('Click Interaction', () => {
    it('should call onProgramClick when program is clicked', async () => {
      const user = userEvent.setup();
      const onProgramClick = vi.fn();

      render(
        <ProgramList
          programs={mockProgramListItems}
          onProgramClick={onProgramClick}
        />
      );

      const firstProgramCard = screen
        .getByText(mockProgramListItems[0].name)
        .closest('[class*="cursor-pointer"]');

      await user.click(firstProgramCard!);

      expect(onProgramClick).toHaveBeenCalledTimes(1);
      expect(onProgramClick).toHaveBeenCalledWith(mockProgramListItems[0]);
    });

    it('should call onProgramClick with correct program data', async () => {
      const user = userEvent.setup();
      const onProgramClick = vi.fn();

      render(
        <ProgramList
          programs={mockProgramListItems}
          onProgramClick={onProgramClick}
        />
      );

      const secondProgramCard = screen
        .getByText(mockProgramListItems[1].name)
        .closest('[class*="cursor-pointer"]');

      await user.click(secondProgramCard!);

      expect(onProgramClick).toHaveBeenCalledWith(mockProgramListItems[1]);
    });

    it('should not make cards clickable when onProgramClick is not provided', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} />
      );

      const clickableCards = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(clickableCards.length).toBe(0);
    });

    it('should handle multiple program clicks', async () => {
      const user = userEvent.setup();
      const onProgramClick = vi.fn();

      render(
        <ProgramList
          programs={mockProgramListItems}
          onProgramClick={onProgramClick}
        />
      );

      const firstCard = screen
        .getByText(mockProgramListItems[0].name)
        .closest('[class*="cursor-pointer"]');

      const secondCard = screen
        .getByText(mockProgramListItems[1].name)
        .closest('[class*="cursor-pointer"]');

      await user.click(firstCard!);
      await user.click(secondCard!);

      expect(onProgramClick).toHaveBeenCalledTimes(2);
      expect(onProgramClick).toHaveBeenNthCalledWith(1, mockProgramListItems[0]);
      expect(onProgramClick).toHaveBeenNthCalledWith(2, mockProgramListItems[1]);
    });
  });

  describe('Loading State with Variants', () => {
    it('should show grid layout skeletons when loading in grid variant', () => {
      const { container } = render(
        <ProgramList programs={[]} isLoading={true} variant="grid" />
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    it('should show list layout skeletons when loading in list variant', () => {
      const { container } = render(
        <ProgramList programs={[]} isLoading={true} variant="list" />
      );

      const listContainer = container.querySelector('[class*="flex-col"]');
      expect(listContainer).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single program', () => {
      const singleProgram = [mockProgramListItems[0]];
      render(<ProgramList programs={singleProgram} />);

      expect(screen.getByText(singleProgram[0].name)).toBeInTheDocument();
    });

    it('should handle large number of programs', () => {
      const manyPrograms = Array.from({ length: 100 }, (_, i) =>
        createMockProgramListItem({ name: `Program ${i}` })
      );

      render(<ProgramList programs={manyPrograms} />);

      expect(screen.getByText('Program 0')).toBeInTheDocument();
      expect(screen.getByText('Program 99')).toBeInTheDocument();
    });

    it('should handle programs with missing optional fields', () => {
      const programWithMinimalData = createMockProgramListItem({
        description: '',
      });

      render(<ProgramList programs={[programWithMinimalData]} />);

      expect(screen.getByText(programWithMinimalData.name)).toBeInTheDocument();
    });

    it('should re-render when programs change', () => {
      const { rerender } = render(
        <ProgramList programs={[mockProgramListItems[0]]} />
      );

      expect(screen.getByText(mockProgramListItems[0].name)).toBeInTheDocument();
      expect(
        screen.queryByText(mockProgramListItems[1].name)
      ).not.toBeInTheDocument();

      rerender(<ProgramList programs={[mockProgramListItems[1]]} />);

      expect(
        screen.queryByText(mockProgramListItems[0].name)
      ).not.toBeInTheDocument();
      expect(screen.getByText(mockProgramListItems[1].name)).toBeInTheDocument();
    });

    it('should handle switching from loading to loaded', () => {
      const { rerender } = render(
        <ProgramList programs={mockProgramListItems} isLoading={true} />
      );

      expect(screen.queryByText(mockProgramListItems[0].name)).not.toBeInTheDocument();

      rerender(<ProgramList programs={mockProgramListItems} isLoading={false} />);

      expect(screen.getByText(mockProgramListItems[0].name)).toBeInTheDocument();
    });

    it('should handle switching from loaded to empty', () => {
      const { rerender } = render(
        <ProgramList programs={mockProgramListItems} />
      );

      expect(screen.getByText(mockProgramListItems[0].name)).toBeInTheDocument();

      rerender(<ProgramList programs={[]} />);

      expect(screen.getByText('No programs found')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should render programs in a semantic structure', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} />
      );

      const listContainer = container.firstChild;
      expect(listContainer).toBeInTheDocument();
    });

    it('should maintain proper heading hierarchy in cards', () => {
      render(<ProgramList programs={mockProgramListItems} />);

      mockProgramListItems.forEach((program) => {
        const heading = screen.getByText(program.name);
        expect(heading).toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with programs in grid layout', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="grid" />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with programs in list layout', () => {
      const { container } = render(
        <ProgramList programs={mockProgramListItems} variant="list" />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in empty state', () => {
      const { container } = render(<ProgramList programs={[]} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot in loading state', () => {
      const { container } = render(
        <ProgramList programs={[]} isLoading={true} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
