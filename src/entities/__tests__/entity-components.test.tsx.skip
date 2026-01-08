/**
 * Entity Components Tests
 * Basic rendering tests for all entity UI components
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import components
import { CourseCard, CourseList } from '../course';
import { LessonCard, LessonList } from '../lesson';
import { EnrollmentCard, EnrollmentList } from '../enrollment';
import { ProgressCard, ProgressStatsComponent, DetailedProgressStats } from '../progress';

// Import types
import type { CourseListItem } from '../course/model/types';
import type { LessonListItem } from '../lesson/model/types';
import type { EnrollmentWithCourse } from '../enrollment/model/types';
import type { LessonProgress, ProgressStats } from '../progress/model/types';

// Test wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

// Mock data
const mockCourse: CourseListItem = {
  _id: 'course-1',
  title: 'Test Course',
  shortDescription: 'A test course description',
  thumbnail: 'https://example.com/image.jpg',
  duration: 120,
  level: 'beginner',
  lessonCount: 10,
  enrollmentCount: 50,
  isEnrolled: true,
  progress: 45,
};

const mockLesson: LessonListItem = {
  _id: 'lesson-1',
  title: 'Test Lesson',
  type: 'video',
  order: 1,
  duration: 30,
  isRequired: true,
  isCompleted: false,
  isLocked: false,
  progress: 25,
};

const mockEnrollment: EnrollmentWithCourse = {
  _id: 'enrollment-1',
  userId: 'user-1',
  courseId: 'course-1',
  status: 'active',
  enrolledAt: new Date().toISOString(),
  progress: 60,
  isCertificateIssued: false,
  course: {
    _id: 'course-1',
    title: 'Test Course',
    shortDescription: 'A test course description',
    thumbnail: 'https://example.com/image.jpg',
    duration: 120,
    level: 'beginner',
    lessonCount: 10,
  },
};

const mockLessonProgress: LessonProgress = {
  lessonId: 'lesson-1',
  lessonTitle: 'Test Lesson',
  status: 'in-progress',
  progress: 50,
  score: 85,
  attempts: 2,
  timeSpent: 1800,
  lastAccessedAt: new Date().toISOString(),
};

const mockProgressStats: ProgressStats = {
  totalLessonsCompleted: 25,
  totalTimeSpent: 36000,
  averageScore: 88.5,
  coursesInProgress: 3,
  coursesCompleted: 5,
  currentStreak: 7,
  longestStreak: 15,
};

describe('Entity Components', () => {
  describe('Course Components', () => {
    it('should render CourseCard', () => {
      render(
        <TestWrapper>
          <CourseCard course={mockCourse} />
        </TestWrapper>
      );
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should render CourseList with courses', () => {
      render(
        <TestWrapper>
          <CourseList courses={[mockCourse]} />
        </TestWrapper>
      );
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should render CourseList empty state', () => {
      render(
        <TestWrapper>
          <CourseList courses={[]} />
        </TestWrapper>
      );
      expect(screen.getByText('No courses found')).toBeInTheDocument();
    });
  });

  describe('Lesson Components', () => {
    it('should render LessonCard', () => {
      render(
        <TestWrapper>
          <LessonCard lesson={mockLesson} courseId="course-1" />
        </TestWrapper>
      );
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });

    it('should render LessonList with lessons', () => {
      render(
        <TestWrapper>
          <LessonList lessons={[mockLesson]} courseId="course-1" />
        </TestWrapper>
      );
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });

    it('should render LessonList empty state', () => {
      render(
        <TestWrapper>
          <LessonList lessons={[]} courseId="course-1" />
        </TestWrapper>
      );
      expect(screen.getByText('No lessons available')).toBeInTheDocument();
    });
  });

  describe('Enrollment Components', () => {
    it('should render EnrollmentCard', () => {
      render(
        <TestWrapper>
          <EnrollmentCard enrollment={mockEnrollment} />
        </TestWrapper>
      );
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should render EnrollmentList with enrollments', () => {
      render(
        <TestWrapper>
          <EnrollmentList enrollments={[mockEnrollment]} />
        </TestWrapper>
      );
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    it('should render EnrollmentList empty state', () => {
      render(
        <TestWrapper>
          <EnrollmentList enrollments={[]} />
        </TestWrapper>
      );
      expect(screen.getByText('No enrollments found')).toBeInTheDocument();
    });
  });

  describe('Progress Components', () => {
    it('should render ProgressCard', () => {
      render(
        <TestWrapper>
          <ProgressCard progress={mockLessonProgress} />
        </TestWrapper>
      );
      expect(screen.getByText('Test Lesson')).toBeInTheDocument();
    });

    it('should render ProgressStatsComponent', () => {
      render(
        <TestWrapper>
          <ProgressStatsComponent stats={mockProgressStats} />
        </TestWrapper>
      );
      expect(screen.getByText('Lessons Completed')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('should render DetailedProgressStats', () => {
      render(
        <TestWrapper>
          <DetailedProgressStats stats={mockProgressStats} />
        </TestWrapper>
      );
      expect(screen.getByText('Learning Statistics')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });
});
