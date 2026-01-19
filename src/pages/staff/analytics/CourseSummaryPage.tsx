/**
 * Course Summary Page
 * Aggregated analytics across all courses within the user's accessible departments
 * 
 * Features:
 * - Default view: All departments where user has department-admin or content-admin role
 * - Filtered view: When department(s) selected, shows only those departments
 * - Key metrics: Total courses, enrollments, completion rates, avg scores
 * - Breakdown by department, course status, and time period
 * 
 * Required Roles: department-admin, content-admin
 * Route: /staff/analytics/courses
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '@/shared/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard, LineChart, PieChart } from '@/widgets/analytics';
import { useToast } from '@/shared/ui/use-toast';
import { useNavigationStore } from '@/shared/stores/navigationStore';
import { useAuthStore } from '@/features/auth/model/authStore';
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Download,
  BarChart3,
  Building2,
  Loader2,
  Info,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// Types for course summary analytics
interface DepartmentSummary {
  departmentId: string;
  departmentName: string;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  completions: number;
  completionRate: number;
  averageScore: number;
  activeStudents: number;
}

interface CourseSummaryMetrics {
  totalDepartments: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalEnrollments: number;
  totalCompletions: number;
  overallCompletionRate: number;
  averageScore: number;
  totalActiveStudents: number;
  departmentBreakdown: DepartmentSummary[];
  enrollmentTrends: Array<{
    period: string;
    enrollments: number;
    completions: number;
  }>;
  courseStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  topCourses: Array<{
    courseId: string;
    courseName: string;
    departmentName: string;
    enrollments: number;
    completionRate: number;
  }>;
}

// Mock data - will be replaced with actual API
const mockCourseSummary: CourseSummaryMetrics = {
  totalDepartments: 5,
  totalCourses: 48,
  publishedCourses: 35,
  draftCourses: 10,
  archivedCourses: 3,
  totalEnrollments: 1250,
  totalCompletions: 876,
  overallCompletionRate: 70.1,
  averageScore: 78.5,
  totalActiveStudents: 342,
  departmentBreakdown: [
    {
      departmentId: '1',
      departmentName: 'Computer Science',
      totalCourses: 15,
      publishedCourses: 12,
      draftCourses: 3,
      totalEnrollments: 420,
      completions: 310,
      completionRate: 73.8,
      averageScore: 82.1,
      activeStudents: 98,
    },
    {
      departmentId: '2',
      departmentName: 'Business Administration',
      totalCourses: 12,
      publishedCourses: 10,
      draftCourses: 2,
      totalEnrollments: 380,
      completions: 265,
      completionRate: 69.7,
      averageScore: 76.4,
      activeStudents: 85,
    },
    {
      departmentId: '3',
      departmentName: 'Engineering',
      totalCourses: 10,
      publishedCourses: 8,
      draftCourses: 2,
      totalEnrollments: 250,
      completions: 168,
      completionRate: 67.2,
      averageScore: 79.8,
      activeStudents: 72,
    },
    {
      departmentId: '4',
      departmentName: 'Marketing',
      totalCourses: 8,
      publishedCourses: 5,
      draftCourses: 3,
      totalEnrollments: 150,
      completions: 98,
      completionRate: 65.3,
      averageScore: 74.2,
      activeStudents: 55,
    },
    {
      departmentId: '5',
      departmentName: 'Human Resources',
      totalCourses: 3,
      publishedCourses: 0,
      draftCourses: 0,
      totalEnrollments: 50,
      completions: 35,
      completionRate: 70.0,
      averageScore: 80.1,
      activeStudents: 32,
    },
  ],
  enrollmentTrends: [
    { period: 'Jan', enrollments: 145, completions: 98 },
    { period: 'Feb', enrollments: 168, completions: 112 },
    { period: 'Mar', enrollments: 192, completions: 135 },
    { period: 'Apr', enrollments: 210, completions: 148 },
    { period: 'May', enrollments: 245, completions: 178 },
    { period: 'Jun', enrollments: 290, completions: 205 },
  ],
  courseStatusDistribution: [
    { status: 'Published', count: 35 },
    { status: 'Draft', count: 10 },
    { status: 'Archived', count: 3 },
  ],
  topCourses: [
    { courseId: '1', courseName: 'Introduction to Programming', departmentName: 'Computer Science', enrollments: 156, completionRate: 82.3 },
    { courseId: '2', courseName: 'Project Management Fundamentals', departmentName: 'Business Administration', enrollments: 134, completionRate: 78.5 },
    { courseId: '3', courseName: 'Data Structures & Algorithms', departmentName: 'Computer Science', enrollments: 98, completionRate: 71.2 },
    { courseId: '4', courseName: 'Business Communication', departmentName: 'Business Administration', enrollments: 87, completionRate: 85.1 },
    { courseId: '5', courseName: 'Engineering Ethics', departmentName: 'Engineering', enrollments: 76, completionRate: 68.9 },
  ],
};

export const CourseSummaryPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { selectedDepartmentId } = useNavigationStore();
  const { roleHierarchy } = useAuthStore();

  // Get user's staff department memberships where user has department-admin or content-admin
  const userStaffDepartments = useMemo(() => {
    if (!roleHierarchy?.staffRoles?.departmentRoles) return [];
    return roleHierarchy.staffRoles.departmentRoles
      .filter(dr => 
        dr.roles.some(r => r.role === 'department-admin') || 
        dr.roles.some(r => r.role === 'content-admin')
      )
      .map(dr => ({
        id: dr.departmentId,
        name: dr.departmentName,
      }));
  }, [roleHierarchy]);

  // Determine which departments to show based on selection
  const activeDepartmentIds = useMemo(() => {
    if (selectedDepartmentId) {
      // If a department is selected and user has access, show only that one
      const hasAccess = userStaffDepartments.some(d => d.id === selectedDepartmentId);
      return hasAccess ? [selectedDepartmentId] : userStaffDepartments.map(d => d.id);
    }
    // No department selected - show all accessible departments
    return userStaffDepartments.map(d => d.id);
  }, [selectedDepartmentId, userStaffDepartments]);

  // TODO: Replace with actual API call
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['course-summary', activeDepartmentIds, timeRange],
  //   queryFn: () => courseSummaryApi.getMetrics({ departmentIds: activeDepartmentIds, timeRange }),
  // });

  // For now, filter mock data based on selected departments
  const filteredData = useMemo(() => {
    if (activeDepartmentIds.length === 0) return mockCourseSummary;
    
    const filteredDepts = mockCourseSummary.departmentBreakdown.filter(
      d => activeDepartmentIds.includes(d.departmentId)
    );
    
    // Recalculate totals based on filtered departments
    const totalCourses = filteredDepts.reduce((sum, d) => sum + d.totalCourses, 0);
    const publishedCourses = filteredDepts.reduce((sum, d) => sum + d.publishedCourses, 0);
    const draftCourses = filteredDepts.reduce((sum, d) => sum + d.draftCourses, 0);
    const totalEnrollments = filteredDepts.reduce((sum, d) => sum + d.totalEnrollments, 0);
    const totalCompletions = filteredDepts.reduce((sum, d) => sum + d.completions, 0);
    const activeStudents = filteredDepts.reduce((sum, d) => sum + d.activeStudents, 0);
    
    return {
      ...mockCourseSummary,
      totalDepartments: filteredDepts.length,
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      totalCompletions,
      overallCompletionRate: totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0,
      totalActiveStudents: activeStudents,
      departmentBreakdown: filteredDepts,
      topCourses: mockCourseSummary.topCourses.filter(c => 
        filteredDepts.some(d => d.departmentName === c.departmentName)
      ),
    };
  }, [activeDepartmentIds]);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setIsExporting(true);
    try {
      // TODO: Implement export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Export Complete',
        description: `Course summary exported as ${format.toUpperCase()}`,
      });
    } catch {
      toast({
        title: 'Export Failed',
        description: 'Unable to export report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = false; // Replace with actual loading state

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Course Summary"
        description="Aggregated analytics across all courses in your departments"
      />

      {/* Scope Indicator */}
      <Card className="bg-muted/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Showing data for:</span>
            {selectedDepartmentId ? (
              <Badge variant="secondary" className="gap-1">
                <Building2 className="h-3 w-3" />
                {userStaffDepartments.find(d => d.id === selectedDepartmentId)?.name || 'Selected Department'}
              </Badge>
            ) : (
              <div className="flex items-center gap-1">
                <Badge variant="outline">{filteredData.totalDepartments} departments</Badge>
                <span className="text-muted-foreground text-xs">
                  (all departments where you are department-admin or content-admin)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Courses"
            value={filteredData.totalCourses}
            icon={BookOpen}
            description={`${filteredData.publishedCourses} published, ${filteredData.draftCourses} draft`}
          />
          <StatCard
            title="Total Enrollments"
            value={filteredData.totalEnrollments.toLocaleString()}
            icon={Users}
            description={`${filteredData.totalActiveStudents} active students`}
          />
          <StatCard
            title="Completion Rate"
            value={`${filteredData.overallCompletionRate.toFixed(1)}%`}
            icon={TrendingUp}
            description={`${filteredData.totalCompletions.toLocaleString()} completions`}
            trend={{ value: 5.2, isPositive: true }}
          />
          <StatCard
            title="Average Score"
            value={`${filteredData.averageScore.toFixed(1)}%`}
            icon={Award}
            description="Across all assessments"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Enrollment Trends */}
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <LineChart
            title="Enrollment Trends"
            description="Enrollments and completions over time"
            data={filteredData.enrollmentTrends}
            xAxisKey="period"
            lines={[
              { dataKey: 'enrollments', name: 'Enrollments', color: '#3b82f6' },
              { dataKey: 'completions', name: 'Completions', color: '#22c55e' },
            ]}
          />
        )}

        {/* Course Status Distribution */}
        {isLoading ? (
          <Skeleton className="h-80" />
        ) : (
          <PieChart
            title="Course Status"
            description="Distribution by publication status"
            data={filteredData.courseStatusDistribution.map(d => ({
              name: d.status,
              value: d.count,
            }))}
            colors={['#22c55e', '#f59e0b', '#6b7280']}
          />
        )}
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Department Breakdown
          </CardTitle>
          <CardDescription>Performance metrics by department</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : filteredData.departmentBreakdown.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No departments to display</p>
              <p className="text-sm">You need department-admin or content-admin role to view analytics</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredData.departmentBreakdown.map((dept) => (
                <div
                  key={dept.departmentId}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{dept.departmentName}</div>
                    <div className="text-sm text-muted-foreground">
                      {dept.totalCourses} courses • {dept.totalEnrollments} enrollments • {dept.activeStudents} active
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-sm font-medium">{dept.completionRate.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Completion</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">{dept.averageScore.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Top Performing Courses
          </CardTitle>
          <CardDescription>Courses with highest enrollment and completion</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : filteredData.topCourses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No courses to display</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredData.topCourses.map((course, index) => (
                <div
                  key={course.courseId}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                    index === 0 && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    index === 1 && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                    index === 2 && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    index > 2 && "bg-muted text-muted-foreground"
                  )}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{course.courseName}</div>
                    <div className="text-sm text-muted-foreground">{course.departmentName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{course.enrollments} enrolled</div>
                    <div className="text-sm text-muted-foreground">{course.completionRate}% completion</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
