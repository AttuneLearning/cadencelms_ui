/**
 * ProgramDetailPage
 * Detailed view of a program with course sequence and progress
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProgramForLearner } from '@/entities/program';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Badge } from '@/shared/ui/badge';
import { Progress } from '@/shared/ui/progress';
import { PageHeader } from '@/shared/ui/page-header';
import {
  CheckCircle2,
  Circle,
  Lock,
  ArrowRight,
  Award,
  Calendar,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import type { ProgramCourseItem } from '@/entities/program/api/learnerProgramApi';

const CourseStatusIcon: React.FC<{ status: ProgramCourseItem['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'in-progress':
      return <ArrowRight className="h-5 w-5 text-blue-500" />;
    case 'locked':
      return <Lock className="h-5 w-5 text-gray-400" />;
    case 'available':
      return <Circle className="h-5 w-5 text-gray-400" />;
  }
};

const CourseCard: React.FC<{ course: ProgramCourseItem }> = ({ course }) => {
  const isAccessible = course.status === 'completed' || course.status === 'in-progress' || course.status === 'available';

  return (
    <Card className={`${!isAccessible ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <CourseStatusIcon status={course.status} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="text-sm mt-1">
                  {course.code} • {course.level.name}
                </CardDescription>
              </div>
              <Badge
                variant={
                  course.status === 'completed'
                    ? 'default'
                    : course.status === 'in-progress'
                    ? 'secondary'
                    : 'outline'
                }
                className="capitalize"
              >
                {course.status.replace('-', ' ')}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{course.description}</p>
          </div>
        </div>
      </CardHeader>
      {course.enrollment && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{course.enrollment.progress}%</span>
            </div>
            <Progress value={course.enrollment.progress} className="h-2" />
            {isAccessible && (
              <Button asChild size="sm" variant="outline" className="w-full mt-3">
                <Link to={`/learner/courses/${course.id}/player`}>
                  {course.status === 'completed' ? 'Review' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      )}
      {!course.enrollment && isAccessible && (
        <CardContent>
          <Button asChild size="sm" variant="default" className="w-full">
            <Link to={`/learner/courses/${course.id}/player`}>
              Start Course
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      )}
      {course.status === 'locked' && course.prerequisites.length > 0 && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete prerequisites to unlock this course
          </p>
        </CardContent>
      )}
    </Card>
  );
};

export const ProgramDetailPage: React.FC = () => {
  const { programId } = useParams<{ programId: string }>();
  const { data: program, isLoading, error } = useProgramForLearner(programId || '');

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="space-y-4 mt-8">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold">Error loading program</p>
              <p className="text-sm mt-1">
                {error instanceof Error ? error.message : 'Program not found'}
              </p>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/learner/programs">Back to My Programs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nextIncompleteCourse = program.courses.find(
    (c) => c.status === 'in-progress' || c.status === 'available'
  );

  const credentialLabels = {
    certificate: 'Certificate',
    diploma: 'Diploma',
    degree: 'Degree',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title={program.name}
        description={program.description}
        className="mb-8"
      />

      {/* Program Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Department</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{program.department.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Award className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Credential</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{credentialLabels[program.credential]}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {program.duration} {program.durationUnit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
          <CardDescription>
            {program.statistics.completedCourses} of {program.statistics.totalCourses} courses completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{program.statistics.overallProgress}%</span>
              {program.enrollment.status === 'completed' && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
            <Progress value={program.statistics.overallProgress} className="h-3" />
          </div>
          {nextIncompleteCourse && (
            <Button asChild className="w-full mt-4">
              <Link to={`/learner/courses/${nextIncompleteCourse.id}/player`}>
                Continue to {nextIncompleteCourse.title}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Certificate Info */}
      {program.certificate?.enabled && (
        <Card className="mb-8 border-primary">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <CardTitle>Certificate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {program.certificate.issued ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Congratulations! Your certificate has been issued.
                </p>
                <Button asChild variant="default">
                  <Link to="/learner/certificates">View Certificate</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {program.certificate.title || 'A certificate'} will be issued upon successful completion of all courses.
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Progress:</span>
                  <span className="text-muted-foreground">
                    {program.statistics.completedCourses}/{program.statistics.totalCourses} courses
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Course Sequence */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Course Sequence</h2>
        </div>
        <p className="text-muted-foreground mb-6">
          Complete courses in order to progress through the program
        </p>
      </div>

      <div className="space-y-4">
        {program.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Back Button */}
      <div className="mt-8">
        <Button asChild variant="outline">
          <Link to="/learner/programs">Back to My Programs</Link>
        </Button>
      </div>
    </div>
  );
};
