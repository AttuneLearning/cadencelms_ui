/**
 * Unit Tests for DepartmentEnrollmentPage
 * Tests course dropdown and enrollment management functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DepartmentEnrollmentPage } from '../DepartmentEnrollmentPage';

// ============================================================================
// Mock Setup
// ============================================================================

vi.mock('@/entities/department/model/useDepartment', () => ({
  useDepartment: vi.fn(() => ({
    data: { id: 'dept-123', name: 'Test Department' },
    isLoading: false,
  })),
}));

vi.mock('@/entities/course/model/useCourse', () => ({
  useCourses: vi.fn(() => ({
    data: {
      courses: [
        { id: 'course-1', title: 'Course One', code: 'CS101', status: 'published' },
        { id: 'course-2', title: 'Course Two', code: 'CS102', status: 'published' },
        { id: 'course-3', title: 'Course Three', code: 'CS103', status: 'published' },
      ],
      pagination: { page: 1, limit: 100, total: 3, totalPages: 1, hasNext: false, hasPrev: false },
    },
    isLoading: false,
  })),
}));

vi.mock('@/entities/enrollment/hooks/useEnrollments', () => ({
  useCourseEnrollments: vi.fn(() => ({
    data: null,
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

vi.mock('@/shared/hooks', () => ({
  useDepartmentContext: vi.fn(() => ({
    hasPermission: vi.fn((perm) =>
      ['enrollment:department:manage', 'enrollment:department:read'].includes(perm)
    ),
    switchDepartment: vi.fn(),
    currentDepartmentId: 'dept-123',
    isSwitching: false,
  })),
}));

vi.mock('@/features/enrollment', () => ({
  EnrollCourseDialog: () => null,
}));

// ============================================================================
// Test Utilities
// ============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderPage = () => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/staff/departments/dept-123/enrollments']}>
        <Routes>
          <Route
            path="/staff/departments/:deptId/enrollments"
            element={<DepartmentEnrollmentPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// ============================================================================
// Test Suites
// ============================================================================

describe('DepartmentEnrollmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Course Dropdown', () => {
    it('should display courses in the dropdown using course.id', async () => {
      const user = userEvent.setup();
      renderPage();

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Select Course')).toBeInTheDocument();
      });

      // Click the course dropdown trigger
      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      // Verify all courses are displayed
      await waitFor(() => {
        expect(screen.getByText('Course One')).toBeInTheDocument();
        expect(screen.getByText('Course Two')).toBeInTheDocument();
        expect(screen.getByText('Course Three')).toBeInTheDocument();
      });
    });

    it('should show course codes as badges', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Select Course')).toBeInTheDocument();
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      await waitFor(() => {
        expect(screen.getByText('CS101')).toBeInTheDocument();
        expect(screen.getByText('CS102')).toBeInTheDocument();
        expect(screen.getByText('CS103')).toBeInTheDocument();
      });
    });

    it('should select a course when clicked', async () => {
      const user = userEvent.setup();
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Select Course')).toBeInTheDocument();
      });

      const selectTrigger = screen.getByRole('combobox');
      await user.click(selectTrigger);

      await waitFor(() => {
        expect(screen.getByText('Course One')).toBeInTheDocument();
      });

      // Click on a course option
      const courseOption = screen.getByText('Course One');
      await user.click(courseOption);

      // Verify the Enroll Learners button appears (indicates course selected)
      await waitFor(() => {
        expect(screen.getByText('Enroll Learners')).toBeInTheDocument();
      });
    });
  });

  describe('Page Header', () => {
    it('should display correct title and department name', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Course Enrollments')).toBeInTheDocument();
        expect(screen.getByText(/Test Department/)).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should show select course prompt when no course is selected', async () => {
      renderPage();

      await waitFor(() => {
        expect(screen.getByText('Select a Course')).toBeInTheDocument();
        expect(
          screen.getByText(/Choose a course from the dropdown above/)
        ).toBeInTheDocument();
      });
    });
  });
});
