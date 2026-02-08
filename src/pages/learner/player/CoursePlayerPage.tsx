/**
 * CoursePlayerPage
 * Main learning interface for consuming course content.
 * Supports multi-lesson modules: each module can contain 1+ lessons.
 */

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Menu } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  ScormPlayer,
  VideoPlayer,
  DocumentViewer,
  PlayerSidebar,
  PlayerControls,
  type CourseModule,
  type Lesson,
} from '@/features/player/ui';
import { CourseCompletionScreen } from '@/features/player/ui/CourseCompletionScreen';
import {
  useStartContentAttempt,
  useContentAttempt,
} from '@/entities/content-attempt';
import { useCourseModules } from '@/entities/course-module';
import { useEnrollmentStatus } from '@/entities/enrollment';
import { useCourseProgress } from '@/entities/progress';
import { Loader2, AlertCircle } from 'lucide-react';

/** Flattened lesson reference for sequential navigation */
interface FlatLesson {
  moduleId: string;
  lessonId: string;
  contentId: string;
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

  // Fetch enrollment for this specific course
  const { data: enrollment, isLoading: enrollmentsLoading } = useEnrollmentStatus(courseId || '');

  // Fetch course structure
  const { data: segmentsData, isLoading: segmentsLoading } = useCourseModules(
    courseId || '',
    {},
    { enabled: !!courseId }
  );

  // Fetch course progress for completion/lock status
  const { data: courseProgress } = useCourseProgress(courseId || '');

  // Build progress lookup: moduleId → ModuleProgress
  const progressMap = useMemo(
    () => new Map(courseProgress?.moduleProgress?.map((mp) => [mp.moduleId, mp]) || []),
    [courseProgress]
  );

  // Start content attempt
  const { mutate: startAttempt } = useStartContentAttempt();

  // Get current attempt
  const { data: currentAttempt } = useContentAttempt(
    currentAttemptId || '',
    currentAttemptId ? true : false
  );

  // Transform API modules into sidebar format with multi-lesson support
  const modules: CourseModule[] = useMemo(() => {
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

      // Build lessons array from module.lessons or fall back to single-lesson
      const lessons: Lesson[] =
        module.lessons && module.lessons.length > 0
          ? module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              type: lesson.type as Lesson['type'],
              contentId: lesson.contentId || lesson.id,
              isCompleted: isModuleCompleted, // TODO: per-lesson progress when API supports it
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
  }, [segmentsData, progressMap, currentLessonId, currentContentId]);

  // Flatten all lessons for sequential navigation
  const flatLessons: FlatLesson[] = useMemo(
    () =>
      modules.flatMap((m) =>
        m.lessons.map((l) => ({
          moduleId: m.id,
          lessonId: l.id,
          contentId: (l as Lesson & { contentId?: string }).contentId || l.id,
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
      }
    } else if (flatLessons.length > 0 && !currentContentId) {
      // No content specified — start with first unlocked lesson
      const firstUnlocked = modules.flatMap((m) => m.lessons).find((l) => !l.isLocked);
      if (firstUnlocked) {
        const flat = flatLessons.find((fl) => fl.lessonId === firstUnlocked.id);
        if (flat) {
          setCurrentModuleId(flat.moduleId);
          setCurrentLessonId(flat.lessonId);
          setCurrentContentId(flat.contentId);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatLessons.length, urlModuleId, urlLessonId, contentId]);

  // Start content attempt when currentContentId changes
  useEffect(() => {
    if (currentContentId && enrollment && !currentAttemptId) {
      startAttempt(
        {
          contentId: currentContentId,
          enrollmentId: enrollment.id,
        },
        {
          onSuccess: (data) => {
            setCurrentAttemptId(data.id);
          },
        }
      );
    }
  }, [currentContentId, enrollment, currentAttemptId, startAttempt]);

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

    // Use multi-lesson URL when modules have multiple lessons, else legacy URL
    const hasMultiLessonModules = modules.some((m) => m.lessons.length > 1);
    if (hasMultiLessonModules) {
      navigate(`/learner/courses/${courseId}/player/${moduleId}/${lessonId}`);
    } else {
      navigate(`/learner/courses/${courseId}/player/${flat.contentId}`);
    }
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
  const handleContentComplete = () => {
    if (isOnFinalLesson) {
      // Check if all modules are completed
      const allCompleted = modules
        .flatMap((m) => m.lessons)
        .every((l) => l.isCompleted || l.isCurrent);
      if (allCompleted) {
        setShowCompletion(true);
        return;
      }
    }
    // Auto-advance to next lesson
    if (currentIndex < flatLessons.length - 1) {
      handleNext();
    }
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
        />
      );
    }

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

    if (contentType === 'document') {
      const url = (currentAttempt.content as any)?.url || '';
      const isPdf = url.toLowerCase().endsWith('.pdf');

      return (
        <DocumentViewer
          attemptId={currentAttempt.id}
          documentUrl={url}
          documentType={isPdf ? 'pdf' : 'image'}
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
              This content type is not yet supported
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (enrollmentsLoading || segmentsLoading) {
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
            {currentModuleTitle && modules.some((m) => m.lessons.length > 1) && (
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
