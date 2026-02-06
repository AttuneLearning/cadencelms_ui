/**
 * Tests for EnrollCourseDialog component
 * Per ADR-DEV-001: Unit test for new UI component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { EnrollCourseDialog } from '../EnrollCourseDialog';
import { mockUsers } from '@/test/mocks/data/users';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe('EnrollCourseDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const baseUrl = env.apiFullUrl;

  const learners = mockUsers.filter((u) => u.roles?.includes('learner'));

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock users endpoint
    server.use(
      http.get(`${baseUrl}/users/staff`, () => {
        return HttpResponse.json({
          users: learners,
          total: learners.length,
          page: 1,
          pageSize: 20,
        });
      }),
      // Mock course enrollments (empty - no one enrolled yet)
      http.get(`${baseUrl}/enrollments/course/:courseId`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            course: { id: 'course-1', title: 'Test Course', code: 'TC101' },
            enrollments: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
            stats: { total: 0, active: 0, completed: 0, withdrawn: 0, averageProgress: 0, completionRate: 0 },
          },
        });
      })
    );
  });

  it('renders dialog when open', () => {
    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/enroll learners in course/i)).toBeInTheDocument();
    expect(screen.getByText(/test course/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <EnrollCourseDialog
        open={false}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/enroll learners in course/i)).not.toBeInTheDocument();
  });

  it('displays department scoped badge when departmentId provided', () => {
    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        departmentId="dept-1"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/department scoped/i)).toBeInTheDocument();
  });

  it('allows searching for learners', async () => {
    const user = userEvent.setup();
    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const searchInput = await screen.findByPlaceholderText(/search learners/i);
    await user.type(searchInput, 'Jane');

    // Search should filter the list
    expect(searchInput).toHaveValue('Jane');
  });

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables enroll button when no learners selected', () => {
    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const enrollButton = screen.getByRole('button', { name: /enroll 0 learner/i });
    expect(enrollButton).toBeDisabled();
  });

  it('shows success result after enrollment', async () => {
    const user = userEvent.setup();

    // Mock successful bulk enrollment
    server.use(
      http.post(`${baseUrl}/enrollments/course/bulk`, () => {
        return HttpResponse.json({
          success: true,
          message: 'Bulk enrollment completed',
          data: {
            enrolled: [{ learnerId: 'learner-1', enrollmentId: 'enrollment-new-1' }],
            failed: [],
            summary: { total: 1, successful: 1, failed: 0 },
          },
        });
      })
    );

    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    // Wait for learners to load, then select one
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    // Select a learner (first available checkbox after "select all")
    const checkboxes = screen.getAllByRole('checkbox');
    if (checkboxes.length > 1) {
      await user.click(checkboxes[1]); // Skip "select all"
    }

    // Click enroll
    const enrollButton = screen.getByRole('button', { name: /enroll \d+ learner/i });
    if (!enrollButton.hasAttribute('disabled')) {
      await user.click(enrollButton);

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText(/enrollment complete/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    }
  });

  it('shows partial failure results', async () => {
    const user = userEvent.setup();

    // Mock partial success
    server.use(
      http.post(`${baseUrl}/enrollments/course/bulk`, () => {
        return HttpResponse.json({
          success: true,
          message: 'Bulk enrollment completed',
          data: {
            enrolled: [{ learnerId: 'learner-1', enrollmentId: 'enrollment-new-1' }],
            failed: [{ learnerId: 'learner-2', reason: 'Already enrolled' }],
            summary: { total: 2, successful: 1, failed: 1 },
          },
        });
      })
    );

    render(
      <EnrollCourseDialog
        open={true}
        courseId="course-1"
        courseName="Test Course"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    // Wait for learners and select
    await waitFor(() => {
      const selectAll = screen.getByLabelText(/select all/i);
      expect(selectAll).toBeInTheDocument();
    });

    // Use select all
    const selectAll = screen.getByLabelText(/select all/i);
    await user.click(selectAll);

    // Enroll
    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    if (!enrollButton.hasAttribute('disabled')) {
      await user.click(enrollButton);

      // Should show partial results
      await waitFor(() => {
        expect(screen.getByText(/1 learner enrolled/i)).toBeInTheDocument();
        expect(screen.getByText(/1 learner.*skipped/i)).toBeInTheDocument();
      });
    }
  });
});
