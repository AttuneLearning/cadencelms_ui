/**
 * Tests for ExerciseList Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ExerciseList } from '../ExerciseList';
import {
  mockExerciseListItems,
  mockQuizExercise,
  mockExamExercise,
  createMockExerciseListItem,
} from '@/test/mocks/data/exercises';

// Wrapper component for Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ExerciseList', () => {
  describe('Rendering', () => {
    it('should render list of exercises', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} />
        </RouterWrapper>
      );

      mockExerciseListItems.forEach((exercise) => {
        expect(screen.getByText(exercise.title)).toBeInTheDocument();
      });
    });

    it('should render single exercise', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={[mockQuizExercise]} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockQuizExercise.title)).toBeInTheDocument();
    });

    it('should render multiple exercises', () => {
      const exercises = [mockQuizExercise, mockExamExercise];

      render(
        <RouterWrapper>
          <ExerciseList exercises={exercises} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockQuizExercise.title)).toBeInTheDocument();
      expect(screen.getByText(mockExamExercise.title)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render empty state when no exercises', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={[]} />
        </RouterWrapper>
      );

      expect(screen.getByText('No exercises found')).toBeInTheDocument();
    });

    it('should render custom empty message', () => {
      const customMessage = 'No exercises available in this category';

      render(
        <RouterWrapper>
          <ExerciseList exercises={[]} emptyMessage={customMessage} />
        </RouterWrapper>
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('should render empty state in dashed border container', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={[]} />
        </RouterWrapper>
      );

      const emptyContainer = container.querySelector('[class*="border-dashed"]');
      expect(emptyContainer).toBeInTheDocument();
    });
  });

  describe('Grid Variant', () => {
    it('should render in grid layout by default', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should render in grid layout when variant is grid', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} variant="grid" />
        </RouterWrapper>
      );

      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should display all exercises in grid', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} variant="grid" />
        </RouterWrapper>
      );

      expect(screen.getAllByRole('link')).toHaveLength(mockExerciseListItems.length);
    });
  });

  describe('List Variant', () => {
    it('should render in list layout when variant is list', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} variant="list" />
        </RouterWrapper>
      );

      const listContainer = container.querySelector('[class*="flex-col"]');
      expect(listContainer).toBeInTheDocument();
    });

    it('should display all exercises in list', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} variant="list" />
        </RouterWrapper>
      );

      expect(screen.getAllByRole('link')).toHaveLength(mockExerciseListItems.length);
    });
  });

  describe('Department Display', () => {
    it('should show department by default', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={[mockQuizExercise]} />
        </RouterWrapper>
      );

      expect(screen.getByText('Department:')).toBeInTheDocument();
    });

    it('should hide department when showDepartment is false', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={[mockQuizExercise]} showDepartment={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Department:')).not.toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-list-class';

      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} className={customClass} />
        </RouterWrapper>
      );

      const listContainer = container.querySelector(`.${customClass}`);
      expect(listContainer).toBeInTheDocument();
    });

    it('should combine custom className with default classes', () => {
      const customClass = 'my-custom-class';

      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} className={customClass} />
        </RouterWrapper>
      );

      const listContainer = container.querySelector(`.${customClass}`);
      expect(listContainer).toBeInTheDocument();
      expect(listContainer).toHaveClass('grid');
    });
  });

  describe('Exercise Cards', () => {
    it('should render ExerciseCard for each exercise', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} />
        </RouterWrapper>
      );

      mockExerciseListItems.forEach((exercise) => {
        expect(screen.getByText(exercise.title)).toBeInTheDocument();
      });
    });

    it('should pass correct exercise data to cards', () => {
      render(
        <RouterWrapper>
          <ExerciseList exercises={[mockQuizExercise]} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockQuizExercise.title)).toBeInTheDocument();
      expect(screen.getByText(mockQuizExercise.description!)).toBeInTheDocument();
      expect(screen.getByText('quiz')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle large number of exercises', () => {
      const manyExercises = Array.from({ length: 50 }, (_, i) =>
        createMockExerciseListItem({
          id: `ex-${i}`,
          title: `Exercise ${i}`,
        })
      );

      render(
        <RouterWrapper>
          <ExerciseList exercises={manyExercises} />
        </RouterWrapper>
      );

      expect(screen.getAllByRole('link')).toHaveLength(50);
    });

    it('should handle exercises with missing optional fields', () => {
      const minimalExercise = createMockExerciseListItem({
        description: undefined,
      });

      render(
        <RouterWrapper>
          <ExerciseList exercises={[minimalExercise]} />
        </RouterWrapper>
      );

      expect(screen.getByText(minimalExercise.title)).toBeInTheDocument();
    });

    it('should render exercises with different types', () => {
      const exercises = [
        createMockExerciseListItem({ type: 'quiz' }),
        createMockExerciseListItem({ type: 'exam' }),
        createMockExerciseListItem({ type: 'practice' }),
        createMockExerciseListItem({ type: 'assessment' }),
      ];

      render(
        <RouterWrapper>
          <ExerciseList exercises={exercises} />
        </RouterWrapper>
      );

      expect(screen.getByText('quiz')).toBeInTheDocument();
      expect(screen.getByText('exam')).toBeInTheDocument();
      expect(screen.getByText('practice')).toBeInTheDocument();
      expect(screen.getByText('assessment')).toBeInTheDocument();
    });

    it('should render exercises with different statuses', () => {
      const exercises = [
        createMockExerciseListItem({ status: 'published' }),
        createMockExerciseListItem({ status: 'draft' }),
        createMockExerciseListItem({ status: 'archived' }),
      ];

      render(
        <RouterWrapper>
          <ExerciseList exercises={exercises} />
        </RouterWrapper>
      );

      expect(screen.getByText('published')).toBeInTheDocument();
      expect(screen.getByText('draft')).toBeInTheDocument();
      expect(screen.getByText('archived')).toBeInTheDocument();
    });

    it('should render exercises with different difficulties', () => {
      const exercises = [
        createMockExerciseListItem({ difficulty: 'easy' }),
        createMockExerciseListItem({ difficulty: 'medium' }),
        createMockExerciseListItem({ difficulty: 'hard' }),
      ];

      render(
        <RouterWrapper>
          <ExerciseList exercises={exercises} />
        </RouterWrapper>
      );

      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('hard')).toBeInTheDocument();
    });
  });

  describe('Loading State Compatibility', () => {
    it('should handle switching from empty to populated', () => {
      const { rerender } = render(
        <RouterWrapper>
          <ExerciseList exercises={[]} />
        </RouterWrapper>
      );

      expect(screen.getByText('No exercises found')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} />
        </RouterWrapper>
      );

      expect(screen.queryByText('No exercises found')).not.toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(mockExerciseListItems.length);
    });

    it('should handle switching from populated to empty', () => {
      const { rerender } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} />
        </RouterWrapper>
      );

      expect(screen.getAllByRole('link')).toHaveLength(mockExerciseListItems.length);

      rerender(
        <RouterWrapper>
          <ExerciseList exercises={[]} />
        </RouterWrapper>
      );

      expect(screen.getByText('No exercises found')).toBeInTheDocument();
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for grid layout', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} variant="grid" />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for list layout', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={mockExerciseListItems} variant="list" />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for empty state', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseList exercises={[]} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
