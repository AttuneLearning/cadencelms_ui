/**
 * Tests for ExerciseCard Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ExerciseCard } from '../ExerciseCard';
import {
  mockQuizExercise,
  mockExamExercise,
  mockPracticeExercise,
  mockAssessmentExercise,
  mockDraftExercise,
  mockArchivedExercise,
  createMockExerciseListItem,
} from '@/test/mocks/data/exercises';

// Wrapper component for Router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('ExerciseCard', () => {
  describe('Rendering', () => {
    it('should render with quiz exercise', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockQuizExercise.title)).toBeInTheDocument();
      expect(screen.getByText(mockQuizExercise.description!)).toBeInTheDocument();
    });

    it('should render with exam exercise', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockExamExercise.title)).toBeInTheDocument();
      expect(screen.getByText('exam')).toBeInTheDocument();
    });

    it('should render with practice exercise', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockPracticeExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockPracticeExercise.title)).toBeInTheDocument();
      expect(screen.getByText('practice')).toBeInTheDocument();
    });

    it('should render with assessment exercise', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockAssessmentExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockAssessmentExercise.title)).toBeInTheDocument();
      expect(screen.getByText('assessment')).toBeInTheDocument();
    });

    it('should display exercise description when provided', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(mockQuizExercise.description!)).toBeInTheDocument();
    });

    it('should not crash when description is missing', () => {
      const exercise = createMockExerciseListItem({ description: undefined });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(exercise.title)).toBeInTheDocument();
    });
  });

  describe('Exercise Type Badges', () => {
    it('should display quiz type badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('quiz')).toBeInTheDocument();
    });

    it('should display exam type badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('exam')).toBeInTheDocument();
    });

    it('should display practice type badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockPracticeExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('practice')).toBeInTheDocument();
    });

    it('should display assessment type badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockAssessmentExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('assessment')).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('should display published status badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('published')).toBeInTheDocument();
    });

    it('should display draft status badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockDraftExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('draft')).toBeInTheDocument();
    });

    it('should display archived status badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockArchivedExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('archived')).toBeInTheDocument();
    });
  });

  describe('Difficulty Badges', () => {
    it('should display easy difficulty badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('easy')).toBeInTheDocument();
    });

    it('should display medium difficulty badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockPracticeExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    it('should display hard difficulty badge', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('hard')).toBeInTheDocument();
    });
  });

  describe('Exercise Metadata', () => {
    it('should display question count', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('5 Questions')).toBeInTheDocument();
    });

    it('should display singular "Question" for 1 question', () => {
      const exercise = createMockExerciseListItem({ questionCount: 1 });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('1 Question')).toBeInTheDocument();
    });

    it('should display total points', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('50 Points')).toBeInTheDocument();
    });

    it('should display time limit in minutes', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    it('should display time limit in hours and minutes', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('2h')).toBeInTheDocument();
    });

    it('should display time limit with hours and minutes', () => {
      const exercise = createMockExerciseListItem({ timeLimit: 5400 }); // 1.5 hours

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('1h 30m')).toBeInTheDocument();
    });

    it('should display "Unlimited" for 0 time limit', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockPracticeExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('Unlimited')).toBeInTheDocument();
    });

    it('should display passing score', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('70% Pass')).toBeInTheDocument();
    });
  });

  describe('Department Display', () => {
    it('should display department by default', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('Department:')).toBeInTheDocument();
      expect(screen.getByText('dept-1')).toBeInTheDocument();
    });

    it('should not display department when showDepartment is false', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} showDepartment={false} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Department:')).not.toBeInTheDocument();
    });
  });

  describe('Feature Flags', () => {
    it('should display shuffle badge when enabled', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('Shuffle')).toBeInTheDocument();
    });

    it('should not display shuffle badge when disabled', () => {
      const exercise = createMockExerciseListItem({ shuffleQuestions: false });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Shuffle')).not.toBeInTheDocument();
    });

    it('should display feedback badge when enabled', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('Feedback')).toBeInTheDocument();
    });

    it('should not display feedback badge when disabled', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
    });

    it('should display review badge when enabled', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('should not display review badge when disabled', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Review')).not.toBeInTheDocument();
    });

    it('should display all enabled feature badges', () => {
      render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('Shuffle')).toBeInTheDocument();
      expect(screen.getByText('Feedback')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('should display no feature badges when all disabled', () => {
      const exercise = createMockExerciseListItem({
        shuffleQuestions: false,
        showFeedback: false,
        allowReview: false,
      });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.queryByText('Shuffle')).not.toBeInTheDocument();
      expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
      expect(screen.queryByText('Review')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-test-class';

      const { container } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} className={customClass} />
        </RouterWrapper>
      );

      const card = container.querySelector('.custom-test-class');
      expect(card).toBeInTheDocument();
    });

    it('should have hover shadow effect', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      const card = container.querySelector('[class*="hover:shadow-lg"]');
      expect(card).toBeInTheDocument();
    });

    it('should render as a link to exercise detail page', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      const link = container.querySelector(`a[href="/exercises/${mockQuizExercise.id}"]`);
      expect(link).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long exercise title', () => {
      const exercise = createMockExerciseListItem({
        title:
          'This is an extremely long exercise title that should be truncated in the UI to prevent layout issues and maintain a clean design',
      });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      const titleElement = screen.getByText(exercise.title);
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveClass('line-clamp-2');
    });

    it('should handle very long description', () => {
      const exercise = createMockExerciseListItem({
        description:
          'This is an extremely long exercise description that should be truncated in the UI. It contains a lot of text that would normally overflow the card boundaries and cause layout issues if not properly handled.',
      });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      const descriptionElement = screen.getByText(exercise.description!);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('line-clamp-2');
    });

    it('should handle exercise with 0 questions', () => {
      const exercise = createMockExerciseListItem({ questionCount: 0 });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('0 Questions')).toBeInTheDocument();
    });

    it('should handle exercise with 0 points', () => {
      const exercise = createMockExerciseListItem({ totalPoints: 0 });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('0 Points')).toBeInTheDocument();
    });

    it('should handle exercise with 100% passing score', () => {
      const exercise = createMockExerciseListItem({ passingScore: 100 });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('100% Pass')).toBeInTheDocument();
    });

    it('should handle exercise with special characters in title', () => {
      const exercise = createMockExerciseListItem({
        title: 'JavaScript & TypeScript: Advanced Topics <Part 1>',
      });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText(exercise.title)).toBeInTheDocument();
    });

    it('should handle exercise with very large time limit', () => {
      const exercise = createMockExerciseListItem({ timeLimit: 36000 }); // 10 hours

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('10h')).toBeInTheDocument();
    });

    it('should handle exercise with large question count', () => {
      const exercise = createMockExerciseListItem({ questionCount: 999 });

      render(
        <RouterWrapper>
          <ExerciseCard exercise={exercise} />
        </RouterWrapper>
      );

      expect(screen.getByText('999 Questions')).toBeInTheDocument();
    });
  });

  describe('All Exercise Types', () => {
    it('should render all exercise types from mock data', () => {
      const { rerender } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('quiz')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('exam')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <ExerciseCard exercise={mockPracticeExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('practice')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <ExerciseCard exercise={mockAssessmentExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('assessment')).toBeInTheDocument();
    });
  });

  describe('All Exercise Statuses', () => {
    it('should render all exercise statuses from mock data', () => {
      const { rerender } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('published')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <ExerciseCard exercise={mockDraftExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('draft')).toBeInTheDocument();

      rerender(
        <RouterWrapper>
          <ExerciseCard exercise={mockArchivedExercise} />
        </RouterWrapper>
      );
      expect(screen.getByText('archived')).toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for quiz exercise', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockQuizExercise} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for exam exercise', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockExamExercise} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for draft exercise', () => {
      const { container } = render(
        <RouterWrapper>
          <ExerciseCard exercise={mockDraftExercise} />
        </RouterWrapper>
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
