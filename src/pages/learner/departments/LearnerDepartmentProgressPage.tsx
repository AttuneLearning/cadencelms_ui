/**
 * Learner Department Progress Page
 * View progress overview for a specific department
 *
 * Features:
 * - Summary statistics for the department
 * - Progress chart visualization
 * - Detailed breakdown by course
 *
 * Route: /learner/departments/:deptId/progress
 * Permission: progress:own:read
 * Navigation Redesign Phase 5 - 2026-02-05
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Progress } from '@/shared/ui/progress';
import { useDepartment } from '@/entities/department';
import { useMyEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import {
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Target,
  BarChart3,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { useDepartmentContext } from '@/shared/hooks';

export const LearnerDepartmentProgressPage: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();

  // Get department context
  const {
    switchDepartment,
    currentDepartmentId,
    isSwitching,
  } = useDepartmentContext();

  // Fetch department details
  const {
    data: department,
    isLoading: isDeptLoading,
    error: deptError,
  } = useDepartment(deptId!);

  // Track if this is initial mount to distinguish from user clearing selection
  const isInitialMountRef = React.useRef(true);

  // Switch to this department when page loads
  React.useEffect(() => {
    if (deptId && currentDepartmentId !== deptId && !isSwitching) {
      // Don't auto-switch if user explicitly cleared selection (currentDepartmentId is null)
      if (currentDepartmentId === null && !isInitialMountRef.current) {
        return;
      }
      switchDepartment(deptId);
    }
    isInitialMountRef.current = false;
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Fetch user's enrollments for this department
  const {
    data: enrollmentsData,
    isLoading: isLoadingEnrollments,
    error: enrollmentsError,
  } = useMyEnrollments({ department: deptId, limit: 100 });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!enrollmentsData) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        averageProgress: 0,
        totalTimeSpent: 0,
      };
    }

    const enrollments = enrollmentsData.enrollments;
    const completed = enrollments.filter(
      (e) => e.status === 'completed' || e.progress.percentage === 100
    );
    const inProgress = enrollments.filter(
      (e) => e.status === 'active' && e.progress.percentage > 0 && e.progress.percentage < 100
    );

    const totalProgress = enrollments.reduce(
      (sum, e) => sum + e.progress.percentage,
      0
    );
    const averageProgress =
      enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

    return {
      totalCourses: enrollments.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      averageProgress,
      totalTimeSpent: 0, // TODO: Get from API when available
    };
  }, [enrollmentsData]);

  const isLoading = isDeptLoading || isSwitching || isLoadingEnrollments;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Error state
  if (deptError || !department) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <Building2 className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Department Not Found</h3>
              <p className="text-muted-foreground mb-4">
                The department you're looking for doesn't exist or you don't have access.
              </p>
              <Button variant="outline" asChild>
                <Link to="/learner/dashboard">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/learner/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{department.name}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">My Progress</span>
      </nav>

      {/* Header */}
      <PageHeader
        title="My Progress"
        description={`Your learning progress in the ${department.name} department`}
      >
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-3 w-3" />
          {department.name}
        </Badge>
      </PageHeader>

      {/* Error State */}
      {enrollmentsError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Failed to load progress data. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Enrolled in this department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressCourses}</div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress by Course
          </CardTitle>
          <CardDescription>Detailed breakdown of your progress in each course</CardDescription>
        </CardHeader>
        <CardContent>
          {enrollmentsData && enrollmentsData.enrollments.length > 0 ? (
            <div className="space-y-4">
              {enrollmentsData.enrollments.map((enrollment) => (
                <div key={enrollment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{enrollment.target.name}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {enrollment.target.code}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {enrollment.progress.percentage}%
                    </span>
                  </div>
                  <Progress value={enrollment.progress.percentage} className="h-2" />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {enrollment.progress.completedItems} of {enrollment.progress.totalItems} items
                    </span>
                    {enrollment.status === 'completed' && (
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No enrollment data available for this department.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to={`/learner/departments/${deptId}/courses`}>
                  Browse Courses
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
