/**
 * Learner Department Courses Page
 * Browse available courses within a specific department
 *
 * Features:
 * - Lists courses available to learners in the department
 * - Filter by status, search
 * - Enroll button for unenrolled courses
 *
 * Route: /learner/departments/:deptId/courses
 * Permission: course:view-catalog
 * Navigation Redesign Phase 5 - 2026-02-05
 */

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { useCourses, type CourseListItem } from '@/entities/course';
import { useDepartment } from '@/entities/department';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Loader2,
  Building2,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { useDepartmentContext } from '@/shared/hooks';

export const LearnerDepartmentCoursesPage: React.FC = () => {
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

  // Switch to this department when page loads (if different from current)
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

  // State
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);

  // Fetch courses for this department (only published for learners)
  const { data, isLoading, error } = useCourses({
    department: deptId,
    status: 'published',
    search: search || undefined,
    page,
    limit: 12,
  });

  // Loading state
  if (isDeptLoading || isSwitching) {
    return (
      <div className="space-y-8 p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
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
        <span className="text-foreground">Courses</span>
      </nav>

      {/* Header */}
      <PageHeader
        title={`${department.name} Courses`}
        description={`Browse available courses in the ${department.name} department`}
      >
        <Badge variant="outline" className="gap-1">
          <Building2 className="h-3 w-3" />
          {department.name}
        </Badge>
      </PageHeader>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">
              Failed to load courses. Please try again later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && !error && (
        <>
          {data?.courses && data.courses.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.courses.map((course) => (
                <LearnerCourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No courses found</h3>
                <p className="text-center text-muted-foreground">
                  {search
                    ? 'No courses match your search. Try different keywords.'
                    : 'There are no published courses in this department yet.'}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={!data.pagination.hasPrev}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!data.pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

// Course Card for Learners
const LearnerCourseCard: React.FC<{ course: CourseListItem }> = ({ course }) => {
  return (
    <Card className="group transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground">{course.code}</span>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        {course.description && (
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.moduleCount} modules</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration}h</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{course.enrollmentCount} enrolled</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" asChild>
          <Link to={`/learner/catalog/${course.id}`}>
            <Play className="mr-2 h-4 w-4" />
            View Course
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
