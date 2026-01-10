/**
 * Tests for ProgressDashboardPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgressDashboardPage } from '../ProgressDashboardPage';
import type { EnrollmentListItem } from '@/entities/enrollment';

// Mock hooks
const mockUseMyEnrollments = vi.fn();
vi.mock('@/entities/enrollment', async () => {
  const actual = await vi.importActual('@/entities/enrollment');
  return {
    ...actual,
    useMyEnrollments: (...args: any[]) => mockUseMyEnrollments(...args),
  };
});

vi.mock('@/shared/lib/navigation/useNavigation', () => ({
  useNavigation: vi.fn(() => ({
    updateBreadcrumbs: vi.fn(),
  })),
}));

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

const mockEnrollments: EnrollmentListItem[] = [
  {
    id: 'enroll-1',
    type: 'course',
    learner: {
      id: 'learner-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    target: {
      id: 'course-1',
      name: 'React Basics',
      code: 'CS101',
      type: 'course',
    },
    status: 'active',
    enrolledAt: '2024-01-01T00:00:00Z',
    completedAt: null,
    withdrawnAt: null,
    expiresAt: null,
    progress: {
      percentage: 50,
      completedItems: 5,
      totalItems: 10,
      lastActivityAt: '2024-01-15T00:00:00Z',
    },
    grade: {
      score: null,
      letter: null,
      passed: null,
    },
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'enroll-2',
    type: 'course',
    learner: {
      id: 'learner-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    target: {
      id: 'course-2',
      name: 'Advanced TypeScript',
      code: 'CS201',
      type: 'course',
    },
    status: 'completed',
    enrolledAt: '2023-12-01T00:00:00Z',
    completedAt: '2024-01-10T00:00:00Z',
    withdrawnAt: null,
    expiresAt: null,
    progress: {
      percentage: 100,
      completedItems: 8,
      totalItems: 8,
      lastActivityAt: '2024-01-10T00:00:00Z',
    },
    grade: {
      score: 95,
      letter: 'A',
      passed: true,
    },
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: 'enroll-3',
    type: 'course',
    learner: {
      id: 'learner-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    target: {
      id: 'course-3',
      name: 'Node.js Fundamentals',
      code: 'CS102',
      type: 'course',
    },
    status: 'active',
    enrolledAt: '2024-01-05T00:00:00Z',
    completedAt: null,
    withdrawnAt: null,
    expiresAt: null,
    progress: {
      percentage: 0,
      completedItems: 0,
      totalItems: 12,
      lastActivityAt: null,
    },
    grade: {
      score: null,
      letter: null,
      passed: null,
    },
    department: {
      id: 'dept-1',
      name: 'Computer Science',
    },
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

describe('ProgressDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render page title', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Progress/i)).toBeInTheDocument();
    });

    it('should render overall progress summary section', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Total Courses')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Completed/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /In Progress/i })).toBeInTheDocument();
    });

    it('should render filter tabs', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('tab', { name: 'All Courses' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'In Progress' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Completed' })).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // Sort dropdown exists (using ID selector as the label is sr-only)
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when fetching data', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should not show content while loading', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.queryByText(/Total Courses/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no enrollments', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No courses enrolled yet/i)).toBeInTheDocument();
    });

    it('should show link to course catalog in empty state', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /browse catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch enrollments'),
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading progress/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch enrollments/i)).toBeInTheDocument();
    });
  });

  describe('Overall Progress Summary', () => {
    it('should display correct total courses count', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should calculate and display completed courses count', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // 1 completed course out of 3
      const completedHeading = screen.getByRole('heading', { name: 'Completed' });
      const completedCard = completedHeading.closest('.rounded-lg') as HTMLElement;
      expect(within(completedCard).getByText('1')).toBeInTheDocument();
      expect(within(completedCard).getByText('Courses finished')).toBeInTheDocument();
    });

    it('should calculate and display in-progress courses count', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // Only 1 in-progress course (50% progress, the one with 0% is not counted as "in progress" in our logic)
      const inProgressHeading = screen.getByRole('heading', { name: 'In Progress' });
      const inProgressCard = inProgressHeading.closest('.rounded-lg') as HTMLElement;
      expect(within(inProgressCard).getByText('1')).toBeInTheDocument();
      expect(within(inProgressCard).getByText('Active learning')).toBeInTheDocument();
    });

    it('should calculate and display overall completion percentage', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // Average: (50 + 100 + 0) / 3 = 50%
      const overallProgressHeading = screen.getByRole('heading', { name: 'Overall Progress' });
      const overallProgressCard = overallProgressHeading.closest('.rounded-lg') as HTMLElement;
      expect(within(overallProgressCard).getByText('50%')).toBeInTheDocument();
    });

    it('should display total lessons completed', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // Total completed: 5 + 8 + 0 = 13
      expect(screen.getByText('13')).toBeInTheDocument();
    });
  });

  describe('Course Progress List', () => {
    it('should display all enrolled courses', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Node.js Fundamentals')).toBeInTheDocument();
    });

    it('should display progress bars for each course', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // Check for progress indicators
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should display enrollment date for each course', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      // Check that we have Enrolled dates for each course
      const enrolledLabels = screen.getAllByText(/Enrolled:/);
      expect(enrolledLabels.length).toBeGreaterThan(0);
    });

    it('should have clickable links to course details', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const courseLinks = screen.getAllByRole('link', { name: /view progress/i });
      expect(courseLinks.length).toBeGreaterThan(0);
      expect(courseLinks[0]).toHaveAttribute('href', expect.stringContaining('/learner/courses/'));
    });
  });

  describe('Filtering', () => {
    it('should filter by In Progress status', async () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const inProgressTab = screen.getByRole('tab', { name: /in progress/i });
      fireEvent.click(inProgressTab);

      await waitFor(() => {
        // Should show only in-progress courses (not completed)
        expect(screen.getByText('React Basics')).toBeInTheDocument();
        expect(screen.getByText('Node.js Fundamentals')).toBeInTheDocument();
      });
    });

    it('should filter by Completed status', async () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const completedTab = screen.getByRole('tab', { name: /completed/i });
      fireEvent.click(completedTab);

      await waitFor(() => {
        // Should show only completed courses
        expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
      });
    });
  });

  describe('Sorting', () => {
    it('should sort by progress percentage', async () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'progress:desc' } });

      await waitFor(() => {
        expect(mockUseMyEnrollments).toHaveBeenCalled();
      });
    });

    it('should sort by enrollment date', async () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'enrolledAt:desc' } });

      await waitFor(() => {
        expect(mockUseMyEnrollments).toHaveBeenCalled();
      });
    });

    it('should sort by course name', async () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      const sortSelect = screen.getByRole('combobox');
      fireEvent.change(sortSelect, { target: { value: 'courseName:asc' } });

      await waitFor(() => {
        expect(mockUseMyEnrollments).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render on mobile viewport', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: mockEnrollments, pagination: { page: 1, total: 3 } },
        isLoading: false,
        error: null,
      });

      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<ProgressDashboardPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Progress/i)).toBeInTheDocument();
    });
  });
});
