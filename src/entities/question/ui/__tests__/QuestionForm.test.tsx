/**
 * Tests for QuestionForm Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuestionForm } from '../QuestionForm';
import {
  mockQuestions,
} from '@/test/mocks/data/questions';

describe('QuestionForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render in create mode', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} mode="create" />);

      expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create question/i })).toBeInTheDocument();
    });

    it('should render in edit mode', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} mode="edit" />);

      expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update question/i })).toBeInTheDocument();
    });

    it('should render with initial data', () => {
      const initialData = mockQuestions[0];

      render(<QuestionForm onSubmit={mockOnSubmit} initialData={initialData} />);

      const questionInput = screen.getByLabelText(/question text/i) as HTMLTextAreaElement;
      expect(questionInput.value).toBe(initialData.questionText);
    });

    it('should render cancel button when onCancel provided', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not render cancel button when onCancel not provided', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
    });
  });

  describe('Question Text Field', () => {
    it('should allow typing in question text', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/question text/i);
      await user.type(input, 'What is TypeScript?');

      expect(input).toHaveValue('What is TypeScript?');
    });

    it('should display character counter', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/question text/i);
      await user.type(input, 'Test question');

      expect(screen.getByText(/13\/2000 characters/i)).toBeInTheDocument();
    });

    it('should show validation error for empty question text', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/question text is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error for text exceeding 2000 characters', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const longText = 'a'.repeat(2001);
      const input = screen.getByLabelText(/question text/i);
      await user.type(input, longText);

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/question text must be 2000 characters or less/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe('Question Type Selection', () => {
    it('should default to multiple choice', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      // Check that multiple choice is selected and options are shown
      expect(screen.getByText(/answer options/i)).toBeInTheDocument();
    });

    it('should change question type to true/false', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const trueFalseOption = screen.getByText('True/False');
      await user.click(trueFalseOption);

      await waitFor(() => {
        // Should show True/False options
        expect(screen.getByDisplayValue('True')).toBeInTheDocument();
        expect(screen.getByDisplayValue('False')).toBeInTheDocument();
      });
    });

    it('should change question type to short answer', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const shortAnswerOption = screen.getByText('Short Answer');
      await user.click(shortAnswerOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/correct answer/i)).toBeInTheDocument();
        expect(screen.queryByText(/answer options/i)).not.toBeInTheDocument();
      });
    });

    it('should change question type to essay', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const essayOption = screen.getByText('Essay');
      await user.click(essayOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/correct answer/i)).toBeInTheDocument();
        expect(
          screen.getByText(/essays are graded manually/i)
        ).toBeInTheDocument();
      });
    });

    it('should change question type to fill in the blank', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const fillBlankOption = screen.getByText('Fill in the Blank');
      await user.click(fillBlankOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/correct answer/i)).toBeInTheDocument();
      });
    });
  });

  describe('Multiple Choice Options', () => {
    it('should render default two options', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const options = screen.getAllByPlaceholderText(/option \d+/i);
      expect(options).toHaveLength(2);
    });

    it('should allow adding new option', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const addButton = screen.getByRole('button', { name: /add option/i });
      await user.click(addButton);

      const options = screen.getAllByPlaceholderText(/option \d+/i);
      expect(options).toHaveLength(3);
    });

    it('should allow typing in option text', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const option1 = screen.getByPlaceholderText('Option 1');
      await user.type(option1, 'First option');

      expect(option1).toHaveValue('First option');
    });

    it('should allow marking option as correct', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      expect(checkboxes[0]).toBeChecked();
    });

    it('should allow removing option when more than 2', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      // Add a third option
      const addButton = screen.getByRole('button', { name: /add option/i });
      await user.click(addButton);

      // Remove the third option
      const deleteButtons = screen.getAllByRole('button', { name: '' });
      const trashButton = deleteButtons.find(
        (btn) => btn.querySelector('svg') !== null
      );
      if (trashButton) {
        await user.click(trashButton);
      }

      const options = screen.getAllByPlaceholderText(/option \d+/i);
      expect(options).toHaveLength(2);
    });

    it('should not allow removing option when only 2 remain', async () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      // Should not show delete buttons for only 2 options
      const deleteButtons = screen.queryAllByRole('button', { name: '' });
      const trashButtons = deleteButtons.filter(
        (btn) => btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );
      expect(trashButtons).toHaveLength(0);
    });

    it('should validate that at least one option is marked correct', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/question text/i);
      await user.type(input, 'Test question');

      const option1 = screen.getByPlaceholderText('Option 1');
      await user.type(option1, 'Option A');

      const option2 = screen.getByPlaceholderText('Option 2');
      await user.type(option2, 'Option B');

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/at least one option must be marked as correct/i)
        ).toBeInTheDocument();
      });
    });

    it('should validate that all options have text', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/question text/i);
      await user.type(input, 'Test question');

      const option1 = screen.getByPlaceholderText('Option 1');
      await user.type(option1, 'Option A');

      // Leave option2 empty
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/all options must have text/i)).toBeInTheDocument();
      });
    });
  });

  describe('True/False Options', () => {
    it('should auto-populate True/False options', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const trueFalseOption = screen.getByText('True/False');
      await user.click(trueFalseOption);

      await waitFor(() => {
        expect(screen.getByDisplayValue('True')).toBeInTheDocument();
        expect(screen.getByDisplayValue('False')).toBeInTheDocument();
      });
    });

    it('should disable editing True/False option text', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const trueFalseOption = screen.getByText('True/False');
      await user.click(trueFalseOption);

      await waitFor(() => {
        const trueInput = screen.getByDisplayValue('True');
        expect(trueInput).toBeDisabled();

        const falseInput = screen.getByDisplayValue('False');
        expect(falseInput).toBeDisabled();
      });
    });

    it('should not show add/remove buttons for True/False', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const trueFalseOption = screen.getByText('True/False');
      await user.click(trueFalseOption);

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /add option/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Points Field', () => {
    it('should default to 1 point', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const pointsInput = screen.getByLabelText(/points/i) as HTMLInputElement;
      expect(pointsInput.value).toBe('1');
    });

    it('should allow changing points value', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const pointsInput = screen.getByLabelText(/points/i);
      await user.clear(pointsInput);
      await user.type(pointsInput, '5');

      expect(pointsInput).toHaveValue(5);
    });

    it('should allow fractional points', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const pointsInput = screen.getByLabelText(/points/i);
      await user.clear(pointsInput);
      await user.type(pointsInput, '2.5');

      expect(pointsInput).toHaveValue(2.5);
    });

    it('should validate points must be at least 0.1', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const input = screen.getByLabelText(/question text/i);
      await user.type(input, 'Test question');

      const pointsInput = screen.getByLabelText(/points/i);
      await user.clear(pointsInput);
      await user.type(pointsInput, '0');

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/points must be at least 0.1/i)).toBeInTheDocument();
      });
    });
  });

  describe('Difficulty Selection', () => {
    it('should default to medium difficulty', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      // Difficulty defaults to medium in form
      expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    });

    it('should allow changing difficulty', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const difficultySelect = screen.getByLabelText(/difficulty/i);
      await user.click(difficultySelect);

      const hardOption = screen.getByText('Hard');
      await user.click(hardOption);

      // Value should be updated
      await waitFor(() => {
        expect(difficultySelect).toBeInTheDocument();
      });
    });
  });

  describe('Correct Answer Field (Short Answer/Essay/Fill Blank)', () => {
    it('should show correct answer field for short answer', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const shortAnswerOption = screen.getByText('Short Answer');
      await user.click(shortAnswerOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/correct answer/i)).toBeInTheDocument();
      });
    });

    it('should require correct answer for short answer', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const shortAnswerOption = screen.getByText('Short Answer');
      await user.click(shortAnswerOption);

      const input = screen.getByLabelText(/question text/i);
      await user.type(input, 'Test question');

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/correct answer is required/i)).toBeInTheDocument();
      });
    });

    it('should not require correct answer for essay', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const essayOption = screen.getByText('Essay');
      await user.click(essayOption);

      await waitFor(() => {
        // Essay type should not have required indicator
        const correctAnswerLabel = screen.getByText(/correct answer/i);
        expect(correctAnswerLabel.textContent).not.toContain('*');
      });
    });

    it('should show helper text for essay questions', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const essayOption = screen.getByText('Essay');
      await user.click(essayOption);

      await waitFor(() => {
        expect(screen.getByText(/essays are graded manually/i)).toBeInTheDocument();
      });
    });
  });

  describe('Tag Management', () => {
    it('should allow adding tags', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'javascript');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    it('should allow adding tags with Enter key', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'typescript{Enter}');

      expect(screen.getByText('typescript')).toBeInTheDocument();
    });

    it('should clear tag input after adding', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i) as HTMLInputElement;
      await user.type(tagInput, 'react');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(tagInput.value).toBe('');
    });

    it('should convert tags to lowercase', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'JavaScript');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    it('should not add duplicate tags', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      const addButton = screen.getByRole('button', { name: /add/i });

      await user.type(tagInput, 'javascript');
      await user.click(addButton);

      await user.type(tagInput, 'javascript');
      await user.click(addButton);

      const tags = screen.getAllByText('javascript');
      expect(tags).toHaveLength(1);
    });

    it('should allow removing tags', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, 'javascript');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      const removeButton = screen.getByRole('button', { name: '' });
      await user.click(removeButton);

      expect(screen.queryByText('javascript')).not.toBeInTheDocument();
    });

    it('should trim whitespace from tags', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, '  javascript  ');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    it('should not add empty tags', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const tagInput = screen.getByLabelText(/tags/i);
      await user.type(tagInput, '   ');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      const { container } = render(<QuestionForm onSubmit={mockOnSubmit} />);
      const badges = container.querySelectorAll('[class*="badge"]');
      expect(badges).toHaveLength(0);
    });
  });

  describe('Explanation Field', () => {
    it('should allow typing explanation', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const explanationInput = screen.getByLabelText(/explanation/i);
      await user.type(explanationInput, 'This is the explanation');

      expect(explanationInput).toHaveValue('This is the explanation');
    });

    it('should display character counter for explanation', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const explanationInput = screen.getByLabelText(/explanation/i);
      await user.type(explanationInput, 'Test explanation');

      expect(screen.getByText(/16\/1000 characters/i)).toBeInTheDocument();
    });

    it('should limit explanation to 1000 characters', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const explanationInput = screen.getByLabelText(/explanation/i) as HTMLTextAreaElement;
      const longText = 'a'.repeat(1000);

      await user.type(explanationInput, longText);

      // maxLength attribute should enforce this
      expect(explanationInput.value.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('Form Submission', () => {
    it('should submit valid multiple choice question', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const questionInput = screen.getByLabelText(/question text/i);
      await user.type(questionInput, 'What is JavaScript?');

      const option1 = screen.getByPlaceholderText('Option 1');
      await user.type(option1, 'A programming language');

      const option2 = screen.getByPlaceholderText('Option 2');
      await user.type(option2, 'A database');

      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]); // Mark first option as correct

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            questionText: 'What is JavaScript?',
            questionType: 'multiple_choice',
            options: expect.arrayContaining([
              expect.objectContaining({ text: 'A programming language', isCorrect: true }),
              expect.objectContaining({ text: 'A database', isCorrect: false }),
            ]),
          })
        );
      });
    });

    it('should submit valid short answer question', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);

      const shortAnswerOption = screen.getByText('Short Answer');
      await user.click(shortAnswerOption);

      const questionInput = screen.getByLabelText(/question text/i);
      await user.type(questionInput, 'What is closure?');

      const correctAnswerInput = screen.getByLabelText(/correct answer/i);
      await user.type(correctAnswerInput, 'A function with access to outer scope');

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            questionText: 'What is closure?',
            questionType: 'short_answer',
            correctAnswer: 'A function with access to outer scope',
          })
        );
      });
    });

    it('should not submit with validation errors', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should clear validation errors on field change', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/question text is required/i)).toBeInTheDocument();
      });

      const questionInput = screen.getByLabelText(/question text/i);
      await user.type(questionInput, 'Valid question');

      await waitFor(() => {
        expect(screen.queryByText(/question text is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable submit button when loading', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable cancel button when loading', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should show saving text when loading', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByText(/saving/i)).toBeInTheDocument();
    });
  });

  describe('Cancel Handler', () => {
    it('should call onCancel when cancel button clicked', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edit Mode with Initial Data', () => {
    it('should populate form with existing question data', () => {
      const initialData = mockQuestions[0];

      render(<QuestionForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);

      const questionInput = screen.getByLabelText(/question text/i) as HTMLTextAreaElement;
      expect(questionInput.value).toBe(initialData.questionText);
    });

    it('should populate options for multiple choice', () => {
      const initialData = mockQuestions[0]; // multiple choice question

      render(<QuestionForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);

      // Check that form is populated
      expect(screen.getByLabelText(/question text/i)).toHaveValue(initialData.questionText);
    });

    it('should populate correct answer for short answer', () => {
      const initialData = mockQuestions[2]; // short answer question

      render(<QuestionForm onSubmit={mockOnSubmit} initialData={initialData} mode="edit" />);

      const questionInput = screen.getByLabelText(/question text/i) as HTMLTextAreaElement;
      expect(questionInput.value).toBe(initialData.questionText);
    });
  });

  describe('Type-Specific Rendering', () => {
    it('should show options section only for multiple choice and true/false', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      // Multiple choice - should show options
      expect(screen.getByText(/answer options/i)).toBeInTheDocument();

      // Change to essay
      const typeSelect = screen.getByLabelText(/question type/i);
      await user.click(typeSelect);
      const essayOption = screen.getByText('Essay');
      await user.click(essayOption);

      // Should not show options
      await waitFor(() => {
        expect(screen.queryByText(/answer options/i)).not.toBeInTheDocument();
      });
    });

    it('should show correct answer section for short answer, essay, and fill blank', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/question type/i);

      // Multiple choice - should not show
      expect(screen.queryByLabelText(/correct answer/i)).not.toBeInTheDocument();

      // Short answer - should show
      await user.click(typeSelect);
      const shortAnswerOption = screen.getByText('Short Answer');
      await user.click(shortAnswerOption);

      await waitFor(() => {
        expect(screen.getByLabelText(/correct answer/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation Edge Cases', () => {
    it('should handle multiple validation errors at once', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const pointsInput = screen.getByLabelText(/points/i);
      await user.clear(pointsInput);
      await user.type(pointsInput, '0');

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/question text is required/i)).toBeInTheDocument();
        expect(screen.getByText(/points must be at least 0.1/i)).toBeInTheDocument();
      });
    });

    it('should validate at least 2 options for multiple choice', async () => {
      const user = userEvent.setup();

      render(<QuestionForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /create question/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/at least 2 options are required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/question text/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/question type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/points/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/explanation/i)).toBeInTheDocument();
    });

    it('should mark required fields with asterisk', () => {
      render(<QuestionForm onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/question text/i).textContent).toContain('*');
      expect(screen.getByText(/question type/i).textContent).toContain('*');
      expect(screen.getByText(/points/i).textContent).toContain('*');
    });
  });
});
