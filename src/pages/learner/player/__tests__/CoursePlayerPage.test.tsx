/**
 * CoursePlayerPage Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoursePlayerPage } from '../CoursePlayerPage';

// Mock all entity and feature hooks
vi.mock('@/entities/course', () => ({
  useCourse: vi.fn(),
}));

vi.mock('@/entities/class', () => ({
  useClass: vi.fn(),
}));

vi.mock('@/entities/enrollment', () => ({
  listEnrollments: vi.fn(),
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

vi.mock('@/entities/learning-unit', () => ({
  listLearningUnits: vi.fn().mockResolvedValue({
    learningUnits: [],
    totalCount: 0,
    categoryCounts: { topic: 0, practice: 0, assignment: 0, graded: 0 },
  }),
  learningUnitKeys: {
    all: ['learning-units'],
    lists: () => ['learning-units', 'list'],
    list: (moduleId: string, filters?: unknown) => ['learning-units', 'list', moduleId, filters],
    details: () => ['learning-units', 'detail'],
    detail: (id: string) => ['learning-units', 'detail', id],
    byModule: (moduleId: string) => ['learning-units', 'module', moduleId],
    byCategory: (moduleId: string, category: string) =>
      ['learning-units', 'list', moduleId, undefined, 'category', category],
  },
}));

vi.mock('@/entities/content', () => ({
  useContent: vi.fn().mockReturnValue({ data: null, isLoading: false, error: null }),
}));

vi.mock('@/features/player/ui', () => ({
  ScormPlayer: () => <div data-testid="scorm-player">Scorm Player</div>,
  VideoPlayer: () => <div data-testid="video-player">Video Player</div>,
  AudioPlayer: () => <div data-testid="audio-player">Audio Player</div>,
  DocumentViewer: () => <div data-testid="document-viewer">Document Viewer</div>,
  AssignmentPlayer: () => <div data-testid="assignment-player">Assignment Player</div>,
  HtmlContentViewer: ({ contentId }: { contentId: string }) => (
    <div data-testid="html-content-viewer">HTML Content: {contentId}</div>
  ),
  PlayerSidebar: ({ courseTitle }: { courseTitle: string }) => (
    <div data-testid="player-sidebar">{courseTitle}</div>
  ),
  PlayerControls: () => <div data-testid="player-controls">Controls</div>,
}));

vi.mock('@/features/player/ui/CourseCompletionScreen', () => ({
  CourseCompletionScreen: () => <div data-testid="completion-screen">Course Complete!</div>,
}));

import { useCourse } from '@/entities/course';
import { useClass } from '@/entities/class';
import { listEnrollments } from '@/entities/enrollment';
import { useCourseModules } from '@/entities/course-module';
import { useCourseProgress } from '@/entities/progress';
import { useStartContentAttempt, useContentAttempt } from '@/entities/content-attempt';
import { listLearningUnits } from '@/entities/learning-unit';

const ExerciseTakeProbe = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const location = useLocation();
  return (
    <div data-testid="exercise-take-page">
      {`exerciseId=${exerciseId};search=${location.search}`}
    </div>
  );
};

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
          <Route path="/learner/exercises/:exerciseId/take" element={<ExerciseTakeProbe />} />
          <Route path="/learner/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Helper: mock enrollment data returned by listEnrollments
const mockEnrollmentResponse = (enrollment: Record<string, unknown> | null) => ({
  enrollments: enrollment ? [enrollment] : [],
  pagination: { page: 1, limit: 1, total: enrollment ? 1 : 0, totalPages: enrollment ? 1 : 0, hasNext: false, hasPrev: false },
});

describe('CoursePlayerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: URL param is a valid course ID (course probe succeeds, class probe returns nothing)
    (useCourse as any).mockReturnValue({ data: { settings: { certificateEnabled: false } }, isLoading: false });
    (useClass as any).mockReturnValue({ data: undefined, isLoading: false });
    (useCourseProgress as any).mockReturnValue({ data: null });
    (useStartContentAttempt as any).mockReturnValue({ mutate: vi.fn() });
    (useContentAttempt as any).mockReturnValue({ data: null });
    (listLearningUnits as any).mockResolvedValue({
      learningUnits: [],
      totalCount: 0,
      categoryCounts: { topic: 0, practice: 0, assignment: 0, graded: 0 },
    });
    // Default: enrolled
    (listEnrollments as any).mockResolvedValue(mockEnrollmentResponse({ id: 'enr1' }));
  });

  it('renders loading state when ID probes are loading', () => {
    (useCourse as any).mockReturnValue({ data: undefined, isLoading: true });
    (useClass as any).mockReturnValue({ data: undefined, isLoading: true });
    (useCourseModules as any).mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    // Should show loading spinner
    expect(screen.queryByText('Not Enrolled')).not.toBeInTheDocument();
    expect(screen.queryByText('Course')).not.toBeInTheDocument();
  });

  it('renders not-enrolled state when no enrollment found', async () => {
    (listEnrollments as any).mockResolvedValue(mockEnrollmentResponse(null));
    (useCourseModules as any).mockReturnValue({
      data: { modules: [], courseTitle: 'Test Course' },
      isLoading: false,
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player'),
    });

    await waitFor(() => {
      expect(screen.getByText('Not Enrolled')).toBeInTheDocument();
    });
    expect(screen.getByText('You are not enrolled in this course')).toBeInTheDocument();
    expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
  });

  it('renders course player with sidebar and controls when enrolled', async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId('player-sidebar')).toBeInTheDocument();
    });
    const courseTitle = screen.getAllByText('My Test Course');
    expect(courseTitle.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('player-controls')).toBeInTheDocument();
  });

  it('shows loading content message when no attempt yet', async () => {
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

    await waitFor(() => {
      expect(screen.getByText('Loading content...')).toBeInTheDocument();
    });
  });

  it('renders exit button', async () => {
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

    await waitFor(() => {
      const titles = screen.getAllByText('My Course');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders modules with multi-lesson support', async () => {
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

    await waitFor(() => {
      expect(screen.getByTestId('player-sidebar')).toBeInTheDocument();
    });
    const courseTitle = screen.getAllByText('Multi-Lesson Course');
    expect(courseTitle.length).toBeGreaterThanOrEqual(1);
  });

  it('resolves class ID to course ID when URL param is a class ID', async () => {
    // Course probe fails (ID is a class, not a course)
    (useCourse as any).mockImplementation((id: string) => {
      if (id === 'class-123') return { data: undefined, isLoading: false, isError: true };
      if (id === 'real-course-id') return { data: { settings: {} }, isLoading: false };
      return { data: undefined, isLoading: false };
    });
    // Class probe succeeds
    (useClass as any).mockReturnValue({
      data: { id: 'class-123', course: { id: 'real-course-id', title: 'EMDR Intro', code: 'EMDR101' } },
      isLoading: false,
    });
    (listEnrollments as any).mockResolvedValue(mockEnrollmentResponse({ id: 'enr-class' }));
    (useCourseModules as any).mockReturnValue({
      data: { courseTitle: 'EMDR Intro', modules: [] },
      isLoading: false,
    });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/class-123/player'),
    });

    await waitFor(() => {
      const titles = screen.getAllByText('EMDR Intro');
      expect(titles.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows course not found when both probes fail', async () => {
    (useCourse as any).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    (useClass as any).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    (useCourseModules as any).mockReturnValue({ data: undefined, isLoading: false });

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/invalid-id/player'),
    });

    await waitFor(() => {
      expect(screen.getByText('Course Not Found')).toBeInTheDocument();
    });
    expect(screen.getByText('This course could not be found')).toBeInTheDocument();
  });

  it('renders practice launch and skips content-attempt auto-start for practice units', async () => {
    const startAttemptSpy = vi.fn();
    (useStartContentAttempt as any).mockReturnValue({ mutate: startAttemptSpy });
    (useCourseModules as any).mockReturnValue({
      data: {
        courseTitle: 'Practice Course',
        modules: [{ id: 'm1', title: 'Module 1', type: 'exercise', lessons: [] }],
      },
      isLoading: false,
    });
    (useCourseProgress as any).mockReturnValue({
      data: { moduleProgress: [], overallProgress: { completionPercent: 0 } },
    });
    (listLearningUnits as any).mockResolvedValue({
      learningUnits: [
        {
          id: 'lu-practice-1',
          title: 'Practice Exercise 1',
          type: 'exercise',
          contentType: 'exercise',
          category: 'practice',
          contentId: 'practice-content-1',
          sequence: 1,
        },
      ],
      totalCount: 1,
      categoryCounts: { topic: 0, practice: 1, assignment: 0, graded: 0 },
    } as any);

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player/m1/lu-practice-1'),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Practice' })).toBeInTheDocument();
    });
    expect(startAttemptSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }));
    await waitFor(() => {
      expect(screen.getByTestId('exercise-take-page')).toBeInTheDocument();
    });
    const destination = screen.getByTestId('exercise-take-page').textContent || '';
    expect(destination).toContain('exerciseId=practice-content-1');
    expect(destination).toContain('courseId=course1');
    expect(destination).toContain('enrollmentId=enr1');
    expect(destination).toContain('learningUnitId=lu-practice-1');
  });

  it('uses learningUnitId as exercise launch id when practice contentId is missing', async () => {
    (useCourseModules as any).mockReturnValue({
      data: {
        courseTitle: 'Practice Course',
        modules: [{ id: 'm1', title: 'Module 1', type: 'exercise', lessons: [] }],
      },
      isLoading: false,
    });
    (useCourseProgress as any).mockReturnValue({
      data: { moduleProgress: [], overallProgress: { completionPercent: 0 } },
    });
    (listLearningUnits as any).mockResolvedValue({
      learningUnits: [
        {
          id: 'lu-practice-no-content',
          title: 'Practice Exercise 2',
          type: 'exercise',
          contentType: 'exercise',
          category: 'practice',
          contentId: null,
          sequence: 1,
        },
      ],
      totalCount: 1,
      categoryCounts: { topic: 0, practice: 1, assignment: 0, graded: 0 },
    } as any);

    render(<CoursePlayerPage />, {
      wrapper: createWrapper('/learner/courses/course1/player/m1/lu-practice-no-content'),
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Start Practice' })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start Practice' }));

    await waitFor(() => {
      expect(screen.getByTestId('exercise-take-page')).toBeInTheDocument();
    });
    const destination = screen.getByTestId('exercise-take-page').textContent || '';
    expect(destination).toContain('exerciseId=lu-practice-no-content');
    expect(destination).toContain('learningUnitId=lu-practice-no-content');
  });
});
