/**
 * ProgramDetailPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
      level: {
        id: 'level-1',
        name: 'Level 1',
        levelNumber: 1,
      },
      status: 'completed',
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
      level: {
        id: 'level-1',
        name: 'Level 1',
        levelNumber: 1,
      },
      status: 'in-progress',
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
      level: {
        id: 'level-2',
        name: 'Level 2',
        levelNumber: 2,
      },
      status: 'available',
      prerequisites: ['course-2'],
    },
    {
      id: 'course-4',
      title: 'Advanced Backend Development',
      code: 'CS301',
      description: 'Master backend architecture and APIs',
      level: {
        id: 'level-3',
        name: 'Level 3',
        levelNumber: 3,
      },
      status: 'locked',
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

describe('ProgramDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set initial URL
    window.history.pushState({}, '', '/learner/programs/prog-1');
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
      expect(screen.getByText('Continue to JavaScript Essentials')).toBeInTheDocument();
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
        ...mockProgramDetail.enrollment,
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
});
