/**
 * Department Management Page
 * Admin interface for managing departments with CRUD operations
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { PageHeader } from '@/shared/ui/page-header';
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Eye,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  DepartmentForm,
  type DepartmentListItem,
  type DepartmentListParams,
} from '@/entities/department';

export const DepartmentManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedDepartments, setSelectedDepartments] = React.useState<DepartmentListItem[]>([]);
  const [departmentToEdit, setDepartmentToEdit] = React.useState<DepartmentListItem | null>(null);
  const [departmentToDelete, setDepartmentToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<DepartmentListParams>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch departments with filters
  const { data: departmentsData, isLoading, error } = useDepartments(filters);

  // Mutations
  useCreateDepartment({
    onSuccess: () => {
      toast({
        title: 'Department created',
        description: 'Department has been successfully created.',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create department. Please try again.',
        variant: 'destructive',
      });
    },
  });

  useUpdateDepartment({
    onSuccess: () => {
      toast({
        title: 'Department updated',
        description: 'Department has been successfully updated.',
      });
      setDepartmentToEdit(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update department. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useDeleteDepartment({
    onSuccess: () => {
      toast({
        title: 'Department deleted',
        description: 'Department has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setDepartmentToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete department. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Action handlers
  const handleDelete = (id: string) => {
    setDepartmentToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (departmentToDelete) {
      deleteMutation.mutate(departmentToDelete);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(
        selectedDepartments.map((dept) => deleteMutation.mutateAsync(dept.id))
      );
      toast({
        title: 'Departments deleted',
        description: `${selectedDepartments.length} department(s) have been successfully deleted.`,
      });
      setSelectedDepartments([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some departments. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setDepartmentToEdit(null);
  };

  const handleFilterChange = (key: keyof DepartmentListParams, value: string | undefined) => {
    setFilters((prev: DepartmentListParams) => ({
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

  const hasActiveFilters = filters.search || filters.parentId;

  // Define columns
  const columns: ColumnDef<DepartmentListItem>[] = [
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
        const dept = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold">{dept.code}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Department Name',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div>
            <div className="font-medium">{dept.name}</div>
            {dept.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {dept.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'parentId',
      header: 'Parent Department',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="text-sm">
            {dept.parentId ? (
              <div className="font-medium">ID: {dept.parentId}</div>
            ) : (
              <span className="text-muted-foreground">Root</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'metadata.totalStaff',
      header: 'Staff',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{dept.metadata.totalStaff}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'metadata.totalPrograms',
      header: 'Programs',
      cell: ({ row }) => {
        const dept = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{dept.metadata.totalPrograms}</span>
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
        const dept = row.original;
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
              <DropdownMenuItem onClick={() => navigate(`/admin/departments/${dept.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDepartmentToEdit(dept)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Department
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(dept.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Department
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
        title="Department Management"
        description="Manage departments and organizational structure"
      >
        {selectedDepartments.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedDepartments.length})
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).filter(
                (k) =>
                  k !== 'page' && k !== 'limit' && filters[k as keyof DepartmentListParams]
              ).length}
            </Badge>
          )}
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter departments by name or parent department
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-search">Search</Label>
              <div className="relative">
                <input
                  id="filter-search"
                  type="text"
                  placeholder="Search departments..."
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
            <h3 className="font-semibold mb-2">Error loading departments</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading departments...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={departmentsData?.departments || []}
          searchable
          searchPlaceholder="Search departments..."
          onRowSelectionChange={setSelectedDepartments}
        />
      )}

      {/* Pagination Info */}
      {departmentsData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {departmentsData.departments.length} of{' '}
            {departmentsData.pagination.total} department(s)
          </div>
          <div>
            Page {departmentsData.pagination.page} of {departmentsData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!departmentToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setDepartmentToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {departmentToEdit ? 'Edit Department' : 'Create New Department'}
            </DialogTitle>
            <DialogDescription>
              {departmentToEdit
                ? 'Update the department information below.'
                : 'Fill in the information to create a new department.'}
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm
            department={departmentToEdit || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setDepartmentToEdit(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Department"
        description="Are you sure you want to delete this department? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Departments"
        description={`Are you sure you want to delete ${selectedDepartments.length} department(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
