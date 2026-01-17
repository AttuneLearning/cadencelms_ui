/**
 * Program Management Page
 * Admin interface for managing programs with CRUD operations
 */

import React from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import { ProgramForm } from '@/entities/program';
import {
  usePrograms,
  useDeleteProgram,
  usePublishProgram,
  useUnpublishProgram,
  useDuplicateProgram,
  type ProgramListItem,
  type ProgramStatus,
  type ProgramCredential,
  type ProgramFilters,
} from '@/entities/program';
import { useDepartments } from '@/entities/department';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Eye,
  EyeOff,
  Copy,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';

export const ProgramManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedPrograms, setSelectedPrograms] = React.useState<ProgramListItem[]>([]);
  const [programToEdit, setProgramToEdit] = React.useState<ProgramListItem | null>(null);
  const [programToDelete, setProgramToDelete] = React.useState<string | null>(null);
  const [programToPublish, setProgramToPublish] = React.useState<{
    id: string;
    action: 'publish' | 'unpublish';
  } | null>(null);
  const [programToDuplicate, setProgramToDuplicate] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = React.useState(false);
  const [isDuplicateConfirmOpen, setIsDuplicateConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<ProgramFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { toast } = useToast();

  // Fetch programs with filters
  const { data: programsData, isLoading, error } = usePrograms(filters);

  // Fetch departments for the form
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // Mutations
  const deleteProgram = useDeleteProgram({
    onSuccess: () => {
      toast({
        title: 'Program deleted',
        description: 'Program has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setProgramToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete program. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const publishProgram = usePublishProgram({
    onSuccess: () => {
      toast({
        title: 'Program published',
        description: 'Program is now visible to learners.',
      });
      setIsPublishConfirmOpen(false);
      setProgramToPublish(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish program. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const unpublishProgram = useUnpublishProgram({
    onSuccess: () => {
      toast({
        title: 'Program unpublished',
        description: 'Program is no longer visible to learners.',
      });
      setIsPublishConfirmOpen(false);
      setProgramToPublish(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to unpublish program. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const duplicateProgram = useDuplicateProgram({
    onSuccess: () => {
      toast({
        title: 'Program duplicated',
        description: 'A copy of the program has been created.',
      });
      setIsDuplicateConfirmOpen(false);
      setProgramToDuplicate(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to duplicate program. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Action handlers
  const handleDelete = (id: string) => {
    setProgramToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const handlePublishToggle = (program: ProgramListItem) => {
    setProgramToPublish({
      id: program.id,
      action: program.isPublished ? 'unpublish' : 'publish',
    });
    setIsPublishConfirmOpen(true);
  };

  const handleDuplicate = (id: string) => {
    setProgramToDuplicate(id);
    setIsDuplicateConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (programToDelete) {
      deleteProgram.mutate(programToDelete);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedPrograms.map((program) => deleteProgram.mutateAsync(program.id)));
      toast({
        title: 'Programs deleted',
        description: `${selectedPrograms.length} program(s) have been successfully deleted.`,
      });
      setSelectedPrograms([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some programs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const confirmPublish = () => {
    if (programToPublish) {
      if (programToPublish.action === 'publish') {
        publishProgram.mutate(programToPublish.id);
      } else {
        unpublishProgram.mutate(programToPublish.id);
      }
    }
  };

  const confirmDuplicate = () => {
    if (programToDuplicate) {
      duplicateProgram.mutate(programToDuplicate);
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setProgramToEdit(null);
  };

  const handleFilterChange = (key: keyof ProgramFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
  };

  const hasActiveFilters = filters.department || filters.status || filters.search;

  // Define columns
  const columns: ColumnDef<ProgramListItem>[] = [
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
      cell: ({ row }) => {
        const program = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold">{program.code}</span>
            {!program.isPublished && (
              <Badge variant="outline" className="text-xs">
                Draft
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Program Name',
      cell: ({ row }) => {
        const program = row.original;
        return (
          <div>
            <div className="font-medium">{program.name}</div>
            {program.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {program.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const program = row.original;
        return (
          <div className="text-sm">
            <div className="font-medium">{program.department.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'credential',
      header: 'Credential',
      cell: ({ row }) => {
        const credential = row.original.credential;
        return (
          <Badge variant="secondary">
            {formatCredential(credential)}
          </Badge>
        );
      },
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
      accessorKey: 'totalLevels',
      header: 'Levels',
      cell: ({ row }) => {
        const program = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{program.totalLevels}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'totalCourses',
      header: 'Courses',
      cell: ({ row }) => {
        const program = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{program.totalCourses}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'activeEnrollments',
      header: 'Enrollments',
      cell: ({ row }) => {
        const program = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{program.activeEnrollments}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }) => {
        const updated = row.original.updatedAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(updated), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const program = row.original;
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
              <DropdownMenuItem onClick={() => setProgramToEdit(program)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Program
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePublishToggle(program)}>
                {program.isPublished ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(program.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(program.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Program
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
        title="Program Management"
        description="Manage academic programs, levels, and courses"
      >
        {selectedPrograms.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedPrograms.length})
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).filter((k) => k !== 'page' && k !== 'limit' && filters[k as keyof ProgramFilters]).length}
            </Badge>
          )}
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter programs by status, department, or search
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-status">Status</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('status', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-department">Department</Label>
              <Select
                value={filters.department || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('department', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-department">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentsData?.departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-search">Search</Label>
              <div className="relative">
                <input
                  id="filter-search"
                  type="text"
                  placeholder="Search programs..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading programs</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading programs...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={programsData?.programs || []}
          searchable
          searchPlaceholder="Search programs..."
          onRowSelectionChange={setSelectedPrograms}
        />
      )}

      {/* Pagination Info */}
      {programsData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {programsData.programs.length} of {programsData.pagination.total} program(s)
          </div>
          <div>
            Page {programsData.pagination.page} of {programsData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!programToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setProgramToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {programToEdit ? 'Edit Program' : 'Create New Program'}
            </DialogTitle>
            <DialogDescription>
              {programToEdit
                ? 'Update the program information below.'
                : 'Fill in the information to create a new program.'}
            </DialogDescription>
          </DialogHeader>
          <ProgramForm
            program={programToEdit ? ({
              id: programToEdit.id,
              name: programToEdit.name,
              code: programToEdit.code,
              description: programToEdit.description,
              department: {
                id: programToEdit.department.id,
                name: programToEdit.department.name,
                code: '', // Code not available in list view
              },
              credential: programToEdit.credential,
              duration: programToEdit.duration,
              durationUnit: programToEdit.durationUnit,
              isPublished: programToEdit.isPublished,
              status: programToEdit.status,
              levels: [],
              statistics: {
                totalLevels: programToEdit.totalLevels,
                totalCourses: programToEdit.totalCourses,
                totalEnrollments: programToEdit.activeEnrollments,
                activeEnrollments: programToEdit.activeEnrollments,
                completedEnrollments: 0,
                completionRate: 0,
              },
              createdAt: programToEdit.createdAt,
              updatedAt: programToEdit.updatedAt,
              createdBy: {
                id: '',
                firstName: '',
                lastName: '',
              },
            }) : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setProgramToEdit(null);
            }}
            availableDepartments={departmentsData?.departments.map((dept) => ({
              id: dept.id,
              name: dept.name,
              code: dept.code,
            }))}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Program"
        description="Are you sure you want to delete this program? This will also remove all associated levels and course assignments. This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteProgram.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Programs"
        description={`Are you sure you want to delete ${selectedPrograms.length} program(s)? This will also remove all associated levels and course assignments. This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteProgram.isPending}
      />

      {/* Publish/Unpublish Confirmation */}
      <ConfirmDialog
        open={isPublishConfirmOpen}
        onOpenChange={setIsPublishConfirmOpen}
        onConfirm={confirmPublish}
        title={programToPublish?.action === 'publish' ? 'Publish Program' : 'Unpublish Program'}
        description={
          programToPublish?.action === 'publish'
            ? 'Are you sure you want to publish this program? It will become visible to learners and available for enrollment.'
            : 'Are you sure you want to unpublish this program? It will no longer be visible to learners or available for new enrollments.'
        }
        confirmText={programToPublish?.action === 'publish' ? 'Publish' : 'Unpublish'}
        isLoading={publishProgram.isPending || unpublishProgram.isPending}
      />

      {/* Duplicate Confirmation */}
      <ConfirmDialog
        open={isDuplicateConfirmOpen}
        onOpenChange={setIsDuplicateConfirmOpen}
        onConfirm={confirmDuplicate}
        title="Duplicate Program"
        description="Are you sure you want to duplicate this program? A new program will be created with the same structure and settings, but with a modified code."
        confirmText="Duplicate"
        isLoading={duplicateProgram.isPending}
      />
    </div>
  );
};

// Helper functions
function formatCredential(credential: ProgramCredential): string {
  const map: Record<ProgramCredential, string> = {
    certificate: 'Certificate',
    diploma: 'Diploma',
    degree: 'Degree',
  };
  return map[credential] || credential;
}

function formatStatus(status: ProgramStatus): string {
  const map: Record<ProgramStatus, string> = {
    active: 'Active',
    inactive: 'Inactive',
    archived: 'Archived',
  };
  return map[status] || status;
}

function getStatusVariant(status: ProgramStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'archived':
      return 'destructive';
    default:
      return 'secondary';
  }
}
