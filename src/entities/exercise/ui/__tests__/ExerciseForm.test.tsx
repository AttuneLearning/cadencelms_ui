/**
 * Tests for ExerciseForm Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseForm } from '../ExerciseForm';
import {
  mockPublishedQuiz,
  mockDraftQuiz,
  createMockExercise,
} from '@/test/mocks/data/exercises';

describe('ExerciseForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Create Mode', () => {
    it('should render empty form for creating new exercise', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Title/)).toHaveValue('');
      expect(screen.getByLabelText(/Description/)).toHaveValue('');
      expect(screen.getByRole('button', { name: /Create Exercise/ })).toBeInTheDocument();
    });

    it('should display create mode title', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Create a new exercise or exam.')).toBeInTheDocument();
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Title/), 'New Exercise');
      await user.type(screen.getByLabelText(/Description/), 'Test description');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'New Exercise',
            description: 'Test description',
            department: 'dept-1',
          })
        );
      });
    });

    it('should show info alert about adding questions', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(
        screen.getByText(/After creating the exercise, you'll be able to add questions/)
      ).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should render form with existing exercise data', () => {
      render(
        <ExerciseForm
          exercise={mockPublishedQuiz}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/Title/)).toHaveValue(mockPublishedQuiz.title);
      expect(screen.getByLabelText(/Description/)).toHaveValue(mockPublishedQuiz.description);
      expect(screen.getByRole('button', { name: /Update Exercise/ })).toBeInTheDocument();
    });

    it('should display update mode title', () => {
      render(
        <ExerciseForm
          exercise={mockPublishedQuiz}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Update the exercise details below.')).toBeInTheDocument();
    });

    it('should disable department field in edit mode', () => {
      render(
        <ExerciseForm
          exercise={mockPublishedQuiz}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText(/Department/)).toBeDisabled();
      expect(screen.getByText('Department cannot be changed')).toBeInTheDocument();
    });

    it('should show alert for exercise with no questions', () => {
      const exerciseWithNoQuestions = createMockExercise({ questionCount: 0 });

      render(
        <ExerciseForm
          exercise={exerciseWithNoQuestions}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(
        screen.getByText(/This exercise has no questions yet. Add at least one question/)
      ).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should render all required fields', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Department/)).toBeInTheDocument();
    });

    it('should render all optional fields', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Difficulty/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Time Limit/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Passing Score/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Instructions/)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Check that title field has required attribute
      expect(screen.getByLabelText(/Title/)).toBeRequired();

      // Check that department field has required attribute
      expect(screen.getByLabelText(/Department/)).toBeRequired();
    });
  });

  describe('Exercise Type Selection', () => {
    it('should allow selecting quiz type', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const typeSelect = screen.getByLabelText(/Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Quiz' }));

      expect(typeSelect).toHaveTextContent('Quiz');
    });

    it('should allow selecting exam type', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const typeSelect = screen.getByLabelText(/Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Exam' }));

      expect(typeSelect).toHaveTextContent('Exam');
    });

    it('should allow selecting practice type', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const typeSelect = screen.getByLabelText(/Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Practice' }));

      expect(typeSelect).toHaveTextContent('Practice');
    });

    it('should allow selecting assessment type', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const typeSelect = screen.getByLabelText(/Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Assessment' }));

      expect(typeSelect).toHaveTextContent('Assessment');
    });
  });

  describe('Difficulty Selection', () => {
    it('should allow selecting easy difficulty', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const difficultySelect = screen.getByLabelText(/Difficulty/);
      await user.click(difficultySelect);
      await user.click(screen.getByRole('option', { name: 'Easy' }));

      expect(difficultySelect).toHaveTextContent('Easy');
    });

    it('should allow selecting medium difficulty', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const difficultySelect = screen.getByLabelText(/Difficulty/);
      await user.click(difficultySelect);
      await user.click(screen.getByRole('option', { name: 'Medium' }));

      expect(difficultySelect).toHaveTextContent('Medium');
    });

    it('should allow selecting hard difficulty', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const difficultySelect = screen.getByLabelText(/Difficulty/);
      await user.click(difficultySelect);
      await user.click(screen.getByRole('option', { name: 'Hard' }));

      expect(difficultySelect).toHaveTextContent('Hard');
    });
  });

  describe('Time Limit Conversion', () => {
    it('should convert seconds to minutes for display', () => {
      const exercise = createMockExercise({ timeLimit: 1800 }); // 30 minutes

      render(<ExerciseForm exercise={exercise} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Time Limit/)).toHaveValue(30);
    });

    it('should convert minutes to seconds on input', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.clear(screen.getByLabelText(/Time Limit/));
      await user.type(screen.getByLabelText(/Time Limit/), '45');
      await user.type(screen.getByLabelText(/Title/), 'Test');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            timeLimit: 2700, // 45 * 60
          })
        );
      });
    });

    it('should handle 0 time limit (unlimited)', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.clear(screen.getByLabelText(/Time Limit/));
      await user.type(screen.getByLabelText(/Time Limit/), '0');
      await user.type(screen.getByLabelText(/Title/), 'Test');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            timeLimit: 0,
          })
        );
      });
    });

    it('should display helper text for unlimited time', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByText('Set to 0 for unlimited time')).toBeInTheDocument();
    });
  });

  describe('Passing Score Validation', () => {
    it('should accept valid passing score', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.clear(screen.getByLabelText(/Passing Score/));
      await user.type(screen.getByLabelText(/Passing Score/), '75');

      expect(screen.getByLabelText(/Passing Score/)).toHaveValue(75);
    });

    it('should have min value of 0', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Passing Score/)).toHaveAttribute('min', '0');
    });

    it('should have max value of 100', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Passing Score/)).toHaveAttribute('max', '100');
    });
  });

  describe('Behavior Options Checkboxes', () => {
    it('should render shuffle questions checkbox', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Shuffle Questions')).toBeInTheDocument();
      expect(screen.getByText('Randomize question order for each attempt')).toBeInTheDocument();
    });

    it('should render show feedback checkbox', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Show Feedback')).toBeInTheDocument();
      expect(screen.getByText('Display feedback after submission')).toBeInTheDocument();
    });

    it('should render allow review checkbox', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Allow Review')).toBeInTheDocument();
      expect(screen.getByText('Let learners review answers after completion')).toBeInTheDocument();
    });

    it('should toggle shuffle questions checkbox', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const checkbox = screen.getByLabelText('Shuffle Questions');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle show feedback checkbox', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const checkbox = screen.getByLabelText('Show Feedback');
      expect(checkbox).toBeChecked(); // Default is true

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should toggle allow review checkbox', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const checkbox = screen.getByLabelText('Allow Review');
      expect(checkbox).toBeChecked(); // Default is true

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('should submit form with checkbox values', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.click(screen.getByLabelText('Shuffle Questions'));
      await user.click(screen.getByLabelText('Show Feedback')); // Toggle off
      await user.type(screen.getByLabelText(/Title/), 'Test');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            shuffleQuestions: true,
            showFeedback: false,
            allowReview: true,
          })
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Title/), 'Test Exercise');
      await user.type(screen.getByLabelText(/Description/), 'Test description');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Test Exercise',
            description: 'Test description',
            department: 'dept-1',
          })
        );
      });
    });

    it('should not submit with empty title', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should remove empty description from payload', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Title/), 'Test');
      await user.type(screen.getByLabelText(/Department/), 'dept-1');
      await user.click(screen.getByRole('button', { name: /Create Exercise/ }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.not.objectContaining({
            description: expect.anything(),
          })
        );
      });
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.click(screen.getByRole('button', { name: /Cancel/ }));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not submit form when cancel is clicked', async () => {
      const user = userEvent.setup();

      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      await user.type(screen.getByLabelText(/Title/), 'Test');
      await user.click(screen.getByRole('button', { name: /Cancel/ }));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable form fields when loading', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByLabelText(/Title/)).toBeDisabled();
      expect(screen.getByLabelText(/Description/)).toBeDisabled();
      expect(screen.getByRole('button', { name: /Create Exercise/ })).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      expect(screen.getByRole('button', { name: /Cancel/ })).toBeDisabled();
    });

    it('should show loading spinner on submit button', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /Create Exercise/ });
      expect(submitButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      const errorMessage = 'Failed to create exercise';

      render(
        <ExerciseForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error alert when none provided', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      // Check that error message is not in the document
      expect(screen.queryByText(/Failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    });
  });

  describe('Field Validation', () => {
    it('should enforce title max length', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Title/)).toHaveAttribute('maxLength', '200');
    });

    it('should enforce title min length', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Title/)).toHaveAttribute('minLength', '1');
    });

    it('should enforce description max length', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Description/)).toHaveAttribute('maxLength', '2000');
    });

    it('should allow time limit of 0 or more', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Time Limit/)).toHaveAttribute('min', '0');
    });
  });

  describe('Default Values', () => {
    it('should have default difficulty of medium', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const difficultySelect = screen.getByLabelText(/Difficulty/);
      expect(difficultySelect).toHaveTextContent('Medium');
    });

    it('should have default type of quiz', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const typeSelect = screen.getByLabelText(/Type/);
      expect(typeSelect).toHaveTextContent('Quiz');
    });

    it('should have default passing score of 70', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText(/Passing Score/)).toHaveValue(70);
    });

    it('should have show feedback checked by default', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Show Feedback')).toBeChecked();
    });

    it('should have allow review checked by default', () => {
      render(<ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByLabelText('Allow Review')).toBeChecked();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for create mode', () => {
      const { container } = render(
        <ExerciseForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for edit mode', () => {
      const { container } = render(
        <ExerciseForm
          exercise={mockPublishedQuiz}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
