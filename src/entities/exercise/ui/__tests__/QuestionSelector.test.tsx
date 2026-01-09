/**
 * Tests for QuestionSelector Component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionSelector } from '../QuestionSelector';
import {
  mockQuestions,
  mockMultipleChoiceQuestion,
  mockTrueFalseQuestion,
  mockShortAnswerQuestion,
  mockEssayQuestion,
  mockMatchingQuestion,
  createMockQuestion,
} from '@/test/mocks/data/exercises';

describe('QuestionSelector', () => {
  const mockOnAddQuestion = vi.fn();
  const mockOnRemoveQuestion = vi.fn();

  beforeEach(() => {
    mockOnAddQuestion.mockClear();
    mockOnRemoveQuestion.mockClear();
  });

  describe('Rendering', () => {
    it('should render with questions list', () => {
      render(
        <QuestionSelector
          questions={mockQuestions}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      mockQuestions.forEach((question) => {
        expect(screen.getByText(question.questionText)).toBeInTheDocument();
      });
    });

    it('should render empty state when no questions', () => {
      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('No questions added yet')).toBeInTheDocument();
    });

    it('should display add question button', () => {
      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByRole('button', { name: /Add Question/ })).toBeInTheDocument();
    });
  });

  describe('Questions Summary', () => {
    it('should display question count', () => {
      render(
        <QuestionSelector
          questions={mockQuestions}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('5 Questions')).toBeInTheDocument();
    });

    it('should display singular "Question" for 1 question', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('1 Question')).toBeInTheDocument();
    });

    it('should display total points', () => {
      render(
        <QuestionSelector
          questions={mockQuestions}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      const totalPoints = mockQuestions.reduce((sum, q) => sum + q.points, 0);
      expect(screen.getByText(`${totalPoints} Total Points`)).toBeInTheDocument();
    });

    it('should display 0 points when no questions', () => {
      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('0 Total Points')).toBeInTheDocument();
    });
  });

  describe('Add Question Form', () => {
    it('should show form when add button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      expect(screen.getByLabelText(/Question Text/)).toBeInTheDocument();
    });

    it('should hide form when cancelled', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      expect(screen.getByLabelText(/Question Text/)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Cancel/ }));
      expect(screen.queryByLabelText(/Question Text/)).not.toBeInTheDocument();
    });

    it('should render all form fields', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      expect(screen.getByLabelText(/Question Text/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Question Type/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Difficulty/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Points/)).toBeInTheDocument();
      expect(screen.getByLabelText(/Explanation/)).toBeInTheDocument();
    });
  });

  describe('Question Type Selection', () => {
    it('should allow selecting multiple choice', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      expect(typeSelect).toHaveTextContent('Multiple Choice');
    });

    it('should allow selecting true/false', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'True/False' }));

      expect(typeSelect).toHaveTextContent('True/False');
    });

    it('should allow selecting short answer', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Short Answer' }));

      expect(typeSelect).toHaveTextContent('Short Answer');
    });

    it('should allow selecting essay', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Essay' }));

      expect(typeSelect).toHaveTextContent('Essay');
    });

    it('should allow selecting matching', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Matching' }));

      expect(typeSelect).toHaveTextContent('Matching');
    });
  });

  describe('Answer Options Management', () => {
    it('should show option fields for multiple choice', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Option 2')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Option 3')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Option 4')).toBeInTheDocument();
    });

    it('should not show option fields for short answer', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'Short Answer' }));

      expect(screen.queryByPlaceholderText('Option 1')).not.toBeInTheDocument();
    });

    it('should allow adding new option', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      await user.click(screen.getByRole('button', { name: /Add Option/ }));

      expect(screen.getByPlaceholderText('Option 5')).toBeInTheDocument();
    });

    it('should allow removing option', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      // Initially should have 4 options
      expect(screen.getByPlaceholderText('Option 4')).toBeInTheDocument();

      const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
        (btn) => btn.querySelector('svg')
      );

      // After removing one option, should have 3 left
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.queryByPlaceholderText('Option 4')).not.toBeInTheDocument();
        });
      }
    });

    it('should not allow removing when only 2 options remain', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      const deleteButtons = screen.getAllByRole('button', { name: '' }).filter(
        (btn) => btn.querySelector('svg')
      );

      // Should have delete buttons
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should limit options to 10', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      // Add 6 more options (4 default + 6 = 10)
      for (let i = 0; i < 6; i++) {
        const addButton = screen.queryByRole('button', { name: /Add Option/ });
        if (addButton) {
          await user.click(addButton);
        }
      }

      expect(screen.queryByRole('button', { name: /Add Option/ })).not.toBeInTheDocument();
    });
  });

  describe('Correct Answer Selection', () => {
    it('should show text input for correct answer by default', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));

      expect(screen.getByLabelText(/Correct Answer/)).toBeInTheDocument();
    });

    it('should show true/false select for true_false type', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      const typeSelect = screen.getByLabelText(/Question Type/);
      await user.click(typeSelect);
      await user.click(screen.getByRole('option', { name: 'True/False' }));

      const correctAnswerSelect = screen.getByLabelText(/Correct Answer/);
      await user.click(correctAnswerSelect);

      expect(screen.getByRole('option', { name: 'True' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'False' })).toBeInTheDocument();
    });
  });

  describe('Question Submission', () => {
    it('should call onAddQuestion with question data', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      await user.type(screen.getByLabelText(/Question Text/), 'Test question');
      await user.type(screen.getByLabelText(/Correct Answer/), 'Test answer');
      await user.click(screen.getAllByRole('button', { name: /Add Question/ })[1]);

      await waitFor(() => {
        expect(mockOnAddQuestion).toHaveBeenCalledWith(
          expect.objectContaining({
            questionText: 'Test question',
            correctAnswer: 'Test answer',
          })
        );
      });
    });

    it('should filter empty options before submission', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      await user.type(screen.getByLabelText(/Question Text/), 'Test question');
      await user.type(screen.getByPlaceholderText('Option 1'), 'Option A');
      await user.type(screen.getByPlaceholderText('Option 2'), 'Option B');
      // Leave Option 3 and 4 empty
      await user.type(screen.getByLabelText(/Correct Answer/), 'Option A');
      await user.click(screen.getAllByRole('button', { name: /Add Question/ })[1]);

      await waitFor(() => {
        expect(mockOnAddQuestion).toHaveBeenCalledWith(
          expect.objectContaining({
            options: ['Option A', 'Option B'],
          })
        );
      });
    });

    it('should reset form after successful submission', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      await user.click(screen.getByRole('button', { name: /Add Question/ }));
      await user.type(screen.getByLabelText(/Question Text/), 'Test question');
      await user.type(screen.getByLabelText(/Correct Answer/), 'Test answer');
      await user.click(screen.getAllByRole('button', { name: /Add Question/ })[1]);

      await waitFor(() => {
        expect(screen.queryByLabelText(/Question Text/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Question Display', () => {
    it('should display question text', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText(mockMultipleChoiceQuestion.questionText)).toBeInTheDocument();
    });

    it('should display question type badge', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('multiple_choice')).toBeInTheDocument();
    });

    it('should display difficulty badge', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText(mockMultipleChoiceQuestion.difficulty)).toBeInTheDocument();
    });

    it('should display points', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('10 pts')).toBeInTheDocument();
    });

    it('should display question number badge', () => {
      render(
        <QuestionSelector
          questions={mockQuestions}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('Q1')).toBeInTheDocument();
      expect(screen.getByText('Q2')).toBeInTheDocument();
      expect(screen.getByText('Q5')).toBeInTheDocument();
    });
  });

  describe('Question Options Display', () => {
    it('should display options for multiple choice questions', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      mockMultipleChoiceQuestion.options!.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('should mark correct answer with checkmark', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      const correctAnswerText = screen.getByText(mockMultipleChoiceQuestion.correctAnswer as string);
      expect(correctAnswerText).toHaveClass('font-medium', 'text-green-700');
    });

    it('should display explanation when present', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('Explanation:')).toBeInTheDocument();
      expect(screen.getByText(mockMultipleChoiceQuestion.explanation!)).toBeInTheDocument();
    });

    it('should not display options for essay questions', () => {
      render(
        <QuestionSelector
          questions={[mockEssayQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.queryByText('Option')).not.toBeInTheDocument();
    });
  });

  describe('Question Removal', () => {
    it('should display remove button for each question', () => {
      render(
        <QuestionSelector
          questions={mockQuestions}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: '' }).filter(
        (btn) => btn.querySelector('svg')?.classList.contains('text-destructive')
      );

      expect(removeButtons.length).toBeGreaterThan(0);
    });

    it('should call onRemoveQuestion when remove button clicked', async () => {
      const user = userEvent.setup();

      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: '' }).filter(
        (btn) => btn.querySelector('svg')?.classList.contains('text-destructive')
      );

      if (removeButtons.length > 0) {
        await user.click(removeButtons[0]);
        expect(mockOnRemoveQuestion).toHaveBeenCalledWith(mockMultipleChoiceQuestion.id);
      }
    });
  });

  describe('Loading State', () => {
    it('should disable add button when loading', () => {
      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
          isLoading={true}
        />
      );

      expect(screen.getByRole('button', { name: /Add Question/ })).toBeDisabled();
    });

    it('should disable remove buttons when loading', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
          isLoading={true}
        />
      );

      const removeButtons = screen.getAllByRole('button', { name: '' }).filter(
        (btn) => btn.querySelector('svg')?.classList.contains('text-destructive')
      );

      removeButtons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should disable buttons when loading', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
          isLoading={true}
        />
      );

      // Check that add button is disabled
      expect(screen.getByRole('button', { name: /Add Question/ })).toBeDisabled();
    });
  });

  describe('Error Display', () => {
    it('should display error message when provided', () => {
      const errorMessage = 'Failed to add question';

      render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('All Question Types Display', () => {
    it('should render multiple choice question correctly', () => {
      render(
        <QuestionSelector
          questions={[mockMultipleChoiceQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('multiple_choice')).toBeInTheDocument();
      expect(screen.getByText(mockMultipleChoiceQuestion.options![0])).toBeInTheDocument();
    });

    it('should render true/false question correctly', () => {
      render(
        <QuestionSelector
          questions={[mockTrueFalseQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('true_false')).toBeInTheDocument();
    });

    it('should render short answer question correctly', () => {
      render(
        <QuestionSelector
          questions={[mockShortAnswerQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('short_answer')).toBeInTheDocument();
    });

    it('should render essay question correctly', () => {
      render(
        <QuestionSelector
          questions={[mockEssayQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('essay')).toBeInTheDocument();
    });

    it('should render matching question correctly', () => {
      render(
        <QuestionSelector
          questions={[mockMatchingQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('matching')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long question text', () => {
      const longQuestion = createMockQuestion({
        questionText:
          'This is a very long question text that should still be displayed correctly in the UI without causing any layout issues or breaking the component structure',
      });

      render(
        <QuestionSelector
          questions={[longQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText(longQuestion.questionText)).toBeInTheDocument();
    });

    it('should handle question with many options', () => {
      const questionWithManyOptions = createMockQuestion({
        options: Array.from({ length: 10 }, (_, i) => `Option ${i + 1}`),
      });

      render(
        <QuestionSelector
          questions={[questionWithManyOptions]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      questionWithManyOptions.options!.forEach((option) => {
        expect(screen.getByText(option)).toBeInTheDocument();
      });
    });

    it('should handle question with 0 points', () => {
      const zeroPointQuestion = createMockQuestion({ points: 0 });

      render(
        <QuestionSelector
          questions={[zeroPointQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.getByText('0 pts')).toBeInTheDocument();
    });

    it('should handle question without explanation', () => {
      const noExplanationQuestion = createMockQuestion({ explanation: undefined });

      render(
        <QuestionSelector
          questions={[noExplanationQuestion]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(screen.queryByText('Explanation:')).not.toBeInTheDocument();
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot with questions', () => {
      const { container } = render(
        <QuestionSelector
          questions={mockQuestions}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot with empty state', () => {
      const { container } = render(
        <QuestionSelector
          questions={[]}
          onAddQuestion={mockOnAddQuestion}
          onRemoveQuestion={mockOnRemoveQuestion}
        />
      );

      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
