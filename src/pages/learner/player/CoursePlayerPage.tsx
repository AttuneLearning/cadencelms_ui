/**
 * CoursePlayerPage
 * Main learning interface for consuming course content.
 * Fetches modules + learning units per module to build navigation.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueries } from '@tanstack/react-query';
import { X, Menu, Loader2, AlertCircle, BookOpen, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  ScormPlayer,
  VideoPlayer,
  AudioPlayer,
  DocumentViewer,
  AssignmentPlayer,
  HtmlContentViewer,
  PlayerSidebar,
  PlayerControls,
  type CourseModule as SidebarModule,
  type Lesson,
} from '@/features/player/ui';
import { CourseCompletionScreen } from '@/features/player/ui/CourseCompletionScreen';
import {
  useStartContentAttempt,
  useContentAttempt,
} from '@/entities/content-attempt';
import { useCourse } from '@/entities/course';
import { useClass } from '@/entities/class';
import { useCourseModules } from '@/entities/course-module';
import { listEnrollments } from '@/entities/enrollment';
import { useCourseProgress } from '@/entities/progress';
import { listLearningUnits, learningUnitKeys } from '@/entities/learning-unit';
import type { LearningUnitListItem } from '@/entities/learning-unit';
import { usePlaylistEngine, useAdaptiveConfig, mapToStaticLearningUnits } from '@/features/playlist-engine';

/** Flattened lesson reference for sequential navigation */
interface FlatLesson {
  moduleId: string;
  lessonId: string;
  contentId: string | null;
  contentType: string;
  category: string | null;
}

export function CoursePlayerPage() {
  const { courseId, contentId, moduleId: urlModuleId, lessonId: urlLessonId } = useParams<{
    courseId: string;
    contentId?: string;
    moduleId?: string;
    lessonId?: string;
  }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentContentId, setCurrentContentId] = useState<string | null>(null);
  const [currentModuleId, setCurrentModuleId] = useState<string | null>(urlModuleId || null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(urlLessonId || null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  // Track what type of content is currently selected
  const [currentLessonMeta, setCurrentLessonMeta] = useState<{
    contentType: string;
    category: string | null;
  } | null>(null);

  // The URL param might be a course ID or a class ID (class enrollments link with class IDs).
  // Probe both in parallel with retry:false for fast resolution.
  const { data: directCourse, isLoading: courseProbeLoading } = useCourse(courseId || '', { retry: false });
  const { data: classData, isLoading: classProbeLoading } = useClass(courseId || '', { retry: false });

  // Resolve the actual course ID for course-level API calls
  const idProbeSettled = !courseProbeLoading && !classProbeLoading;
  const resolvedCourseId = directCourse ? (courseId || '') : (classData?.course?.id || '');

  // Fetch course data using the resolved ID (for settings, adaptive config)
  const { data: course } = useCourse(resolvedCourseId);

  // Fetch enrollment — tries course filter, falls back to class filter
  const { data: enrollment, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollment-for-player', courseId, resolvedCourseId],
    queryFn: async () => {
      // Try course filter first (works for direct course enrollments)
      if (resolvedCourseId) {
        const byCourse = await listEnrollments({ course: resolvedCourseId, limit: 1 });
        if (byCourse.enrollments.length > 0) return byCourse.enrollments[0];
      }
      // Try class filter (works for class enrollments where URL param is class ID)
      if (courseId && courseId !== resolvedCourseId) {
        const byClass = await listEnrollments({ class: courseId, limit: 1 });
        if (byClass.enrollments.length > 0) return byClass.enrollments[0];
      }
      return null;
    },
    enabled: !!resolvedCourseId,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch course structure
  const { data: segmentsData, isLoading: segmentsLoading } = useCourseModules(
    resolvedCourseId,
    {},
    { enabled: !!resolvedCourseId }
  );

  // Fetch course progress for completion/lock status
  const { data: courseProgress } = useCourseProgress(resolvedCourseId);

  // Build progress lookup: moduleId → ModuleProgress
  const progressMap = useMemo(
    () => new Map(courseProgress?.moduleProgress?.map((mp) => [mp.moduleId, mp]) || []),
    [courseProgress]
  );

  // Fetch learning units for each module
  const moduleIds = useMemo(
    () => segmentsData?.modules?.map((m) => m.id) || [],
    [segmentsData]
  );

  const learningUnitQueries = useQueries({
    queries: moduleIds.map((moduleId) => ({
      queryKey: learningUnitKeys.list(moduleId),
      queryFn: () => listLearningUnits(moduleId),
      enabled: moduleIds.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const allLUsLoaded = moduleIds.length === 0 || learningUnitQueries.every((q) => !q.isLoading);

  // Build map: moduleId → LearningUnit[]
  const learningUnitsMap = useMemo(() => {
    const map = new Map<string, LearningUnitListItem[]>();
    moduleIds.forEach((moduleId, index) => {
      const query = learningUnitQueries[index];
      if (query.data?.learningUnits) {
        map.set(moduleId, query.data.learningUnits);
      }
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIds.join(','), allLUsLoaded]);

  // Build static LU list for playlist engine (flattened across all modules)
  const staticLearningUnits = useMemo(() => {
    const allLUs: LearningUnitListItem[] = [];
    moduleIds.forEach((modId) => {
      const lus = learningUnitsMap.get(modId);
      if (lus) allLUs.push(...lus);
    });
    return mapToStaticLearningUnits(allLUs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleIds.join(','), learningUnitsMap]);

  // Adaptive configuration (currently 'off' mode)
  const { config: adaptiveConfig } = useAdaptiveConfig(course?.adaptiveSettings);

  // Playlist engine — in off mode, produces identical sequential navigation to flatLessons
  const playlistEngine = usePlaylistEngine({
    config: adaptiveConfig,
    learningUnits: staticLearningUnits,
    enrollmentId: enrollment?.id || '',
    moduleId: moduleIds[0] || '',
  });

  // Map learning unit contentType to Lesson type
  const mapContentType = (lu: LearningUnitListItem): Lesson['type'] => {
    // API returns contentType field (not in TS interface), fall back to type
    const ct = (lu as unknown as Record<string, unknown>).contentType as string || lu.type;
    switch (ct) {
      case 'document': return 'document';
      case 'video': return 'video';
      case 'media': return 'media';
      case 'scorm': return 'scorm';
      case 'audio': return 'audio';
      case 'exercise': return 'exercise';
      case 'assessment': return 'assessment';
      case 'assignment': return 'assignment';
      default: return 'document';
    }
  };

  // Start content attempt
  const { mutate: startAttempt } = useStartContentAttempt();

  // Get current attempt
  const { data: currentAttempt } = useContentAttempt(
    currentAttemptId || '',
    currentAttemptId ? true : false
  );

  // Transform API modules + learning units into sidebar format
  const modules: SidebarModule[] = useMemo(() => {
    if (!segmentsData?.modules) return [];

    return segmentsData.modules.map((module, index) => {
      const progress = progressMap.get(module.id);
      const isModuleCompleted = progress?.status === 'completed';

      // Module is locked if any prior required module is not completed
      const isModuleLocked =
        index > 0 &&
        segmentsData.modules.slice(0, index).some((prev) => {
          const prevProgress = progressMap.get(prev.id);
          if (!prevProgress) return true;
          if (!prevProgress.isRequired) return false;
          return prevProgress.status !== 'completed';
        });

      // Get learning units for this module
      const lus = learningUnitsMap.get(module.id);

      // Build lessons from learning units (preferred) or fall back to module as single lesson
      const lessons: Lesson[] =
        lus && lus.length > 0
          ? lus
              .sort((a, b) => a.sequence - b.sequence)
              .map((lu) => ({
                id: lu.id,
                title: lu.title,
                type: mapContentType(lu),
                contentId: lu.contentId || undefined,
                category: lu.category || undefined,
                isCompleted: isModuleCompleted, // TODO: per-LU progress
                isLocked: isModuleLocked,
                isCurrent: lu.id === currentLessonId,
              }))
          : module.lessons && module.lessons.length > 0
            ? module.lessons.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type as Lesson['type'],
                contentId: lesson.contentId || lesson.id,
                isCompleted: isModuleCompleted,
                isLocked: isModuleLocked,
                isCurrent: lesson.id === currentLessonId,
              }))
            : [
                {
                  id: module.id,
                  title: module.title,
                  type: module.type as Lesson['type'],
                  contentId: module.contentId || module.id,
                  isCompleted: isModuleCompleted,
                  isLocked: isModuleLocked,
                  isCurrent:
                    module.id === currentLessonId || module.id === currentContentId,
                },
              ];

      return {
        id: module.id,
        title: module.title,
        lessons,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentsData, progressMap, currentLessonId, currentContentId, learningUnitsMap]);

  // Flatten all lessons for sequential navigation
  const flatLessons: FlatLesson[] = useMemo(
    () =>
      modules.flatMap((m) =>
        m.lessons.map((l) => ({
          moduleId: m.id,
          lessonId: l.id,
          contentId: l.contentId || null,
          contentType: l.type,
          category: l.category || null,
        }))
      ),
    [modules]
  );

  // Find current position in flat lesson list
  const currentIndex = useMemo(() => {
    if (currentLessonId) {
      return flatLessons.findIndex((fl) => fl.lessonId === currentLessonId);
    }
    if (currentContentId) {
      return flatLessons.findIndex(
        (fl) => fl.contentId === currentContentId || fl.lessonId === currentContentId
      );
    }
    return -1;
  }, [flatLessons, currentLessonId, currentContentId]);

  // Initialize from URL params on mount
  useEffect(() => {
    if (urlModuleId && urlLessonId) {
      const flat = flatLessons.find(
        (fl) => fl.moduleId === urlModuleId && fl.lessonId === urlLessonId
      );
      if (flat) {
        setCurrentModuleId(urlModuleId);
        setCurrentLessonId(urlLessonId);
        setCurrentContentId(flat.contentId);
        setCurrentLessonMeta({ contentType: flat.contentType, category: flat.category });
      }
    } else if (contentId) {
      // Legacy single-content route
      setCurrentContentId(contentId);
      const flat = flatLessons.find(
        (fl) => fl.contentId === contentId || fl.lessonId === contentId
      );
      if (flat) {
        setCurrentModuleId(flat.moduleId);
        setCurrentLessonId(flat.lessonId);
        setCurrentLessonMeta({ contentType: flat.contentType, category: flat.category });
      }
    } else if (flatLessons.length > 0 && !currentContentId && allLUsLoaded) {
      // No content specified — start with first unlocked lesson
      // Guard with allLUsLoaded to prevent premature selection from module-level
      // fallback lessons before real LU data is available
      const firstUnlocked = modules.flatMap((m) => m.lessons).find((l) => !l.isLocked);
      if (firstUnlocked) {
        const flat = flatLessons.find((fl) => fl.lessonId === firstUnlocked.id);
        if (flat) {
          setCurrentModuleId(flat.moduleId);
          setCurrentLessonId(flat.lessonId);
          setCurrentContentId(flat.contentId);
          setCurrentLessonMeta({ contentType: flat.contentType, category: flat.category });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatLessons.length, urlModuleId, urlLessonId, contentId, allLUsLoaded]);

  const isAssessmentUnit =
    currentLessonMeta?.category === 'graded' || currentLessonMeta?.contentType === 'assessment';
  const isPracticeExerciseUnit =
    currentLessonMeta?.category === 'practice' || currentLessonMeta?.contentType === 'exercise';

  // Start content attempt when currentContentId changes (non-assessment content only)
  useEffect(() => {
    if (
      currentContentId &&
      enrollment &&
      !currentAttemptId &&
      !isAssessmentUnit &&
      !isPracticeExerciseUnit
    ) {
      startAttempt(
        {
          contentId: currentContentId,
          enrollmentId: enrollment.id,
        },
        {
          onSuccess: (data) => {
            setCurrentAttemptId(data.id);
          },
          onError: () => {
            // Content attempt failed — still allow direct content viewing
            setCurrentAttemptId(null);
          },
        }
      );
    }
  }, [
    currentContentId,
    enrollment,
    currentAttemptId,
    startAttempt,
    isAssessmentUnit,
    isPracticeExerciseUnit,
  ]);

  // Handle exit
  const handleExit = () => {
    navigate('/learner/dashboard');
  };

  // Handle lesson navigation
  const handleLessonClick = (moduleId: string, lessonId: string) => {
    const flat = flatLessons.find(
      (fl) => fl.moduleId === moduleId && fl.lessonId === lessonId
    );
    if (!flat) return;

    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
    setCurrentContentId(flat.contentId);
    setCurrentAttemptId(null);
    setShowCompletion(false);
    setCurrentLessonMeta({ contentType: flat.contentType, category: flat.category });

    // Use multi-lesson URL
    navigate(`/learner/courses/${courseId}/player/${moduleId}/${lessonId}`);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prev = flatLessons[currentIndex - 1];
      handleLessonClick(prev.moduleId, prev.lessonId);
    }
  };

  const handleNext = () => {
    if (currentIndex < flatLessons.length - 1) {
      const next = flatLessons[currentIndex + 1];
      handleLessonClick(next.moduleId, next.lessonId);
    }
  };

  // Check if this is the final lesson
  const isOnFinalLesson = currentIndex === flatLessons.length - 1 && flatLessons.length > 0;

  // Handle course completion
  const handleCompleteCourse = () => {
    setShowCompletion(true);
  };

  // Handle content completion callback (auto-advance or show completion)
  // Uses the playlist engine for decision-making (off mode = identical to index nav)
  const handleContentComplete = () => {
    if (isOnFinalLesson) {
      const allCompleted = modules
        .flatMap((m) => m.lessons)
        .every((l) => l.isCompleted || l.isCurrent);
      if (allCompleted) {
        setShowCompletion(true);
        return;
      }
    }

    // Ask the playlist engine what to do next
    const decision = playlistEngine.resolveAndApplyNext();

    if (decision.action === 'complete') {
      setShowCompletion(true);
      return;
    }

    if (decision.action === 'advance' || decision.action === 'skip') {
      // Navigate to the next lesson in flatLessons
      if (currentIndex < flatLessons.length - 1) {
        handleNext();
      }
      return;
    }

    // hold, retry, inject — future phases will handle these
    // For now in off mode, these won't occur
  };

  // Get breadcrumb info
  const currentModuleTitle = modules.find((m) => m.id === currentModuleId)?.title;
  const currentLessonTitle = modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === currentLessonId)?.title;

  // All lessons for PlayerControls
  const allLessons = modules.flatMap((m) => m.lessons);

  // Render player based on content type
  const renderPlayer = () => {
    if (showCompletion) {
      return (
        <CourseCompletionScreen
          courseTitle={segmentsData?.courseTitle || 'Course'}
          courseProgress={courseProgress}
          enrollment={enrollment}
          onBackToDashboard={() => navigate('/learner/dashboard')}
          onReviewCourse={() => {
            setShowCompletion(false);
            if (flatLessons.length > 0) {
              handleLessonClick(flatLessons[0].moduleId, flatLessons[0].lessonId);
            }
          }}
          onViewCertificate={
            course?.settings?.certificateEnabled
              ? () => navigate('/learner/certificates')
              : undefined
          }
        />
      );
    }

    if (currentLessonMeta && (currentLessonMeta.category === 'graded' || currentLessonMeta.contentType === 'assessment')) {
      const canLaunchAssessment = !!currentContentId && !!enrollment && !!currentLessonId;
      return (
        <div className="flex h-full items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <FileText className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Assessment</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentLessonTitle || 'This assessment'} is a graded evaluation.
              </p>
              {!currentContentId && (
                <p className="text-sm text-destructive mt-2">
                  Assessment reference missing (`learningUnit.contentId`).
                </p>
              )}
            </div>
            <Button
              disabled={!canLaunchAssessment}
              onClick={() => {
                if (!currentContentId || !enrollment || !currentLessonId) return;
                const params = new URLSearchParams();
                params.set('courseId', resolvedCourseId || courseId || '');
                params.set('enrollmentId', enrollment.id);
                params.set('learningUnitId', currentLessonId);
                navigate(`/learner/exercises/${currentContentId}/take?${params.toString()}`);
              }}
            >
              Start Assessment
            </Button>
          </div>
        </div>
      );
    }

    if (currentLessonMeta && (currentLessonMeta.category === 'practice' || currentLessonMeta.contentType === 'exercise')) {
      const practiceExerciseId = currentContentId || currentLessonId;
      const canLaunchPractice = !!practiceExerciseId && !!enrollment && !!currentLessonId;

      return (
        <div className="flex h-full items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <BookOpen className="h-12 w-12 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Practice Exercise</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentLessonTitle || 'This exercise'} is an interactive practice activity.
              </p>
              {!practiceExerciseId && (
                <p className="text-sm text-destructive mt-2">
                  Exercise reference missing. Launch context could not be resolved.
                </p>
              )}
            </div>
            <Button
              disabled={!canLaunchPractice}
              onClick={() => {
                if (!practiceExerciseId || !enrollment || !currentLessonId) return;
                const params = new URLSearchParams();
                params.set('courseId', resolvedCourseId || courseId || '');
                params.set('enrollmentId', enrollment.id);
                params.set('learningUnitId', currentLessonId);
                navigate(`/learner/exercises/${practiceExerciseId}/take?${params.toString()}`);
              }}
            >
              Start Practice
            </Button>
          </div>
        </div>
      );
    }

    if (!currentContentId && currentLessonMeta) {
      const { contentType, category } = currentLessonMeta;
      if (category === 'graded' || contentType === 'assessment') return null;
    }

    // For topic content with contentId — render via HtmlContentViewer directly
    // (bypasses content attempt for HTML content since the attempt may return 'media' type)
    if (currentContentId && currentLessonMeta?.category === 'topic') {
      return (
        <HtmlContentViewer
          contentId={currentContentId}
          onViewed={handleContentComplete}
        />
      );
    }

    // Fallback: attempt-based rendering for other content types
    if (!currentAttempt || !currentContentId) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading content...</p>
          </div>
        </div>
      );
    }

    const contentType = currentAttempt.content?.type;

    if (contentType === 'scorm') {
      return (
        <ScormPlayer
          attemptId={currentAttempt.id}
          scormUrl={currentAttempt.launchUrl || ''}
          scormVersion={currentAttempt.scormVersion || '1.2'}
          savedData={(currentAttempt.cmiData as Record<string, string>) || {}}
          onComplete={handleContentComplete}
        />
      );
    }

    if (contentType === 'video') {
      return (
        <VideoPlayer
          attemptId={currentAttempt.id}
          videoUrl={(currentAttempt.content as any)?.url || ''}
          lastPosition={currentAttempt.location ? parseFloat(currentAttempt.location) : 0}
          onComplete={handleContentComplete}
        />
      );
    }

    if (contentType === 'audio') {
      return (
        <AudioPlayer
          attemptId={currentAttempt.id}
          audioUrl={(currentAttempt.content as any)?.url || ''}
          lastPosition={currentAttempt.location ? parseFloat(currentAttempt.location) : 0}
          onComplete={handleContentComplete}
        />
      );
    }

    if (contentType === 'document') {
      const url = (currentAttempt.content as any)?.url || '';
      const isPdf = url.toLowerCase().endsWith('.pdf');

      return (
        <DocumentViewer
          attemptId={currentAttempt.id}
          documentUrl={url}
          documentType={isPdf ? 'pdf' : 'image'}
          onViewed={handleContentComplete}
        />
      );
    }

    if (contentType === 'assignment') {
      const assignment = (currentAttempt.content as any)?.assignment;
      if (!assignment) {
        return (
          <div className="flex h-full items-center justify-center bg-muted/10">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="text-lg font-semibold">Assignment Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  Assignment data is missing
                </p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <AssignmentPlayer
          attemptId={currentAttempt.id}
          assignment={assignment}
          onComplete={handleContentComplete}
        />
      );
    }

    // Handle 'media' or 'html' content types — render via HtmlContentViewer
    if (contentType === 'media' || contentType === 'html') {
      return (
        <HtmlContentViewer
          contentId={currentContentId}
          onViewed={handleContentComplete}
        />
      );
    }

    return (
      <div className="flex h-full items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Unsupported Content Type</h3>
            <p className="text-sm text-muted-foreground">
              This content type ({contentType || 'unknown'}) is not yet supported
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Wait for ID probes to settle so we know if this is a course or class ID
  if (!idProbeSettled && !resolvedCourseId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Both probes settled but neither matched — invalid ID
  if (idProbeSettled && !resolvedCourseId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Course Not Found</h3>
            <p className="text-sm text-muted-foreground">
              This course could not be found
            </p>
          </div>
          <Button onClick={() => navigate('/learner/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (enrollmentsLoading || segmentsLoading || !allLUsLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Not Enrolled</h3>
            <p className="text-sm text-muted-foreground">
              You are not enrolled in this course
            </p>
          </div>
          <Button onClick={() => navigate('/learner/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <h1 className="text-lg font-semibold">{segmentsData?.courseTitle || 'Course'}</h1>
            {currentModuleTitle && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{currentModuleTitle}</span>
                {currentLessonTitle && currentLessonTitle !== currentModuleTitle && (
                  <>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-muted-foreground">{currentLessonTitle}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleExit}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 shrink-0">
            <PlayerSidebar
              courseTitle={segmentsData?.courseTitle || ''}
              modules={modules}
              overallProgress={courseProgress?.overallProgress.completionPercent ?? 0}
              onLessonClick={handleLessonClick}
            />
          </aside>
        )}

        {/* Player Area */}
        <main className="flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden">{renderPlayer()}</div>

          {/* Controls */}
          {!showCompletion && (
            <PlayerControls
              currentLessonIndex={currentIndex}
              totalLessons={allLessons.length}
              hasPrevious={currentIndex > 0}
              hasNext={currentIndex < allLessons.length - 1}
              isNextLocked={
                currentIndex < allLessons.length - 1 && allLessons[currentIndex + 1].isLocked
              }
              isOnFinalLesson={isOnFinalLesson}
              timeSpent={currentAttempt?.timeSpentSeconds || 0}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onCompleteCourse={handleCompleteCourse}
            />
          )}
        </main>
      </div>
    </div>
  );
}
