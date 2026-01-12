/**
 * Learner Management Page
 * Admin interface for managing learners with CRUD operations
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
import { Label } from '@/shared/ui/label';
import { Card } from '@/shared/ui/card';
import {
  MoreHorizontal,
  Plus,
  Trash,
  Edit,
  Loader2,
  Filter,
  X,
} from 'lucide-react';
import {
  useLearnerList,
  useCreateLearner,
  useUpdateLearner,
  useDeleteLearner,
  LearnerForm,
  type LearnerListItem,
  type LearnerFilters,
} from '@/entities/learner';
import { useDepartments } from '@/entities/department';

export const LearnerManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedLearners, setSelectedLearners] = React.useState<LearnerListItem[]>([]);
  const [learnerToEdit, setLearnerToEdit] = React.useState<LearnerListItem | null>(null);
  const [learnerToDelete, setLearnerToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<LearnerFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { toast } = useToast();

  // Fetch learners with filters
  const { data: learnersData, isLoading, error } = useLearnerList(filters);

  // Fetch departments for dropdown
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // Mutations
  const createMutation = useCreateLearner({
    onSuccess: () => {
      toast({
        title: 'Learner created',
        description: 'Learner has been successfully created.',
      });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create learner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useUpdateLearner({
    onSuccess: () => {
      toast({
        title: 'Learner updated',
        description: 'Learner has been successfully updated.',
      });
      setLearnerToEdit(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update learner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useDeleteLearner({
    onSuccess: () => {
      toast({
        title: 'Learner deleted',
        description: 'Learner has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setLearnerToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete learner. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Action handlers
  const handleDelete = (id: string) => {
    setLearnerToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (learnerToDelete) {
      deleteMutation.mutate(learnerToDelete);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedLearners.map((l) => deleteMutation.mutateAsync(l.id)));
      toast({
        title: 'Learners deleted',
        description: `${selectedLearners.length} learner(s) have been successfully deleted.`,
      });
      setSelectedLearners([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some learners. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setLearnerToEdit(null);
  };

  const handleFilterChange = (key: keyof LearnerFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 50,
    });
  };

  const hasActiveFilters = filters.search || filters.department || filters.status;

  // Define columns
  const columns: ColumnDef<LearnerListItem>[] = [
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
      accessorKey: 'studentId',
      header: 'Student ID',
      cell: ({ row }) => {
        const learner = row.original;
        return (
          <div className="font-mono font-semibold">{learner.studentId}</div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const learner = row.original;
        return (
          <div>
            <div className="font-medium">
              {learner.firstName} {learner.lastName}
            </div>
            <div className="text-sm text-muted-foreground">{learner.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const learner = row.original;
        return (
          <div className="text-sm">
            <div className="font-medium">{learner.department.name}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const learner = row.original;
        let variant: 'default' | 'secondary' | 'destructive' = 'default';
        if (learner.status === 'inactive') variant = 'secondary';
        if (learner.status === 'graduated') variant = 'outline';
        return (
          <Badge variant={variant}>
            {learner.status === 'active' ? 'Active' : learner.status === 'inactive' ? 'Inactive' : 'Graduated'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'enrollmentCount',
      header: 'Enrollments',
      cell: ({ row }) => {
        const learner = row.original;
        return (
          <div className="text-center">
            <span className="font-medium">{learner.enrollmentCount}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const created = row.original.createdAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(created), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const learner = row.original;
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
              <DropdownMenuItem onClick={() => setLearnerToEdit(learner)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Learner
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(learner.id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Learner
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learner Management</h1>
          <p className="text-muted-foreground">
            Manage learner accounts and enrollments
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedLearners.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedLearners.length})
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {Object.keys(filters).filter(
                  (k) =>
                    k !== 'page' && k !== 'limit' && filters[k as keyof LearnerFilters]
                ).length}
              </Badge>
            )}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Learner
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter learners by department, status, or search
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filter-search">Search</Label>
              <input
                id="filter-search"
                type="text"
                placeholder="Name, email, or ID..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
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
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading learners</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading learners...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={learnersData?.learners || []}
          searchable
          searchPlaceholder="Search learners..."
          onRowSelectionChange={setSelectedLearners}
        />
      )}

      {/* Pagination Info */}
      {learnersData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {learnersData.learners.length} of {learnersData.pagination.total} learner(s)
          </div>
          <div>
            Page {learnersData.pagination.page} of {learnersData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!learnerToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setLearnerToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {learnerToEdit ? 'Edit Learner' : 'Create New Learner'}
            </DialogTitle>
            <DialogDescription>
              {learnerToEdit
                ? 'Update the learner information below.'
                : 'Fill in the information to create a new learner.'}
            </DialogDescription>
          </DialogHeader>
          <LearnerForm
            learner={learnerToEdit}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setLearnerToEdit(null);
            }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete Learner"
        description="Are you sure you want to delete this learner? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Learners"
        description={`Are you sure you want to delete ${selectedLearners.length} learner(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
