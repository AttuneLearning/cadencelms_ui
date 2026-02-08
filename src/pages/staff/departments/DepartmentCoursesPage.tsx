/**
 * Department Courses Page
 * Admin view of ALL courses within a specific department
 * 
 * Features:
 * - Lists all courses in the department (not just user's courses)
 * - Filter by status, instructor, search
 * - Bulk actions (archive, publish)
 * - Create course button (pre-fills department)
 * 
 * Route: /staff/departments/:deptId/courses
 * Permission: content:courses:read
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  useCourses,
  type CourseListItem,
  type CourseStatus,
  type CourseFilters,
} from '@/entities/course';
import { useDepartment } from '@/entities/department';
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Users,
  Settings,
  Filter,
  X,
  Loader2,
  Building2,
  Eye,
  ChevronLeft,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { formatDistanceToNow } from 'date-fns';
import { useDepartmentContext } from '@/shared/hooks';
import { CourseActionMenu } from '@/features/course-actions';

export const DepartmentCoursesPage: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const navigate = useNavigate();
  
  // Get department context and permission checking
  const { 
    hasPermission, 
    switchDepartment, 
    currentDepartmentId,
    isSwitching 
  } = useDepartmentContext();

  // Fetch department details
  const { 
    data: department, 
    isLoading: isDeptLoading, 
    error: deptError 
  } = useDepartment(deptId!);

  // Track if this is initial mount to distinguish from user clearing selection
  const isInitialMountRef = React.useRef(true);

  // Switch to this department when page loads (if different from current)
  React.useEffect(() => {
    if (deptId && currentDepartmentId !== deptId && !isSwitching) {
      // Don't auto-switch if user explicitly cleared selection (currentDepartmentId is null)
      // Only auto-switch on initial mount or when navigating to a different department
      if (currentDepartmentId === null && !isInitialMountRef.current) {
        // User cleared selection via sidebar - don't re-select, let them choose
        return;
      }
      switchDepartment(deptId);
    }
    isInitialMountRef.current = false;
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Check permissions (API uses content:courses:manage for create/edit)
  const canCreateCourse = hasPermission('content:courses:manage');
  const canEditCourses = hasPermission('content:courses:manage');

  // State
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<CourseFilters>({
    page: 1,
    limit: 12,
    department: deptId,
    status: undefined,
    search: undefined,
  });

  // Update department filter when deptId changes
  React.useEffect(() => {
    setFilters(prev => ({ ...prev, department: deptId, page: 1 }));
  }, [deptId]);

  // Fetch courses for this department
  const { data, isLoading, error, refetch } = useCourses(filters);

  // Handlers
  const handleCreateCourse = () => {
    navigate(`/staff/departments/${deptId}/courses/create`);
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/staff/courses/${courseId}/edit`);
  };

  const handlePreviewCourse = (courseId: string) => {
    navigate(`/staff/courses/${courseId}/preview`);
  };

  const handleFilterChange = (key: keyof CourseFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      department: deptId,
      status: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = Boolean(filters.status || filters.search);

  // Loading state for department or switching context
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

  // Error state for department
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
              <Button variant="outline" onClick={() => navigate('/staff/dashboard')}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/staff/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{department.name}</span>
        <span>/</span>
        <span className="text-foreground">Courses</span>
      </nav>

      {/* Header */}
      <PageHeader
        title={`${department.name} Courses`}
        description={`Manage all courses in the ${department.name} department`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {department.name}
          </Badge>
          {canCreateCourse && (
            <Button onClick={handleCreateCourse} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Course
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search courses by title or code..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={hasActiveFilters ? 'border-primary' : ''}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange('status', value === 'all' ? undefined : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
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
                <DepartmentCourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => handleEditCourse(course.id)}
                  onPreview={() => handlePreviewCourse(course.id)}
                  canEdit={canEditCourses}
                  onActionComplete={() => refetch()}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No courses found</h3>
                <p className="mb-4 text-center text-muted-foreground">
                  {hasActiveFilters
                    ? 'No courses match your search criteria. Try adjusting your filters.'
                    : `This department doesn't have any courses yet.`}
                </p>
                {!hasActiveFilters && canCreateCourse && (
                  <Button onClick={handleCreateCourse}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Course
                  </Button>
                )}
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
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!data.pagination.hasNext}
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

// Department Course Card Component
interface DepartmentCourseCardProps {
  course: CourseListItem;
  onEdit: () => void;
  onPreview: () => void;
  canEdit: boolean;
  onActionComplete?: () => void;
}

const DepartmentCourseCard: React.FC<DepartmentCourseCardProps> = ({
  course,
  onEdit,
  onPreview,
  canEdit,
  onActionComplete,
}) => {
  return (
    <Card className="group transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant={getStatusVariant(course.status)}>
                {formatStatus(course.status)}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                {course.code}
              </span>
            </div>
            <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          </div>
          {/* Action Menu */}
          <CourseActionMenu
            course={course}
            canEdit={canEdit}
            onActionComplete={onActionComplete}
          />
        </div>
        {course.description && (
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {/* Stats */}
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

          {/* Last Updated */}
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onPreview} className="flex-1">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Button>
        <Button onClick={onEdit} className="flex-1" disabled={!canEdit}>
          <Settings className="mr-2 h-4 w-4" />
          {canEdit ? 'Edit' : 'View'}
        </Button>
      </CardFooter>
    </Card>
  );
};

// Helper functions
function formatStatus(status: CourseStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'published':
      return 'Published';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}

function getStatusVariant(status: CourseStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'published':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'secondary';
  }
}
