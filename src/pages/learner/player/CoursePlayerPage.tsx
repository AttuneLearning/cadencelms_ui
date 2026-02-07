/**
 * CoursePlayerPage
 * Main learning interface for consuming course content
 */

import { useEffect, useState } from 'react';
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
} from '@/features/player/ui';
import {
  useStartContentAttempt,
  useContentAttempt,
} from '@/entities/content-attempt';
import { useCourseModules } from '@/entities/course-module';
import { useEnrollmentStatus } from '@/entities/enrollment';
import { useCourseProgress } from '@/entities/progress';
import { Loader2, AlertCircle } from 'lucide-react';

export function CoursePlayerPage() {
  const { courseId, contentId } = useParams<{ courseId: string; contentId?: string }>();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentContentId, setCurrentContentId] = useState<string | null>(contentId || null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string | null>(null);

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
  const progressMap = new Map(
    courseProgress?.moduleProgress?.map((mp) => [mp.moduleId, mp]) || []
  );

  // Start content attempt
  const { mutate: startAttempt } = useStartContentAttempt();

  // Get current attempt
  const { data: currentAttempt } = useContentAttempt(
    currentAttemptId || '',
    currentAttemptId ? true : false
  );

  useEffect(() => {
    if (currentContentId && enrollment && !currentAttemptId) {
      // Start a new attempt
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
    navigate(`/learner/dashboard`);
  };

  // Transform course segments to sidebar format with progress data
  const modules: CourseModule[] =
    segmentsData?.modules.map((module, index) => {
      const progress = progressMap.get(module.id);
      const isCompleted = progress?.status === 'completed';

      // A module is locked if any prior required module is not completed
      const isLocked =
        index > 0 &&
        segmentsData.modules.slice(0, index).some((prev) => {
          const prevProgress = progressMap.get(prev.id);
          if (!prevProgress) return true;
          if (!prevProgress.isRequired) return false;
          return prevProgress.status !== 'completed';
        });

      return {
        id: module.id,
        title: module.title,
        lessons: [
          {
            id: module.id,
            title: module.title,
            type: module.type as any,
            isCompleted,
            isLocked,
            isCurrent: module.id === currentContentId,
          },
        ],
      };
    }) || [];

  // Handle lesson navigation
  const handleLessonClick = (_moduleId: string, lessonId: string) => {
    setCurrentContentId(lessonId);
    setCurrentAttemptId(null); // Reset attempt to start a new one
    navigate(`/learner/courses/${courseId}/player/${lessonId}`);
  };

  // Navigation controls
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === currentContentId);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      handleLessonClick('', prevLesson.id);
    }
  };

  const handleNext = () => {
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      handleLessonClick('', nextLesson.id);
    }
  };

  // Render player based on content type
  const renderPlayer = () => {
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
          onComplete={() => {
            // Auto-navigate to next
            if (currentIndex < allLessons.length - 1) {
              handleNext();
            }
          }}
        />
      );
    }

    if (contentType === 'video') {
      return (
        <VideoPlayer
          attemptId={currentAttempt.id}
          videoUrl={(currentAttempt.content as any)?.url || ''}
          lastPosition={currentAttempt.location ? parseFloat(currentAttempt.location) : 0}
          onComplete={() => {
            if (currentIndex < allLessons.length - 1) {
              handleNext();
            }
          }}
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
          <h1 className="text-lg font-semibold">{segmentsData?.courseTitle || 'Course'}</h1>
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
          <PlayerControls
            currentLessonIndex={currentIndex}
            totalLessons={allLessons.length}
            hasPrevious={currentIndex > 0}
            hasNext={currentIndex < allLessons.length - 1}
            isNextLocked={
              currentIndex < allLessons.length - 1 && allLessons[currentIndex + 1].isLocked
            }
            timeSpent={currentAttempt?.timeSpentSeconds || 0}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </main>
      </div>
    </div>
  );
}
