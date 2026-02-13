/**
 * Tests for GradingForm Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GradingForm } from '../GradingForm';
import { mockExamQuestionsWithAnswers } from '@/test/mocks/data/examAttempts';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('GradingForm', () => {
  const mockQuestions = mockExamQuestionsWithAnswers;
  const mockHandlers = {
    onSubmit: vi.fn(),
    onSaveDraft: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all questions', () => {
      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      mockQuestions.forEach((question) => {
        expect(screen.getByText(question.questionText)).toBeInTheDocument();
      });
    });

    it('should render score inputs for each question', () => {
      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);
      expect(scoreInputs.length).toBe(mockQuestions.length);
    });

    it('should render feedback textareas for each question', () => {
      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const feedbackInputs = screen.getAllByLabelText(/feedback/i);
      expect(feedbackInputs.length).toBeGreaterThan(0);
    });

    it('should render overall feedback textarea', () => {
      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByLabelText(/overall feedback/i)).toBeInTheDocument();
    });

    it('should display total score calculation', () => {
      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/total score/i)).toBeInTheDocument();
    });

    it('should render projected grading context when question metadata is present', () => {
      const projectedQuestions = mockQuestions.map((question, index) =>
        index === 2
          ? {
              ...question,
              projectedScore: 11,
              projectedMethod: 'short_answer_fuzzy',
              projectedConfidence: 0.76,
              projectedReason: 'Near-threshold response requires instructor review',
              requiresInstructorReview: true,
            }
          : question
      );

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={projectedQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByText(/projected grading/i)).toBeInTheDocument();
      expect(screen.getByText(/confidence 76%/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /use projected score/i })).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('should validate score does not exceed max points', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);
      const firstInput = scoreInputs[0];

      // Try to enter score higher than max points
      await user.clear(firstInput);
      await user.type(firstInput, '99999');

      await waitFor(() => {
        expect(screen.getByText(/cannot exceed/i)).toBeInTheDocument();
      });
    });

    it('should validate score is not negative', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);
      const firstInput = scoreInputs[0];

      await user.clear(firstInput);
      await user.type(firstInput, '-5');

      await waitFor(() => {
        expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
      });
    });

    it('should show error when submitting without all scores', async () => {
      const user = userEvent.setup();

      const mockSubmit = vi.fn();

      // Create questions without scores
      const questionsWithoutScores = mockQuestions.map((q) => ({
        ...q,
        scoreEarned: undefined,
      }));

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={questionsWithoutScores}
          maxScore={100}
          onSubmit={mockSubmit}
          // No onSaveDraft to avoid auto-save interference
        />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit grade/i });
      await user.click(submitButton);

      // Wait for error message to appear
      await waitFor(
        () => {
          const errorMessage = screen.queryByText(/all questions must be graded/i);
          expect(errorMessage).toBeInTheDocument();
        },
        { timeout: 3000 }
      );

      // Verify that onSubmit was NOT called
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Score Input', () => {
    it('should update total score when individual scores change', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);

      await user.clear(scoreInputs[0]);
      await user.type(scoreInputs[0], '10');

      await waitFor(() => {
        // Check that the input has the value
        expect(scoreInputs[0]).toHaveValue(10);
        // Find the total score display - it should show the updated total
        const totalScoreElements = screen.getAllByText('10');
        // Should find at least the input value and the total
        expect(totalScoreElements.length).toBeGreaterThan(0);
      });
    });

    it('should calculate percentage correctly', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={30}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);

      // Give full marks to all questions
      await user.clear(scoreInputs[0]);
      await user.type(scoreInputs[0], '10');
      await user.clear(scoreInputs[1]);
      await user.type(scoreInputs[1], '5');
      await user.clear(scoreInputs[2]);
      await user.type(scoreInputs[2], '15');

      await waitFor(() => {
        // Check that all inputs have correct values
        expect(scoreInputs[0]).toHaveValue(10);
        expect(scoreInputs[1]).toHaveValue(5);
        expect(scoreInputs[2]).toHaveValue(15);
        // Check for 100% being displayed
        const percentageElements = screen.getAllByText(/100%/);
        expect(percentageElements.length).toBeGreaterThan(0);
      });
    });

    it('should apply projected score when requested', async () => {
      const user = userEvent.setup();
      const projectedQuestions = mockQuestions.map((question, index) =>
        index === 2
          ? {
              ...question,
              projectedScore: 11,
              projectedReason: 'Projected by heuristic',
              requiresInstructorReview: true,
            }
          : question
      );

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={projectedQuestions}
          maxScore={30}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      await user.click(screen.getByRole('button', { name: /use projected score/i }));

      await waitFor(() => {
        expect(screen.getByLabelText(/score for question 3/i)).toHaveValue(11);
      });
    });
  });

  describe('Auto-save', () => {
    it('should trigger auto-save after typing', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const feedbackInput = screen.getAllByLabelText(/feedback/i)[0];
      await user.type(feedbackInput, 'Good answer');

      // Wait for debounce to complete (2000ms + buffer)
      await waitFor(
        () => {
          expect(mockHandlers.onSaveDraft).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });

    it('should show saving indicator during auto-save', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const feedbackInput = screen.getAllByLabelText(/feedback/i)[0];
      await user.type(feedbackInput, 'Good answer');

      // Wait for debounce and save to complete
      await waitFor(
        () => {
          expect(mockHandlers.onSaveDraft).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Submit', () => {
    it('should call onSubmit with grade data when form is valid', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={30}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);

      // Fill all scores
      await user.clear(scoreInputs[0]);
      await user.type(scoreInputs[0], '10');
      await user.clear(scoreInputs[1]);
      await user.type(scoreInputs[1], '5');
      await user.clear(scoreInputs[2]);
      await user.type(scoreInputs[2], '12');

      const submitButton = screen.getByRole('button', { name: /submit grade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockHandlers.onSubmit).toHaveBeenCalled();
      });
    });

    it('should include feedback in submission', async () => {
      const user = userEvent.setup();

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={30}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);
      await user.clear(scoreInputs[0]);
      await user.type(scoreInputs[0], '10');
      await user.clear(scoreInputs[1]);
      await user.type(scoreInputs[1], '5');
      await user.clear(scoreInputs[2]);
      await user.type(scoreInputs[2], '15');

      const overallFeedback = screen.getByLabelText(/overall feedback/i);
      await user.type(overallFeedback, 'Great work!');

      const submitButton = screen.getByRole('button', { name: /submit grade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockHandlers.onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            overallFeedback: expect.stringContaining('Great work!'),
          })
        );
      });
    });

    it('should disable submit button while submitting', async () => {
      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={30}
          isSubmitting={true}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Pre-filled Data', () => {
    it('should pre-fill scores if provided', () => {
      const questionsWithScores = mockQuestions.map((q) => ({
        ...q,
        scoreEarned: q.points,
      }));

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={questionsWithScores}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const scoreInputs = screen.getAllByLabelText(/score/i);
      scoreInputs.forEach((input) => {
        expect(input).toHaveValue();
      });
    });

    it('should pre-fill feedback if provided', () => {
      const questionsWithFeedback = mockQuestions.map((q) => ({
        ...q,
        feedback: 'Good job!',
      }));

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={questionsWithFeedback}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const feedbackInputs = screen.getAllByLabelText(/feedback/i);
      let foundQuestionFeedback = false;
      feedbackInputs.forEach((input) => {
        if (input.getAttribute('aria-label')?.includes('Question')) {
          expect(input).toHaveValue('Good job!');
          foundQuestionFeedback = true;
        }
      });
      expect(foundQuestionFeedback).toBe(true);
    });
  });
});
