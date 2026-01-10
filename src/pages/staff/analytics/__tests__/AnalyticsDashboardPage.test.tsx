/**
 * Tests for Analytics Dashboard Page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AnalyticsDashboardPage } from '../AnalyticsDashboardPage';

// Mock the hooks
vi.mock('@/entities/progress/hooks', () => ({
  useProgressSummary: vi.fn(),
}));

vi.mock('@/entities/learning-event/hooks', () => ({
  useActivityStats: vi.fn(),
  useLearningEvents: vi.fn(),
}));

vi.mock('@/entities/exam-attempt/hooks', () => ({
  useExamAttempts: vi.fn(),
}));

vi.mock('@/entities/enrollment/hooks', () => ({
  useEnrollments: vi.fn(),
}));

// Mock the child components
vi.mock('@/features/analytics/ui', () => ({
  CourseCompletionChart: () => <div data-testid="course-completion-chart">CourseCompletionChart</div>,
  EngagementChart: () => <div data-testid="engagement-chart">EngagementChart</div>,
  PerformanceMetrics: () => <div data-testid="performance-metrics">PerformanceMetrics</div>,
  ContentEffectiveness: () => <div data-testid="content-effectiveness">ContentEffectiveness</div>,
  AnalyticsFilters: () => (
    <div data-testid="analytics-filters">
      <span>Filters</span>
    </div>
  ),
  ExportDialog: ({ open }: any) => open ? <div data-testid="export-dialog">ExportDialog</div> : null,
}));

import { useProgressSummary } from '@/entities/progress/hooks';
import { useActivityStats } from '@/entities/learning-event/hooks';
import { useExamAttempts } from '@/entities/exam-attempt/hooks';
import { useEnrollments } from '@/entities/enrollment/hooks';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AnalyticsDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock returns
    vi.mocked(useProgressSummary).mockReturnValue({
      data: {
        summary: {
          totalLearners: 150,
          averageProgress: 68.5,
          averageScore: 82.3,
          completedCount: 85,
          inProgressCount: 50,
          notStartedCount: 15,
          totalTimeSpent: 5000,
        },
        learners: [],
        pagination: { page: 1, limit: 20, total: 150, totalPages: 8 },
        filters: { programId: null, courseId: null, classId: null, departmentId: null, status: null, dateRange: { start: null, end: null } },
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useActivityStats).mockReturnValue({
      data: {
        totalEvents: 5420,
        activeUsers: 120,
        avgSessionDuration: 35,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useExamAttempts).mockReturnValue({
      data: {
        attempts: [
          { id: '1', score: 85, status: 'graded', examId: 'exam1' },
          { id: '2', score: 92, status: 'graded', examId: 'exam1' },
        ],
        total: 2,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useEnrollments).mockReturnValue({
      data: {
        enrollments: [
          { id: '1', status: 'active', progress: 75 },
          { id: '2', status: 'completed', progress: 100 },
        ],
        total: 2,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render page title', () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error state', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch data'),
    } as any);

    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('should display metric cards with real data', async () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Total Students')).toBeInTheDocument();
      // The number is rendered based on enrollments data length which is 2
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should render charts section', async () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('course-completion-chart')).toBeInTheDocument();
      expect(screen.getByTestId('engagement-chart')).toBeInTheDocument();
    });
  });

  it('should render filters section', () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId('analytics-filters')).toBeInTheDocument();
  });

  it('should render export button', () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText(/export/i)).toBeInTheDocument();
  });

  it('should calculate average completion rate correctly', async () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('68.5%')).toBeInTheDocument();
    });
  });

  it('should calculate average quiz score correctly', async () => {
    render(<AnalyticsDashboardPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Average of 85 and 92 is 88.5
      expect(screen.getByText('88.5')).toBeInTheDocument();
    });
  });
});
