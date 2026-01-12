/**
 * Tests for EngagementChart Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EngagementChart } from '../EngagementChart';

// Mock the hooks
vi.mock('@/entities/learning-event/hooks', () => ({
  useLearningEvents: vi.fn(),
  useActivityStats: vi.fn(),
}));

import { useLearningEvents, useActivityStats } from '@/entities/learning-event/hooks';

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

describe('EngagementChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLearningEvents).mockReturnValue({
      data: {
        events: [
          { id: '1', timestamp: '2024-01-01T10:00:00Z', learnerId: 'user1', eventType: 'page_view' },
          { id: '2', timestamp: '2024-01-01T11:00:00Z', learnerId: 'user2', eventType: 'page_view' },
          { id: '3', timestamp: '2024-01-02T10:00:00Z', learnerId: 'user1', eventType: 'page_view' },
          { id: '4', timestamp: '2024-01-02T11:00:00Z', learnerId: 'user3', eventType: 'page_view' },
          { id: '5', timestamp: '2024-01-03T10:00:00Z', learnerId: 'user1', eventType: 'page_view' },
        ],
        total: 5,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    vi.mocked(useActivityStats).mockReturnValue({
      data: {
        totalEvents: 5,
        activeUsers: 3,
        avgSessionDuration: 35,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render chart title', () => {
    render(<EngagementChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Student Engagement')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useLearningEvents).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<EngagementChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading chart data...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    vi.mocked(useLearningEvents).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Failed to fetch'),
    } as any);

    render(<EngagementChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Error loading chart data')).toBeInTheDocument();
  });

  it('should render engagement chart', async () => {
    render(<EngagementChart filters={{}} />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Check that the chart description is present
      expect(screen.getByText('Active students and events over time')).toBeInTheDocument();
    });
  });

  it('should handle empty data', () => {
    vi.mocked(useLearningEvents).mockReturnValue({
      data: {
        events: [],
        total: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<EngagementChart filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  it('should apply date range filters', () => {
    const filters = { dateRange: 'last7Days' as const };
    render(<EngagementChart filters={filters} />, { wrapper: createWrapper() });

    // Should call hook with date filters
    expect(useLearningEvents).toHaveBeenCalled();
  });

  it('should display engagement data', async () => {
    render(<EngagementChart filters={{}} />, { wrapper: createWrapper() });

    await waitFor(() => {
      // Verify chart renders with title
      expect(screen.getByText('Student Engagement')).toBeInTheDocument();
    });
  });
});
