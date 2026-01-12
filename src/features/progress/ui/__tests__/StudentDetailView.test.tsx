/**
 * Tests for StudentDetailView Component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentDetailView } from '../StudentDetailView';
import type { LearnerProgress } from '@/entities/progress/model/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const mockStudentData: LearnerProgress = {
  learnerId: '1',
  learnerName: 'John Doe',
  learnerEmail: 'john@example.com',
  summary: {
    programsEnrolled: 2,
    programsCompleted: 1,
    coursesEnrolled: 5,
    coursesCompleted: 2,
    classesEnrolled: 3,
    totalCreditsEarned: 30,
    totalTimeSpent: 75600, // 21 hours in seconds
    averageScore: 85,
    currentStreak: 5,
    longestStreak: 10,
    lastActivityAt: '2024-01-08T10:30:00Z',
    joinedAt: '2023-09-01T00:00:00Z',
  },
  programProgress: [
    {
      programId: 'p1',
      programName: 'Computer Science',
      programCode: 'CS101',
      status: 'in_progress',
      completionPercent: 60,
      creditsEarned: 20,
      creditsRequired: 40,
      enrolledAt: '2023-09-01T00:00:00Z',
      completedAt: null,
      lastAccessedAt: '2024-01-08T10:30:00Z',
    },
  ],
  courseProgress: [
    {
      courseId: 'c1',
      courseTitle: 'Introduction to React',
      courseCode: 'REACT101',
      programId: 'p1',
      programName: 'Computer Science',
      status: 'completed',
      completionPercent: 100,
      score: 92,
      creditsEarned: 3,
      enrolledAt: '2023-09-01T00:00:00Z',
      completedAt: '2023-12-15T00:00:00Z',
      lastAccessedAt: '2023-12-15T00:00:00Z',
    },
    {
      courseId: 'c2',
      courseTitle: 'Advanced TypeScript',
      courseCode: 'TS201',
      programId: 'p1',
      programName: 'Computer Science',
      status: 'in_progress',
      completionPercent: 45,
      score: 78,
      creditsEarned: 0,
      enrolledAt: '2023-12-16T00:00:00Z',
      completedAt: null,
      lastAccessedAt: '2024-01-08T10:30:00Z',
    },
  ],
  recentActivity: [
    {
      timestamp: '2024-01-08T10:30:00Z',
      activityType: 'module_completed',
      resourceId: 'm1',
      resourceType: 'module',
      resourceTitle: 'TypeScript Generics',
      details: 'Completed module with 85% score',
    },
  ],
  achievements: [
    {
      id: 'a1',
      type: 'course_completion',
      title: 'React Master',
      description: 'Completed Introduction to React course',
      earnedAt: '2023-12-15T00:00:00Z',
      badge: null,
    },
  ],
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('StudentDetailView', () => {
  describe('Rendering', () => {
    it('should render student basic information', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should display loading state', () => {
      render(<StudentDetailView studentId="1" data={undefined} isLoading={true} />, { wrapper });

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should display error state when no data', () => {
      render(<StudentDetailView studentId="1" data={undefined} isLoading={false} />, { wrapper });

      expect(screen.getByText(/no data/i)).toBeInTheDocument();
    });
  });

  describe('Summary Statistics', () => {
    it('should display course completion statistics', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText(/2.*\/.*5.*courses/i)).toBeInTheDocument();
    });

    it('should display average score', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText(/average score/i)).toBeInTheDocument();
    });

    it('should display total time spent', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      // 75600 seconds = 21 hours
      expect(screen.getByText(/21.*hours/i)).toBeInTheDocument();
    });

    it('should display credits earned', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText(/credits earned/i)).toBeInTheDocument();
    });
  });

  describe('Course Progress List', () => {
    it('should display all enrolled courses', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText('Advanced TypeScript')).toBeInTheDocument();
    });

    it('should show course progress percentages', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should indicate completed courses', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      const completedBadge = screen.getByText(/completed/i);
      expect(completedBadge).toBeInTheDocument();
    });

    it('should display course scores', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('92')).toBeInTheDocument(); // Score for React course
      expect(screen.getByText('78')).toBeInTheDocument(); // Score for TypeScript course
    });
  });

  describe('Recent Activity', () => {
    it('should display recent activity timeline', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
      expect(screen.getByText('TypeScript Generics')).toBeInTheDocument();
    });

    it('should show activity details', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText(/completed module with 85% score/i)).toBeInTheDocument();
    });
  });

  describe('Achievements', () => {
    it('should display earned achievements', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText('React Master')).toBeInTheDocument();
      expect(screen.getByText(/completed introduction to react course/i)).toBeInTheDocument();
    });

    it('should show achievements section', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByText(/achievements/i)).toBeInTheDocument();
    });
  });

  describe('At-Risk Detection', () => {
    it('should show at-risk indicator when conditions are met', () => {
      const atRiskData: LearnerProgress = {
        ...mockStudentData,
        summary: {
          ...mockStudentData.summary,
          averageScore: 55, // Below 60%
          lastActivityAt: '2023-12-20T00:00:00Z', // More than 7 days ago
        },
      };

      render(<StudentDetailView studentId="1" data={atRiskData} isLoading={false} />, { wrapper });

      expect(screen.getByText(/at risk/i)).toBeInTheDocument();
    });

    it('should not show at-risk indicator when student is on track', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      const atRiskBadge = screen.queryByText(/at risk/i);
      expect(atRiskBadge).not.toBeInTheDocument();
    });
  });

  describe('Tabs Navigation', () => {
    it('should display tab navigation for different sections', () => {
      render(<StudentDetailView studentId="1" data={mockStudentData} isLoading={false} />, {
        wrapper,
      });

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /courses/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
    });
  });
});
