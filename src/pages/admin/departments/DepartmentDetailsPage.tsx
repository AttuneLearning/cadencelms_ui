/**
 * Department Details Page
 * Comprehensive department view with staff management, statistics, and programs
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent } from '@/shared/ui/card';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import {
  useDepartment,
  useDepartmentStats,
} from '@/entities/department';
import { DepartmentOverviewCard } from './components/DepartmentOverviewCard';
import { DepartmentStatsCards } from './components/DepartmentStatsCards';
import { DepartmentStaffSection } from './components/DepartmentStaffSection';

export const DepartmentDetailsPage: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('staff');

  // Fetch department data
  const { data: department, isLoading: isLoadingDepartment, error: departmentError } = useDepartment(
    departmentId!
  );
  const { data: stats, isLoading: isLoadingStats } = useDepartmentStats(departmentId!, {
    includeChildDepartments: false,
  });

  // Handle edit department
  const handleEdit = () => {
    // Navigate back to department management with edit mode
    // For now, just navigate to management page
    navigate('/admin/departments');
  };

  // Loading state
  if (isLoadingDepartment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading department...</span>
      </div>
    );
  }

  // Error state
  if (departmentError || !department) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-destructive mb-2">Department Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The department you're looking for doesn't exist or you don't have permission to
              view it.
            </p>
            <Button onClick={() => navigate('/admin/departments')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Departments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title={department.name}
        description={`Department Code: ${department.code}`}
        backButton={
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/departments')}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        }
      >
        <Button variant="outline" onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Department
        </Button>
      </PageHeader>

      {/* Department Overview Card */}
      <DepartmentOverviewCard department={department} />

      {/* Statistics Cards */}
      <DepartmentStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">
            Staff {stats && `(${stats.staff.total})`}
          </TabsTrigger>
          <TabsTrigger value="programs">
            Programs {stats && `(${stats.programs.total})`}
          </TabsTrigger>
          <TabsTrigger value="courses">
            Courses {stats && `(${stats.courses.total})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <DepartmentStaffSection
                departmentId={departmentId!}
                departmentName={department.name}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  Programs view coming soon. Use the Programs Management page to manage programs.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/admin/programs')}
                >
                  Go to Programs Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  Courses view coming soon. Use the Course Management page to manage courses.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/admin/courses')}
                >
                  Go to Course Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
