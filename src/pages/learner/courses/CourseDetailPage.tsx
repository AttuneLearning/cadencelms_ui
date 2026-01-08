/**
 * Course Detail Page
 * Display detailed course information, lessons, and enrollment options
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { courseApi } from '@/entities/course/api/courseApi';
import { lessonApi } from '@/entities/lesson/api/lessonApi';
import { enrollmentApi } from '@/entities/enrollment/api/enrollmentApi';
import { EnrollButton } from '@/features/course-enrollment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import { Progress as ProgressBar } from '@/shared/ui/progress';
import {
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  PlayCircle,
  CheckCircle2,
  Lock,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import type { LessonListItem } from '@/entities/lesson/model/types';

export const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  if (!courseId) {
    return <div>Invalid course ID</div>;
  }

  // Fetch course details
  const {
    data: course,
    isLoading: isLoadingCourse,
    error: courseError,
  } = useQuery({
    queryKey: ['courses', courseId],
    queryFn: () => courseApi.getById(courseId),
    enabled: !!courseId,
  });

  // Fetch course lessons
  const {
    data: lessons,
    isLoading: isLoadingLessons,
  } = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => lessonApi.getListByCourseId(courseId),
    enabled: !!courseId,
  });

  // Check enrollment status
  const {
    data: enrollmentStatus,
    isLoading: isLoadingEnrollment,
    refetch: refetchEnrollment,
  } = useQuery({
    queryKey: ['enrollment', 'check', courseId],
    queryFn: () => enrollmentApi.checkEnrollment(courseId),
    enabled: !!courseId,
  });

  const isEnrolled = enrollmentStatus?.isEnrolled ?? false;
  const enrollment = enrollmentStatus?.enrollment;

  // Calculate progress
  const completedLessons = lessons?.filter((lesson) => lesson.isCompleted).length ?? 0;
  const totalLessons = lessons?.length ?? 0;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const handleStartCourse = () => {
    if (isEnrolled && lessons && lessons.length > 0) {
      // Navigate to first lesson
      const firstLesson = lessons.find((l) => !l.isCompleted) || lessons[0];
      navigate(`/learner/courses/${courseId}/lessons/${firstLesson._id}`);
    }
  };

  if (isLoadingCourse) {
    return <CourseDetailSkeleton />;
  }

  if (courseError || !course) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load course details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/learner/courses')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Catalog
      </Button>

      {/* Course Header */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Info Card */}
          <Card>
            {course.thumbnail && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-base">
                    {course.shortDescription}
                  </CardDescription>
                </div>
                {course.level && <Badge variant="secondary">{course.level}</Badge>}
              </div>

              {/* Course Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4">
                {typeof course.lessonCount === 'number' && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {course.lessonCount} {course.lessonCount === 1 ? 'Lesson' : 'Lessons'}
                    </span>
                  </div>
                )}
                {typeof course.duration === 'number' && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(course.duration)}</span>
                  </div>
                )}
                {typeof course.enrollmentCount === 'number' && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.enrollmentCount} Enrolled</span>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Progress Bar (for enrolled users) */}
              {isEnrolled && enrollment && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Your Progress</span>
                    <span className="text-muted-foreground">
                      {completedLessons} of {totalLessons} lessons completed
                    </span>
                  </div>
                  <ProgressBar value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground">{progress}% Complete</p>
                </div>
              )}

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-2">About this course</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
              </div>

              {/* Learning Objectives */}
              {course.learningObjectives && course.learningObjectives.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What you'll learn</h3>
                    <ul className="space-y-2">
                      {course.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Lessons List */}
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
                {course.duration && ` · ${formatDuration(course.duration)} total length`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLessons ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : lessons && lessons.length > 0 ? (
                <div className="space-y-2">
                  {lessons.map((lesson, index) => (
                    <LessonItem
                      key={lesson._id}
                      lesson={lesson}
                      index={index + 1}
                      isEnrolled={isEnrolled}
                      courseId={courseId}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No lessons available yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="pt-6 space-y-4">
              {isLoadingEnrollment ? (
                <Skeleton className="h-10 w-full" />
              ) : isEnrolled ? (
                <>
                  <Button onClick={handleStartCourse} className="w-full" size="lg">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    {progress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    You're enrolled in this course
                  </p>
                </>
              ) : (
                <>
                  <EnrollButton
                    courseId={courseId}
                    courseTitle={course.title}
                    isEnrolled={isEnrolled}
                    className="w-full"
                    size="lg"
                    onEnrollSuccess={() => refetchEnrollment()}
                  />
                  <p className="text-sm text-center text-muted-foreground">
                    Click to enroll in this course
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Lesson Item Component
interface LessonItemProps {
  lesson: LessonListItem;
  index: number;
  isEnrolled: boolean;
  courseId: string;
}

const LessonItem: React.FC<LessonItemProps> = ({ lesson, index, isEnrolled, courseId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (isEnrolled && !lesson.isLocked) {
      navigate(`/learner/courses/${courseId}/lessons/${lesson._id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isEnrolled || lesson.isLocked}
      className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
        {lesson.isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : lesson.isLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground" />
        ) : (
          index
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{lesson.type}</span>
          {lesson.duration && (
            <>
              <span>·</span>
              <span>{lesson.duration} min</span>
            </>
          )}
          {lesson.isRequired && (
            <>
              <span>·</span>
              <Badge variant="secondary" className="text-xs">
                Required
              </Badge>
            </>
          )}
        </div>
      </div>
      {!isEnrolled && <Lock className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
};

// Loading Skeleton
const CourseDetailSkeleton: React.FC = () => (
  <div className="container mx-auto py-8 space-y-6">
    <Skeleton className="h-10 w-32" />
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <Skeleton className="aspect-video w-full rounded-t-lg" />
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1">
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

// Helper function
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
