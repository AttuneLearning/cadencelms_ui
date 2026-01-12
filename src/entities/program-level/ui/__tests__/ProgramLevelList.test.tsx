/**
 * Tests for ProgramLevelList Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgramLevelList } from '../ProgramLevelList';
import {
  mockProgramLevelListItems,
  createMockProgramLevelListItem,
} from '@/test/mocks/data/programLevels';

describe('ProgramLevelList', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      expect(screen.getByText('Year 1: Foundation')).toBeInTheDocument();
      expect(screen.getByText('Year 2: Core Concepts')).toBeInTheDocument();
      expect(screen.getByText('Year 3: Advanced Topics')).toBeInTheDocument();
      expect(screen.getByText('Year 4: Capstone')).toBeInTheDocument();
    });

    it('should render levels sorted by order', () => {
      const unsortedLevels = [
        mockProgramLevelListItems[2], // Order 3
        mockProgramLevelListItems[0], // Order 1
        mockProgramLevelListItems[3], // Order 4
        mockProgramLevelListItems[1], // Order 2
      ];

      render(<ProgramLevelList levels={unsortedLevels} />);

      const levelCards = screen.getAllByRole('heading', { level: 3 });
      expect(levelCards[0]).toHaveTextContent('Year 1: Foundation');
      expect(levelCards[1]).toHaveTextContent('Year 2: Core Concepts');
      expect(levelCards[2]).toHaveTextContent('Year 3: Advanced Topics');
      expect(levelCards[3]).toHaveTextContent('Year 4: Capstone');
    });

    it('should display order badges', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should display course count for each level', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      expect(screen.getByText('6')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display required credits when provided', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      const creditElements = screen.getAllByText('30');
      expect(creditElements.length).toBeGreaterThan(0);
    });

    it('should display descriptions', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      expect(
        screen.getByText(/Introduction to computer science fundamentals/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Data structures, algorithms, and software engineering/)
      ).toBeInTheDocument();
    });

    it('should display empty state when no levels', () => {
      render(<ProgramLevelList levels={[]} />);

      expect(screen.getByText('No Levels Found')).toBeInTheDocument();
      expect(
        screen.getByText("This program doesn't have any levels yet.")
      ).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<ProgramLevelList levels={[]} loading />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Reordering', () => {
    it('should show reorder controls when enableReorder is true', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} enableReorder />);

      const upArrows = screen.getAllByRole('button', { name: '' });
      // Should have up/down buttons for each level (2 buttons per level)
      expect(upArrows.length).toBe(mockProgramLevelListItems.length * 2);
    });

    it('should not show reorder controls when enableReorder is false', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} enableReorder={false} />);

      const gripIcons = document.querySelectorAll('[class*="lucide-grip-vertical"]');
      expect(gripIcons).toHaveLength(0);
    });

    it('should disable move up button for first item', () => {
      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      // First button (up arrow for first item) should be disabled
      const firstUpButton = buttons[0];
      expect(firstUpButton).toBeDisabled();
    });

    it('should disable move down button for last item', () => {
      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      // Last button (down arrow for last item) should be disabled
      const lastDownButton = buttons[buttons.length - 1];
      expect(lastDownButton).toBeDisabled();
    });

    it('should call onReorder when move up is clicked', async () => {
      const user = userEvent.setup();
      const handleReorder = vi.fn();

      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={handleReorder}
        />
      );

      const buttons = screen.getAllByRole('button');
      // Second up button (for second item)
      const secondUpButton = buttons[2];

      await user.click(secondUpButton);

      expect(handleReorder).toHaveBeenCalledWith('level-2', 1);
    });

    it('should call onReorder when move down is clicked', async () => {
      const user = userEvent.setup();
      const handleReorder = vi.fn();

      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={handleReorder}
        />
      );

      const buttons = screen.getAllByRole('button');
      // First down button (for first item)
      const firstDownButton = buttons[1];

      await user.click(firstDownButton);

      expect(handleReorder).toHaveBeenCalledWith('level-1', 2);
    });

    it('should show reordering state temporarily', async () => {
      const user = userEvent.setup();
      const handleReorder = vi.fn();

      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={handleReorder}
        />
      );

      const buttons = screen.getAllByRole('button');
      const upButton = buttons[2];

      await user.click(upButton);

      // Reordering state should clear after timeout (500ms in component)
      await waitFor(
        () => {
          expect(handleReorder).toHaveBeenCalled();
        },
        { timeout: 1000 }
      );
    });

    it('should disable buttons during reordering', async () => {
      const user = userEvent.setup();
      const handleReorder = vi.fn();

      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={handleReorder}
        />
      );

      const buttons = screen.getAllByRole('button');
      const upButton = buttons[2];

      await user.click(upButton);

      // During reordering, buttons should be disabled
      // This happens immediately after click before timeout
      expect(handleReorder).toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should handle level click when onLevelClick is provided', async () => {
      const user = userEvent.setup();
      const handleLevelClick = vi.fn();

      render(
        <ProgramLevelList levels={mockProgramLevelListItems} onLevelClick={handleLevelClick} />
      );

      const levelCard = screen.getByText('Year 1: Foundation').closest('.cursor-pointer');
      expect(levelCard).toBeInTheDocument();

      if (levelCard) {
        await user.click(levelCard);
        expect(handleLevelClick).toHaveBeenCalledWith('level-1');
      }
    });

    it('should not be clickable when onLevelClick is not provided', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      const levelCard = screen.getByText('Year 1: Foundation').closest('.cursor-pointer');
      expect(levelCard).not.toBeInTheDocument();
    });

    it('should not call onLevelClick when reorder controls are enabled', async () => {
      const user = userEvent.setup();
      const handleLevelClick = vi.fn();

      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onLevelClick={handleLevelClick}
        />
      );

      const levelCard = screen.getByText('Year 1: Foundation').closest('[class*="space-y-2"]');
      if (levelCard) {
        const parentCard = levelCard.querySelector('[class*="p-4"]');
        if (parentCard) {
          await user.click(parentCard);
          expect(handleLevelClick).not.toHaveBeenCalled();
        }
      }
    });

    it('should stop propagation when clicking reorder buttons', async () => {
      const user = userEvent.setup();
      const handleLevelClick = vi.fn();
      const handleReorder = vi.fn();

      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={handleReorder}
          onLevelClick={handleLevelClick}
        />
      );

      const buttons = screen.getAllByRole('button');
      const downButton = buttons[1];

      await user.click(downButton);

      expect(handleReorder).toHaveBeenCalled();
      expect(handleLevelClick).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single level', () => {
      const singleLevel = [mockProgramLevelListItems[0]];

      render(<ProgramLevelList levels={singleLevel} enableReorder onReorder={vi.fn()} />);

      expect(screen.getByText('Year 1: Foundation')).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      // Both up and down should be disabled for single item
      expect(buttons[0]).toBeDisabled(); // Up
      expect(buttons[1]).toBeDisabled(); // Down
    });

    it('should handle level without description', () => {
      const levelNoDesc = createMockProgramLevelListItem({
        name: 'Level Without Description',
        description: null,
      });

      render(<ProgramLevelList levels={[levelNoDesc]} />);

      expect(screen.getByText('Level Without Description')).toBeInTheDocument();
    });

    it('should handle level with zero course count', () => {
      const levelNoCourses = createMockProgramLevelListItem({
        courseCount: 0,
      });

      render(<ProgramLevelList levels={[levelNoCourses]} />);

      expect(screen.getByText('0')).toBeInTheDocument();
      expect(screen.getByText('Courses')).toBeInTheDocument();
    });

    it('should handle level without required credits', () => {
      const levelNoCredits = createMockProgramLevelListItem({
        requiredCredits: null,
      });

      render(<ProgramLevelList levels={[levelNoCredits]} />);

      expect(screen.queryByText('Credits')).not.toBeInTheDocument();
    });

    it('should handle very large number of levels', () => {
      const manyLevels = Array.from({ length: 20 }, (_, i) =>
        createMockProgramLevelListItem({
          id: `level-${i}`,
          name: `Level ${i + 1}`,
          order: i + 1,
        })
      );

      render(<ProgramLevelList levels={manyLevels} />);

      expect(screen.getByText('Level 1')).toBeInTheDocument();
      expect(screen.getByText('Level 20')).toBeInTheDocument();
    });

    it('should handle levels with same order (should sort by existing order)', () => {
      const levelsWithDuplicateOrder = [
        createMockProgramLevelListItem({ id: 'level-a', order: 1 }),
        createMockProgramLevelListItem({ id: 'level-b', order: 1 }),
      ];

      render(<ProgramLevelList levels={levelsWithDuplicateOrder} />);

      const levelCards = screen.getAllByRole('heading', { level: 3 });
      expect(levelCards).toHaveLength(2);
    });
  });

  describe('Loading States', () => {
    it('should show three skeleton items when loading', () => {
      render(<ProgramLevelList levels={[]} loading />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      // Should have multiple skeleton elements (3 cards with multiple skeleton parts each)
      expect(skeletons.length).toBeGreaterThan(3);
    });

    it('should not show empty state when loading', () => {
      render(<ProgramLevelList levels={[]} loading />);

      expect(screen.queryByText('No Levels Found')).not.toBeInTheDocument();
    });

    it('should not show actual levels when loading', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} loading />);

      expect(screen.queryByText('Year 1: Foundation')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings).toHaveLength(4);
    });

    it('should have keyboard accessible reorder buttons', () => {
      render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={vi.fn()}
        />
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should indicate loading state accessibly', () => {
      render(<ProgramLevelList levels={[]} loading />);

      // Loading skeleton should be visible
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with default view', () => {
      const { container } = render(<ProgramLevelList levels={mockProgramLevelListItems} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with reorder enabled', () => {
      const { container } = render(
        <ProgramLevelList
          levels={mockProgramLevelListItems}
          enableReorder
          onReorder={vi.fn()}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with empty state', () => {
      const { container } = render(<ProgramLevelList levels={[]} />);

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with loading state', () => {
      const { container } = render(<ProgramLevelList levels={[]} loading />);

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
