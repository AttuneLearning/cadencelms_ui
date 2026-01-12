/**
 * Tests for PerformanceMetrics Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceMetrics } from '../PerformanceMetrics';

// Mock the hooks
vi.mock('@/entities/exam-attempt/hooks', () => ({
  useExamAttempts: vi.fn(),
}));

import { useExamAttempts } from '@/entities/exam-attempt/hooks';

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

describe('PerformanceMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useExamAttempts).mockReturnValue({
      data: {
        attempts: [
          { id: '1', score: 85, status: 'graded', examId: 'exam1', exam: { title: 'React Quiz', courseId: 'course1' } },
          { id: '2', score: 92, status: 'graded', examId: 'exam1', exam: { title: 'React Quiz', courseId: 'course1' } },
          { id: '3', score: 55, status: 'graded', examId: 'exam2', exam: { title: 'TS Quiz', courseId: 'course2' } },
          { id: '4', score: 78, status: 'graded', examId: 'exam2', exam: { title: 'TS Quiz', courseId: 'course2' } },
          { id: '5', score: 45, status: 'graded', examId: 'exam2', exam: { title: 'TS Quiz', courseId: 'course2' } },
        ],
        total: 5,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render component title', () => {
    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useExamAttempts).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading metrics data...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    vi.mocked(useExamAttempts).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as any);

    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Error loading metrics data')).toBeInTheDocument();
  });

  it('should render performance metrics', async () => {
    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check that metrics are displayed
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      expect(screen.getByText(/Average scores, pass rates, and distribution/i)).toBeInTheDocument();
    });
  });

  it('should display pass rates', async () => {
    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check that pass rate label exists
      expect(screen.getAllByText(/pass rate/i).length).toBeGreaterThan(0);
    });
  });

  it('should handle empty data', () => {
    vi.mocked(useExamAttempts).mockReturnValue({
      data: {
        attempts: [],
        total: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should display score distribution', async () => {
    render(<PerformanceMetrics filters={{}} />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Score Distribution')).toBeInTheDocument();
    });
  });
});
