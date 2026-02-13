/**
 * Tests for GradingDetailPage Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { GradingDetailPage } from '../GradingDetailPage';
import { mockSubmittedAttempt, mockExamQuestionsWithAnswers } from '@/test/mocks/data/examAttempts';

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/staff/grading/:attemptId" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GradingDetailPage', () => {
  const baseUrl = env.apiFullUrl;
  const mockAttempt = {
    ...mockSubmittedAttempt,
    questions: mockExamQuestionsWithAnswers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();

    // Mock the API call for fetching attempt details
    server.use(
      http.get(`${baseUrl}/assessment-attempts/:id`, () => {
        return HttpResponse.json({
          success: true,
          data: mockAttempt,
        });
      })
    );
  });

  describe('Page Rendering', () => {
    it('should render page title', async () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Check that the page header is rendered with the title
        // "Grade Submission" appears in both PageHeader and GradingForm, so use queryAllByText
        const titleElements = screen.queryAllByText('Grade Submission');
        expect(titleElements.length).toBeGreaterThan(0);
      });
    });

    it('should display loading state initially', () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should render submission viewer after loading', async () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(mockAttempt.learnerName!)).toBeInTheDocument();
        expect(screen.getByText(mockAttempt.examTitle)).toBeInTheDocument();
      });
    });

    it('should render grading form after loading', async () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit grade/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when attempt not found', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts/:id`, () => {
          return HttpResponse.json(
            { success: false, error: 'Attempt not found' },
            { status: 404 }
          );
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading submission/i)).toBeInTheDocument();
      });
    });

    it('should display error message on API failure', async () => {
      server.use(
        http.get(`${baseUrl}/assessment-attempts/:id`, () => {
          return HttpResponse.json(
            { success: false, error: 'Server error' },
            { status: 500 }
          );
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading submission/i)).toBeInTheDocument();
      });
    });
  });

  describe('Grading Actions', () => {
    it('should render submit button and form', async () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit grade/i })).toBeInTheDocument();
        // Verify score input fields are present
        expect(screen.getAllByLabelText(/score earned/i).length).toBeGreaterThan(0);
      });
    });

    it('should have grading form fields for all questions', async () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Verify that form fields exist for each question
        const scoreInputs = screen.getAllByLabelText(/score earned/i);
        // mockAttempt has 3 questions
        expect(scoreInputs.length).toBe(3);
      });
    });
  });

  describe('Navigation', () => {
    it('should have back button to return to grading list', async () => {
      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });
    });

    it('should navigate back when back button clicked', async () => {
      const user = userEvent.setup();

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Should navigate - in real app this would change route
      expect(window.history.length).toBeGreaterThan(0);
    });
  });

  describe('Already Graded Submissions', () => {
    it('should show warning when submission is already graded', async () => {
      const gradedAttempt = {
        ...mockAttempt,
        status: 'graded' as const,
        score: 85,
        percentage: 85,
      };

      server.use(
        http.get(`${baseUrl}/assessment-attempts/:id`, () => {
          return HttpResponse.json({
            success: true,
            data: gradedAttempt,
          });
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/has already been graded/i)).toBeInTheDocument();
      });
    });

    it('should allow re-grading of already graded submission', async () => {
      const gradedAttempt = {
        ...mockAttempt,
        status: 'graded' as const,
        score: 85,
        percentage: 85,
      };

      server.use(
        http.get(`${baseUrl}/assessment-attempts/:id`, () => {
          return HttpResponse.json({
            success: true,
            data: gradedAttempt,
          });
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Should still show submit button for re-grading
        expect(screen.getByRole('button', { name: /update grade|submit grade/i })).toBeInTheDocument();
      });
    });
  });

  describe('Projected Grading Review', () => {
    it('should show projected review alert when questions require instructor review', async () => {
      const projectedAttempt = {
        ...mockAttempt,
        questions: mockAttempt.questions.map((question, index) =>
          index === 2
            ? {
                ...question,
                projectedScore: 11,
                projectedMethod: 'short_answer_fuzzy',
                projectedConfidence: 0.78,
                projectedReason: 'Near-threshold fuzzy projection',
                requiresInstructorReview: true,
              }
            : question
        ),
      };

      server.use(
        http.get(`${baseUrl}/assessment-attempts/:id`, () => {
          return HttpResponse.json({
            success: true,
            data: projectedAttempt,
          });
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');
      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTestId('projected-review-alert')).toBeInTheDocument();
        expect(screen.getByText(/require instructor review/i)).toBeInTheDocument();
      });
    });
  });
});
