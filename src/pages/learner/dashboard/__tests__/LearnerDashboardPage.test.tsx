/**
 * LearnerDashboardPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LearnerDashboardPage } from '../LearnerDashboardPage';

// Mock hooks
vi.mock('@/features/auth/model/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/entities/enrollment/hooks/useEnrollments', () => ({
  useMyEnrollments: vi.fn(),
}));

vi.mock('@/entities/certificate/hooks/useCertificates', () => ({
  useCertificates: vi.fn(),
}));

vi.mock('@/entities/progress', () => ({
  useLearnerProgress: vi.fn(),
}));

vi.mock('@/features/quick-actions', () => ({
  QuickActionsCard: () => <div data-testid="quick-actions">Quick Actions</div>,
}));

vi.mock('@/entities/enrollment/ui/ExpiryBadge', () => ({
  ExpiryBadge: () => <span data-testid="expiry-badge">Expiry</span>,
}));

import { useAuth } from '@/features/auth/model/useAuth';
import { useMyEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import { useCertificates } from '@/entities/certificate/hooks/useCertificates';
import { useLearnerProgress } from '@/entities/progress';

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

const mockEnrollments = {
  enrollments: [
    {
      id: 'e1',
      target: { id: 'c1', name: 'React Basics' },
      progress: { percentage: 50, lastActivityAt: new Date().toISOString() },
      expiresAt: null,
      enrolledAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'e2',
      target: { id: 'c2', name: 'TypeScript Advanced' },
      progress: { percentage: 100, lastActivityAt: '2024-02-01T00:00:00Z' },
      expiresAt: null,
      enrolledAt: '2024-01-15T00:00:00Z',
    },
    {
      id: 'e3',
      target: { id: 'c3', name: 'Node.js Fundamentals' },
      progress: { percentage: 0, lastActivityAt: null },
      expiresAt: null,
      enrolledAt: '2024-02-01T00:00:00Z',
    },
  ],
};

describe('LearnerDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useAuth as any).mockReturnValue({
      user: { _id: 'u1', firstName: 'Alice', email: 'alice@test.com' },
    });

    (useLearnerProgress as any).mockReturnValue({
      data: { summary: { totalTimeSpent: 7200 } },
    });
  });

  it('renders welcome message with user name', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: mockEnrollments,
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: { pagination: { total: 3 } },
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Welcome back, Alice!')).toBeInTheDocument();
    expect(screen.getByText("Here's your learning overview")).toBeInTheDocument();
  });

  it('renders loading state with skeletons', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    // When loading, stat cards show skeletons; "Active Courses" title still renders
    expect(screen.getByText('Active Courses')).toBeInTheDocument();
    expect(screen.getByText('Continue Learning')).toBeInTheDocument();
  });

  it('renders stat cards with correct values', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: mockEnrollments,
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: { pagination: { total: 5 } },
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    // Active courses = 1 (50% progress, between 0 and 100)
    expect(screen.getByText('Active Courses')).toBeInTheDocument();
    // Completed courses = 1 (100%)
    expect(screen.getByText('Completed Courses')).toBeInTheDocument();
    // Certificates
    expect(screen.getByText('Certificates')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    // Hours Studied: 7200 seconds = 2 hours
    expect(screen.getByText('Hours Studied')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders error state when enrollments fail to load', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    });
    (useCertificates as any).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load dashboard data. Please refresh the page.')).toBeInTheDocument();
  });

  it('renders continue learning section with in-progress courses', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: mockEnrollments,
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: { pagination: { total: 0 } },
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    // React Basics appears in both Continue Learning and Recent Activity
    const reactBasicsElements = screen.getAllByText('React Basics');
    expect(reactBasicsElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('shows empty continue learning message when no in-progress courses', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: {
        enrollments: [
          {
            id: 'e1',
            target: { id: 'c1', name: 'Done Course' },
            progress: { percentage: 100, lastActivityAt: null },
            expiresAt: null,
            enrolledAt: '2024-01-01T00:00:00Z',
          },
        ],
      },
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: { pagination: { total: 0 } },
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText("You don't have any courses in progress.")).toBeInTheDocument();
    expect(screen.getByText('Browse Course Catalog')).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: mockEnrollments,
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: { pagination: { total: 0 } },
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Your latest learning activities')).toBeInTheDocument();
  });

  it('renders quick actions card', () => {
    (useMyEnrollments as any).mockReturnValue({
      data: mockEnrollments,
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: { pagination: { total: 0 } },
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  it('defaults to "Learner" when user has no firstName', () => {
    (useAuth as any).mockReturnValue({
      user: { _id: 'u1', email: 'test@test.com' },
    });
    (useMyEnrollments as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    (useCertificates as any).mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    render(<LearnerDashboardPage />, { wrapper: createWrapper() });

    expect(screen.getByText('Welcome back, Learner!')).toBeInTheDocument();
  });
});
