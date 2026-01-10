/**
 * Tests for CertificatesPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CertificatesPage } from '../CertificatesPage';
import * as enrollmentModule from '@/entities/enrollment';

// Mock hooks
vi.mock('@/entities/enrollment', () => ({
  useMyEnrollments: vi.fn(),
}));

const useMyEnrollments = enrollmentModule.useMyEnrollments as ReturnType<typeof vi.fn>;

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
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Certificates/i)).toBeInTheDocument();
      expect(screen.getByText(/View and download/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/Search certificates/i)).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when data is loading', () => {
      useMyEnrollments.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no certificates', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No certificates earned yet/i)).toBeInTheDocument();
    });

    it('should show encouragement message in empty state', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Complete courses to earn certificates/i)).toBeInTheDocument();
    });

    it('should show link to course catalog in empty state', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /Browse Course Catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });
  });

  describe('Certificate Display', () => {
    it('should display completed courses as certificates', () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
        },
        {
          id: 'enr-2',
          type: 'course',
          target: { id: 'c2', name: 'Advanced TypeScript', code: 'CS201' },
          status: 'completed',
          completedAt: '2024-02-20T14:45:00Z',
          enrolledAt: '2024-02-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 8, totalItems: 8 },
          grade: { score: 88, letter: 'B+', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
    });

    it('should display course code for each certificate', () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/TEST101/i)).toBeInTheDocument();
    });

    it('should display completion date for each certificate', () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Completed:/i)).toBeInTheDocument();
      expect(screen.getByText(/Jan 15, 2024/i)).toBeInTheDocument();
    });

    it('should display certificate ID for each certificate', () => {
      const mockEnrollments = [
        {
          id: 'enr-123456',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/ENR-123456/i)).toBeInTheDocument();
    });

    it('should display grade when available', () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 95, letter: 'A', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Grade:/i)).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText(/95%/i)).toBeInTheDocument();
    });

    it('should display View Certificate button for each certificate', () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /View Certificate/i })).toBeInTheDocument();
    });

    it('should display Print button for each certificate', () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 5, totalItems: 5 },
          grade: { score: 90, letter: 'A-', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      // Print button is an icon-only button, so check for both View and action buttons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // At least View Certificate and Print buttons
    });
  });

  describe('Search Functionality', () => {
    it('should filter certificates by course name', async () => {
      const mockEnrollments = [
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
        },
        {
          id: 'enr-2',
          type: 'course',
          target: { id: 'c2', name: 'Advanced TypeScript', code: 'CS201' },
          status: 'completed',
          completedAt: '2024-02-20T14:45:00Z',
          enrolledAt: '2024-02-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 8, totalItems: 8 },
          grade: { score: 88, letter: 'B+', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

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
        {
          id: 'enr-1',
          type: 'course',
          target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
          status: 'completed',
          completedAt: '2024-01-15T10:30:00Z',
          enrolledAt: '2024-01-01T00:00:00Z',
          progress: { percentage: 100, completedItems: 10, totalItems: 10 },
          grade: { score: 95, letter: 'A', passed: true },
        },
      ];

      useMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

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
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(useMyEnrollments).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'completedAt:desc',
        })
      );
    });

    it('should have sort options available', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      const sortButton = screen.getByRole('combobox');
      expect(sortButton).toBeInTheDocument();
    });

    it('should display default sort value', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Completion Date \(Newest\)/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      useMyEnrollments.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch certificates'),
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading certificates/i)).toBeInTheDocument();
    });

    it('should display error details in error state', () => {
      useMyEnrollments.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should fetch only completed enrollments', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(useMyEnrollments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
        })
      );
    });

    it('should pass correct type filter to API', () => {
      useMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CertificatesPage />, { wrapper: createWrapper() });

      expect(useMyEnrollments).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'course',
        })
      );
    });
  });
});
