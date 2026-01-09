/**
 * LessonPlayerPage
 * Main page for viewing lesson content with progress tracking
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  List,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { ContentViewer } from '@/widgets/content-viewer';
import {
  TimeSpentDisplay,
  LessonCompleteButton,
  useProgressTracker,
} from '@/features/content-progress';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { progressApi } from '@/entities/progress/api/progressApi';

export const LessonPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [initialPosition, setInitialPosition] = useState<number>(0);

  // Validate params
  if (!courseId || !lessonId) {
    navigate('/courses');
    return null;
  }

  // Fetch lesson data
  const {
    data: lesson,
    isLoading: isLoadingLesson,
    error: lessonError,
  } = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: () => lessonApi.getById(courseId, lessonId),
  });

  // Fetch progress data
  const {
    data: progress,
    isLoading: isLoadingProgress,
  } = useQuery({
    queryKey: ['lesson-progress', courseId, lessonId],
    queryFn: () => progressApi.getLessonProgress(courseId, lessonId),
  });

  // Fetch all lessons for navigation
  const { data: allLessons } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonApi.getListByCourseId(courseId),
  });

  // Progress tracker
  const {
    timeSpent,
    isTracking,
    startTracking,
    stopTracking,
    updateProgress,
    completeLesson,
  } = useProgressTracker({
    courseId,
    lessonId,
    enabled: !!lesson,
  });

  // Set initial position from saved progress
  useEffect(() => {
    if (progress?.metadata?.lastPosition) {
      setInitialPosition(progress.metadata.lastPosition);
    }
  }, [progress]);

  // Start tracking when lesson loads
  useEffect(() => {
    if (lesson && !isTracking) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [lesson, isTracking, startTracking, stopTracking]);

  // Complete lesson mutation
  const completeMutation = useMutation({
    mutationFn: () => completeLesson(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course-progress', courseId] });
    },
  });

  // Handle content progress updates
  const handleContentProgress = (data: {
    currentTime?: number;
    duration?: number;
    percent?: number;
    scrollPercent?: number;
  }) => {
    const lastPosition = data.currentTime || data.scrollPercent || 0;
    updateProgress({
      lastPosition,
      status: 'in-progress',
    });
  };

  // Handle lesson completion
  const handleComplete = async () => {
    await completeMutation.mutateAsync();
  };

  // Navigation
  const currentLessonIndex = allLessons?.findIndex((l) => l._id === lessonId) ?? -1;
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = allLessons && currentLessonIndex < allLessons.length - 1;

  const handlePrevious = () => {
    if (hasPrevious && allLessons) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      navigate(`/courses/${courseId}/lessons/${prevLesson._id}`);
    }
  };

  const handleNext = () => {
    if (hasNext && allLessons) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      navigate(`/courses/${courseId}/lessons/${nextLesson._id}`);
    }
  };

  // Loading state
  if (isLoadingLesson || isLoadingProgress) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (lessonError || !lesson) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Lesson</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't load this lesson. Please try again.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
                <Home className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold line-clamp-1">{lesson.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Lesson {lesson.order + 1}
                  {allLessons && ` of ${allLessons.length}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TimeSpentDisplay seconds={timeSpent} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/courses/${courseId}`)}
              >
                <List className="h-4 w-4 mr-2" />
                All Lessons
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Content Viewer */}
          <Card>
            <CardContent className="p-0">
              <div className="aspect-video w-full">
                <ContentViewer
                  content={lesson}
                  onProgress={handleContentProgress}
                  initialPosition={initialPosition}
                  className="w-full h-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lesson Info & Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>About This Lesson</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lesson.description && (
                  <p className="text-muted-foreground">{lesson.description}</p>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lesson Type</p>
                    <p className="font-medium capitalize">{lesson.type}</p>
                  </div>
                  {lesson.duration && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium">{lesson.duration} minutes</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="font-medium capitalize">
                      {isCompleted ? 'Completed' : progress?.status || 'Not Started'}
                    </p>
                  </div>
                  {lesson.isRequired && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Required</p>
                      <p className="font-medium">Yes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Time Spent</p>
                  <TimeSpentDisplay seconds={timeSpent} format="long" showIcon={false} />
                </div>

                <Separator />

                <LessonCompleteButton
                  onComplete={handleComplete}
                  isCompleted={isCompleted}
                  className="w-full"
                />
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Lesson
                </Button>

                <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
                  <List className="h-4 w-4 mr-2" />
                  View All Lessons
                </Button>

                <Button onClick={handleNext} disabled={!hasNext}>
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
