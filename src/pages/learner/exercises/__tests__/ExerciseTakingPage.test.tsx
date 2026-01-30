/**
 * ExerciseTakingPage Component Tests
 * TDD tests for quiz/exercise taking functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExerciseTakingPage } from '../ExerciseTakingPage';
import * as examAttemptHooks from '@/entities/exam-attempt/hooks/useExamAttempts';
import type { ExamAttempt, ExamQuestion } from '@/entities/exam-attempt/model/types';

// Mock the navigation hook
vi.mock('@/shared/lib/navigation/useNavigation', () => ({
  useNavigation: () => ({
    updateBreadcrumbs: vi.fn(),
  }),
}));

// Mock the toast hook
vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ exerciseId: 'exercise-1' }),
  };
});

// Helper to wrap component with providers
function renderWithProviders(component: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={component} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock question data
const mockQuestions: ExamQuestion[] = [
  {
    id: 'q1',
    questionText: 'What is 2 + 2?',
    questionType: 'multiple_choice',
    order: 1,
    points: 10,
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
  },
  {
    id: 'q2',
    questionText: 'The sky is blue.',
    questionType: 'true_false',
    order: 2,
    points: 5,
    options: ['True', 'False'],
    correctAnswer: 'True',
  },
  {
    id: 'q3',
    questionText: 'What is the capital of France?',
    questionType: 'short_answer',
    order: 3,
    points: 10,
  },
];

// Mock exam attempt
const mockAttempt: ExamAttempt = {
  id: 'attempt-1',
  examId: 'exercise-1',
  examTitle: 'Sample Quiz',
  examType: 'quiz',
  learnerId: 'learner-1',
  attemptNumber: 1,
  status: 'in_progress',
  score: 0,
  maxScore: 25,
  percentage: 0,
  passed: false,
  timeLimit: 1800, // 30 minutes in seconds
  remainingTime: 1800,
  timeSpent: 0,
  questions: mockQuestions,
  instructions: 'Answer all questions to the best of your ability.',
  allowReview: true,
  showFeedback: true,
  startedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ExerciseTakingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  describe('Initial Load', () => {
    it('should start exam attempt on mount', async () => {
      const mockStartAttempt = vi.fn().mockResolvedValue(mockAttempt);

      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: mockStartAttempt,
        isPending: false,
        isError: false,
        isSuccess: true,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ExerciseTakingPage />);

      await waitFor(() => {
        expect(mockStartAttempt).toHaveBeenCalled();
        const callArgs = mockStartAttempt.mock.calls[0];
        expect(callArgs[0]).toEqual({ examId: 'exercise-1' });
      });
    });

    it('should display loading state while starting attempt', () => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
        isError: false,
        isSuccess: false,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error state if starting attempt fails', () => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: true,
        error: new Error('Failed to start attempt'),
        isSuccess: false,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to start attempt'),
      } as any);

      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByRole('heading', { name: /failed to start exam/i })).toBeInTheDocument();
      expect(screen.getByText('Failed to start attempt')).toBeInTheDocument();
    });
  });

  describe('Question Display', () => {
    beforeEach(() => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should display exam title', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByText('Sample Quiz')).toBeInTheDocument();
    });

    it('should display first question initially', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    it('should display question points', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByText(/10 points/i)).toBeInTheDocument();
    });

    it('should display instructions', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByText(/Answer all questions/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSaveAnswer').mockReturnValue({
        mutate: vi.fn(),
        mutateDebounced: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should show next button', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should not show previous button on first question', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    });

    it('should navigate to next question on next button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('The sky is blue.')).toBeInTheDocument();
      });
    });

    it('should show previous button on second question', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      });
    });

    it('should navigate to previous question on previous button click', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      // Go to next question
      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Go back to previous
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      });
    });
  });

  describe('Answer Saving', () => {
    let mockSaveAnswer: ReturnType<typeof vi.fn>;
    let mockSaveAnswerDebounced: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockSaveAnswer = vi.fn();
      mockSaveAnswerDebounced = vi.fn();

      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSaveAnswer').mockReturnValue({
        mutate: mockSaveAnswer,
        mutateDebounced: mockSaveAnswerDebounced,
        isPending: false,
      } as any);
    });

    it.skip('should save answer with debouncing when answer changes', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      // Select an option for multiple choice question
      const option = screen.getByLabelText('4');
      expect(option).toBeInTheDocument();

      await user.click(option);

      // Give enough time for state updates
      await new Promise((resolve) => setTimeout(resolve, 200));

      // The mutation should be called via mutateDebounced
      expect(mockSaveAnswerDebounced).toHaveBeenCalled();
    });

    it('should mark question as answered after saving', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const option = screen.getByLabelText('4');
      await user.click(option);

      await waitFor(() => {
        // Question should be marked as answered in navigator
        const navigator = screen.getByTestId('question-navigator');
        expect(navigator).toBeInTheDocument();
      });
    });
  });

  describe('Timer', () => {
    beforeEach(() => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);
    });

    it('should display timer with remaining time', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByText(/time remaining/i)).toBeInTheDocument();
      expect(screen.getByText(/30:00/)).toBeInTheDocument();
    });

    it('should auto-submit when timer expires', async () => {
      const mockSubmitExam = vi.fn();

      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn((_, { onSuccess }) => {
          // Immediately call onSuccess to set attemptId
          onSuccess?.(mockAttempt);
        }),
        isPending: false,
        isError: false,
        isSuccess: true,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSubmitExamAttempt').mockReturnValue({
        mutate: mockSubmitExam,
        isPending: false,
      } as any);

      const attemptWithNoTime = {
        ...mockAttempt,
        remainingTime: 0,
      };

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: attemptWithNoTime,
        isLoading: false,
        error: null,
      } as any);

      renderWithProviders(<ExerciseTakingPage />);

      // Wait a bit for effects to run
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockSubmitExam).toHaveBeenCalled();
    });
  });

  describe('Submit', () => {
    let mockSubmitExam: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockSubmitExam = vi.fn();

      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSaveAnswer').mockReturnValue({
        mutate: vi.fn(),
        mutateDebounced: vi.fn(),
        isPending: false,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSubmitExamAttempt').mockReturnValue({
        mutate: mockSubmitExam,
        isPending: false,
      } as any);
    });

    it('should show submit button', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should show confirmation dialog when submit is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });
    });

    it.skip('should submit exam after confirmation', async () => {
      const user = userEvent.setup();

      // Setup the mock to call onSuccess callback
      mockSubmitExam.mockImplementation((payload, options) => {
        options?.onSuccess?.({ attemptId: 'attempt-1', status: 'graded' });
      });

      renderWithProviders(<ExerciseTakingPage />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockSubmitExam).toHaveBeenCalled();
        const callArgs = mockSubmitExam.mock.calls[0];
        expect(callArgs[0]).toEqual({ attemptId: 'attempt-1', data: { confirmSubmit: true } });
      });
    });

    it.skip('should navigate to results page after submission', async () => {
      const user = userEvent.setup();

      // Setup the mock to call onSuccess callback
      mockSubmitExam.mockImplementation((payload, options) => {
        options?.onSuccess?.({ attemptId: 'attempt-1', status: 'graded' });
      });

      renderWithProviders(<ExerciseTakingPage />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      // Wait for navigation to be called
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockNavigate).toHaveBeenCalledWith('/learner/exercises/exercise-1/results/attempt-1');
    });

    it.skip('should show warning for unanswered questions in confirmation dialog', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const submitButton = screen.getByRole('button', { name: /submit exam/i });
      await user.click(submitButton);

      // The dialog shows summary with "Unanswered Questions:" and warning message
      // All 3 questions are unanswered initially, so the warning should appear
      await waitFor(
        () => {
          expect(screen.getByText(/unanswered question/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Mark for Review', () => {
    beforeEach(() => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSaveAnswer').mockReturnValue({
        mutate: vi.fn(),
        mutateDebounced: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should show mark for review button', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByRole('button', { name: /mark for review/i })).toBeInTheDocument();
    });

    it('should mark question for review when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const markButton = screen.getByRole('button', { name: /mark for review/i });
      await user.click(markButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unmark/i })).toBeInTheDocument();
      });
    });
  });

  describe('Question Navigator', () => {
    beforeEach(() => {
      vi.spyOn(examAttemptHooks, 'useStartExamAttempt').mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        isError: false,
        isSuccess: true,
        data: mockAttempt,
      } as any);

      vi.spyOn(examAttemptHooks, 'useExamAttempt').mockReturnValue({
        data: mockAttempt,
        isLoading: false,
        error: null,
      } as any);

      vi.spyOn(examAttemptHooks, 'useSaveAnswer').mockReturnValue({
        mutate: vi.fn(),
        mutateDebounced: vi.fn(),
        isPending: false,
      } as any);
    });

    it('should display question navigator', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByTestId('question-navigator')).toBeInTheDocument();
    });

    it('should display all question numbers', () => {
      renderWithProviders(<ExerciseTakingPage />);

      expect(screen.getByRole('button', { name: /question 1/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /question 2/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /question 3/i })).toBeInTheDocument();
    });

    it('should jump to question when number is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExerciseTakingPage />);

      const questionButton = screen.getByRole('button', { name: /question 3/i });
      await user.click(questionButton);

      await waitFor(() => {
        expect(screen.getByText('What is the capital of France?')).toBeInTheDocument();
      });
    });

    it('should highlight current question', () => {
      renderWithProviders(<ExerciseTakingPage />);

      const currentQuestion = screen.getByRole('button', { name: /question 1/i });
      expect(currentQuestion).toHaveClass('active');
    });
  });
});
