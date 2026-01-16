/**
 * Staff Courses Page
 * List of courses the staff member teaches or can edit
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '@/features/auth/model/authStore';

export const StaffCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Check if user is billing-admin (read-only access)
  const isBillingAdmin = user?.roles?.includes('billing-admin');
  const isReadOnly = isBillingAdmin && !user?.roles?.includes('content-admin');

  // State
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<CourseFilters>({
    page: 1,
    limit: 12,
    status: undefined,
    search: undefined,
  });

  // Fetch courses
  const { data, isLoading, error } = useCourses(filters);

  // Handlers
  const handleCreateCourse = () => {
    navigate('/staff/courses/new');
  };

  const handleEditCourse = (courseId: string) => {
    navigate(`/staff/courses/${courseId}/edit`);
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
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
      status: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = Boolean(filters.status || filters.search);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground">
            {isReadOnly ? 'View course content (read-only access)' : 'Create and manage your course content'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isReadOnly && (
            <Badge variant="outline" className="border-amber-600 text-amber-600 bg-amber-50">
              View Only
            </Badge>
          )}
          {!isReadOnly && (
            <Button onClick={handleCreateCourse} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Course
            </Button>
          )}
        </div>
      </div>

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
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={() => handleEditCourse(course.id)}
                  isReadOnly={isReadOnly}
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
                    : 'Get started by creating your first course.'}
                </p>
                {!hasActiveFilters && (
                  <Button onClick={handleCreateCourse}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Course
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
            onClick={() => handleFilterChange('page', filters.page! - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!data.pagination.hasNext}
            onClick={() => handleFilterChange('page', filters.page! + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

// Course Card Component
interface CourseCardProps {
  course: CourseListItem;
  onEdit: () => void;
  isReadOnly?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, isReadOnly = false }) => {
  return (
    <Card className="group transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
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

          {/* Department */}
          <div className="pt-2">
            <Badge variant="outline" className="text-xs">
              {course.department.name}
            </Badge>
          </div>

          {/* Last Updated */}
          <p className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button onClick={onEdit} className="flex-1" disabled={isReadOnly}>
          <Settings className="mr-2 h-4 w-4" />
          {isReadOnly ? 'View Course' : 'Edit Course'}
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
