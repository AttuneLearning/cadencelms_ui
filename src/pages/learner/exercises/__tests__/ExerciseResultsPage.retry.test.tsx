/**
 * ExerciseResultsPage Retry Flow Tests
 * Tests for retry button, attempt badge, attempt history, and exhausted state
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExerciseResultsPage } from '../ExerciseResultsPage';
import * as assessmentAttemptHooks from '@/entities/assessment-attempt/hooks/useAssessmentAttempts';
import type { ExamResult, ExamAttemptListItem, ExamAttemptsListResponse } from '@/entities/exam-attempt/model/types';

// Mock the navigation hook
vi.mock('@/shared/lib/navigation/useNavigation', () => ({
  useNavigation: () => ({
    updateBreadcrumbs: vi.fn(),
  }),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ exerciseId: 'exam-1', attemptId: 'attempt-1' }),
    useSearchParams: () => [
      new URLSearchParams(
        'courseId=course-1&enrollmentId=enrollment-1&learningUnitId=learning-unit-1'
      ),
      vi.fn(),
    ],
  };
});

// Base mock result (failed, with attempts remaining)
function createMockResult(overrides: Partial<ExamResult> = {}): ExamResult {
  return {
    attemptId: 'attempt-1',
    examTitle: 'Module 1 Quiz',
    learnerName: 'Jane Smith',
    attemptNumber: 1,
    status: 'graded',
    score: 50,
    maxScore: 100,
    percentage: 50,
    passed: false,
    gradeLetter: 'F',
    passingScore: 70,
    submittedAt: '2026-01-09T09:25:00.000Z',
    gradedAt: '2026-01-09T09:30:00.000Z',
    timeSpent: 1200,
    timeLimit: 1800,
    maxAttempts: 3,
    attemptsUsed: 1,
    summary: {
      totalQuestions: 10,
      answeredCount: 10,
      unansweredCount: 0,
      correctCount: 5,
      incorrectCount: 5,
    },
    questionResults: [],
    overallFeedback: null,
    gradedBy: null,
    allowReview: true,
    showCorrectAnswers: true,
    ...overrides,
  };
}

// Mock attempt list items for history
const mockAttemptHistoryItems: ExamAttemptListItem[] = [
  {
    id: 'attempt-1',
    examId: 'exam-1',
    examTitle: 'Module 1 Quiz',
    learnerId: 'learner-1',
    learnerName: 'Jane Smith',
    attemptNumber: 1,
    status: 'graded',
    score: 50,
    maxScore: 100,
    percentage: 50,
    passed: false,
    startedAt: '2026-01-09T09:00:00.000Z',
    submittedAt: '2026-01-09T09:20:00.000Z',
    gradedAt: '2026-01-09T09:25:00.000Z',
    timeSpent: 1200,
    remainingTime: null,
    createdAt: '2026-01-09T09:00:00.000Z',
    updatedAt: '2026-01-09T09:25:00.000Z',
  },
];

// Helper render function
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

// Default mock setup helpers
function mockResultHook(result: ExamResult | undefined, isLoading = false, error: Error | null = null) {
  vi.spyOn(assessmentAttemptHooks, 'useAssessmentAttemptResult').mockReturnValue({
    data: result,
    isLoading,
    error,
    isError: !!error,
    isSuccess: !!result,
  } as any);
}

function mockHistoryHook(attempts: ExamAttemptListItem[] = []) {
  const response: ExamAttemptsListResponse = {
    attempts,
    pagination: { page: 1, limit: 20, total: attempts.length, totalPages: 1, hasNext: false, hasPrev: false },
  };
  vi.spyOn(assessmentAttemptHooks, 'useMyAssessmentAttemptHistory').mockReturnValue({
    data: response,
    isLoading: false,
    error: null,
  } as any);
}

function mockStartAttemptHook(mutateFn = vi.fn()) {
  vi.spyOn(assessmentAttemptHooks, 'useStartAssessmentAttempt').mockReturnValue({
    mutate: mutateFn,
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    reset: vi.fn(),
  } as any);
}

describe('ExerciseResultsPage - Retry Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  describe('Retry Button Visibility', () => {
    it('should show retry button when failed with attempts remaining', () => {
      const result = createMockResult({ passed: false, maxAttempts: 3, attemptsUsed: 1 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.getByTestId('retry-exam-button')).toBeInTheDocument();
      expect(screen.getByTestId('retry-exam-button')).toHaveTextContent('Retry Assessment');
    });

    it('should hide retry button when passed', () => {
      const result = createMockResult({ passed: true, maxAttempts: 3, attemptsUsed: 1 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.queryByTestId('retry-exam-button')).not.toBeInTheDocument();
    });

    it('should hide retry button when all attempts used', () => {
      const result = createMockResult({ passed: false, maxAttempts: 3, attemptsUsed: 3 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.queryByTestId('retry-exam-button')).not.toBeInTheDocument();
    });

    it('should show retry button when failed with unlimited attempts', () => {
      const result = createMockResult({ passed: false, maxAttempts: null, attemptsUsed: 5 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.getByTestId('retry-exam-button')).toBeInTheDocument();
    });
  });

  describe('Attempt Badge', () => {
    it('should display "Attempt X of Y" when maxAttempts is set', () => {
      const result = createMockResult({ attemptNumber: 2, maxAttempts: 3 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      const badge = screen.getByTestId('attempt-badge');
      expect(badge).toHaveTextContent('Attempt 2 of 3');
    });

    it('should display "Unlimited" when maxAttempts is null', () => {
      const result = createMockResult({ attemptNumber: 1, maxAttempts: null });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      const badge = screen.getByTestId('attempt-badge');
      expect(badge).toHaveTextContent('Unlimited');
    });
  });

  describe('No Attempts Remaining', () => {
    it('should show "No attempts remaining" message when all attempts exhausted and not passed', () => {
      const result = createMockResult({ passed: false, maxAttempts: 3, attemptsUsed: 3 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.getByTestId('no-attempts-remaining')).toBeInTheDocument();
      expect(screen.getByText('No attempts remaining')).toBeInTheDocument();
    });

    it('should not show exhausted message when passed', () => {
      const result = createMockResult({ passed: true, maxAttempts: 3, attemptsUsed: 3 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.queryByTestId('no-attempts-remaining')).not.toBeInTheDocument();
    });

    it('should not show exhausted message when unlimited attempts', () => {
      const result = createMockResult({ passed: false, maxAttempts: null, attemptsUsed: 10 });
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.queryByTestId('no-attempts-remaining')).not.toBeInTheDocument();
    });
  });

  describe('Attempt History', () => {
    it('should render attempt history with previous attempts', () => {
      const result = createMockResult();
      mockResultHook(result);
      mockHistoryHook(mockAttemptHistoryItems);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.getByTestId('attempt-history')).toBeInTheDocument();
      expect(screen.getByTestId('attempt-history-table')).toBeInTheDocument();
      expect(screen.getAllByTestId('attempt-history-row')).toHaveLength(1);
    });

    it('should not render attempt history when no attempts', () => {
      const result = createMockResult();
      mockResultHook(result);
      mockHistoryHook([]);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.queryByTestId('attempt-history')).not.toBeInTheDocument();
    });
  });

  describe('Retry Button Action', () => {
    it('should call startExamAttempt and navigate on retry click', async () => {
      const user = userEvent.setup();
      const result = createMockResult({ passed: false, maxAttempts: 3, attemptsUsed: 1 });
      mockResultHook(result);
      mockHistoryHook([]);

      const mockMutate = vi.fn().mockImplementation((_data, options) => {
        options?.onSuccess?.({ id: 'new-attempt-1', examId: 'exam-1' });
      });
      mockStartAttemptHook(mockMutate);

      renderWithProviders(<ExerciseResultsPage />);

      const retryButton = screen.getByTestId('retry-exam-button');
      await user.click(retryButton);

      expect(mockMutate).toHaveBeenCalledWith(
        {
          enrollmentId: 'enrollment-1',
          learningUnitId: 'learning-unit-1',
        },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/learner/exercises/exam-1/take?courseId=course-1&enrollmentId=enrollment-1&learningUnitId=learning-unit-1'
        );
      });
    });
  });
});
