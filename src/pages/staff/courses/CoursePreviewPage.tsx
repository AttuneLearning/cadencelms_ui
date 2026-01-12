/**
 * Course Preview Page
 * Allows staff to preview course content exactly as learners will see it
 * Features:
 * - View as Learner mode
 * - Course overview with module list
 * - Simulated progress indicators
 * - Locked/unlocked state based on prerequisites
 * - Navigation between modules
 */

import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '@/entities/course/model/useCourse';
import { useCourseSegments } from '@/entities/course-segment/hooks/useCourseSegments';
import { CourseNavigation } from '@/features/courses/ui/CourseNavigation';
import { LessonPlayerPreview } from '@/features/courses/ui/LessonPlayerPreview';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import {
  ArrowLeft,
  Eye,
  BookOpen,
  Clock,
  Award,
  Users,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function CoursePreviewPage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId?: string }>();
  const navigate = useNavigate();

  // Fetch course data
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourse(courseId || '');

  // Fetch course segments/modules
  const {
    data: segmentsData,
    isLoading: segmentsLoading,
    error: segmentsError,
  } = useCourseSegments(courseId || '');

  // State for simulated progress
  type SimulatedProgressType = {
    [moduleId: string]: {
      isCompleted: boolean;
      isLocked: boolean;
      progress?: number;
    };
  };

  const [simulatedProgress] = useState<SimulatedProgressType>(() => {
    // Initialize with first module unlocked, rest locked
    const modules = segmentsData?.modules || [];
    const initial: SimulatedProgressType = {};
    modules.forEach((module, index) => {
      initial[module.id] = {
        isCompleted: false,
        isLocked: index !== 0, // Only first module is unlocked
        progress: 0,
      };
    });
    return initial;
  });

  const [showOverview, setShowOverview] = useState(!moduleId);

  // Get current module
  const currentModule = useMemo(() => {
    if (!moduleId || !segmentsData) return null;
    return segmentsData.modules.find((m) => m.id === moduleId);
  }, [moduleId, segmentsData]);

  // Get sorted modules
  const sortedModules = useMemo(() => {
    if (!segmentsData) return [];
    return [...segmentsData.modules].sort((a, b) => a.order - b.order);
  }, [segmentsData]);

  // Navigation helpers
  const currentIndex = currentModule
    ? sortedModules.findIndex((m) => m.id === currentModule.id)
    : -1;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < sortedModules.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      const prevModule = sortedModules[currentIndex - 1];
      navigate(`/staff/courses/${courseId}/preview/${prevModule.id}`);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextModule = sortedModules[currentIndex + 1];
      navigate(`/staff/courses/${courseId}/preview/${nextModule.id}`);
    }
  };

  const handleModuleClick = (newModuleId: string) => {
    setShowOverview(false);
    navigate(`/staff/courses/${courseId}/preview/${newModuleId}`);
  };

  const handleExitPreview = () => {
    navigate(`/admin/courses/${courseId}`);
  };

  const handleBackToOverview = () => {
    setShowOverview(true);
    navigate(`/staff/courses/${courseId}/preview`);
  };

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (sortedModules.length === 0) return 0;
    const completed = sortedModules.filter(
      (m) => simulatedProgress[m.id]?.isCompleted
    ).length;
    return (completed / sortedModules.length) * 100;
  }, [sortedModules, simulatedProgress]);

  // Loading state
  if (courseLoading || segmentsLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-96" />
          </div>
          <div className="lg:col-span-3">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (courseError || segmentsError) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {courseError?.message || segmentsError?.message || 'Failed to load course'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Course not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Mode Banner */}
      <div className="bg-primary text-primary-foreground py-3 px-6 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5" />
            <span className="font-semibold">Preview Mode - Learner View</span>
            <Badge variant="secondary" className="bg-primary-foreground/20">
              Read-Only
            </Badge>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExitPreview} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Exit Preview
          </Button>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {/* Course Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
              <p className="text-muted-foreground">{course.code}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className={cn(
                course.status === 'published' ? 'bg-green-500/10 text-green-500' :
                course.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-gray-500/10 text-gray-500'
              )}>
                {course.status}
              </Badge>
            </div>
          </div>

          {!showOverview && (
            <Button variant="ghost" size="sm" onClick={handleBackToOverview} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Course Overview
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <CourseNavigation
              modules={sortedModules}
              currentModuleId={currentModule?.id}
              onModuleClick={handleModuleClick}
              simulatedProgress={simulatedProgress}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {showOverview ? (
              <div className="space-y-6">
                {/* Course Overview Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Course Overview
                    </CardTitle>
                    <CardDescription>
                      This is what learners see when they first access the course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {course.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground">{course.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <Clock className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-semibold">{course.duration} hours</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <Award className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Credits</p>
                          <p className="font-semibold">{course.credits}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 border rounded-lg">
                        <Users className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Instructors</p>
                          <p className="font-semibold">{course.instructors.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold mb-3">Your Progress</h3>
                      <Progress value={overallProgress} className="h-3 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {sortedModules.filter((m) => simulatedProgress[m.id]?.isCompleted).length}{' '}
                        of {sortedModules.length} modules completed ({overallProgress.toFixed(0)}%)
                      </p>
                    </div>

                    {/* Instructors */}
                    {course.instructors.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Instructors</h3>
                        <div className="space-y-2">
                          {course.instructors.map((instructor) => (
                            <div
                              key={instructor.id}
                              className="flex items-center gap-3 p-3 border rounded-lg"
                            >
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="font-semibold text-primary">
                                  {instructor.firstName[0]}
                                  {instructor.lastName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  {instructor.firstName} {instructor.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{instructor.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Course Settings Info */}
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Course Settings:</p>
                          <ul className="text-sm space-y-1 ml-4">
                            <li>
                              Passing Score: {course.settings.passingScore}%
                            </li>
                            <li>
                              Max Attempts: {course.settings.maxAttempts === 0 ? 'Unlimited' : course.settings.maxAttempts}
                            </li>
                            {course.settings.certificateEnabled && (
                              <li>Certificate available upon completion</li>
                            )}
                            {course.settings.allowSelfEnrollment && (
                              <li>Self-enrollment enabled</li>
                            )}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>

                    {/* Start Button */}
                    {sortedModules.length > 0 && (
                      <div className="flex justify-center pt-4">
                        <Button
                          size="lg"
                          onClick={() => handleModuleClick(sortedModules[0].id)}
                          className="gap-2"
                        >
                          <BookOpen className="h-5 w-5" />
                          {overallProgress > 0 ? 'Continue Course' : 'Start Course'}
                        </Button>
                      </div>
                    )}

                    {sortedModules.length === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No modules have been added to this course yet.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : currentModule ? (
              <LessonPlayerPreview
                module={currentModule}
                onPrevious={handlePrevious}
                onNext={handleNext}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                isLocked={simulatedProgress[currentModule.id]?.isLocked}
              />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Module not found</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
