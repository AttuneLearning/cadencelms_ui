/**
 * Department Management Page
 * Allows department-admins to manage subdepartments, programs, and certificates
 * UI-ISS-049
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import { useDepartmentHierarchy } from '@/entities/department';
import { usePrograms } from '@/entities/program';
import { Building2, FolderTree, GraduationCap, Award, Plus, MoreHorizontal, Loader2 } from 'lucide-react';

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

  // Fetch programs for this department
  const { data: programsData, isLoading: isLoadingPrograms } = usePrograms(
    { department: deptId },
    { enabled: !!deptId }
  );

  const subdepartmentCount = hierarchy?.children?.length || 0;
  const programCount = programsData?.programs?.length || 0;

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
            <div className="text-2xl font-bold">
              {isLoadingPrograms ? '...' : programCount}
            </div>
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
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Program
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPrograms ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : programCount === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No programs found. Create a program to group courses and issue certificates.
            </p>
          ) : (
            <div className="space-y-3">
              {programsData?.programs?.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{program.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {program.code}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {program.totalCourses || 0} courses • {program.credential || 'certificate'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                      {program.status || 'active'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
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

export default DepartmentManagementPage;
