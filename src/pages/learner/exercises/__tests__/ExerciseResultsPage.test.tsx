/**
 * ExerciseResultsPage Core Tests
 * Tests for loading, error, and success rendering states
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ExerciseResultsPage } from '../ExerciseResultsPage';
import * as assessmentAttemptHooks from '@/entities/assessment-attempt/hooks/useAssessmentAttempts';
import type { ExamResult } from '@/entities/exam-attempt/model/types';

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

function createMockResult(overrides: Partial<ExamResult> = {}): ExamResult {
  return {
    attemptId: 'attempt-1',
    examTitle: 'Module 1 Quiz',
    learnerName: 'Jane Smith',
    attemptNumber: 1,
    status: 'graded',
    score: 85,
    maxScore: 100,
    percentage: 85,
    passed: true,
    gradeLetter: 'B',
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
      correctCount: 8,
      incorrectCount: 2,
    },
    questionResults: [],
    overallFeedback: null,
    gradedBy: null,
    allowReview: true,
    showCorrectAnswers: true,
    ...overrides,
  };
}

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

function mockStartAttemptHook() {
  vi.spyOn(assessmentAttemptHooks, 'useStartAssessmentAttempt').mockReturnValue({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    isSuccess: false,
    reset: vi.fn(),
  } as any);
}

describe('ExerciseResultsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner when data is loading', () => {
      vi.spyOn(assessmentAttemptHooks, 'useAssessmentAttemptResult').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        isSuccess: false,
      } as any);
      vi.spyOn(assessmentAttemptHooks, 'useMyAssessmentAttemptHistory').mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.getByText('Loading results...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when data fails to load', () => {
      vi.spyOn(assessmentAttemptHooks, 'useAssessmentAttemptResult').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        isError: true,
        isSuccess: false,
      } as any);
      vi.spyOn(assessmentAttemptHooks, 'useMyAssessmentAttemptHistory').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      expect(screen.getByText('Unable to Load Assessment')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should render result viewer with score data', () => {
      const result = createMockResult({ passed: true, score: 85, maxScore: 100 });
      vi.spyOn(assessmentAttemptHooks, 'useAssessmentAttemptResult').mockReturnValue({
        data: result,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);
      vi.spyOn(assessmentAttemptHooks, 'useMyAssessmentAttemptHistory').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      // Should render the attempt badge
      expect(screen.getByTestId('attempt-badge')).toBeInTheDocument();
      // Should have navigation buttons
      expect(screen.getByText('Back to Course')).toBeInTheDocument();
    });

    it('should render screen reader announcement for passed result', () => {
      const result = createMockResult({ passed: true, score: 85, maxScore: 100 });
      vi.spyOn(assessmentAttemptHooks, 'useAssessmentAttemptResult').mockReturnValue({
        data: result,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);
      vi.spyOn(assessmentAttemptHooks, 'useMyAssessmentAttemptHistory').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      const srAnnouncement = document.querySelector('[aria-live="polite"]');
      expect(srAnnouncement).toBeInTheDocument();
      expect(srAnnouncement?.textContent).toContain('You passed!');
      expect(srAnnouncement?.textContent).toContain('Score: 85 out of 100');
    });

    it('should render screen reader announcement for failed result', () => {
      const result = createMockResult({ passed: false, score: 40, maxScore: 100 });
      vi.spyOn(assessmentAttemptHooks, 'useAssessmentAttemptResult').mockReturnValue({
        data: result,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: true,
      } as any);
      vi.spyOn(assessmentAttemptHooks, 'useMyAssessmentAttemptHistory').mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      } as any);
      mockStartAttemptHook();

      renderWithProviders(<ExerciseResultsPage />);

      const srAnnouncement = document.querySelector('[aria-live="polite"]');
      expect(srAnnouncement?.textContent).toContain('You did not pass.');
      expect(srAnnouncement?.textContent).toContain('Score: 40 out of 100');
    });
  });
});
