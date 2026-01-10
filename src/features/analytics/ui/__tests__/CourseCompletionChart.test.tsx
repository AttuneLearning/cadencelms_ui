/**
 * Tests for CourseCompletionChart Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseCompletionChart } from '../CourseCompletionChart';

// Mock the hooks
vi.mock('@/entities/enrollment/hooks', () => ({
  useEnrollments: vi.fn(),
}));

vi.mock('@/entities/progress/hooks', () => ({
  useProgressSummary: vi.fn(),
}));

import { useEnrollments } from '@/entities/enrollment/hooks';
import { useProgressSummary } from '@/entities/progress/hooks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CourseCompletionChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useEnrollments).mockReturnValue({
      data: {
        enrollments: [
          { id: '1', courseId: 'course1', course: { id: 'course1', title: 'React Basics' }, status: 'completed', progress: 100 },
          { id: '2', courseId: 'course1', course: { id: 'course1', title: 'React Basics' }, status: 'active', progress: 75 },
          { id: '3', courseId: 'course2', course: { id: 'course2', title: 'TypeScript' }, status: 'completed', progress: 100 },
          { id: '4', courseId: 'course2', course: { id: 'course2', title: 'TypeScript' }, status: 'active', progress: 50 },
        ],
        total: 4,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useProgressSummary).mockReturnValue({
      data: {
        courses: [
          { courseId: 'course1', courseName: 'React Basics', averageProgress: 87.5 },
          { courseId: 'course2', courseName: 'TypeScript', averageProgress: 75 },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render chart title', () => {
    render(<CourseCompletionChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Course Completion Rates')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useEnrollments).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<CourseCompletionChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    vi.mocked(useEnrollments).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as any);

    render(<CourseCompletionChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Error loading chart data')).toBeInTheDocument();
  });

  it('should render chart with data', async () => {
    render(<CourseCompletionChart filters={{}} />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check that the chart description is present
      expect(screen.getByText('Percentage of students who completed each course')).toBeInTheDocument();
    });
  });

  it('should handle empty data', () => {
    vi.mocked(useEnrollments).mockReturnValue({
      data: {
        enrollments: [],
        total: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<CourseCompletionChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should apply filters correctly', () => {
    const filters = { courseId: 'course1' };
    render(<CourseCompletionChart filters={filters} />, { wrapper: createWrapper() });

    // Should only show filtered course
    expect(useEnrollments).toHaveBeenCalledWith(expect.objectContaining({ course: 'course1' }));
  });
});
