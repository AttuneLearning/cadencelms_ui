/**
 * Department Classes Page
 * Admin view of ALL classes (sections) within a specific department
 * 
 * Features:
 * - Lists all classes in the department
 * - Filter by course, instructor, status, term
 * - View class roster and progress
 * - Create new class button
 * 
 * Route: /staff/departments/:deptId/classes
 * Permission: class:view-department
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
  useClasses,
  type ClassListItem,
  type ClassStatus,
  type ClassFilters,
} from '@/entities/class';
import { useDepartment } from '@/entities/department';
import {
  Plus,
  Search,
  Users,
  Filter,
  X,
  Building2,
  Eye,
  ChevronLeft,
  GraduationCap,
  Calendar,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { formatDistanceToNow } from 'date-fns';
import { useDepartmentContext } from '@/shared/hooks';

// Status badge variants
const statusVariants: Record<ClassStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  'upcoming': 'outline',
  'active': 'default',
  'completed': 'secondary',
  'cancelled': 'destructive',
};

const statusLabels: Record<ClassStatus, string> = {
  'upcoming': 'Upcoming',
  'active': 'Active',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
};

export const DepartmentClassesPage: React.FC = () => {
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
      if (currentDepartmentId === null && !isInitialMountRef.current) {
        return;
      }
      switchDepartment(deptId);
    }
    isInitialMountRef.current = false;
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Check permissions (API uses content:classes:manage)
  const canCreateClass = hasPermission('content:classes:manage');
  const canViewRoster = hasPermission('content:classes:read');

  // State
  const [showFilters, setShowFilters] = React.useState(false);
  const [filters, setFilters] = React.useState<ClassFilters>({
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

  // Fetch classes for this department
  const { data, isLoading, error } = useClasses(filters);

  // Handlers
  const handleCreateClass = () => {
    navigate(`/staff/departments/${deptId}/classes/create`);
  };

  const handleViewClass = (classId: string) => {
    navigate(`/staff/classes/${classId}`);
  };

  const handleViewRoster = (classId: string) => {
    navigate(`/staff/classes/${classId}/roster`);
  };

  const handleFilterChange = (key: keyof ClassFilters, value: unknown) => {
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

  const hasActiveFilters = Boolean(filters.status || filters.search || filters.course || filters.instructor);

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
        <span className="text-foreground">Classes</span>
      </nav>

      {/* Header */}
      <PageHeader
        title={`${department.name} Classes`}
        description={`Manage all classes (sections) in the ${department.name} department`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Building2 className="h-3 w-3" />
            {department.name}
          </Badge>
          {canCreateClass && (
            <Button onClick={handleCreateClass}>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant={hasActiveFilters ? 'secondary' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={handleClearFilters} className="gap-1">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t pt-4">
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
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Classes</h3>
              <p className="text-muted-foreground">
                Failed to load classes. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : !data?.classes || data.classes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Classes Found</h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'No classes match your filters. Try adjusting your search criteria.'
                  : `No classes have been created in ${department.name} yet.`}
              </p>
              {canCreateClass && !hasActiveFilters && (
                <Button onClick={handleCreateClass}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Class
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classItem={classItem}
              canViewRoster={canViewRoster}
              onView={() => handleViewClass(classItem.id)}
              onViewRoster={() => handleViewRoster(classItem.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={filters.page === 1}
            onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page || 1} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={(filters.page || 1) >= data.pagination.totalPages}
            onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// ClassCard Component
// ============================================================================

interface ClassCardProps {
  classItem: ClassListItem;
  canViewRoster: boolean;
  onView: () => void;
  onViewRoster: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  canViewRoster,
  onView,
  onViewRoster,
}) => {
  const status = classItem.status;

  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{classItem.name}</CardTitle>
          <Badge variant={statusVariants[status] || 'outline'}>
            {statusLabels[status] || status}
          </Badge>
        </div>
        {classItem.course && (
          <CardDescription className="line-clamp-1 flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {classItem.course.title}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{classItem.enrolledCount || 0} enrolled</span>
          </div>
          {classItem.capacity && (
            <span className="text-xs">
              / {classItem.capacity} max
            </span>
          )}
        </div>

        {/* Instructors */}
        {classItem.instructors && classItem.instructors.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <UserCheck className="h-4 w-4 text-muted-foreground" />
            <span className="line-clamp-1">
              {classItem.instructors.map(i => `${i.firstName} ${i.lastName}`).join(', ')}
            </span>
          </div>
        )}

        {/* Term/Schedule */}
        {classItem.academicTerm && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{classItem.academicTerm.name}</span>
          </div>
        )}

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(classItem.updatedAt), { addSuffix: true })}
        </p>
      </CardContent>

      <CardFooter className="pt-3 border-t gap-2">
        <Button variant="outline" className="flex-1" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
        {canViewRoster && (
          <Button variant="outline" onClick={onViewRoster}>
            <Users className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
