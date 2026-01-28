/**
 * DepartmentReportsPage
 * 
 * Staff view of reports relevant to a specific department.
 * Allows generating and viewing department-scoped analytics.
 * 
 * Path: /staff/departments/:deptId/reports
 * 
 * Features:
 * - View recent report jobs for the department
 * - Quick report generation for common metrics
 * - Enrollment statistics
 * - Progress summaries
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronRight,
  Building,
  FileText,
  Download,
  BarChart3,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  PieChart,
  LineChart,
  Table2,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import { PageHeader } from '@/shared/ui/page-header';
import { useDepartment } from '@/entities/department/model/useDepartment';
import { useReportJobs } from '@/entities/report-job/hooks/useReportJobs';
import { useDepartmentContext } from '@/shared/hooks';
import type { ReportJobState } from '@/entities/report-job/model/types';

// Report type presets for quick generation
const QUICK_REPORTS = [
  {
    id: 'enrollment-summary',
    name: 'Enrollment Summary',
    description: 'Overview of current enrollments by status and type',
    icon: Users,
    category: 'enrollment',
  },
  {
    id: 'progress-report',
    name: 'Progress Report',
    description: 'Student progress across all courses and programs',
    icon: TrendingUp,
    category: 'progress',
  },
  {
    id: 'completion-rates',
    name: 'Completion Rates',
    description: 'Course and program completion statistics',
    icon: PieChart,
    category: 'completion',
  },
  {
    id: 'class-attendance',
    name: 'Class Attendance',
    description: 'Attendance records for active classes',
    icon: Calendar,
    category: 'attendance',
  },
  {
    id: 'grade-distribution',
    name: 'Grade Distribution',
    description: 'Distribution of grades across courses',
    icon: BarChart3,
    category: 'grades',
  },
  {
    id: 'activity-log',
    name: 'Activity Log',
    description: 'Recent learning activity in the department',
    icon: LineChart,
    category: 'activity',
  },
];

// Status colors for report jobs
const JOB_STATUS_CONFIG: Record<
  ReportJobState,
  { label: string; color: string }
> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  queued: { label: 'Queued', color: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800' },
  rendering: { label: 'Rendering', color: 'bg-yellow-100 text-yellow-800' },
  uploading: { label: 'Uploading', color: 'bg-blue-100 text-blue-800' },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-800' },
  downloaded: { label: 'Downloaded', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
  expired: { label: 'Expired', color: 'bg-orange-100 text-orange-800' },
};

export function DepartmentReportsPage() {
  const { deptId } = useParams<{ deptId: string }>();
  const { 
    hasPermission, 
    switchDepartment, 
    currentDepartmentId,
    isSwitching 
  } = useDepartmentContext();

  // Switch to the department from the URL if needed
  useEffect(() => {
    if (deptId && deptId !== currentDepartmentId && !isSwitching) {
      switchDepartment(deptId);
    }
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Fetch department details
  const { 
    data: department, 
    isLoading: isDeptLoading, 
    error: deptError 
  } = useDepartment(deptId || '');
  
  // Fetch recent report jobs (filtered by department via API if supported)
  const { 
    data: reportsData, 
    isLoading: isReportsLoading,
    refetch: refetchReports,
  } = useReportJobs(
    { 
      limit: 10,
      // Note: API may not support department filter - this is a placeholder
      // department: deptId,
    },
    {
      enabled: !!deptId && !isSwitching,
    }
  );

  // Tab state
  const [activeTab, setActiveTab] = useState('quick');

  // Permission checks
  const canViewReports = hasPermission('report:view-department');
  const canCreateReports = hasPermission('report:create-department');
  const canExportReports = hasPermission('report:export-department');

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
  if (!canViewReports) {
    return (
      <div className="p-6">
        <Card className="border-yellow-500">
          <CardHeader>
            <CardTitle className="text-yellow-700">Access Restricted</CardTitle>
            <CardDescription>
              You don't have permission to view reports for this department.
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

  const handleGenerateReport = (reportId: string) => {
    // TODO: Implement report generation
    console.log('Generate report:', reportId, 'for department:', deptId);
    // This would call the createReportJob mutation with appropriate parameters
  };

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
        <span className="text-foreground font-medium">Reports</span>
      </nav>

      {/* Page Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            {department.name} Reports
            <Badge variant="secondary" className="font-mono">
              <Building className="h-3 w-3 mr-1" />
              {department.code}
            </Badge>
          </span>
        }
        description="Generate and view analytics reports for this department"
      >
        {canCreateReports && (
          <Link to="/admin/reports/builder">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Advanced Report Builder
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="quick">
            <BarChart3 className="h-4 w-4 mr-2" />
            Quick Reports
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recent Reports
          </TabsTrigger>
        </TabsList>

        {/* Quick Reports Tab */}
        <TabsContent value="quick" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_REPORTS.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base">{report.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{report.description}</CardDescription>
                    <div className="flex items-center gap-2">
                      {canCreateReports ? (
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(report.id)}
                          className="flex-1"
                        >
                          Generate
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled className="flex-1">
                          Generate (No Permission)
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Recent Reports Tab */}
        <TabsContent value="recent" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Report Jobs</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => refetchReports()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isReportsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : !reportsData?.jobs?.length ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No Recent Reports</h3>
                  <p className="text-muted-foreground mt-1">
                    Generate a quick report above to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportsData.jobs.map((job) => {
                    const statusConfig = JOB_STATUS_CONFIG[job.state];
                    return (
                      <div 
                        key={job._id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Table2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h4 className="font-medium">{job.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                          {(job.state === 'ready' || job.state === 'downloaded') && canExportReports && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Department Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-600">--</p>
              <p className="text-sm text-blue-700">Active Students</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50">
              <TrendingUp className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-600">--</p>
              <p className="text-sm text-green-700">Completions (30d)</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <BarChart3 className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-600">--%</p>
              <p className="text-sm text-purple-700">Avg Progress</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-orange-50">
              <PieChart className="h-6 w-6 mx-auto text-orange-600 mb-2" />
              <p className="text-2xl font-bold text-orange-600">--%</p>
              <p className="text-sm text-orange-700">Completion Rate</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Statistics will be populated when the analytics API is connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default DepartmentReportsPage;
