/**
 * CoursePlayerPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoursePlayerPage } from '../CoursePlayerPage';

// Mock all entity and feature hooks
vi.mock('@/entities/course', () => ({
  useCourse: vi.fn(),
}));

vi.mock('@/entities/enrollment', () => ({
  useEnrollmentStatus: vi.fn(),
}));

vi.mock('@/entities/course-module', () => ({
  useCourseModules: vi.fn(),
}));

vi.mock('@/entities/progress', () => ({
  useCourseProgress: vi.fn(),
}));

vi.mock('@/entities/content-attempt', () => ({
  useStartContentAttempt: vi.fn(),
  useContentAttempt: vi.fn(),
}));

vi.mock('@/features/player/ui', () => ({
  ScormPlayer: () => <div data-testid="scorm-player">Scorm Player</div>,
  VideoPlayer: () => <div data-testid="video-player">Video Player</div>,
  AudioPlayer: () => <div data-testid="audio-player">Audio Player</div>,
  DocumentViewer: () => <div data-testid="document-viewer">Document Viewer</div>,
  AssignmentPlayer: () => <div data-testid="assignment-player">Assignment Player</div>,
  PlayerSidebar: ({ courseTitle }: { courseTitle: string }) => (
    <div data-testid="player-sidebar">{courseTitle}</div>
  ),
  PlayerControls: () => <div data-testid="player-controls">Controls</div>,
}));

vi.mock('@/features/player/ui/CourseCompletionScreen', () => ({
  CourseCompletionScreen: () => <div data-testid="completion-screen">Course Complete!</div>,
}));

import { useCourse } from '@/entities/course';
import { useEnrollmentStatus } from '@/entities/enrollment';
import { useCourseModules } from '@/entities/course-module';
import { useCourseProgress } from '@/entities/progress';
import { useStartContentAttempt, useContentAttempt } from '@/entities/content-attempt';

const createWrapper = (initialEntry: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/learner/courses/:courseId/player" element={children} />
          <Route path="/learner/courses/:courseId/player/:contentId" element={children} />
          <Route path="/learner/courses/:courseId/player/:moduleId/:lessonId" element={children} />
          <Route path="/learner/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('CoursePlayerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useCourse as any).mockReturnValue({ data: { settings: { certificateEnabled: false } } });
    (useCourseProgress as any).mockReturnValue({ data: null });
    (useStartContentAttempt as any).mockReturnValue({ mutate: vi.fn() });
    (useContentAttempt as any).mockReturnValue({ data: null });
  });

  it('renders loading state when enrollment is loading', () => {
    (useEnrollmentStatus as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    (useCourseModules as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    // Should show loading spinner (Loader2 from lucide)
    expect(screen.queryByText('Not Enrolled')).not.toBeInTheDocument();
    expect(screen.queryByText('Course')).not.toBeInTheDocument();
  });

  it('renders not-enrolled state when no enrollment found', () => {
    (useEnrollmentStatus as any).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    (useCourseModules as any).mockReturnValue({
      data: { modules: [], courseTitle: 'Test Course' },
      isLoading: false,
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    expect(screen.getByText('Not Enrolled')).toBeInTheDocument();
    expect(screen.getByText('You are not enrolled in this course')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
  });

  it('renders course player with sidebar and controls when enrolled', () => {
    (useEnrollmentStatus as any).mockReturnValue({
      data: { id: 'enr1' },
      isLoading: false,
    });
    (useCourseModules as any).mockReturnValue({
      data: {
        courseTitle: 'My Test Course',
        modules: [
          {
            id: 'm1',
            title: 'Module 1',
            type: 'video',
            contentId: 'content1',
            lessons: [],
          },
        ],
      },
      isLoading: false,
    });
    (useCourseProgress as any).mockReturnValue({
      data: {
        moduleProgress: [],
        overallProgress: { completionPercent: 0 },
      },
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    // Course title appears in both header and sidebar
    const courseTitle = screen.getAllByText('My Test Course');
    expect(courseTitle.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('player-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('player-controls')).toBeInTheDocument();
  });

  it('shows loading content message when no attempt yet', () => {
    (useEnrollmentStatus as any).mockReturnValue({
      data: { id: 'enr1' },
      isLoading: false,
    });
    (useCourseModules as any).mockReturnValue({
      data: {
        courseTitle: 'My Course',
        modules: [
          {
            id: 'm1',
            title: 'Module 1',
            type: 'video',
            contentId: 'c1',
            lessons: [],
          },
        ],
      },
      isLoading: false,
    });
    (useCourseProgress as any).mockReturnValue({
      data: { moduleProgress: [], overallProgress: { completionPercent: 0 } },
    });
    (useContentAttempt as any).mockReturnValue({ data: null });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    expect(screen.getByText('Loading content...')).toBeInTheDocument();
  });

  it('renders exit button', () => {
    (useEnrollmentStatus as any).mockReturnValue({
      data: { id: 'enr1' },
      isLoading: false,
    });
    (useCourseModules as any).mockReturnValue({
      data: {
        courseTitle: 'My Course',
        modules: [],
      },
      isLoading: false,
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    // The X close button should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders modules with multi-lesson support', () => {
    (useEnrollmentStatus as any).mockReturnValue({
      data: { id: 'enr1' },
      isLoading: false,
    });
    (useCourseModules as any).mockReturnValue({
      data: {
        courseTitle: 'Multi-Lesson Course',
        modules: [
          {
            id: 'm1',
            title: 'Module 1',
            type: 'video',
            lessons: [
              { id: 'l1', title: 'Lesson 1', type: 'video', contentId: 'c1' },
              { id: 'l2', title: 'Lesson 2', type: 'document', contentId: 'c2' },
            ],
          },
          {
            id: 'm2',
            title: 'Module 2',
            type: 'scorm',
            lessons: [
              { id: 'l3', title: 'Lesson 3', type: 'scorm', contentId: 'c3' },
            ],
          },
        ],
      },
      isLoading: false,
    });
    (useCourseProgress as any).mockReturnValue({
      data: {
        moduleProgress: [],
        overallProgress: { completionPercent: 0 },
      },
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    // Course title appears in both header and sidebar
    const courseTitle = screen.getAllByText('Multi-Lesson Course');
    expect(courseTitle.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('player-sidebar')).toBeInTheDocument();
  });
});
