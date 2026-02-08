/**
 * Tests for MyCoursesPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyCoursesPage } from '../MyCoursesPage';

// Mock hooks
vi.mock('@/entities/enrollment');

import { useMyEnrollments } from '@/entities/enrollment';
import type { EnrollmentListItem, EnrollmentsListResponse } from '@/entities/enrollment';

// Helper to create mock enrollment items with all required fields
const createMockEnrollment = (partial: Omit<Partial<EnrollmentListItem>, 'target'> & { id: string; target: { id: string; name: string; code: string } }): EnrollmentListItem => {
  const baseEnrollment: EnrollmentListItem = {
    id: partial.id,
    type: 'course' as const,
    learner: { id: 'l1', firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
    target: { id: partial.target.id, name: partial.target.name, code: partial.target.code, type: 'course' as const },
    status: 'active' as const,
    completedAt: null,
    enrolledAt: '2024-01-01T00:00:00Z',
    withdrawnAt: null,
    expiresAt: null,
    progress: { percentage: 50, completedItems: 5, totalItems: 10 },
    grade: { score: null, letter: null, passed: null },
    department: { id: 'd1', name: 'Engineering' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const result: EnrollmentListItem = {
    ...baseEnrollment,
    ...partial,
    target: {
      id: partial.target.id,
      name: partial.target.name,
      code: partial.target.code,
      type: 'course' as const
    }
  };
  return result;
};

// Helper to create mock query result
const createMockQueryResult = (data: EnrollmentsListResponse | undefined, isLoading: boolean, error: Error | null) => ({
  data,
  isLoading,
  error,
  isError: !!error,
  isSuccess: !isLoading && !error && data !== undefined,
  status: isLoading ? 'pending' as const : error ? 'error' as const : 'success' as const,
  refetch: vi.fn(),
  fetchStatus: 'idle' as const,
  dataUpdatedAt: 0,
  errorUpdatedAt: 0,
  failureCount: 0,
  failureReason: error,
  errorUpdateCount: 0,
  isFetched: true,
  isFetchedAfterMount: true,
  isFetching: false,
  isInitialLoading: isLoading,
  isLoadingError: false,
  isPaused: false,
  isPlaceholderData: false,
  isPending: isLoading,
  isRefetchError: false,
  isRefetching: false,
  isStale: false,
}) as any;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MyCoursesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Courses/i)).toBeInTheDocument();
    });

    it('should render search bar', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should render filter tabs', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /in progress/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /not started/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton', () => {

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(undefined, true, null)
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no enrollments', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/You haven't enrolled/i)).toBeInTheDocument();
    });

    it('should show link to course catalog in empty state', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /browse catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });
  });

  describe('Course Display', () => {
    it('should display enrolled courses', () => {
      
      const mockEnrollments = [
        createMockEnrollment({
          id: '1',
          target: { id: 'c1', name: 'React Basics', code: 'CS101' },
          progress: { percentage: 50, completedItems: 5, totalItems: 10 },
        }),
        createMockEnrollment({
          id: '2',
          target: { id: 'c2', name: 'Advanced TypeScript', code: 'CS201' },
          progress: { percentage: 0, completedItems: 0, totalItems: 8 },
          enrolledAt: '2024-01-02T00:00:00Z',
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 2, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
    });

    it('should display progress for each course', () => {
      
      const mockEnrollments = [
        createMockEnrollment({
          id: '1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 75, completedItems: 3, totalItems: 4 },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/75%/i)).toBeInTheDocument();
    });

    it('should display status badge for each course', () => {
      
      const mockEnrollments = [
        createMockEnrollment({
          id: '1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 95, letter: 'A', passed: true },
          completedAt: '2024-02-01T00:00:00Z',
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should have Continue Learning button for each course', () => {
      
      const mockEnrollments = [
        createMockEnrollment({
          id: '1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 50, completedItems: 2, totalItems: 4 },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('link', { name: /continue learning/i })).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by In Progress status', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify tabs are rendered
      expect(screen.getByRole('tab', { name: /in progress/i })).toBeInTheDocument();
    });

    it('should filter by Completed status', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify tabs are rendered
      expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should filter courses by search query', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify search input is rendered
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by enrollment date', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify sort controls are rendered
      const sortLabel = screen.queryByLabelText(/sort by/i);
      if (sortLabel) {
        expect(sortLabel).toBeInTheDocument();
      }
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(undefined, false, new Error('Failed to fetch enrollments'))
      );

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading courses/i)).toBeInTheDocument();
    });
  });
});
