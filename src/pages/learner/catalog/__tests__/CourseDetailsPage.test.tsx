/**
 * Tests for CourseDetailsPage
 * TDD: Write tests first
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CourseDetailsPage } from '../CourseDetailsPage';

// Mock hooks
vi.mock('@/entities/course', () => ({
  useCourse: vi.fn(),
}));

vi.mock('@/entities/course-module', () => ({
  useCourseModules: vi.fn(),
}));

vi.mock('@/entities/enrollment', () => ({
  useEnrollmentStatus: vi.fn(),
  useEnrollInCourse: vi.fn(),
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
      <BrowserRouter>
        <Routes>
          <Route path="/learner/catalog/:courseId" element={children} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CourseDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      useCourse.mockReturnValue({ data: null, isLoading: true, error: null });
      useCourseModules.mockReturnValue({ data: null, isLoading: true, error: null });
      useEnrollmentStatus.mockReturnValue({ data: null, isLoading: true, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Course Display', () => {
    it('should render course title and code', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Introduction to React',
        code: 'CS101',
        description: 'Learn React basics',
        status: 'published',
        duration: 40,
        credits: 3,
        department: { id: 'dept-1', name: 'Computer Science' },
        settings: { passingScore: 70 },
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText('CS101')).toBeInTheDocument();
    });

    it('should display course description', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        description: 'This is a detailed course description',
        status: 'published',
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('This is a detailed course description')).toBeInTheDocument();
    });

    it('should display course metadata', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        description: 'Test',
        status: 'published',
        duration: 40,
        credits: 3,
        department: { id: 'dept-1', name: 'Computer Science' },
        settings: { passingScore: 70 },
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/40 hours/i)).toBeInTheDocument();
      expect(screen.getByText(/3 credits/i)).toBeInTheDocument();
      expect(screen.getByText(/70%/i)).toBeInTheDocument();
    });
  });

  describe('Module List', () => {
    it('should display course modules', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        status: 'published',
      };

      const mockSegments = {
        segments: [
          { id: '1', title: 'Module 1', type: 'custom', order: 1, isPublished: true },
          { id: '2', title: 'Module 2', type: 'custom', order: 2, isPublished: true },
        ],
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: mockSegments, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Module 1')).toBeInTheDocument();
      expect(screen.getByText('Module 2')).toBeInTheDocument();
    });
  });

  describe('Enrollment Section', () => {
    it('should show enroll button when not enrolled', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        status: 'published',
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /enroll/i })).toBeInTheDocument();
    });

    it('should show continue learning button when enrolled', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        status: 'published',
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: true }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /continue learning/i })).toBeInTheDocument();
    });

    it('should not show enroll button for unpublished courses', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        status: 'draft',
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/not available/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /enroll/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when course fetch fails', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      useCourse.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Course not found'),
      });
      useCourseModules.mockReturnValue({ data: null, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: null, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/error loading course/i)).toBeInTheDocument();
    });
  });

  describe('Back Navigation', () => {
    it('should have back to catalog button', () => {
      const { useCourse } = require('@/entities/course');
      const { useCourseModules } = require('@/entities/course-module');
      const { useEnrollmentStatus } = require('@/entities/enrollment');

      const mockCourse = {
        id: '1',
        title: 'Test Course',
        code: 'TEST',
        status: 'published',
      };

      useCourse.mockReturnValue({ data: mockCourse, isLoading: false, error: null });
      useCourseModules.mockReturnValue({ data: { segments: [] }, isLoading: false, error: null });
      useEnrollmentStatus.mockReturnValue({ data: { enrolled: false }, isLoading: false, error: null });

      window.history.pushState({}, '', '/learner/catalog/course-1');
      render(<CourseDetailsPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('link', { name: /back to catalog/i })).toBeInTheDocument();
    });
  });
});
