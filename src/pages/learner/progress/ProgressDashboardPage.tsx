/**
 * Progress Dashboard Page
 * Overall progress visualization across ALL enrolled courses
 * Route: /learner/progress
 * Role: learner
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMyEnrollments } from '@/entities/enrollment';
import type { EnrollmentListItem, EnrollmentStatus } from '@/entities/enrollment';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Label } from '@/shared/ui/label';
import { Progress } from '@/shared/ui/progress';
import { Badge } from '@/shared/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  BookOpen,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { useNavigation } from '@/shared/lib/navigation/useNavigation';
import { PageHeader } from '@/shared/ui/page-header';

type FilterStatus = 'all' | 'in-progress' | 'completed';

interface ProgressSummary {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  overallProgress: number;
  totalLessonsCompleted: number;
  totalLessons: number;
}

export const ProgressDashboardPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState('enrolledAt:desc');
  const { updateBreadcrumbs } = useNavigation();

  // Update breadcrumbs
  useEffect(() => {
    updateBreadcrumbs([
      { label: 'Dashboard', path: '/learner/dashboard' },
      { label: 'My Progress', path: '/learner/progress' },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map filter status to API status
  const getApiStatus = (): EnrollmentStatus | undefined => {
    if (filterStatus === 'completed') return 'completed';
    if (filterStatus === 'in-progress') return 'active';
    return undefined;
  };

  const { data, isLoading, error } = useMyEnrollments({
    status: getApiStatus(),
    sort: sortBy,
    limit: 100,
  });

  const enrollments = data?.enrollments || [];

  // Calculate progress summary
  const progressSummary: ProgressSummary = useMemo(() => {
    const allEnrollments = enrollments;

    const completed = allEnrollments.filter((e) => e.status === 'completed').length;
    const inProgress = allEnrollments.filter(
      (e) => e.status === 'active' && e.progress.percentage > 0
    ).length;

    const totalProgress = allEnrollments.reduce(
      (sum, e) => sum + e.progress.percentage,
      0
    );
    const avgProgress = allEnrollments.length > 0
      ? Math.round(totalProgress / allEnrollments.length)
      : 0;

    const totalLessonsCompleted = allEnrollments.reduce(
      (sum, e) => sum + e.progress.completedItems,
      0
    );

    const totalLessons = allEnrollments.reduce(
      (sum, e) => sum + e.progress.totalItems,
      0
    );

    return {
      totalCourses: allEnrollments.length,
      completedCourses: completed,
      inProgressCourses: inProgress,
      overallProgress: avgProgress,
      totalLessonsCompleted,
      totalLessons,
    };
  }, [enrollments]);

  // Filter enrollments for display (client-side filter for in-progress)
  const filteredEnrollments = useMemo(() => {
    if (filterStatus === 'all') return enrollments;
    if (filterStatus === 'completed') return enrollments;
    if (filterStatus === 'in-progress') {
      return enrollments.filter((e) => e.status === 'active');
    }
    return enrollments;
  }, [enrollments, filterStatus]);

  const handleStatusFilterChange = (value: string) => {
    setFilterStatus(value as FilterStatus);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (enrollment: EnrollmentListItem) => {
    if (enrollment.status === 'completed') {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    }
    if (enrollment.progress.percentage > 0) {
      return (
        <Badge variant="secondary">
          <TrendingUp className="w-3 h-3 mr-1" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Circle className="w-3 h-3 mr-1" />
        Not Started
      </Badge>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div data-testid="loading-skeleton">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p className="font-semibold text-lg mb-2">Error loading progress</p>
              <p className="text-sm">
                {error instanceof Error ? error.message : 'An error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (enrollments.length === 0 && filterStatus === 'all') {
    return (
      <div className="container mx-auto py-8 px-4">
        <PageHeader
          title="My Progress"
          description="Track your learning journey across all courses"
          className="mb-8"
        />
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses enrolled yet</h3>
              <p className="text-muted-foreground mb-4">
                Start learning by enrolling in a course
              </p>
              <Button asChild>
                <Link to="/learner/catalog">Browse Catalog</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <PageHeader
        title="My Progress"
        description="Track your learning journey across all courses"
        className="mb-8"
      />

      {/* Overall Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Courses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{progressSummary.totalCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {progressSummary.completedCourses}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {progressSummary.inProgressCourses}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Active learning</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        {/* Overall Completion */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{progressSummary.overallProgress}%</div>
                <p className="text-xs text-muted-foreground mt-1">Average completion</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={progressSummary.overallProgress} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Lessons Summary */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {progressSummary.totalLessonsCompleted}
                </div>
                <p className="text-sm text-muted-foreground">
                  Lessons completed out of {progressSummary.totalLessons}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Clock className="h-8 w-8 text-muted-foreground inline-block" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <div className="mb-6 space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Tabs value={filterStatus} onValueChange={handleStatusFilterChange}>
            <TabsList>
              <TabsTrigger value="all">All Courses</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Sort */}
          <div className="sm:w-64">
            <Label htmlFor="sort-select" className="sr-only">
              Sort by
            </Label>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger id="sort-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enrolledAt:desc">Newest First</SelectItem>
                <SelectItem value="enrolledAt:asc">Oldest First</SelectItem>
                <SelectItem value="progress:desc">Highest Progress</SelectItem>
                <SelectItem value="progress:asc">Lowest Progress</SelectItem>
                <SelectItem value="courseName:asc">Course Name (A-Z)</SelectItem>
                <SelectItem value="courseName:desc">Course Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Course Progress List */}
      {filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredEnrollments.length} course
            {filteredEnrollments.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {enrollment.target.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.target.code}
                      </p>
                    </div>
                    {getStatusBadge(enrollment)}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-bold">
                        {enrollment.progress.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={enrollment.progress.percentage}
                      className="h-2"
                      aria-label={`Course progress: ${enrollment.progress.percentage}%`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {enrollment.progress.completedItems} of {enrollment.progress.totalItems}{' '}
                      lessons completed
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1 mb-4">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Enrolled:</span>{' '}
                      {formatDate(enrollment.enrolledAt)}
                    </p>
                    {enrollment.completedAt && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Completed:</span>{' '}
                        {formatDate(enrollment.completedAt)}
                      </p>
                    )}
                    {enrollment.progress.lastActivityAt && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Last Activity:</span>{' '}
                        {formatDate(enrollment.progress.lastActivityAt)}
                      </p>
                    )}
                    {enrollment.grade.score !== null && (
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Score:</span>{' '}
                        {enrollment.grade.score}% ({enrollment.grade.letter})
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" variant="default">
                      <Link to={`/learner/courses/${enrollment.target.id}/progress`}>
                        View Progress
                      </Link>
                    </Button>
                    {enrollment.status !== 'completed' && (
                      <Button asChild className="flex-1" variant="outline">
                        <Link to={`/learner/courses/${enrollment.target.id}/player`}>
                          Continue
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
