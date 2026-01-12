/**
 * CourseDetailsPage
 * Detailed course information and enrollment page
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCourse } from '@/entities/course';
import { useCourseSegments } from '@/entities/course-segment';
import { useEnrollmentStatus } from '@/entities/enrollment';
import { CourseHeader } from '@/features/catalog/ui/CourseHeader';
import { CourseModules } from '@/features/catalog/ui/CourseModules';
import { EnrollmentSection } from '@/features/catalog/ui/EnrollmentSection';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';

export const CourseDetailsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, isLoading: isCourseLoading, error: courseError } = useCourse(courseId!);
  const { data: segmentsData, isLoading: isSegmentsLoading } = useCourseSegments(courseId!);
  const { data: enrollment, isLoading: isEnrollmentLoading } = useEnrollmentStatus(courseId!);

  const isLoading = isCourseLoading || isSegmentsLoading || isEnrollmentLoading;
  const segments = segmentsData?.modules || [];
  const isEnrolled = !!enrollment;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4" data-testid="loading-skeleton">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/4 mb-6" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/learner/catalog">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Catalog
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading course</AlertTitle>
          <AlertDescription>
            {courseError instanceof Error
              ? courseError.message
              : 'Unable to load course details. Please try again later.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back Navigation */}
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/learner/catalog">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <Card>
            <CardContent className="p-6">
              <CourseHeader course={course} />
            </CardContent>
          </Card>

          {/* Course Description */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">About This Course</h2>
              <p className="text-muted-foreground leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <CourseModules modules={segments} />

          {/* Instructors */}
          {course.instructors && course.instructors.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Instructors</h2>
                <div className="space-y-3">
                  {course.instructors.map((instructor) => (
                    <div key={instructor.id} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {instructor.firstName[0]}
                          {instructor.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {instructor.firstName} {instructor.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {instructor.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Section */}
          <EnrollmentSection
            course={course}
            isEnrolled={isEnrolled}
          />

          {/* Course Info */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Course Information</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-medium">{course.duration} hours</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Credits</dt>
                  <dd className="font-medium">{course.credits}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Passing Score</dt>
                  <dd className="font-medium">{course.settings.passingScore}%</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Max Attempts</dt>
                  <dd className="font-medium">
                    {course.settings.maxAttempts || 'Unlimited'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Students Enrolled</dt>
                  <dd className="font-medium">{course.enrollmentCount}</dd>
                </div>
                {course.settings.certificateEnabled && (
                  <div>
                    <dt className="text-muted-foreground">Certificate</dt>
                    <dd className="font-medium">Available upon completion</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
