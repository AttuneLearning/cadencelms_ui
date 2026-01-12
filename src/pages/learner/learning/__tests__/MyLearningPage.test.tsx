/**
 * Tests for MyLearningPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MyLearningPage } from '../MyLearningPage';

// Mock hooks - export the mock functions so they can be configured in tests
const mockUseMyEnrollments = vi.fn();
const mockUseLearnerActivity = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/entities/enrollment', () => ({
  useMyEnrollments: (params: any) => mockUseMyEnrollments(params),
}));

vi.mock('@/entities/learning-event', () => ({
  useLearnerActivity: (learnerId: any, filters: any) => mockUseLearnerActivity(learnerId, filters),
}));

vi.mock('@/features/auth', () => ({
  useAuth: () => mockUseAuth(),
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
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MyLearningPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default auth mock
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
      isAuthenticated: true,
    });
  });

  describe('Rendering - Basic Structure', () => {
    it('should render page title', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/My Learning/i)).toBeInTheDocument();
    });

    it('should render quick stats section', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: {
          enrollments: [
            {
              id: '1',
              type: 'course',
              target: { id: 'c1', name: 'Test Course', code: 'TEST' },
              status: 'active',
              progress: { percentage: 50, completedItems: 5, totalItems: 10 },
            },
          ],
          pagination: { page: 1, total: 1 }
        },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: {
          events: [],
          summary: {
            totalStudyTime: 7200,
            contentCompleted: 5,
          },
          pagination: { page: 1, total: 0 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Quick Stats/i)).toBeInTheDocument();
    });

    it('should render active learning section', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Active Learning/i)).toBeInTheDocument();
    });

    it('should render recent activity section', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      const headings = screen.getAllByText(/Recent Activity/i);
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Loading State', () => {
    it('should show loading skeleton when enrollments are loading', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });

    it('should show loading skeleton when activities are loading', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('activity-loading')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when enrollment fetch fails', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch enrollments'),
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading learning data/i)).toBeInTheDocument();
    });

    it('should display error message when activity fetch fails', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Failed to fetch activities'),
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading recent activity/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no enrollments', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No Active Courses/i)).toBeInTheDocument();
    });

    it('should show link to catalog in empty state', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      const catalogLink = screen.getByRole('link', { name: /Browse Catalog/i });
      expect(catalogLink).toHaveAttribute('href', '/learner/catalog');
    });

    it('should show empty activity message when no recent activity', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/No recent activity/i)).toBeInTheDocument();
    });
  });

  describe('Quick Stats Cards', () => {
    it('should display courses in progress count', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: {
          enrollments: [
            {
              id: '1',
              type: 'course',
              target: { id: 'c1', name: 'Course 1', code: 'C1' },
              status: 'active',
              progress: { percentage: 50, completedItems: 5, totalItems: 10 },
            },
            {
              id: '2',
              type: 'course',
              target: { id: 'c2', name: 'Course 2', code: 'C2' },
              status: 'active',
              progress: { percentage: 75, completedItems: 7, totalItems: 10 },
            },
            {
              id: '3',
              type: 'course',
              target: { id: 'c3', name: 'Course 3', code: 'C3' },
              status: 'completed',
              progress: { percentage: 100, completedItems: 10, totalItems: 10 },
            },
          ],
          pagination: { page: 1, total: 3 }
        },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('stat-courses-in-progress')).toHaveTextContent('2');
    });

    it('should display lessons completed this week', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      const now = new Date();

      mockUseLearnerActivity.mockReturnValue({
        data: {
          events: [
            {
              id: '1',
              type: 'content_completed',
              timestamp: now.toISOString(),
            },
            {
              id: '2',
              type: 'content_completed',
              timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              type: 'content_completed',
              timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ],
          summary: {},
          pagination: { page: 1, total: 3 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('stat-lessons-this-week')).toHaveTextContent('2');
    });

    it('should display total time spent learning', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: {
          events: [],
          summary: {
            totalStudyTime: 7200, // 2 hours in seconds
          },
          pagination: { page: 1, total: 0 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('stat-total-time')).toHaveTextContent('2h');
    });

    it('should display current streak', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      const now = new Date();
      mockUseLearnerActivity.mockReturnValue({
        data: {
          events: [
            { id: '1', type: 'content_completed', timestamp: now.toISOString() },
            {
              id: '2',
              type: 'content_completed',
              timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: '3',
              type: 'content_completed',
              timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
            },
          ],
          summary: {},
          pagination: { page: 1, total: 3 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('stat-current-streak')).toHaveTextContent('3');
    });
  });

  describe('Active Learning Section', () => {
    it('should display in-progress courses', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: {
          enrollments: [
            {
              id: '1',
              type: 'course',
              target: { id: 'c1', name: 'React Fundamentals', code: 'CS101' },
              status: 'active',
              progress: {
                percentage: 60,
                completedItems: 6,
                totalItems: 10,
                lastActivityAt: new Date().toISOString(),
              },
            },
            {
              id: '2',
              type: 'course',
              target: { id: 'c2', name: 'TypeScript Advanced', code: 'CS201' },
              status: 'active',
              progress: {
                percentage: 30,
                completedItems: 3,
                totalItems: 10,
                lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              },
            },
          ],
          pagination: { page: 1, total: 2 }
        },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText('React Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('TypeScript Advanced')).toBeInTheDocument();
    });

    it('should display continue button for each active course', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: {
          enrollments: [
            {
              id: '1',
              type: 'course',
              target: { id: 'c1', name: 'Test Course', code: 'TEST' },
              status: 'active',
              progress: {
                percentage: 50,
                completedItems: 5,
                totalItems: 10,
                lastActivityAt: new Date().toISOString(),
              },
            },
          ],
          pagination: { page: 1, total: 1 }
        },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      const continueButton = screen.getByRole('link', { name: /Continue/i });
      expect(continueButton).toBeInTheDocument();
      expect(continueButton).toHaveAttribute('href', '/learner/courses/c1/player');
    });

    it('should display progress percentage for each course', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: {
          enrollments: [
            {
              id: '1',
              type: 'course',
              target: { id: 'c1', name: 'Test Course', code: 'TEST' },
              status: 'active',
              progress: {
                percentage: 65,
                completedItems: 13,
                totalItems: 20,
                lastActivityAt: new Date().toISOString(),
              },
            },
          ],
          pagination: { page: 1, total: 1 }
        },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/65%/i)).toBeInTheDocument();
    });

    it('should only show active courses, not completed', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: {
          enrollments: [
            {
              id: '1',
              type: 'course',
              target: { id: 'c1', name: 'Active Course', code: 'CS101' },
              status: 'active',
              progress: { percentage: 50, completedItems: 5, totalItems: 10 },
            },
            {
              id: '2',
              type: 'course',
              target: { id: 'c2', name: 'Completed Course', code: 'CS102' },
              status: 'completed',
              progress: { percentage: 100, completedItems: 10, totalItems: 10 },
            },
          ],
          pagination: { page: 1, total: 2 }
        },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Active Course')).toBeInTheDocument();
      expect(screen.queryByText('Completed Course')).not.toBeInTheDocument();
    });
  });

  describe('Recent Activity Timeline', () => {
    it('should display recent learning events', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: {
          events: [
            {
              id: '1',
              type: 'content_completed',
              timestamp: new Date().toISOString(),
              course: { id: 'c1', title: 'React Basics', code: 'CS101' },
              content: { id: 'cnt1', title: 'Introduction to Hooks' },
            },
            {
              id: '2',
              type: 'assessment_completed',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              course: { id: 'c1', title: 'React Basics', code: 'CS101' },
              score: 85,
            },
          ],
          summary: {},
          pagination: { page: 1, total: 2 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Introduction to Hooks/i)).toBeInTheDocument();
      const reactBasicsElements = screen.getAllByText(/React Basics/i);
      expect(reactBasicsElements.length).toBeGreaterThan(0);
    });

    it('should limit activity timeline to 10 items', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      const events = Array.from({ length: 15 }, (_, i) => ({
        id: `event-${i}`,
        type: 'content_completed',
        timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
        course: { id: 'c1', title: 'Course', code: 'CS101' },
        content: { id: `cnt${i}`, title: `Content ${i}` },
      }));

      mockUseLearnerActivity.mockReturnValue({
        data: {
          events,
          summary: {},
          pagination: { page: 1, total: 15 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      const activityItems = screen.getAllByTestId(/activity-item/);
      expect(activityItems).toHaveLength(10);
    });

    it('should display timestamps for each activity', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      const now = new Date();
      mockUseLearnerActivity.mockReturnValue({
        data: {
          events: [
            {
              id: '1',
              type: 'content_completed',
              timestamp: now.toISOString(),
              course: { id: 'c1', title: 'Test Course', code: 'TEST' },
              content: { id: 'cnt1', title: 'Test Content' },
            },
          ],
          summary: {},
          pagination: { page: 1, total: 1 }
        },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      // Should have some timestamp display (e.g., "Just now" or relative time)
      expect(screen.getByTestId('activity-item-1')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render stats in grid layout', () => {
      mockUseMyEnrollments.mockReturnValue({
        data: { enrollments: [], pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      mockUseLearnerActivity.mockReturnValue({
        data: { events: [], summary: {}, pagination: { page: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      render(<MyLearningPage />, { wrapper: createWrapper() });

      const statsGrid = screen.getByTestId('stats-grid');
      expect(statsGrid).toBeInTheDocument();
      expect(statsGrid).toHaveClass('grid');
    });
  });
});
