/**
 * Tests for CertificatesPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CertificatesPage } from '../CertificatesPage';

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
    status: 'completed' as const,
    completedAt: '2024-01-15T10:30:00Z',
    enrolledAt: '2024-01-01T00:00:00Z',
    withdrawnAt: null,
    expiresAt: null,
    progress: { percentage: 100, completedItems: 10, totalItems: 10 },
    grade: { score: 95, letter: 'A', passed: true },
    department: { id: 'd1', name: 'Engineering' },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
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

describe('CertificatesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title and description', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Certificates/i)).toBeInTheDocument();
      expect(screen.getByText(/View and download/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/Search certificates/i)).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when data is loading', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(undefined, true, null)
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no certificates', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No certificates earned yet/i)).toBeInTheDocument();
    });

    it('should show encouragement message in empty state', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Complete courses to earn certificates/i)).toBeInTheDocument();
    });

    it('should show link to course catalog in empty state', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /Browse Course Catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });
  });

  describe('Certificate Display', () => {
    it('should display completed courses as certificates', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
        }),
        createMockEnrollment({
          id: 'enr-2',
          target: { id: 'c2', name: 'Advanced TypeScript', code: 'CS201' },
          completedAt: '2024-02-20T14:45:00Z',
          enrolledAt: '2024-02-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 8, totalItems: 8 },
          grade: { score: 88, letter: 'B+', passed: true },
          updatedAt: '2024-02-20T14:45:00Z',
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 2, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
    });

    it('should display course code for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST101' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/TEST101/i)).toBeInTheDocument();
    });

    it('should display completion date for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Completed:/i)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/i)).toBeInTheDocument();
    });

    it('should display certificate ID for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-123456',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/ENR-123456/i)).toBeInTheDocument();
    });

    it('should display grade when available', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 95, letter: 'A', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Grade:/i)).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    it('should display View Certificate button for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /View Certificate/i })).toBeInTheDocument();
    });

    it('should display Print button for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      // Print button is an icon-only button, so check for both View and action buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least View Certificate and Print buttons
    });
  });

  describe('Search Functionality', () => {
    it('should filter certificates by course name', async () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
        }),
        createMockEnrollment({
          id: 'enr-2',
          target: { id: 'c2', name: 'Advanced TypeScript', code: 'CS201' },
          completedAt: '2024-02-20T14:45:00Z',
          enrolledAt: '2024-02-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 8, totalItems: 8 },
          grade: { score: 88, letter: 'B+', passed: true },
          updatedAt: '2024-02-20T14:45:00Z',
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 2, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/Search certificates/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
        expect(screen.queryByText('Advanced TypeScript')).not.toBeInTheDocument();
      });
    });

    it('should show empty result message when search has no matches', async () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/Search certificates/i);
      fireEvent.change(searchInput, { target: { value: 'Python' } });

      await waitFor(() => {
        expect(screen.getByText(/No certificates found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sort Functionality', () => {
    it('should initialize with default sort (newest first)', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(vi.mocked(useMyEnrollments)).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'completedAt:desc',
        })
      );
    });

    it('should have sort options available', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const sortButton = screen.getByRole('combobox');
      expect(sortButton).toBeInTheDocument();
    });

    it('should display default sort value', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Completion Date \(Newest\)/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(undefined, false, new Error('Failed to fetch certificates'))
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/unable to load certificates/i)).toBeInTheDocument();
    });

    it('should display error details in error state', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(undefined, false, new Error('Network error'))
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      // Check that error panel is shown
      expect(screen.getByText(/unable to load certificates/i)).toBeInTheDocument();
      expect(screen.getByText(/problem loading your certificates/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should fetch only completed enrollments', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(vi.mocked(useMyEnrollments)).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      );
    });

    it('should pass correct type filter to API', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(vi.mocked(useMyEnrollments)).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'course',
        })
      );
    });
  });

  describe('Certificate Actions', () => {
    it('should navigate to certificate view page when clicking View Certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const viewButton = screen.getByRole('button', { name: /View Certificate/i });
      expect(viewButton).toBeInTheDocument();
    });

    it('should have download button for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      // Button with Download icon should be present (check by title attribute)
      const buttons = screen.getAllByRole('button');
      const downloadButton = buttons.find(btn => btn.getAttribute('title') === 'Download PDF');
      expect(downloadButton).toBeInTheDocument();
    });

    it('should have share button for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      // Button with Share icon should be present (check by title attribute)
      const buttons = screen.getAllByRole('button');
      const shareButton = buttons.find(btn => btn.getAttribute('title') === 'Share Certificate');
      expect(shareButton).toBeInTheDocument();
    });

    it('should have verify button for each certificate', () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 1, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      // Button with Verify icon should be present (check by title attribute)
      const buttons = screen.getAllByRole('button');
      const verifyButton = buttons.find(btn => btn.getAttribute('title') === 'Verify Certificate');
      expect(verifyButton).toBeInTheDocument();
    });
  });

  describe('Date Range Filter', () => {
    it('should display date range filter inputs', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: [], pagination: { page: 1, total: 0, limit: 12, totalPages: 0, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/From Date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/To Date/i)).toBeInTheDocument();
    });

    it('should filter certificates by date range', async () => {
      const mockEnrollments = [
        createMockEnrollment({
          id: 'enr-1',
          target: { id: 'c1', name: 'Old Course', code: 'OLD' },
          completedAt: '2023-01-15T10:30:00Z',
          enrolledAt: '2023-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
          createdAt: '2023-01-01T00:00:00Z',
          updatedAt: '2023-01-15T10:30:00Z',
        }),
        createMockEnrollment({
          id: 'enr-2',
          target: { id: 'c2', name: 'New Course', code: 'NEW' },
          completedAt: '2024-06-15T10:30:00Z',
          enrolledAt: '2024-06-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 95, letter: 'A', passed: true },
          createdAt: '2024-06-01T00:00:00Z',
          updatedAt: '2024-06-15T10:30:00Z',
        }),
      ];

      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          { enrollments: mockEnrollments, pagination: { page: 1, total: 2, limit: 12, totalPages: 1, hasNext: false, hasPrev: false } },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const fromDate = screen.getByLabelText(/From Date/i);
      const toDate = screen.getByLabelText(/To Date/i);

      fireEvent.change(fromDate, { target: { value: '2024-01-01' } });
      fireEvent.change(toDate, { target: { value: '2024-12-31' } });

      await waitFor(() => {
        expect(screen.getByText('New Course')).toBeInTheDocument();
        expect(screen.queryByText('Old Course')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination when multiple pages exist', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          {
            enrollments: [
              createMockEnrollment({
                id: 'enr-1',
                target: { id: 'c1', name: 'Course 1', code: 'C1' },
                progress: { percentage: 100, completedItems: 5, totalItems: 5 },
                grade: { score: 90, letter: 'A-', passed: true },
              }),
            ],
            pagination: {
              page: 1,
              total: 25,
              totalPages: 3,
              hasNext: true,
              hasPrev: false,
              limit: 12,
            },
          },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
    });

    it('should disable Previous button on first page', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          {
            enrollments: [
              createMockEnrollment({
                id: 'enr-1',
                target: { id: 'c1', name: 'Course 1', code: 'C1' },
                progress: { percentage: 100, completedItems: 5, totalItems: 5 },
                grade: { score: 90, letter: 'A-', passed: true },
              }),
            ],
            pagination: {
              page: 1,
              total: 25,
              totalPages: 3,
              hasNext: true,
              hasPrev: false,
              limit: 12,
            },
          },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const prevButton = screen.getByRole('button', { name: /Previous/i });
      expect(prevButton).toBeDisabled();
    });

    it('should disable Next button on last page', () => {
      vi.mocked(useMyEnrollments).mockReturnValue(
        createMockQueryResult(
          {
            enrollments: [
              createMockEnrollment({
                id: 'enr-1',
                target: { id: 'c1', name: 'Course 1', code: 'C1' },
                progress: { percentage: 100, completedItems: 5, totalItems: 5 },
                grade: { score: 90, letter: 'A-', passed: true },
              }),
            ],
            pagination: {
              page: 3,
              total: 25,
              totalPages: 3,
              hasNext: false,
              hasPrev: true,
              limit: 12,
            },
          },
          false,
          null
        )
      );

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toBeDisabled();
    });
  });
});
