/**
 * DepartmentStudentsPage
 * 
 * Staff view of all students/enrollments within a specific department.
 * Provides enrollment management, progress tracking, and student oversight.
 * 
 * Path: /staff/departments/:deptId/students
 * 
 * Features:
 * - View all enrollments in the department
 * - Filter by status, type (program/course/class)
 * - Search students by name or email
 * - View progress and grades
 * - Manage enrollment status (withdraw, suspend, complete)
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Users,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  BookOpen,
  Calendar,
  Building,
  TrendingUp,
} from 'lucide-react';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from '@/shared/ui';
import { useDepartment } from '@/entities/department/model/useDepartment';
import { useEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import { useDepartmentContext } from '@/shared/hooks';
import type { EnrollmentStatus, EnrollmentType, EnrollmentListItem } from '@/entities/enrollment/model/types';

// Enrollment status configuration
const ENROLLMENT_STATUS_CONFIG: Record<
  EnrollmentStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800', icon: Clock },
};

// Enrollment type configuration  
const ENROLLMENT_TYPE_CONFIG: Record<EnrollmentType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  program: { label: 'Program', icon: GraduationCap },
  course: { label: 'Course', icon: BookOpen },
  class: { label: 'Class', icon: Calendar },
};

export function DepartmentStudentsPage() {
  const { deptId } = useParams<{ deptId: string }>();
  const { 
    hasPermission, 
    switchDepartment, 
    currentDepartmentId,
    isSwitching 
  } = useDepartmentContext();

  // Switch to the department from the URL if needed
  useEffect(() => {
    if (deptId && deptId !== currentDepartmentId) {
      switchDepartment(deptId);
    }
  }, [deptId, currentDepartmentId, switchDepartment]);

  // Fetch department details
  const { 
    data: department, 
    isLoading: isDeptLoading, 
    error: deptError 
  } = useDepartment(deptId || '');
  
  // Local state for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EnrollmentType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;

  // Build enrollment filters
  const enrollmentFilters = useMemo(() => ({
    department: deptId,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page,
    limit,
  }), [deptId, statusFilter, typeFilter, page]);

  // Fetch enrollments
  const { 
    data: enrollmentsData, 
    isLoading: isEnrollmentsLoading, 
    error: enrollmentsError 
  } = useEnrollments(enrollmentFilters, {
    enabled: !!deptId && !isSwitching,
  });

  // Filter enrollments by search query (client-side)
  const filteredEnrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];
    if (!searchQuery.trim()) return enrollmentsData.enrollments;
    
    const query = searchQuery.toLowerCase();
    return enrollmentsData.enrollments.filter((enrollment) => {
      const learnerName = `${enrollment.learner.firstName} ${enrollment.learner.lastName}`.toLowerCase();
      const learnerEmail = enrollment.learner.email.toLowerCase();
      const targetName = enrollment.target.name.toLowerCase();
      return learnerName.includes(query) || learnerEmail.includes(query) || targetName.includes(query);
    });
  }, [enrollmentsData?.enrollments, searchQuery]);

  // Permission checks
  const canViewEnrollments = hasPermission('enrollment:view-department');
  const canManageEnrollments = hasPermission('enrollment:manage-department');
  const canExport = hasPermission('enrollment:export-department');

  // Loading state
  if (isDeptLoading || isSwitching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading department...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (deptError || !department) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Department Not Found</CardTitle>
            <CardDescription>
              The department you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/staff/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Permission denied
  if (!canViewEnrollments) {
    return (
      <div className="p-6">
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-700">Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view student enrollments for this department.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/staff/dashboard">
              <Button variant="outline">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/staff/dashboard" className="hover:text-foreground transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/staff/departments" className="hover:text-foreground transition-colors">
          Departments
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link 
          to={`/staff/departments/${deptId}/overview`} 
          className="hover:text-foreground transition-colors"
        >
          {department.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Students</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{department.name} Students</h1>
            <Badge variant="secondary" className="font-mono">
              <Building className="h-3 w-3 mr-1" />
              {department.code}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Manage student enrollments and track progress
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {canExport && (
            <Button variant="outline" size="sm">
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Enrollments</span>
            </div>
            <p className="text-2xl font-bold mt-1">
              {enrollmentsData?.pagination.total ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {filteredEnrollments.filter(e => e.status === 'active').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {filteredEnrollments.filter(e => e.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-muted-foreground">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-purple-600">
              {filteredEnrollments.length > 0
                ? Math.round(
                    filteredEnrollments.reduce((sum, e) => sum + e.progress.percentage, 0) /
                      filteredEnrollments.length
                  )
                : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as EnrollmentStatus | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {(Object.keys(ENROLLMENT_STATUS_CONFIG) as EnrollmentStatus[]).map((status) => (
                      <SelectItem key={status} value={status}>
                        {ENROLLMENT_STATUS_CONFIG[status].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as EnrollmentType | 'all')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {(Object.keys(ENROLLMENT_TYPE_CONFIG) as EnrollmentType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {ENROLLMENT_TYPE_CONFIG[type].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollments List */}
      {isEnrollmentsLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading enrollments...</p>
          </div>
        </div>
      ) : enrollmentsError ? (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <p className="text-destructive">Failed to load enrollments. Please try again.</p>
          </CardContent>
        </Card>
      ) : filteredEnrollments.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Enrollments Found</h3>
            <p className="text-muted-foreground mt-1">
              {hasActiveFilters
                ? 'No enrollments match your current filters.'
                : 'There are no student enrollments in this department yet.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Enrollment Cards */}
          <div className="grid gap-4">
            {filteredEnrollments.map((enrollment) => (
              <EnrollmentCard 
                key={enrollment.id} 
                enrollment={enrollment} 
                canManage={canManageEnrollments}
              />
            ))}
          </div>

          {/* Pagination */}
          {enrollmentsData && enrollmentsData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, enrollmentsData.pagination.total)} of {enrollmentsData.pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!enrollmentsData.pagination.hasPrev}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {enrollmentsData.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!enrollmentsData.pagination.hasNext}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =====================
// SUB-COMPONENTS
// =====================

interface EnrollmentCardProps {
  enrollment: EnrollmentListItem;
  canManage: boolean;
}

function EnrollmentCard({ enrollment, canManage }: EnrollmentCardProps) {
  const statusConfig = ENROLLMENT_STATUS_CONFIG[enrollment.status];
  const typeConfig = ENROLLMENT_TYPE_CONFIG[enrollment.type];
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Learner Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {enrollment.learner.firstName.charAt(0)}
              {enrollment.learner.lastName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">
                  {enrollment.learner.firstName} {enrollment.learner.lastName}
                </h3>
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {enrollment.learner.email}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TypeIcon className="h-3.5 w-3.5" />
                  {typeConfig.label}: {enrollment.target.name}
                </span>
                <span>
                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{enrollment.progress.percentage}%</p>
              <div className="w-24">
                <Progress value={enrollment.progress.percentage} className="h-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {enrollment.progress.completedItems}/{enrollment.progress.totalItems} items
              </p>
            </div>

            {/* Grade if available */}
            {enrollment.grade.score !== null && (
              <div className="text-right border-l pl-4">
                <p className="text-lg font-bold">
                  {enrollment.grade.letter || enrollment.grade.score}
                </p>
                <p className="text-xs text-muted-foreground">
                  {enrollment.grade.passed ? 'Passed' : 'Not Passed'}
                </p>
              </div>
            )}

            {/* Actions */}
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    View Progress
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {enrollment.status === 'active' && (
                    <>
                      <DropdownMenuItem>
                        Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-yellow-600">
                        Suspend
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Withdraw
                      </DropdownMenuItem>
                    </>
                  )}
                  {enrollment.status === 'suspended' && (
                    <DropdownMenuItem>
                      Reactivate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DepartmentStudentsPage;
