/**
 * DepartmentEnrollmentPage
 *
 * Staff page for managing course enrollments within a department.
 * Allows direct course enrollment without requiring a class.
 *
 * Path: /staff/departments/:deptId/enrollments
 *
 * Features:
 * - Select a course to manage enrollments
 * - View current enrollments for selected course
 * - Bulk enroll learners directly in course
 * - Filter enrollments by status
 * - Search enrolled learners
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Users,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
  Loader2,
  GraduationCap,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Progress,
} from '@/shared/ui';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { PageHeader } from '@/shared/ui/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import { useDepartment } from '@/entities/department/model/useDepartment';
import { useCourseEnrollments } from '@/entities/enrollment/hooks/useEnrollments';
import { useCourses } from '@/entities/course/model/useCourse';
import { useDepartmentContext } from '@/shared/hooks';
import { EnrollCourseDialog } from '@/features/enrollment';
import type { EnrollmentStatus } from '@/entities/enrollment/model/types';

// Enrollment status configuration
const STATUS_CONFIG: Record<
  EnrollmentStatus,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: CheckCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', icon: XCircle },
  suspended: { label: 'Suspended', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: AlertCircle },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: Clock },
};

export function DepartmentEnrollmentPage() {
  const { deptId } = useParams<{ deptId: string }>();
  const {
    hasPermission,
    switchDepartment,
    currentDepartmentId,
    isSwitching
  } = useDepartmentContext();

  // State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);

  // Track if this is initial mount
  const isInitialMountRef = useRef(true);

  // Switch to the department from the URL if needed
  useEffect(() => {
    if (deptId && deptId !== currentDepartmentId && !isSwitching) {
      if (currentDepartmentId === null && !isInitialMountRef.current) {
        return;
      }
      switchDepartment(deptId);
    }
    isInitialMountRef.current = false;
  }, [deptId, currentDepartmentId, isSwitching, switchDepartment]);

  // Fetch department details
  const { data: department, isLoading: isDepartmentLoading } = useDepartment(deptId || '');

  // Fetch courses for the department
  const { data: coursesData, isLoading: isCoursesLoading, error: coursesError } = useCourses(
    {
      department: deptId,
      status: 'published',
      limit: 100,
    },
    {
      enabled: !!deptId, // Only fetch when deptId is available
    }
  );

  // Debug logging for course fetch issues
  if (import.meta.env.DEV) {
    console.log('[DepartmentEnrollmentPage] Course query state:', {
      deptId,
      isCoursesLoading,
      coursesError: coursesError?.message,
      courseCount: coursesData?.courses?.length ?? 'no data',
    });
  }

  // Fetch enrollments for selected course
  const {
    data: enrollmentsData,
    isLoading: isEnrollmentsLoading,
    refetch: refetchEnrollments,
  } = useCourseEnrollments(
    selectedCourseId,
    statusFilter !== 'all' ? { status: statusFilter } : undefined,
    { enabled: !!selectedCourseId }
  );

  // Permission check
  const canManageEnrollments = hasPermission('enrollment:department:manage');
  const canViewEnrollments = hasPermission('enrollment:department:read') || canManageEnrollments;

  // Get selected course details
  const selectedCourse = useMemo(() => {
    return coursesData?.courses.find(c => c.id === selectedCourseId);
  }, [coursesData, selectedCourseId]);

  // Filter enrollments by search term
  const filteredEnrollments = useMemo(() => {
    if (!enrollmentsData?.enrollments) return [];

    return enrollmentsData.enrollments.filter((enrollment) => {
      const learner = enrollment.learner;
      const matchesSearch =
        searchTerm === '' ||
        `${learner.firstName} ${learner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        learner.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [enrollmentsData, searchTerm]);

  // Stats for selected course
  const stats = enrollmentsData?.stats;

  if (isDepartmentLoading || isSwitching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!canViewEnrollments) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Access Denied</p>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have permission to view enrollments for this department.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <PageHeader
        title="Course Enrollments"
        description={`Manage course enrollments for ${department?.name || 'this department'}`}
      />

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Course
          </CardTitle>
          <CardDescription>
            Choose a course to view and manage its enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coursesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load courses: {coursesError.message}
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={isCoursesLoading || !coursesData?.courses?.length}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isCoursesLoading
                        ? "Loading courses..."
                        : !coursesData?.courses?.length
                          ? "No published courses found"
                          : "Select a course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {coursesData?.courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      <div className="flex items-center gap-2">
                        <span>{course.title}</span>
                        {course.code && (
                          <Badge variant="outline" className="text-xs">
                            {course.code}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCourseId && canManageEnrollments && (
              <Button onClick={() => setIsEnrollDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Enroll Learners
              </Button>
            )}
          </div>
          {!isCoursesLoading && coursesData?.courses?.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
              No published courses found in this department. Courses must be published to allow enrollments.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards - Show when course is selected */}
      {selectedCourseId && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Enrolled</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{Math.round(stats.averageProgress)}%</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enrollments List */}
      {selectedCourseId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Enrolled Learners</CardTitle>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search learners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as EnrollmentStatus | 'all')}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEnrollmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEnrollments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {searchTerm ? 'No learners match your search' : 'No enrollments found for this course'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredEnrollments.map((enrollment) => {
                  const statusConfig = STATUS_CONFIG[enrollment.status];
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={enrollment.learner.profileImage || undefined} />
                        <AvatarFallback>
                          {enrollment.learner.firstName[0]}
                          {enrollment.learner.lastName[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          {enrollment.learner.firstName} {enrollment.learner.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {enrollment.learner.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{enrollment.progress.percentage}%</span>
                          </div>
                          <Progress value={enrollment.progress.percentage} className="h-2" />
                        </div>

                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>

                        {enrollment.grade.score !== null && (
                          <Badge variant="outline">
                            {enrollment.grade.letter || `${enrollment.grade.score}%`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state when no course selected */}
      {!selectedCourseId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Select a Course</p>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Choose a course from the dropdown above to view its enrollments and add new learners.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enroll Dialog */}
      {selectedCourse && (
        <EnrollCourseDialog
          open={isEnrollDialogOpen}
          courseId={selectedCourseId}
          courseName={selectedCourse.title}
          departmentId={deptId}
          onClose={() => setIsEnrollDialogOpen(false)}
          onSuccess={() => {
            refetchEnrollments();
          }}
        />
      )}
    </div>
  );
}
