/**
 * Tests for ContentEffectiveness Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContentEffectiveness } from '../ContentEffectiveness';

// Mock the hooks
vi.mock('@/entities/progress/hooks', () => ({
  useProgressSummary: vi.fn(),
}));

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

describe('ContentEffectiveness', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useProgressSummary).mockReturnValue({
      data: {
        contentMetrics: [
          { contentType: 'video', completionRate: 85, avgTimeSpent: 45 },
          { contentType: 'quiz', completionRate: 92, avgTimeSpent: 20 },
          { contentType: 'reading', completionRate: 78, avgTimeSpent: 30 },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);
  });

  it('should render component title', () => {
    render(<ContentEffectiveness filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Content Effectiveness')).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as any);

    render(<ContentEffectiveness filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('Loading content metrics...')).toBeInTheDocument();
  });

  it('should display content types', () => {
    render(<ContentEffectiveness filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getAllByText(/video/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/quiz/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/reading/i).length).toBeGreaterThan(0);
  });

  it('should show completion rates', () => {
    render(<ContentEffectiveness filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
  });

  it('should handle empty data', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      data: {
        contentMetrics: [],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    render(<ContentEffectiveness filters={{}} />, { wrapper: createWrapper() });

    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });
});
