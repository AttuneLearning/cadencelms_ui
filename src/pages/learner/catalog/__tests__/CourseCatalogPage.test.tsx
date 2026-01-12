/**
 * Tests for CourseCatalogPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseCatalogPage } from '../CourseCatalogPage';

// Mock hooks
const mockUseCourses = vi.fn();
vi.mock('@/entities/course', () => ({
  useCourses: () => mockUseCourses(),
}));

// Mock the navigation hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

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

describe('CourseCatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Course Catalog/i)).toBeInTheDocument();
    });

    it('should render search bar', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText(/Search courses/i)).toBeInTheDocument();
    });

    it('should render view toggle buttons', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /list view/i })).toBeInTheDocument();
    });

    it('should render filter panel', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Filters/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when fetching courses', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no courses found', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No courses found/i)).toBeInTheDocument();
    });
  });

  describe('Course Display', () => {
    it('should display courses in grid view by default', () => {
      const { useCourses } = require('@/entities/course');
      const mockCourses = [
        {
          id: '1',
          title: 'Introduction to React',
          code: 'CS101',
          description: 'Learn React basics',
          status: 'published',
          enrollmentCount: 100,
          duration: 40,
        },
        {
          id: '2',
          title: 'Advanced TypeScript',
          code: 'CS201',
          description: 'Master TypeScript',
          status: 'published',
          enrollmentCount: 50,
          duration: 60,
        },
      ];

      useCourses.mockReturnValue({
        data: {
          courses: mockCourses,
          pagination: { page: 1, limit: 20, total: 2, totalPages: 1 },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      expect(screen.getByTestId('course-grid')).toBeInTheDocument();
    });

    it('should filter published courses only', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(useCourses).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
        })
      );
    });
  });

  describe('View Toggle', () => {
    it('should switch to list view when list button clicked', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: {
          courses: [
            {
              id: '1',
              title: 'Test Course',
              code: 'TEST',
              description: 'Test',
              status: 'published',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const listViewButton = screen.getByRole('button', { name: /list view/i });
      fireEvent.click(listViewButton);

      await waitFor(() => {
        expect(screen.getByTestId('course-list-view')).toBeInTheDocument();
      });
    });

    it('should switch back to grid view when grid button clicked', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: {
          courses: [
            {
              id: '1',
              title: 'Test Course',
              code: 'TEST',
              description: 'Test',
              status: 'published',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      // Switch to list view first
      const listViewButton = screen.getByRole('button', { name: /list view/i });
      fireEvent.click(listViewButton);

      // Switch back to grid view
      const gridViewButton = screen.getByRole('button', { name: /grid view/i });
      fireEvent.click(gridViewButton);

      await waitFor(() => {
        expect(screen.getByTestId('course-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter courses by search term', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/Search courses/i);
      fireEvent.change(searchInput, { target: { value: 'React' } });

      await waitFor(() => {
        expect(useCourses).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'React',
          })
        );
      });
    });

    it('should debounce search input', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const searchInput = screen.getByPlaceholderText(/Search courses/i);

      // Type multiple characters quickly
      fireEvent.change(searchInput, { target: { value: 'R' } });
      fireEvent.change(searchInput, { target: { value: 'Re' } });
      fireEvent.change(searchInput, { target: { value: 'Rea' } });

      // Should not call immediately
      expect(useCourses).not.toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Rea' })
      );
    });
  });

  describe('Filter Functionality', () => {
    it('should apply department filter', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const departmentFilter = screen.getByLabelText(/Department/i);
      fireEvent.change(departmentFilter, { target: { value: 'dept-1' } });

      await waitFor(() => {
        expect(useCourses).toHaveBeenCalledWith(
          expect.objectContaining({
            department: 'dept-1',
          })
        );
      });
    });

    it('should clear all filters', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const clearButton = screen.getByRole('button', { name: /clear filters/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(useCourses).toHaveBeenCalledWith(
          expect.objectContaining({
            department: undefined,
            program: undefined,
          })
        );
      });
    });
  });

  describe('Sorting', () => {
    it('should apply sort by name', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const sortSelect = screen.getByLabelText(/Sort by/i);
      fireEvent.change(sortSelect, { target: { value: 'title:asc' } });

      await waitFor(() => {
        expect(useCourses).toHaveBeenCalledWith(
          expect.objectContaining({
            sort: 'title:asc',
          })
        );
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: {
          courses: Array(20).fill(null).map((_, i) => ({
            id: `${i}`,
            title: `Course ${i}`,
            code: `CS${i}`,
            status: 'published',
          })),
          pagination: { page: 1, limit: 20, total: 50, totalPages: 3, hasNext: true, hasPrev: false },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
    });

    it('should navigate to next page', async () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: {
          courses: [],
          pagination: { page: 1, limit: 20, total: 50, totalPages: 3, hasNext: true, hasPrev: false },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(useCourses).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 2,
          })
        );
      });
    });
  });

  describe('Course Cards', () => {
    it('should display course details on each card', () => {
      const { useCourses } = require('@/entities/course');
      const mockCourse = {
        id: '1',
        title: 'Introduction to React',
        code: 'CS101',
        description: 'Learn React basics',
        status: 'published',
        enrollmentCount: 100,
        duration: 40,
        credits: 3,
      };

      useCourses.mockReturnValue({
        data: {
          courses: [mockCourse],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText('CS101')).toBeInTheDocument();
      expect(screen.getByText(/40 hours/i)).toBeInTheDocument();
      expect(screen.getByText(/100 enrolled/i)).toBeInTheDocument();
    });

    it('should have View Details button on each card', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: {
          courses: [
            {
              id: '1',
              title: 'Test Course',
              code: 'TEST',
              status: 'published',
            },
          ],
          pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
        },
        isLoading: false,
        error: null,
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('link', { name: /view details/i })).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch courses'),
      });

      render(<CourseCatalogPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading courses/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should be responsive on mobile', () => {
      const { useCourses } = require('@/entities/course');
      useCourses.mockReturnValue({
        data: { courses: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        isLoading: false,
        error: null,
      });

      const { container } = render(<CourseCatalogPage />, { wrapper: createWrapper() });

      // Check for responsive classes
      const gridContainer = container.querySelector('[class*="grid"]');
      expect(gridContainer).toBeInTheDocument();
    });
  });
});
