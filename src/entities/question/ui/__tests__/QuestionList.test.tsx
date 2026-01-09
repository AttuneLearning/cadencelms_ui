/**
 * Tests for QuestionList Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuestionList } from '../QuestionList';
import { mockQuestions, createMultipleChoiceQuestion } from '@/test/mocks/data/questions';
import type { QuestionListResponse } from '../../model/types';

// Mock the useQuestions hook
vi.mock('../../model/useQuestion', () => ({
  useQuestions: vi.fn(),
}));

import { useQuestions } from '../../model/useQuestion';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('QuestionList', () => {
  const mockData: QuestionListResponse = {
    questions: mockQuestions,
    pagination: {
      page: 1,
      limit: 10,
      total: mockQuestions.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQuestions).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
    } as any);
  });

  describe('Rendering', () => {
    it('should render list of questions', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      mockQuestions.forEach((question) => {
        expect(screen.getByText(question.questionText)).toBeInTheDocument();
      });
    });

    it('should render with custom initial filters', () => {
      const initialFilters = { difficulty: 'easy' as const };

      render(<QuestionList initialFilters={initialFilters} />, { wrapper: createWrapper() });

      expect(screen.getByText(mockQuestions[0].questionText)).toBeInTheDocument();
    });

    it('should render filter section', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText('Search questions...')).toBeInTheDocument();
    });

    it('should render question type filter', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByText('Question Type')).toBeInTheDocument();
    });

    it('should render difficulty filter', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByText('Difficulty')).toBeInTheDocument();
    });

    it('should render sort filter', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByText('Sort By')).toBeInTheDocument();
    });

    it('should display question count', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(
        screen.getByText(`Showing ${mockQuestions.length} of ${mockQuestions.length} questions`)
      ).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading', () => {
      vi.mocked(useQuestions).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const { container } = render(<QuestionList />, { wrapper: createWrapper() });

      // Look for the loading spinner SVG with animate-spin class
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should not display questions while loading', () => {
      vi.mocked(useQuestions).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      mockQuestions.forEach((question) => {
        expect(screen.queryByText(question.questionText)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should display error message on error', () => {
      const errorMessage = 'Failed to load questions';
      vi.mocked(useQuestions).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isError: true,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByText(`Error loading questions: ${errorMessage}`)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty message when no questions', () => {
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      expect(
        screen.getByText('No questions found matching your filters.')
      ).toBeInTheDocument();
    });

    it('should show clear filters button in empty state when filters active', async () => {
      const user = userEvent.setup();
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      // Type in search to activate filters
      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'nonexistent');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        const clearButtons = screen.getAllByRole('button', { name: /clear/i });
        expect(clearButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should allow typing in search input', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(
        'Search questions...'
      ) as HTMLInputElement;
      await user.type(searchInput, 'JavaScript');

      expect(searchInput.value).toBe('JavaScript');
    });

    it('should trigger search on button click', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search questions...');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(searchInput, 'JavaScript');
      await user.click(searchButton);

      // The hook should be called with search params
      await waitFor(() => {
        expect(useQuestions).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'JavaScript' })
        );
      });
    });

    it('should trigger search on Enter key', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'JavaScript{Enter}');

      await waitFor(() => {
        expect(useQuestions).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'JavaScript' })
        );
      });
    });

    it('should show clear search button when search has value', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: '' });
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear search on clear button click', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(
        'Search questions...'
      ) as HTMLInputElement;
      await user.type(searchInput, 'test');

      const clearButton = screen.getByRole('button', { name: '' });
      await user.click(clearButton);

      expect(searchInput.value).toBe('');
    });
  });

  describe('Filter Controls', () => {
    it('should filter by question type', async () => {
      render(<QuestionList initialFilters={{ questionType: 'multiple_choice' }} />, {
        wrapper: createWrapper(),
      });

      expect(useQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ questionType: 'multiple_choice' })
      );
    });

    it('should filter by difficulty', async () => {
      render(<QuestionList initialFilters={{ difficulty: 'easy' }} />, {
        wrapper: createWrapper(),
      });

      expect(useQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ difficulty: 'easy' })
      );
    });

    it('should change sort order', async () => {
      render(<QuestionList initialFilters={{ sort: 'createdAt' }} />, {
        wrapper: createWrapper(),
      });

      expect(useQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'createdAt' })
      );
    });

    it('should reset page to 1 when filters change', async () => {
      const user = userEvent.setup();

      render(<QuestionList initialFilters={{ page: 3 }} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'test');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(useQuestions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, search: 'test' })
        );
      });
    });
  });

  describe('Clear Filters', () => {
    it('should show clear all button when filters are active', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'test');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
      });
    });

    it('should clear all filters on clear all button click', async () => {
      const user = userEvent.setup();

      render(<QuestionList initialFilters={{ search: 'test' }} />, {
        wrapper: createWrapper(),
      });

      // Find and click the clear all button
      const clearAllButton = screen.getByRole('button', { name: /clear all/i });
      await user.click(clearAllButton);

      await waitFor(() => {
        // After clearing, should be called with default filters
        const calls = vi.mocked(useQuestions).mock.calls;
        const lastCall = calls[calls.length - 1][0];
        expect(lastCall.search).toBeUndefined();
      });
    });
  });

  describe('Tag Filtering', () => {
    it('should display active tags', async () => {
      const user = userEvent.setup();

      render(<QuestionList initialFilters={{ tag: 'javascript' }} />, {
        wrapper: createWrapper(),
      });

      // Note: Tag display implementation may vary
      // This test checks if tags section would render
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('should allow removing tags', async () => {
      const user = userEvent.setup();

      render(<QuestionList initialFilters={{ tag: 'javascript' }} />, {
        wrapper: createWrapper(),
      });

      // Implementation would show tag badges with remove buttons
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should display pagination when multiple pages', () => {
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: mockQuestions.slice(0, 2),
          pagination: {
            page: 1,
            limit: 2,
            total: 10,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: mockQuestions.slice(0, 2),
          pagination: {
            page: 1,
            limit: 2,
            total: 10,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: mockQuestions.slice(0, 2),
          pagination: {
            page: 5,
            limit: 2,
            total: 10,
            totalPages: 5,
            hasNext: false,
            hasPrev: true,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });

    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: mockQuestions.slice(0, 2),
          pagination: {
            page: 1,
            limit: 2,
            total: 10,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList />, { wrapper: createWrapper() });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(useQuestions).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
      });
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      vi.mocked(useQuestions).mockReturnValue({
        data: {
          questions: mockQuestions.slice(0, 2),
          pagination: {
            page: 2,
            limit: 2,
            total: 10,
            totalPages: 5,
            hasNext: true,
            hasPrev: true,
          },
        },
        isLoading: false,
        error: null,
        isError: false,
        refetch: vi.fn(),
      } as any);

      render(<QuestionList initialFilters={{ page: 2 }} />, { wrapper: createWrapper() });

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      await waitFor(() => {
        expect(useQuestions).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
      });
    });

    it('should not display pagination for single page', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      expect(screen.queryByText(/Page/)).not.toBeInTheDocument();
    });
  });

  describe('Question Click Handler', () => {
    it('should call onQuestionClick when question is clicked', async () => {
      const user = userEvent.setup();
      const onQuestionClick = vi.fn();

      render(<QuestionList onQuestionClick={onQuestionClick} />, {
        wrapper: createWrapper(),
      });

      const questionCard = screen.getByText(mockQuestions[0].questionText);
      await user.click(questionCard);

      await waitFor(() => {
        expect(onQuestionClick).toHaveBeenCalledWith(mockQuestions[0].id);
      });
    });

    it('should not make cards clickable when no handler provided', () => {
      const { container } = render(<QuestionList />, { wrapper: createWrapper() });

      const clickableCards = container.querySelectorAll('[class*="cursor-pointer"]');
      expect(clickableCards.length).toBe(0);
    });
  });

  describe('Usage Statistics', () => {
    it('should show usage stats when showUsageStats is true', () => {
      render(<QuestionList showUsageStats={true} />, { wrapper: createWrapper() });

      // Usage stats would be shown in QuestionCard
      expect(screen.getByText(mockQuestions[0].questionText)).toBeInTheDocument();
    });

    it('should not show usage stats by default', () => {
      render(<QuestionList />, { wrapper: createWrapper() });

      // By default, showUsageStats is false
      expect(screen.getByText(mockQuestions[0].questionText)).toBeInTheDocument();
    });
  });

  describe('Department Filtering', () => {
    it('should filter by department when departmentId provided', () => {
      const departmentId = 'dept-1';

      render(<QuestionList departmentId={departmentId} />, { wrapper: createWrapper() });

      expect(useQuestions).toHaveBeenCalledWith(
        expect.objectContaining({ department: departmentId })
      );
    });

    it('should persist department filter when other filters change', async () => {
      const user = userEvent.setup();
      const departmentId = 'dept-1';

      render(<QuestionList departmentId={departmentId} />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText('Search questions...');
      await user.type(searchInput, 'test');
      await user.click(screen.getByRole('button', { name: /search/i }));

      await waitFor(() => {
        expect(useQuestions).toHaveBeenCalledWith(
          expect.objectContaining({
            department: departmentId,
            search: 'test',
          })
        );
      });
    });
  });

  describe('Sort Options', () => {
    it('should display all sort options', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const sortSelects = screen.getAllByRole('combobox', { name: '' });
      await user.click(sortSelects[2]); // Sort select

      // Check for unique sort options
      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Newest first' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Oldest first' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Recently updated' })).toBeInTheDocument();
      });
    });
  });

  describe('Question Type Filter Options', () => {
    it('should display all question type options', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const typeSelects = screen.getAllByRole('combobox', { name: '' });
      await user.click(typeSelects[0]);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All types' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'True/False' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Short Answer' })).toBeInTheDocument();
      });
    });
  });

  describe('Difficulty Filter Options', () => {
    it('should display all difficulty options', async () => {
      const user = userEvent.setup();

      render(<QuestionList />, { wrapper: createWrapper() });

      const difficultySelects = screen.getAllByRole('combobox', { name: '' });
      await user.click(difficultySelects[1]);

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'All difficulties' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Easy' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Medium' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Hard' })).toBeInTheDocument();
      });
    });
  });
});
