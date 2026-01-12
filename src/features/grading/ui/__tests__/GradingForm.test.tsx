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

      render(
        <GradingForm
          attemptId="attempt-1"
          questions={mockQuestions}
          maxScore={100}
          {...mockHandlers}
        />,
        { wrapper: createWrapper() }
      );

      const submitButton = screen.getByRole('button', { name: /submit grade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/all questions must be graded/i)).toBeInTheDocument();
      });
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
        expect(screen.getByText(/10/)).toBeInTheDocument();
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
        expect(screen.getByText(/100%/)).toBeInTheDocument();
      });
    });
  });

  describe('Auto-save', () => {
    it('should trigger auto-save after typing', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

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

      // Fast forward time to trigger debounce
      vi.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockHandlers.onSaveDraft).toHaveBeenCalled();
      });

      vi.useRealTimers();
    });

    it('should show saving indicator during auto-save', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers();

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

      vi.advanceTimersByTime(2000);

      // Should show some indication of saving
      await waitFor(() => {
        expect(mockHandlers.onSaveDraft).toHaveBeenCalled();
      });

      vi.useRealTimers();
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
      const user = userEvent.setup();

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
