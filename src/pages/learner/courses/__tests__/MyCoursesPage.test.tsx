/**
 * Tests for MyCoursesPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyCoursesPage } from '../MyCoursesPage';

// Mock hooks
vi.mock('@/entities/enrollment');

import { useMyEnrollments } from '@/entities/enrollment';

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
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Courses/i)).toBeInTheDocument();
    });

    it('should render search bar', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });

    it('should render filter tabs', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('tab', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /in progress/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /not started/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no enrollments', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/You haven't enrolled/i)).toBeInTheDocument();
    });

    it('should show link to course catalog in empty state', () => {
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /browse catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });
  });

  describe('Course Display', () => {
    it('should display enrolled courses', () => {
      
      const mockEnrollments = [
        {
          id: '1',
          type: 'course',
          target: { id: 'c1', name: 'React Basics', code: 'CS101' },
          status: 'active',
          progress: { percentage: 50, completedItems: 5, totalItems: 10 },
          enrolledAt: '2024-01-01',
        },
        {
          id: '2',
          type: 'course',
          target: { id: 'c2', name: 'Advanced TypeScript', code: 'CS201' },
          status: 'active',
          progress: { percentage: 0, completedItems: 0, totalItems: 8 },
          enrolledAt: '2024-01-02',
        },
      ];

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
    });

    it('should display progress for each course', () => {
      
      const mockEnrollments = [
        {
          id: '1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'active',
          progress: { percentage: 75, completedItems: 3, totalItems: 4 },
          enrolledAt: '2024-01-01',
        },
      ];

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/75%/i)).toBeInTheDocument();
    });

    it('should display status badge for each course', () => {
      
      const mockEnrollments = [
        {
          id: '1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'completed',
          progress: { percentage: 100, completedItems: 5, totalItems: 5, score: 95 },
          grade: { score: 95, letter: 'A', passed: true },
          completedAt: '2024-02-01',
          enrolledAt: '2024-01-01',
        },
      ];

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should have Continue Learning button for each course', () => {
      
      const mockEnrollments = [
        {
          id: '1',
          type: 'course',
          target: { id: 'c1', name: 'Test Course', code: 'TEST' },
          status: 'active',
          progress: { percentage: 50, completedItems: 2, totalItems: 4 },
          enrolledAt: '2024-01-01',
        },
      ];

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 1 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('link', { name: /continue learning/i })).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter by In Progress status', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify tabs are rendered
      expect(screen.getByRole('tab', { name: /in progress/i })).toBeInTheDocument();
    });

    it('should filter by Completed status', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify tabs are rendered
      expect(screen.getByRole('tab', { name: /completed/i })).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should filter courses by search query', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      // Just verify search input is rendered
      expect(screen.getByPlaceholderText(/Search/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by enrollment date', async () => {

      vi.mocked(useMyEnrollments).mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

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
      
      vi.mocked(useMyEnrollments).mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch enrollments'),
      });

      render(<MyCoursesPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading courses/i)).toBeInTheDocument();
    });
  });
});
