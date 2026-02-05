/**
 * Course Management Page
 * Admin interface for managing courses with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import {
  CourseForm,
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  usePublishCourse,
  useUnpublishCourse,
  useArchiveCourse,
  useDuplicateCourse,
  canEditCourse,
  type CourseListItem,
  type CourseStatus,
  type ExportFormat,
  type CourseFilters,
} from '@/entities/course';
import { useCreateCourseVersion } from '@/entities/course-version';
import { useAuthStore } from '@/features/auth/model';
import { usePrograms } from '@/entities/program';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Copy,
  Archive,
  Download,
  Eye,
  EyeOff,
  FileText,
  Filter,
  X,
  Lock,
} from 'lucide-react';

type ActionDialogType = 'create' | 'edit' | 'delete' | 'publish' | 'unpublish' | 'archive' | 'duplicate' | 'export' | 'createVersion' | null;

export const CourseManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth for permission checks
  const { user, roleHierarchy } = useAuthStore();
  const userDepartmentRoles = React.useMemo(() => {
    if (!roleHierarchy?.staffRoles?.departmentRoles) return [];
    return roleHierarchy.staffRoles.departmentRoles.flatMap((dept) =>
      dept.roles.map((r) => ({
        departmentId: dept.departmentId,
        role: r.role,
      }))
    );
  }, [roleHierarchy]);

  // State management
  const [selectedCourses, setSelectedCourses] = React.useState<CourseListItem[]>([]);
  const [courseToEdit, setCourseToEdit] = React.useState<CourseListItem | null>(null);
  const [courseToAction, setCourseToAction] = React.useState<CourseListItem | null>(null);
  const [activeDialog, setActiveDialog] = React.useState<ActionDialogType>(null);
  const [showFilters, setShowFilters] = React.useState(false);

  // Filters state
  const [filters, setFilters] = React.useState<CourseFilters>({
    page: 1,
    limit: 10,
    status: undefined,
    department: undefined,
    program: undefined,
    instructor: undefined,
    search: undefined,
  });

  // Duplicate form state
  const [duplicateData, setDuplicateData] = React.useState({
    newCode: '',
    newTitle: '',
    includeModules: true,
    includeSettings: true,
  });

  // Export form state
  const [exportFormat, setExportFormat] = React.useState<ExportFormat>('json');

  // Version creation form state
  const [versionChangeNotes, setVersionChangeNotes] = React.useState('');

  // Fetch courses
  const { data, isLoading, error } = useCourses(filters);

  // Fetch programs for the dropdown (based on department filter if set)
  const { data: programsData, isLoading: programsLoading } = usePrograms(
    { department: filters.department, limit: 100 },
    { enabled: true }
  );

  // Mutations
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const publishMutation = usePublishCourse();
  const unpublishMutation = useUnpublishCourse();
  const archiveMutation = useArchiveCourse();
  const duplicateMutation = useDuplicateCourse();
  const createVersionMutation = useCreateCourseVersion();

  // Handlers
  const handleOpenDialog = (type: ActionDialogType, course?: CourseListItem) => {
    setActiveDialog(type);
    setCourseToAction(course || null);
    if (type === 'edit' && course) {
      setCourseToEdit(course);
    }
    if (type === 'duplicate' && course) {
      setDuplicateData({
        newCode: `${course.code}-COPY`,
        newTitle: `${course.title} (Copy)`,
        includeModules: true,
        includeSettings: true,
      });
    }
  };

  const handleCloseDialog = () => {
    setActiveDialog(null);
    setCourseToAction(null);
    setCourseToEdit(null);
    setDuplicateData({
      newCode: '',
      newTitle: '',
      includeModules: true,
      includeSettings: true,
    });
    setVersionChangeNotes('');
  };

  const handleCreate = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: 'Course created',
        description: 'Course has been successfully created.',
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (data: any) => {
    if (!courseToEdit) return;

    try {
      await updateMutation.mutateAsync({ id: courseToEdit.id, payload: data });
      toast({
        title: 'Course updated',
        description: 'Course has been successfully updated.',
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!courseToAction) return;

    try {
      await deleteMutation.mutateAsync(courseToAction.id);
      toast({
        title: 'Course deleted',
        description: 'Course has been successfully deleted.',
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    if (!courseToAction) return;

    try {
      await publishMutation.mutateAsync({ id: courseToAction.id });
      toast({
        title: 'Course published',
        description: 'Course has been successfully published.',
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublish = async () => {
    if (!courseToAction) return;

    try {
      await unpublishMutation.mutateAsync({ id: courseToAction.id });
      toast({
        title: 'Course unpublished',
        description: 'Course has been successfully unpublished.',
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unpublish course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async () => {
    if (!courseToAction) return;

    try {
      await archiveMutation.mutateAsync({ id: courseToAction.id });
      toast({
        title: 'Course archived',
        description: 'Course has been successfully archived.',
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to archive course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    if (!courseToAction) return;

    try {
      const result = await duplicateMutation.mutateAsync({
        id: courseToAction.id,
        payload: duplicateData,
      });
      toast({
        title: 'Course duplicated',
        description: `Course "${result.title}" has been successfully created.`,
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async () => {
    if (!courseToAction) return;

    try {
      // Export functionality would trigger download
      // For now, just show a success message
      toast({
        title: 'Export started',
        description: `Exporting course in ${exportFormat} format...`,
      });
      handleCloseDialog();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to export course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateVersion = async () => {
    if (!courseToAction) return;

    // The courseToAction has a canonicalCourseId property if using the new versioning model,
    // otherwise fall back to the course id itself (for backward compatibility during transition)
    const canonicalCourseId = (courseToAction as any).canonicalCourseId || courseToAction.id;

    try {
      const result = await createVersionMutation.mutateAsync({
        canonicalCourseId,
        payload: versionChangeNotes ? { changeNotes: versionChangeNotes } : undefined,
      });

      toast({
        title: 'New version created',
        description: `Version ${result.courseVersion.version} of "${courseToAction.title}" has been created as a draft.`,
      });
      handleCloseDialog();

      // Navigate to the new version's edit page
      navigate(`/admin/courses/${result.courseVersion.id}/edit`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create new version. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditCourse = (course: CourseListItem) => {
    // Check if user can edit this course
    if (!user || !canEditCourse(course, user._id, userDepartmentRoles)) {
      toast({
        title: 'Permission denied',
        description: 'You do not have permission to edit this course.',
        variant: 'destructive',
      });
      return;
    }

    // If course is locked, cannot edit
    if (course.isLocked) {
      toast({
        title: 'Course locked',
        description: 'This course version is locked and cannot be edited.',
        variant: 'destructive',
      });
      return;
    }

    // If course is published, need to create a new version first
    if (course.status === 'published') {
      handleOpenDialog('createVersion', course);
    } else {
      // Draft course - edit directly
      handleOpenDialog('edit', course);
    }
  };

  const handleViewSegments = (courseId: string) => {
    navigate(`/admin/courses/${courseId}/segments`);
  };

  const handleFilterChange = (key: keyof CourseFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      status: undefined,
      department: undefined,
      program: undefined,
      instructor: undefined,
      search: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.status || filters.department || filters.program || filters.instructor || filters.search
  );

  // Define columns
  const columns: ColumnDef<CourseListItem>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: 'Code',
      cell: ({ row }) => (
        <div className="font-mono font-medium">{row.original.code}</div>
      ),
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div>
            <div className="font-medium">{course.title}</div>
            {course.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {course.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => row.original.department.name,
    },
    {
      accessorKey: 'program',
      header: 'Program',
      cell: ({ row }) => row.original.program?.name || (
        <span className="text-muted-foreground">-</span>
      ),
    },
    {
      accessorKey: 'credits',
      header: 'Credits',
      cell: ({ row }) => row.original.credits,
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      cell: ({ row }) => `${row.original.duration}h`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>;
      },
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }) => {
        const course = row.original;
        return (
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="font-mono text-xs">
              v{course.version}
            </Badge>
            {course.isLocked && (
              <Lock className="h-3 w-3 text-muted-foreground" />
            )}
            {course.isLatest && (
              <Badge variant="secondary" className="text-xs">
                Latest
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'instructors',
      header: 'Instructors',
      cell: ({ row }) => {
        const instructors = row.original.instructors;
        if (instructors.length === 0) {
          return <span className="text-muted-foreground">None</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {instructors.slice(0, 2).map((instructor) => (
              <Badge key={instructor.id} variant="outline" className="text-xs">
                {instructor.firstName} {instructor.lastName}
              </Badge>
            ))}
            {instructors.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{instructors.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'moduleCount',
      header: 'Modules',
      cell: ({ row }) => (
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={() => handleViewSegments(row.original.id)}
        >
          {row.original.moduleCount}
        </Button>
      ),
    },
    {
      accessorKey: 'enrollmentCount',
      header: 'Enrolled',
      cell: ({ row }) => row.original.enrollmentCount,
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const course = row.original;
        const isPublished = course.status === 'published';
        const isArchived = course.status === 'archived';
        const canEdit = user && canEditCourse(course, user._id, userDepartmentRoles);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewSegments(course.id)}>
                <FileText className="mr-2 h-4 w-4" />
                View Segments
              </DropdownMenuItem>
              {canEdit && !course.isLocked && (
                <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                  <Edit className="mr-2 h-4 w-4" />
                  {isPublished ? 'Edit (Create New Version)' : 'Edit Course'}
                </DropdownMenuItem>
              )}
              {canEdit && course.isLocked && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <Lock className="mr-2 h-4 w-4" />
                  Locked (v{course.version})
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleOpenDialog('duplicate', course)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {!isPublished && !isArchived && (
                <DropdownMenuItem onClick={() => handleOpenDialog('publish', course)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              {isPublished && (
                <DropdownMenuItem onClick={() => handleOpenDialog('unpublish', course)}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              )}
              {!isArchived && (
                <DropdownMenuItem onClick={() => handleOpenDialog('archive', course)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleOpenDialog('export', course)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleOpenDialog('delete', course)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Course
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <PageHeader
        title="Course Management"
        description="Manage courses, modules, and content"
      >
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
        {selectedCourses.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => {
              toast({
                title: 'Bulk operations',
                description: 'Bulk delete not yet implemented',
              });
            }}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedCourses.length})
          </Button>
        )}
        <Button onClick={() => handleOpenDialog('create')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <div className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search courses..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
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
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                placeholder="Department ID"
                value={filters.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Program</Label>
              <Input
                placeholder="Program ID"
                value={filters.program || ''}
                onChange={(e) => handleFilterChange('program', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Failed to load courses. Please try again later.
          </p>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.courses || []}
        searchable={false}
        onRowSelectionChange={setSelectedCourses}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading courses...</div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={activeDialog === 'create' || activeDialog === 'edit'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeDialog === 'create' ? 'Create Course' : 'Edit Course'}
            </DialogTitle>
            <DialogDescription>
              {activeDialog === 'create'
                ? 'Create a new course with the form below.'
                : 'Update the course details below.'}
            </DialogDescription>
          </DialogHeader>
          <CourseForm
            course={courseToEdit ? {
              ...courseToEdit,
              modules: [],
              createdBy: { id: courseToEdit.createdBy, firstName: '', lastName: '' },
              completionRate: 0,
              // Versioning fields (already in courseToEdit via spread, but explicit for clarity)
              changeNotes: courseToEdit.lockedReason ? `Locked: ${courseToEdit.lockedReason}` : null,
              lockedBy: null,
            } : undefined}
            onSubmit={activeDialog === 'create' ? handleCreate : handleUpdate}
            onCancel={handleCloseDialog}
            isLoading={createMutation.isPending || updateMutation.isPending}
            availablePrograms={programsData?.programs?.map((p) => ({
              id: p.id,
              name: p.name,
              code: p.code,
            })) || []}
            programsLoading={programsLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'delete'}
        onOpenChange={(open) => !open && handleCloseDialog()}
        onConfirm={handleDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${courseToAction?.title}"? This action cannot be undone and will remove all associated modules and enrollments.`}
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Publish Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'publish'}
        onOpenChange={(open) => !open && handleCloseDialog()}
        onConfirm={handlePublish}
        title="Publish Course"
        description={`Are you sure you want to publish "${courseToAction?.title}"? This will make the course visible to students.`}
        confirmText="Publish"
        isLoading={publishMutation.isPending}
      />

      {/* Unpublish Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'unpublish'}
        onOpenChange={(open) => !open && handleCloseDialog()}
        onConfirm={handleUnpublish}
        title="Unpublish Course"
        description={`Are you sure you want to unpublish "${courseToAction?.title}"? This will hide the course from students.`}
        confirmText="Unpublish"
        isLoading={unpublishMutation.isPending}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'archive'}
        onOpenChange={(open) => !open && handleCloseDialog()}
        onConfirm={handleArchive}
        title="Archive Course"
        description={`Are you sure you want to archive "${courseToAction?.title}"? Archived courses are no longer accessible to students.`}
        confirmText="Archive"
        isLoading={archiveMutation.isPending}
      />

      {/* Duplicate Dialog */}
      <Dialog
        open={activeDialog === 'duplicate'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate Course</DialogTitle>
            <DialogDescription>
              Create a copy of "{courseToAction?.title}" with the options below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newCode">
                New Course Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="newCode"
                value={duplicateData.newCode}
                onChange={(e) =>
                  setDuplicateData({ ...duplicateData, newCode: e.target.value.toUpperCase() })
                }
                placeholder="e.g., WEB102"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTitle">New Course Title</Label>
              <Input
                id="newTitle"
                value={duplicateData.newTitle}
                onChange={(e) =>
                  setDuplicateData({ ...duplicateData, newTitle: e.target.value })
                }
                placeholder="Leave empty to use original title"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeModules"
                checked={duplicateData.includeModules}
                onCheckedChange={(checked) =>
                  setDuplicateData({ ...duplicateData, includeModules: checked as boolean })
                }
              />
              <Label htmlFor="includeModules" className="cursor-pointer">
                Include modules
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSettings"
                checked={duplicateData.includeSettings}
                onCheckedChange={(checked) =>
                  setDuplicateData({ ...duplicateData, includeSettings: checked as boolean })
                }
              />
              <Label htmlFor="includeSettings" className="cursor-pointer">
                Include settings
              </Label>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={!duplicateData.newCode || duplicateMutation.isPending}
            >
              Duplicate Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog
        open={activeDialog === 'export'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Course</DialogTitle>
            <DialogDescription>
              Export "{courseToAction?.title}" in your preferred format.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exportFormat">Export Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as ExportFormat)}
              >
                <SelectTrigger id="exportFormat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="scorm1.2">SCORM 1.2</SelectItem>
                  <SelectItem value="scorm2004">SCORM 2004</SelectItem>
                  <SelectItem value="xapi">xAPI</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose the format that best suits your needs
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog
        open={activeDialog === 'createVersion'}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Version</DialogTitle>
            <DialogDescription>
              "{courseToAction?.title}" is published. Editing will create a new draft version (v{(courseToAction?.version ?? 0) + 1}).
              The current published version (v{courseToAction?.version}) will be locked from changes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Learners currently enrolled in this course will continue using the published version until they complete it or the access period expires.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="changeNotes">Change Notes (Optional)</Label>
              <Input
                id="changeNotes"
                value={versionChangeNotes}
                onChange={(e) => setVersionChangeNotes(e.target.value)}
                placeholder="Describe what changes you're planning..."
              />
              <p className="text-xs text-muted-foreground">
                These notes help track why a new version was created
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleCreateVersion} disabled={createVersionMutation.isPending}>
              <Edit className="mr-2 h-4 w-4" />
              {createVersionMutation.isPending ? 'Creating...' : 'Create Draft Version'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
