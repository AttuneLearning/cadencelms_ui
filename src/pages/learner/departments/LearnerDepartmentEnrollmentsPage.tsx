/**
 * Learner Department Enrollments Page
 * View learner's enrollments within a specific department
 *
 * Features:
 * - Lists learner's active and completed enrollments in the department
 * - Progress tracking per enrollment
 * - Continue learning buttons
 *
 * Route: /learner/departments/:deptId/enrollments
 * Permission: enrollments:own:read
 * Navigation Redesign Phase 5 - 2026-02-05
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { Progress } from '@/shared/ui/progress';
import { useDepartment } from '@/entities/department';
import { useMyEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import {
  BookOpen,
  Clock,
  Building2,
  ChevronLeft,
  ChevronRight,
  Play,
  Award,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { useDepartmentContext } from '@/shared/hooks';
import { formatDistanceToNow } from 'date-fns';

export const LearnerDepartmentEnrollmentsPage: React.FC = () => {
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
  } = useMyEnrollments({ department: deptId, limit: 50 });

  // Separate active and completed enrollments
  const { activeEnrollments, completedEnrollments } = React.useMemo(() => {
    if (!enrollmentsData) {
      return { activeEnrollments: [], completedEnrollments: [] };
    }

    const active = enrollmentsData.enrollments.filter(
      (e) => e.status === 'active' && e.progress.percentage < 100
    );
    const completed = enrollmentsData.enrollments.filter(
      (e) => e.status === 'completed' || e.progress.percentage === 100
    );

    return { activeEnrollments: active, completedEnrollments: completed };
  }, [enrollmentsData]);

  const isLoading = isDeptLoading || isSwitching || isLoadingEnrollments;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
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
        <span className="text-foreground">My Enrollments</span>
      </nav>

      {/* Header */}
      <PageHeader
        title="My Enrollments"
        description={`Your courses in the ${department.name} department`}
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
              Failed to load enrollments. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Active Enrollments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          In Progress ({activeEnrollments.length})
        </h2>

        {activeEnrollments.length > 0 ? (
          <div className="space-y-3">
            {activeEnrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{enrollment.target.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="font-mono text-xs">{enrollment.target.code}</span>
                        {enrollment.progress.lastActivityAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active{' '}
                            {formatDistanceToNow(new Date(enrollment.progress.lastActivityAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-32 text-right">
                      <span className="text-sm font-medium">
                        {enrollment.progress.percentage}%
                      </span>
                      <Progress
                        value={enrollment.progress.percentage}
                        className="h-2 mt-1"
                      />
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/learner/courses/${enrollment.target.id}/player`}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No courses in progress in this department.
              </p>
              <Button variant="outline" className="mt-4" asChild>
                <Link to={`/learner/departments/${deptId}/courses`}>
                  Browse Courses
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Completed Enrollments */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Award className="h-5 w-5" />
          Completed ({completedEnrollments.length})
        </h2>

        {completedEnrollments.length > 0 ? (
          <div className="space-y-3">
            {completedEnrollments.map((enrollment) => (
              <Card key={enrollment.id} className="bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{enrollment.target.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span className="font-mono text-xs">{enrollment.target.code}</span>
                        {enrollment.completedAt && (
                          <span>
                            Completed{' '}
                            {formatDistanceToNow(new Date(enrollment.completedAt), {
                              addSuffix: true,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    {enrollment.grade.score !== null && (
                      <Badge variant="secondary" className="text-sm">
                        Score: {enrollment.grade.score}%
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Award className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No completed courses in this department yet.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};
