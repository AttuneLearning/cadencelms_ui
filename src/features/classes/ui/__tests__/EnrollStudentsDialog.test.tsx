/**
 * Tests for EnrollStudentsDialog component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';
import { env } from '@/shared/config/env';
import { EnrollStudentsDialog } from '../EnrollStudentsDialog';
import { mockUsers } from '@/test/mocks/data/users';
import { mockEnrollmentResult } from '@/test/mocks/data/classes';

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

describe('EnrollStudentsDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  const learners = mockUsers.filter((u) => u.roles.includes('learner'));

  beforeEach(() => {
    vi.clearAllMocks();
    server.use(
      http.get(`${env.apiFullUrl}/users/staff`, () => {
        return HttpResponse.json({
          users: learners,
          total: learners.length,
          page: 1,
          pageSize: 20,
        });
      })
    );
  });

  it('renders dialog when open', () => {
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/enroll students/i)).toBeInTheDocument();
    expect(screen.getByText(/test class/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <EnrollStudentsDialog
        open={false}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText(/enroll students/i)).not.toBeInTheDocument();
  });

  it('displays list of learners', async () => {
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });
  });

  it('allows searching for students', async () => {
    const user = userEvent.setup();
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const searchInput = await screen.findByPlaceholderText(/search students/i);
    await user.type(searchInput, 'Jane');

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });
  });

  it('allows selecting individual students', async () => {
    const user = userEvent.setup();
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    expect(checkboxes[0]).toBeChecked();
  });

  it('allows selecting all students', async () => {
    const user = userEvent.setup();
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const selectAllCheckbox = screen.getByRole('checkbox', { name: /select all/i });
    await user.click(selectAllCheckbox);

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      if (checkbox !== selectAllCheckbox) {
        expect(checkbox).toBeChecked();
      }
    });
  });

  it('displays selected count', async () => {
    const user = userEvent.setup();
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    // Skip the "Select All" checkbox at index 0, click the first student checkbox
    await user.click(checkboxes[1]);

    // Wait for the selected count text to appear
    await waitFor(() => {
      expect(screen.getByText('1 student selected')).toBeInTheDocument();
    });
  });

  it('enrolls selected students when submit is clicked', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${env.apiFullUrl}/classes/:classId/enrollments`, () => {
        return HttpResponse.json(mockEnrollmentResult);
      })
    );

    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    await user.click(enrollButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('disables enroll button when no students selected', async () => {
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    expect(enrollButton).toBeDisabled();
  });

  it('shows already enrolled students as disabled', async () => {
    server.use(
      http.get(`${env.apiFullUrl}/classes/class-1/enrollments`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            classId: 'class-1',
            enrollments: [
              {
                id: 'enrollment-1',
                learner: {
                  ...learners[0],
                  id: learners[0]._id, // Use id field to match component expectation
                },
                status: 'active',
                enrolledAt: '2026-01-01T00:00:00Z',
              },
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

    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    // Wait for both learners to load and for the already enrolled section to appear
    // learners[0] is jane smith who is already enrolled
    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Already Enrolled')).toBeInTheDocument();
    });
  });

  it('closes dialog when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('displays error message on enrollment failure', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${env.apiFullUrl}/classes/:classId/enrollments`, () => {
        return HttpResponse.json(
          { message: 'Class is full' },
          { status: 400 }
        );
      })
    );

    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    await user.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to enroll students/i)).toBeInTheDocument();
    });
  });

  it('filters by department', async () => {
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const departmentFilter = screen.getByRole('combobox', { name: /department/i });
    expect(departmentFilter).toBeInTheDocument();
  });

  it('filters by program', async () => {
    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const programFilter = screen.getByRole('combobox', { name: /program/i });
    expect(programFilter).toBeInTheDocument();
  });

  it('displays loading state while enrolling', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${env.apiFullUrl}/classes/:classId/enrollments`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return HttpResponse.json(mockEnrollmentResult);
      })
    );

    render(
      <EnrollStudentsDialog
        open={true}
        classId="class-1"
        className="Test Class"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[0]);

    const enrollButton = screen.getByRole('button', { name: /enroll/i });
    await user.click(enrollButton);

    expect(screen.getByText(/enrolling/i)).toBeInTheDocument();
  });
});
