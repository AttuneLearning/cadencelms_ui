/**
 * Department Programs Page
 * Allows department-admins to manage programs and certificates within their department
 * UI-ISS-049
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useDepartmentContext } from '@/shared/hooks/useDepartmentContext';
import { useDepartmentHierarchy, DepartmentForm } from '@/entities/department';
import { usePrograms, useProgram, ProgramForm, CertificateConfigForm } from '@/entities/program';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/shared/ui/collapsible';
import { Building2, FolderTree, GraduationCap, Award, Plus, MoreHorizontal, Loader2, Settings, FileEdit, ChevronRight, ChevronDown } from 'lucide-react';

/**
 * Subdepartment Programs List
 * Displays programs for a specific subdepartment when expanded
 */
interface SubdepartmentProgramsListProps {
  subdeptId: string;
  onCertificateConfig: (program: { id: string; name: string }) => void;
  onEditProgram: (program: { id: string; name: string }) => void;
}

const SubdepartmentProgramsList: React.FC<SubdepartmentProgramsListProps> = ({
  subdeptId,
  onCertificateConfig,
  onEditProgram,
}) => {
  const { data, isLoading } = usePrograms(
    { department: subdeptId },
    { enabled: !!subdeptId }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.programs?.length) {
    return (
      <p className="text-sm text-muted-foreground py-2 pl-8">
        No programs in this subdepartment.
      </p>
    );
  }

  return (
    <div className="space-y-2 pl-8">
      {data.programs.map((program) => (
        <div
          key={program.id}
          className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
        >
          <div className="flex items-center gap-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{program.name}</p>
                <Badge variant="outline" className="text-xs">
                  {program.code}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {program.totalCourses || 0} courses
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditProgram({ id: program.id, name: program.name })}>
                <FileEdit className="h-4 w-4 mr-2" />
                Edit Program
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCertificateConfig({ id: program.id, name: program.name })}>
                <Award className="h-4 w-4 mr-2" />
                Certificate Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
};

export const DepartmentProgramsPage: React.FC = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const { currentDepartmentName, currentDepartmentId, switchDepartment, isSwitching } = useDepartmentContext();

  // Dialog state for creating programs
  const [isCreateProgramOpen, setIsCreateProgramOpen] = React.useState(false);

  // Dialog state for creating subdepartments
  const [isCreateSubdeptOpen, setIsCreateSubdeptOpen] = React.useState(false);

  // State for expanded subdepartments
  const [expandedSubdepts, setExpandedSubdepts] = React.useState<Set<string>>(new Set());

  // State for creating program in a specific subdepartment
  const [createProgramForSubdept, setCreateProgramForSubdept] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // State for including subdepartment programs in top-level list
  const [includeSubdepartments, setIncludeSubdepartments] = React.useState(false);

  // Dialog state for certificate configuration
  const [certificateConfigProgram, setCertificateConfigProgram] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // Dialog state for editing a program
  const [editingProgramId, setEditingProgramId] = React.useState<string | null>(null);

  // Fetch program details when editing
  const { data: editingProgram, isLoading: isLoadingEditProgram } = useProgram(
    editingProgramId || '',
    { enabled: !!editingProgramId }
  );

  // Sync department context with URL
  React.useEffect(() => {
    if (deptId && currentDepartmentId !== deptId && !isSwitching) {
      switchDepartment(deptId);
    }
  }, [deptId, currentDepartmentId, switchDepartment, isSwitching]);

  // Fetch department hierarchy for subdepartments
  const { data: hierarchy, isLoading: isLoadingHierarchy } = useDepartmentHierarchy(
    deptId || '',
    undefined,
    { enabled: !!deptId }
  );

  // Fetch programs for this department (optionally including subdepartments)
  const { data: programsData, isLoading: isLoadingPrograms } = usePrograms(
    { department: deptId, includeSubdepartments },
    { enabled: !!deptId }
  );

  const subdepartmentCount = hierarchy?.children?.length || 0;
  const programCount = programsData?.programs?.length || 0;

  // Toggle expanded state for a subdepartment
  const toggleSubdept = (subdeptId: string) => {
    setExpandedSubdepts((prev) => {
      const next = new Set(prev);
      if (next.has(subdeptId)) {
        next.delete(subdeptId);
      } else {
        next.add(subdeptId);
      }
      return next;
    });
  };

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
            <Button size="sm" onClick={() => setIsCreateSubdeptOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Subdepartment
            </Button>
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
            <div className="space-y-3">
              {hierarchy?.children?.map((child) => {
                const isExpanded = expandedSubdepts.has(child.id);
                return (
                  <Collapsible
                    key={child.id}
                    open={isExpanded}
                    onOpenChange={() => toggleSubdept(child.id)}
                  >
                    <div className="border rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <div className="text-left">
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {child.code || 'No code'}
                              </p>
                            </div>
                          </button>
                        </CollapsibleTrigger>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCreateProgramForSubdept({ id: child.id, name: child.name });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Program
                        </Button>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t px-3 py-3">
                          <SubdepartmentProgramsList
                            subdeptId={child.id}
                            onCertificateConfig={setCertificateConfigProgram}
                            onEditProgram={(p) => setEditingProgramId(p.id)}
                          />
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
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
            <div className="flex items-center gap-4">
              {subdepartmentCount > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="includeSubdepts"
                    checked={includeSubdepartments}
                    onCheckedChange={(checked) => setIncludeSubdepartments(checked === true)}
                  />
                  <Label htmlFor="includeSubdepts" className="text-sm cursor-pointer">
                    Include subdepartments
                  </Label>
                </div>
              )}
              <Button size="sm" onClick={() => setIsCreateProgramOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Program
              </Button>
            </div>
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
                        {includeSubdepartments && program.department.id !== deptId && (
                          <Badge variant="secondary" className="text-xs">
                            {program.department.name}
                          </Badge>
                        )}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingProgramId(program.id)}>
                          <FileEdit className="h-4 w-4 mr-2" />
                          Edit Program
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            setCertificateConfigProgram({
                              id: program.id,
                              name: program.name,
                            })
                          }
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Certificate Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Program Settings
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Subdepartment Dialog */}
      <Dialog open={isCreateSubdeptOpen} onOpenChange={setIsCreateSubdeptOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Create Subdepartment
            </DialogTitle>
          </DialogHeader>
          <DepartmentForm
            availableParents={
              deptId
                ? [{ id: deptId, name: currentDepartmentName || '', code: hierarchy?.current?.code || '' }]
                : []
            }
            defaultParentId={deptId}
            onSuccess={() => setIsCreateSubdeptOpen(false)}
            onCancel={() => setIsCreateSubdeptOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Program Dialog (top-level department) */}
      <Dialog open={isCreateProgramOpen} onOpenChange={setIsCreateProgramOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Program</DialogTitle>
          </DialogHeader>
          <ProgramForm
            availableDepartments={
              hierarchy
                ? [
                    { id: deptId || '', name: currentDepartmentName || '', code: hierarchy?.current?.code || '' },
                    ...(hierarchy.children?.map((c) => ({ id: c.id, name: c.name, code: c.code || '' })) || []),
                  ]
                : deptId
                ? [{ id: deptId, name: currentDepartmentName || '', code: '' }]
                : []
            }
            onSuccess={() => setIsCreateProgramOpen(false)}
            onCancel={() => setIsCreateProgramOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Create Program Dialog (for subdepartment) */}
      <Dialog
        open={!!createProgramForSubdept}
        onOpenChange={(open) => !open && setCreateProgramForSubdept(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Create Program in {createProgramForSubdept?.name}
            </DialogTitle>
          </DialogHeader>
          {createProgramForSubdept && (
            <ProgramForm
              availableDepartments={[
                {
                  id: createProgramForSubdept.id,
                  name: createProgramForSubdept.name,
                  code: hierarchy?.children?.find((c) => c.id === createProgramForSubdept.id)?.code || '',
                },
              ]}
              onSuccess={() => setCreateProgramForSubdept(null)}
              onCancel={() => setCreateProgramForSubdept(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Certificate Configuration Dialog */}
      <Dialog
        open={!!certificateConfigProgram}
        onOpenChange={(open) => !open && setCertificateConfigProgram(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Configuration
            </DialogTitle>
          </DialogHeader>
          {certificateConfigProgram && (
            <CertificateConfigForm
              programId={certificateConfigProgram.id}
              programName={certificateConfigProgram.name}
              departmentId={deptId}
              onSuccess={() => setCertificateConfigProgram(null)}
              onCancel={() => setCertificateConfigProgram(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Program Dialog */}
      <Dialog
        open={!!editingProgramId}
        onOpenChange={(open) => !open && setEditingProgramId(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileEdit className="h-5 w-5" />
              Edit Program
            </DialogTitle>
          </DialogHeader>
          {isLoadingEditProgram ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : editingProgram ? (
            <ProgramForm
              program={editingProgram}
              availableDepartments={
                hierarchy
                  ? [
                      { id: deptId || '', name: currentDepartmentName || '', code: hierarchy.current?.code || '' },
                      ...(hierarchy.children?.map((c) => ({ id: c.id, name: c.name, code: c.code || '' })) || []),
                    ]
                  : deptId
                  ? [{ id: deptId, name: currentDepartmentName || '', code: '' }]
                  : []
              }
              onSuccess={() => setEditingProgramId(null)}
              onCancel={() => setEditingProgramId(null)}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentProgramsPage;
