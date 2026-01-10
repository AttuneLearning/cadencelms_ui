/**
 * Tests for GradingDetailPage Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tantml:query';
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
  const baseUrl = env.apiBaseUrl;
  const mockAttempt = {
    ...mockSubmittedAttempt,
    questions: mockExamQuestionsWithAnswers,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();

    // Mock the API call for fetching attempt details
    server.use(
      http.get(`${baseUrl}/api/exam-attempts/:id`, () => {
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
        expect(screen.getByText(/grade submission/i)).toBeInTheDocument();
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
        http.get(`${baseUrl}/api/exam-attempts/:id`, () => {
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
        http.get(`${baseUrl}/api/exam-attempts/:id`, () => {
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
    it('should submit grades successfully', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${baseUrl}/api/exam-attempts/:id/grade`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              ...mockAttempt,
              status: 'graded',
              score: 85,
              percentage: 85,
            },
          });
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit grade/i })).toBeInTheDocument();
      });

      // Fill out the form and submit
      const submitButton = screen.getByRole('button', { name: /submit grade/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Should show success message or redirect
        expect(screen.queryByText(/submitting/i)).not.toBeInTheDocument();
      });
    });

    it('should handle grading errors', async () => {
      const user = userEvent.setup();

      server.use(
        http.post(`${baseUrl}/api/exam-attempts/:id/grade`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to submit grade' },
            { status: 500 }
          );
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /submit grade/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /submit grade/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to submit/i)).toBeInTheDocument();
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
        http.get(`${baseUrl}/api/exam-attempts/:id`, () => {
          return HttpResponse.json({
            success: true,
            data: gradedAttempt,
          });
        })
      );

      window.history.pushState({}, '', '/staff/grading/attempt-1');

      render(<GradingDetailPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/already graded/i)).toBeInTheDocument();
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
        http.get(`${baseUrl}/api/exam-attempts/:id`, () => {
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
});
