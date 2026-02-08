/**
 * Staff Management Page
 * Admin interface for managing staff with CRUD operations and role assignments
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
  useStaffList,
  useCreateStaff,
  useUpdateStaff,
  useDeleteStaff,
  StaffForm,
  type Staff,
  type StaffListItem,
  type StaffFilters,
} from '@/entities/staff';
import { useDepartments } from '@/entities/department';

export const StaffManagementPage: React.FC = () => {
  // State for selections and dialogs
  const [selectedStaff, setSelectedStaff] = React.useState<StaffListItem[]>([]);
  const [staffToEdit, setStaffToEdit] = React.useState<StaffListItem | null>(null);
  const [staffToDelete, setStaffToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  // State for filters
  const [filters, setFilters] = React.useState<StaffFilters>({
    page: 1,
    limit: 50,
  });
  const [showFilters, setShowFilters] = React.useState(false);

  const { toast } = useToast();

  // Fetch staff with filters
  const { data: staffData, isLoading, error } = useStaffList(filters);

  // Fetch departments for dropdown
  const { data: departmentsData } = useDepartments({ limit: 1000 });

  // Mutations
  const createMutation = useCreateStaff();
  const updateMutation = useUpdateStaff();
  const deleteMutation = useDeleteStaff();

  // Action handlers
  const handleDelete = (id: string) => {
    setStaffToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (staffToDelete) {
      deleteMutation.mutate(staffToDelete);
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedStaff.map((s) => deleteMutation.mutateAsync(s.id || s._id)));
      toast({
        title: 'Staff deleted',
        description: `${selectedStaff.length} staff member(s) have been successfully deleted.`,
      });
      setSelectedStaff([]);
      setIsBulkDeleteConfirmOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete some staff members. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false);
    setStaffToEdit(null);
  };

  const handleFilterChange = (key: keyof StaffFilters, value: string | undefined) => {
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

  const hasActiveFilters = filters.search || filters.department || filters.role || filters.status;

  // Define columns
  const columns: ColumnDef<StaffListItem>[] = [
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
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div>
            <div className="font-medium">
              {staff.firstName} {staff.lastName}
            </div>
            <div className="text-sm text-muted-foreground">{staff.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div className="text-sm">
            <div className="font-medium">{staff.department?.name}</div>
            <div className="text-muted-foreground">{staff.department?.code}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const staff = row.original;
        const variant = staff.role === 'global-admin' ? 'destructive' : 'secondary';
        return (
          <Badge variant={variant}>
            {staff.role === 'global-admin' ? 'Global Admin' : 'Staff'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const staff = row.original;
        const variant = staff.status === 'active' ? 'default' : 'secondary';
        return (
          <Badge variant={variant}>
            {staff.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <span className="text-sm">{staff.phone || '-'}</span>
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
        const staff = row.original;
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
              <DropdownMenuItem onClick={() => setStaffToEdit(staff)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Staff
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(staff.id || staff._id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Staff
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
        title="Staff Management"
        description="Manage staff accounts and roles"
      >
        {selectedStaff.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedStaff.length})
          </Button>
        )}
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {Object.keys(filters).filter(
                (k) =>
                  k !== 'page' && k !== 'limit' && filters[k as keyof StaffFilters]
              ).length}
            </Badge>
          )}
        </Button>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </PageHeader>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="text-sm text-muted-foreground">
                Filter staff by department, role, or status
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
              <Label htmlFor="filter-role">Role</Label>
              <Select
                value={filters.role || 'all'}
                onValueChange={(value) =>
                  handleFilterChange('role', value === 'all' ? undefined : value)
                }
              >
                <SelectTrigger id="filter-role">
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="global-admin">Global Admin</SelectItem>
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
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter-search">Search</Label>
              <input
                id="filter-search"
                type="text"
                placeholder="Name or email..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-6 border-destructive">
          <div className="text-destructive">
            <h3 className="font-semibold mb-2">Error loading staff</h3>
            <p className="text-sm">{error.message}</p>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading staff...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && (
        <DataTable
          columns={columns}
          data={staffData?.staff || []}
          searchable
          searchPlaceholder="Search staff..."
          onRowSelectionChange={setSelectedStaff}
        />
      )}

      {/* Pagination Info */}
      {staffData?.pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {staffData.staff.length} of {staffData.pagination.total} staff member(s)
          </div>
          <div>
            Page {staffData.pagination.page} of {staffData.pagination.totalPages}
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || !!staffToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setStaffToEdit(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {staffToEdit ? 'Edit Staff' : 'Create New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {staffToEdit
                ? 'Update the staff member information below.'
                : 'Fill in the information to create a new staff member.'}
            </DialogDescription>
          </DialogHeader>
          <StaffForm
            staff={staffToEdit ? staffToEdit as unknown as Staff : undefined}
            onSubmit={() => handleFormSuccess()}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setStaffToEdit(null);
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
        title="Delete Staff"
        description="Are you sure you want to delete this staff member? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Staff Members"
        description={`Are you sure you want to delete ${selectedStaff.length} staff member(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
