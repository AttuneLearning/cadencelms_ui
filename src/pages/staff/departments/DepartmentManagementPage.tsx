/**
 * Department Management Page
 * Allows department-admins to manage subdepartments, programs, and certificates
 * UI-ISS-049
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import { useDepartmentHierarchy } from '@/entities/department';
import { Building2, FolderTree, GraduationCap, Award } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const { currentDepartmentName, currentDepartmentId, switchDepartment, isSwitching } = useDepartmentContext();

  // Sync department context with URL
  React.useEffect(() => {
    if (deptId && currentDepartmentId !== deptId && !isSwitching) {
      switchDepartment(deptId);
    }
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Fetch department hierarchy for subdepartments
  const { data: hierarchy, isLoading: isLoadingHierarchy } = useDepartmentHierarchy(deptId || '', {
    enabled: !!deptId,
  });

  const subdepartmentCount = hierarchy?.children?.length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Management"
        description={currentDepartmentName || 'Manage subdepartments, programs, and certificates'}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subdepartments</CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingHierarchy ? '...' : subdepartmentCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Child departments under this department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Course programs in this department
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">
              Certificate templates configured
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subdepartments Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Subdepartments
              </CardTitle>
              <CardDescription>
                Manage child departments under {currentDepartmentName || 'this department'}
              </CardDescription>
            </div>
            {/* TODO: Add "New Subdepartment" button */}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingHierarchy ? (
            <p className="text-muted-foreground">Loading subdepartments...</p>
          ) : subdepartmentCount === 0 ? (
            <p className="text-muted-foreground">
              No subdepartments found. Create one to organize your department structure.
            </p>
          ) : (
            <div className="space-y-2">
              {hierarchy?.children?.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {child.code || 'No code'}
                      </p>
                    </div>
                  </div>
                  {/* TODO: Add edit/view actions */}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Programs
              </CardTitle>
              <CardDescription>
                Manage course programs and certificate configurations
              </CardDescription>
            </div>
            {/* TODO: Add "New Program" button */}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Program management coming soon. Waiting for API endpoints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentManagementPage;
