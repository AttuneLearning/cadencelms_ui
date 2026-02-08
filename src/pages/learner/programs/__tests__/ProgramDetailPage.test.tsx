/**
 * ProgramDetailPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProgramDetailPage } from '../ProgramDetailPage';
import * as programHooks from '@/entities/program';
import type { LearnerProgramDetail } from '@/entities/program/api/learnerProgramApi';

// Mock the program hooks
vi.mock('@/entities/program', async () => {
  const actual = await vi.importActual('@/entities/program');
  return {
    ...actual,
    useProgramForLearner: vi.fn(),
    useEnrollProgram: vi.fn(),
  };
});

// Mock useToast
const mockToast = vi.fn();
vi.mock('@/shared/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
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
      <BrowserRouter>
        <Routes>
          <Route path="/learner/programs/:programId" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockProgramDetail: LearnerProgramDetail = {
  id: 'prog-1',
  name: 'Full Stack Development',
  code: 'FSD-2024',
  description: 'Comprehensive full stack development program covering frontend and backend technologies',
  credential: 'certificate',
  duration: 6,
  durationUnit: 'months',
  department: {
    id: 'dept-1',
    name: 'Computer Science',
  },
  enrollment: {
    id: 'enr-1',
    status: 'active',
    enrolledAt: '2024-01-15T00:00:00Z',
    completedAt: null,
    progress: 45,
  },
  courses: [
    {
      id: 'course-1',
      title: 'HTML & CSS Fundamentals',
      code: 'CS101',
      description: 'Learn the basics of web development',
      order: 1,
      level: {
        id: 'level-1',
        name: 'Level 1',
        levelNumber: 1,
      },
      status: 'completed',
      prerequisiteMet: true,
      enrollment: {
        id: 'ce-1',
        progress: 100,
        enrolledAt: '2024-01-15T00:00:00Z',
        completedAt: '2024-02-01T00:00:00Z',
      },
      prerequisites: [],
    },
    {
      id: 'course-2',
      title: 'JavaScript Essentials',
      code: 'CS102',
      description: 'Master JavaScript programming',
      order: 2,
      level: {
        id: 'level-1',
        name: 'Level 1',
        levelNumber: 1,
      },
      status: 'in-progress',
      prerequisiteMet: true,
      enrollment: {
        id: 'ce-2',
        progress: 60,
        enrolledAt: '2024-02-02T00:00:00Z',
        completedAt: null,
      },
      prerequisites: ['course-1'],
    },
    {
      id: 'course-3',
      title: 'React Framework',
      code: 'CS201',
      description: 'Build modern web applications with React',
      order: 3,
      level: {
        id: 'level-2',
        name: 'Level 2',
        levelNumber: 2,
      },
      status: 'available',
      prerequisiteMet: true,
      prerequisites: ['course-2'],
    },
    {
      id: 'course-4',
      title: 'Advanced Backend Development',
      code: 'CS301',
      description: 'Master backend architecture and APIs',
      order: 4,
      level: {
        id: 'level-3',
        name: 'Level 3',
        levelNumber: 3,
      },
      status: 'locked',
      prerequisiteMet: false,
      prerequisites: ['course-3'],
    },
  ],
  certificate: {
    enabled: true,
    title: 'Full Stack Development Certificate',
    issued: false,
  },
  statistics: {
    totalCourses: 4,
    completedCourses: 1,
    inProgressCourses: 1,
    overallProgress: 45,
  },
};

const mockUnenrolledProgram: LearnerProgramDetail = {
  ...mockProgramDetail,
  enrollment: undefined,
  courses: mockProgramDetail.courses.map((c) => ({
    ...c,
    status: 'locked' as const,
    prerequisiteMet: false,
    enrollment: undefined,
  })),
  statistics: {
    totalCourses: 4,
    completedCourses: 0,
    inProgressCourses: 0,
    overallProgress: 0,
  },
};

// Default enroll mutation mock
const mockMutateAsync = vi.fn();
const defaultEnrollMock = {
  mutateAsync: mockMutateAsync,
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  reset: vi.fn(),
};

describe('ProgramDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.pushState({}, '', '/learner/programs/prog-1');
    vi.mocked(programHooks.useEnrollProgram).mockReturnValue(defaultEnrollMock as any);
  });

  it('renders loading state initially', () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    expect(screen.getAllByRole('generic').some(el => el.className.includes('h-10'))).toBe(true);
  });

  it('renders program details when data is loaded', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Full Stack Development')).toBeInTheDocument();
      expect(screen.getByText(/Comprehensive full stack development program/)).toBeInTheDocument();
    });
  });

  it('displays program info cards correctly', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('Computer Science')).toBeInTheDocument();
      expect(screen.getByText('Credential')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('6 months')).toBeInTheDocument();
    });

    // Check there's at least one "Certificate" text (credential label)
    expect(screen.getAllByText('Certificate').length).toBeGreaterThan(0);
  });

  it('displays overall progress correctly', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('1 of 4 courses completed')).toBeInTheDocument();
    });
  });

  it('displays all course statuses correctly', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('HTML & CSS Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('JavaScript Essentials')).toBeInTheDocument();
      expect(screen.getByText('React Framework')).toBeInTheDocument();
      expect(screen.getByText('Advanced Backend Development')).toBeInTheDocument();
    });

    // Check for at least one occurrence of each status badge (case-insensitive match)
    expect(screen.getAllByText(/^completed$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^in progress$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^available$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^locked$/i).length).toBeGreaterThan(0);
  });

  it('displays continue button for next incomplete course', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/Continue to JavaScript Essentials/)).toBeInTheDocument();
    });
  });

  it('displays certificate information for uncompleted program', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText(/will be issued upon successful completion/)).toBeInTheDocument();
      expect(screen.getByText('1/4 courses')).toBeInTheDocument();
    });
  });

  it('displays issued certificate message when program is completed', async () => {
    const completedProgram: LearnerProgramDetail = {
      ...mockProgramDetail,
      enrollment: {
        ...mockProgramDetail.enrollment!,
        status: 'completed',
        progress: 100,
        completedAt: '2024-06-01T00:00:00Z',
      },
      certificate: {
        enabled: true,
        title: 'Full Stack Development Certificate',
        issued: true,
        issuedAt: '2024-06-01T00:00:00Z',
      },
      statistics: {
        totalCourses: 4,
        completedCourses: 4,
        inProgressCourses: 0,
        overallProgress: 100,
      },
    };

    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: completedProgram,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Congratulations! Your certificate has been issued.')).toBeInTheDocument();
      expect(screen.getByText('View Certificate')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const error = new Error('Failed to load program');
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Error loading program')).toBeInTheDocument();
      expect(screen.getByText('Failed to load program')).toBeInTheDocument();
    });
  });

  it('displays locked course message for prerequisites', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Complete prerequisites to unlock this course')).toBeInTheDocument();
    });
  });

  // =====================
  // Enrollment Flow Tests
  // =====================

  it('renders enrollment button for unenrolled user', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockUnenrolledProgram,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Enroll in This Program')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Enroll in Program' })).toBeInTheDocument();
    });

    // Should NOT show overall progress for unenrolled users
    expect(screen.queryByText('Overall Progress')).not.toBeInTheDocument();
  });

  it('calls enrollment mutation on enroll button click', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValue({ enrollmentId: 'new-enr-1' });

    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockUnenrolledProgram,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    const enrollButton = await screen.findByRole('button', { name: 'Enroll in Program' });
    await user.click(enrollButton);

    expect(mockMutateAsync).toHaveBeenCalledWith('prog-1');
    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Enrolled successfully',
      })
    );
  });

  it('shows loading state during enrollment', async () => {
    vi.mocked(programHooks.useEnrollProgram).mockReturnValue({
      ...defaultEnrollMock,
      isPending: true,
    } as any);

    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockUnenrolledProgram,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Enrolling...')).toBeInTheDocument();
    });

    // Button should be disabled during enrollment
    const enrollButton = screen.getByRole('button', { name: /Enrolling/ });
    expect(enrollButton).toBeDisabled();
  });

  it('shows error toast on enrollment failure', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockRejectedValue(new Error('Enrollment failed'));

    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockUnenrolledProgram,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    const enrollButton = await screen.findByRole('button', { name: 'Enroll in Program' });
    await user.click(enrollButton);

    expect(mockToast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Enrollment failed',
        variant: 'destructive',
      })
    );
  });

  it('shows progress section for enrolled users, not enrollment button', async () => {
    vi.mocked(programHooks.useProgramForLearner).mockReturnValue({
      data: mockProgramDetail,
      isLoading: false,
      error: null,
    } as any);

    render(<ProgramDetailPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    });

    // Should NOT show enrollment button for enrolled users
    expect(screen.queryByText('Enroll in This Program')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Enroll in Program' })).not.toBeInTheDocument();
  });
});
