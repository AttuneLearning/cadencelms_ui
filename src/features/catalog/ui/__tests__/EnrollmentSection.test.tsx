/**
 * EnrollmentSection Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnrollmentSection } from '../EnrollmentSection';
import type { Course } from '@/entities/course';

// Mock dependencies
vi.mock('@/entities/enrollment');
import { useEnrollInCourse } from '@/entities/enrollment';

vi.mock('@/shared/ui/use-toast');
import { useToast } from '@/shared/ui/use-toast';

vi.mock('@/features/auth/model/useAuth');
import { useAuth } from '@/features/auth/model/useAuth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockToast = vi.fn();
const mockEnrollMutate = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockPublishedCourse: Course = {
  id: 'course-1',
  title: 'React Testing',
  code: 'RT-101',
  description: 'Learn React testing',
  department: { id: 'dept-1', name: 'Engineering' },
  program: null,
  credits: 3,
  duration: 10,
  status: 'published',
  instructors: [],
  settings: {
    allowSelfEnrollment: true,
    passingScore: 70,
    maxAttempts: 3,
    certificateEnabled: true,
  },
  modules: [],
  enrollmentCount: 25,
  publishedAt: '2024-01-01T00:00:00Z',
  archivedAt: null,
  createdBy: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  version: 1,
  canonicalCourseId: 'course-1',
  isLocked: false,
  isLatest: true,
  parentVersionId: null,
  lockedAt: null,
  lockedBy: null,
  lockedReason: null,
  changeNotes: null,
};

const mockDraftCourse: Course = {
  ...mockPublishedCourse,
  id: 'course-2',
  status: 'draft',
  publishedAt: null,
};

describe('EnrollmentSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useToast).mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });

    vi.mocked(useAuth).mockReturnValue({
      user: { _id: 'learner-1', email: 'test@test.com', userTypes: ['learner'] },
    } as any);

    vi.mocked(useEnrollInCourse).mockReturnValue({
      mutate: mockEnrollMutate,
      isPending: false,
    } as any);
  });

  it('shows unavailable message for unpublished courses', () => {
    render(
      <EnrollmentSection course={mockDraftCourse} isEnrolled={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('This course is not available for enrollment yet.')).toBeInTheDocument();
  });

  it('shows enrollment info and Enroll Now button for unenrolled learners', () => {
    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Ready to start learning?')).toBeInTheDocument();
    expect(screen.getByText('10 hours of content')).toBeInTheDocument();
    expect(screen.getByText('3 credits upon completion')).toBeInTheDocument();
    expect(screen.getByText('Pass with 70% or higher')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enroll now/i })).toBeInTheDocument();
  });

  it('shows enrolled status and Continue Learning for enrolled learners', () => {
    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={true} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('You are enrolled in this course')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue learning/i })).toBeInTheDocument();
  });

  it('calls enrollInCourse mutation on Enroll Now click', () => {
    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={false} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByRole('button', { name: /enroll now/i }));

    expect(mockEnrollMutate).toHaveBeenCalledWith(
      { learnerId: 'learner-1', courseId: 'course-1' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it('shows success toast on successful enrollment', async () => {
    mockEnrollMutate.mockImplementation((_payload: any, options: any) => {
      options.onSuccess();
    });

    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={false} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByRole('button', { name: /enroll now/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Enrolled successfully',
          description: 'You have been enrolled in React Testing.',
        })
      );
    });
  });

  it('shows error toast on failed enrollment', async () => {
    mockEnrollMutate.mockImplementation((_payload: any, options: any) => {
      options.onError();
    });

    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={false} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByRole('button', { name: /enroll now/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Enrollment failed',
          variant: 'destructive',
        })
      );
    });
  });

  it('navigates to course player on Continue Learning click', () => {
    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={true} />,
      { wrapper: createWrapper() }
    );

    fireEvent.click(screen.getByRole('button', { name: /continue learning/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/learner/courses/course-1/player');
  });

  it('shows Enrolling... text while mutation is pending', () => {
    vi.mocked(useEnrollInCourse).mockReturnValue({
      mutate: mockEnrollMutate,
      isPending: true,
    } as any);

    render(
      <EnrollmentSection course={mockPublishedCourse} isEnrolled={false} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByRole('button', { name: /enrolling/i })).toBeDisabled();
  });
});
