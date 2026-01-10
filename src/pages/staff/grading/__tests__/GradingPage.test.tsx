/**
 * Tests for GradingPage Component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { GradingPage } from '../GradingPage';
import {
  mockSubmittedAttempt,
  createMockExamAttempt,
} from '@/test/mocks/data/examAttempts';

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
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GradingPage', () => {
  const baseUrl = env.apiBaseUrl;

  beforeEach(() => {
    vi.clearAllMocks();
    server.resetHandlers();
  });

  describe('Page Rendering', () => {
    it('should render page title and description', () => {
      render(<GradingPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Grading Dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(/review and grade student submissions/i)
      ).toBeInTheDocument();
    });

    it('should render filter controls', () => {
      render(<GradingPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      render(<GradingPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Submissions List', () => {
    it('should display pending submissions', async () => {
      const mockAttempts = [
        createMockExamAttempt({
          id: 'attempt-1',
          status: 'submitted',
          learnerName: 'John Doe',
          examTitle: 'Math Quiz',
        }),
        createMockExamAttempt({
          id: 'attempt-2',
          status: 'submitted',
          learnerName: 'Jane Smith',
          examTitle: 'Science Test',
        }),
      ];

      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              attempts: mockAttempts,
              pagination: {
                page: 1,
                limit: 20,
                total: 2,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display empty state when no submissions', async () => {
      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              attempts: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/no submissions found/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, () => {
          return HttpResponse.json(
            { success: false, error: 'Failed to fetch submissions' },
            { status: 500 }
          );
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/error loading submissions/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, ({ request }) => {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');

          if (status === 'submitted') {
            return HttpResponse.json({
              success: true,
              data: {
                attempts: [mockSubmittedAttempt],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 1,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                },
              },
            });
          }

          return HttpResponse.json({
            success: true,
            data: {
              attempts: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /status/i })).toBeInTheDocument();
      });

      const statusSelect = screen.getByRole('combobox', { name: /status/i });
      await user.click(statusSelect);

      const submittedOption = await screen.findByRole('option', { name: /submitted/i });
      await user.click(submittedOption);

      await waitFor(() => {
        expect(screen.getByText(mockSubmittedAttempt.learnerName!)).toBeInTheDocument();
      });
    });

    it('should filter by search query', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, ({ request }) => {
          const url = new URL(request.url);
          const search = url.searchParams.get('search');

          if (search === 'John') {
            return HttpResponse.json({
              success: true,
              data: {
                attempts: [
                  createMockExamAttempt({
                    id: 'attempt-1',
                    learnerName: 'John Doe',
                  }),
                ],
                pagination: {
                  page: 1,
                  limit: 20,
                  total: 1,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                },
              },
            });
          }

          return HttpResponse.json({
            success: true,
            data: {
              attempts: [],
              pagination: {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');

      await waitFor(
        () => {
          expect(screen.getByText('John Doe')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', async () => {
      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              attempts: Array.from({ length: 10 }, (_, i) =>
                createMockExamAttempt({
                  id: `attempt-${i}`,
                  learnerName: `Student ${i}`,
                })
              ),
              pagination: {
                page: 1,
                limit: 10,
                total: 25,
                totalPages: 3,
                hasNext: true,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/page 1 of 3/i)).toBeInTheDocument();
      });
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, ({ request }) => {
          const url = new URL(request.url);
          const page = parseInt(url.searchParams.get('page') || '1');

          return HttpResponse.json({
            success: true,
            data: {
              attempts: [
                createMockExamAttempt({
                  id: `attempt-page-${page}`,
                  learnerName: `Student Page ${page}`,
                }),
              ],
              pagination: {
                page,
                limit: 10,
                total: 25,
                totalPages: 3,
                hasNext: page < 3,
                hasPrev: page > 1,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Student Page 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Student Page 2')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Actions', () => {
    it('should show bulk actions toolbar when submissions are selected', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              attempts: [
                createMockExamAttempt({
                  id: 'attempt-1',
                  status: 'submitted',
                }),
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByRole('checkbox', { name: /select/i })).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox', { name: /select/i });
      await user.click(checkbox);

      await waitFor(() => {
        expect(screen.getByText(/1 selected/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /bulk grade/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to submission detail when clicking on a submission', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${baseUrl}/api/exam-attempts`, () => {
          return HttpResponse.json({
            success: true,
            data: {
              attempts: [
                createMockExamAttempt({
                  id: 'attempt-1',
                  status: 'submitted',
                  learnerName: 'John Doe',
                }),
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        })
      );

      render(<GradingPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const viewButton = screen.getByRole('button', { name: /grade/i });
      await user.click(viewButton);

      // Should navigate - in real app this would change route
      await waitFor(() => {
        expect(window.location.pathname).toContain('/grading/attempt-1');
      });
    });
  });
});
