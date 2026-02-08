/**
 * MyProgramsPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyProgramsPage } from '../MyProgramsPage';
import * as programHooks from '@/entities/program';
import type { MyProgramsResponse } from '@/entities/program/api/learnerProgramApi';

// Mock the program hooks
vi.mock('@/entities/program', async () => {
  const actual = await vi.importActual('@/entities/program');
  return {
    ...actual,
    useMyPrograms: vi.fn(),
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

const mockProgramsResponse: MyProgramsResponse = {
  programs: [
    {
      id: 'prog-1',
      name: 'Full Stack Development',
      code: 'FSD-2024',
      description: 'Comprehensive full stack development program',
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
      coursesCompleted: 3,
      coursesTotal: 8,
      certificate: {
        enabled: true,
        title: 'Full Stack Development Certificate',
      },
    },
    {
      id: 'prog-2',
      name: 'Data Science Fundamentals',
      code: 'DSF-2024',
      description: 'Introduction to data science and analytics',
      credential: 'diploma',
      duration: 12,
      durationUnit: 'months',
      department: {
        id: 'dept-2',
        name: 'Data Science',
      },
      enrollment: {
        id: 'enr-2',
        status: 'completed',
        enrolledAt: '2023-06-01T00:00:00Z',
        completedAt: '2024-06-01T00:00:00Z',
        progress: 100,
      },
      coursesCompleted: 10,
      coursesTotal: 10,
    },
  ],
  pagination: {
    page: 1,
    limit: 12,
    total: 2,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
};

describe('MyProgramsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders programs when data is loaded', async () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: mockProgramsResponse,
      isLoading: false,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Full Stack Development')).toBeInTheDocument();
      expect(screen.getByText('Data Science Fundamentals')).toBeInTheDocument();
    });

    expect(screen.getByText('Computer Science')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
  });

  it('displays correct progress for active program', async () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: mockProgramsResponse,
      isLoading: false,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument();
      expect(screen.getByText('3 / 8')).toBeInTheDocument();
    });
  });

  it('displays completed badge and progress for completed program', async () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: mockProgramsResponse,
      isLoading: false,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('displays certificate availability message', async () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: mockProgramsResponse,
      isLoading: false,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Certificate available upon completion')).toBeInTheDocument();
    });
  });

  it('renders empty state when no programs are enrolled', async () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: {
        programs: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      },
      isLoading: false,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText("You haven't enrolled in any programs yet")).toBeInTheDocument();
      expect(screen.getByText('Browse Catalog')).toBeInTheDocument();
    });
  });

  it('renders error state on API failure', async () => {
    const error = new Error('Failed to load programs');
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Error loading programs')).toBeInTheDocument();
      expect(screen.getByText('Failed to load programs')).toBeInTheDocument();
    });
  });

  it('renders credential badges correctly', async () => {
    vi.mocked(programHooks.useMyPrograms).mockReturnValue({
      data: mockProgramsResponse,
      isLoading: false,
      error: null,
    } as any);

    render(<MyProgramsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Certificate')).toBeInTheDocument();
      expect(screen.getByText('Diploma')).toBeInTheDocument();
    });
  });
});
