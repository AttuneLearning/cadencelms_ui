/**
 * Department Staff Section
 * DataTable with staff members, filters, and management actions
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { DataTable } from '@/shared/ui/data-table';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
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
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToast } from '@/shared/ui/use-toast';
import { MoreHorizontal, Plus, Trash, Edit, User, Loader2 } from 'lucide-react';
import {
  useDepartmentStaff,
  departmentKeys,
  type DepartmentStaffMember,
  type DepartmentStaffParams,
} from '@/entities/department';
import { useUpdateStaffDepartments } from '@/entities/staff-management';
import { AddStaffDialog } from './AddStaffDialog';
import { EditStaffRoleDialog } from './EditStaffRoleDialog';

interface DepartmentStaffSectionProps {
  departmentId: string;
  departmentName: string;
}

const formatRoleName = (role: string): string => {
  return role
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const DepartmentStaffSection: React.FC<DepartmentStaffSectionProps> = ({
  departmentId,
  departmentName,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for dialogs and selections
  const [selectedStaff, setSelectedStaff] = useState<DepartmentStaffMember[]>([]);
  const [staffToEdit, setStaffToEdit] = useState<DepartmentStaffMember | null>(null);
  const [staffToRemove, setStaffToRemove] = useState<DepartmentStaffMember | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkRemoveConfirm, setShowBulkRemoveConfirm] = useState(false);

  // State for filters
  const [filters, setFilters] = useState<DepartmentStaffParams>({
    page: 1,
    limit: 50,
  });

  // Fetch department staff
  const { data: staffData, isLoading } = useDepartmentStaff(departmentId, filters);

  // Update staff mutation
  const updateStaffMutation = useUpdateStaffDepartments();

  // Handle filter changes
  const handleFilterChange = (key: keyof DepartmentStaffParams, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page
    }));
  };

  // Handle remove staff
  const handleRemoveStaff = async () => {
    if (!staffToRemove) return;

    try {
      await updateStaffMutation.mutateAsync({
        id: staffToRemove.id,
        payload: {
          action: 'remove',
          departmentAssignments: [
            {
              departmentId,
              role: staffToRemove.departmentRole as any, // Map to staff-management role
            },
          ],
        },
      });

      toast({
        title: 'Staff removed',
        description: `${staffToRemove.fullName} has been removed from the department`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStaff(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStats(departmentId),
      });

      setStaffToRemove(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove staff member',
        variant: 'destructive',
      });
    }
  };

  // Handle bulk remove
  const handleBulkRemove = async () => {
    try {
      await Promise.all(
        selectedStaff.map((staff) =>
          updateStaffMutation.mutateAsync({
            id: staff.id,
            payload: {
              action: 'remove',
              departmentAssignments: [
                {
                  departmentId,
                  role: staff.departmentRole as any,
                },
              ],
            },
          })
        )
      );

      toast({
        title: 'Staff removed',
        description: `${selectedStaff.length} staff member(s) have been removed from the department`,
      });

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStaff(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStats(departmentId),
      });

      setSelectedStaff([]);
      setShowBulkRemoveConfirm(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove some staff members. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Define columns
  const columns: ColumnDef<DepartmentStaffMember>[] = [
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
      accessorKey: 'fullName',
      header: 'Name',
      cell: ({ row }) => {
        const staff = row.original;
        return (
          <div>
            <div className="font-medium">{staff.fullName}</div>
            <div className="text-sm text-muted-foreground">{staff.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'departmentRole',
      header: 'Department Role',
      cell: ({ row }) => {
        const role = row.original.departmentRole;
        return <Badge variant="secondary">{formatRoleName(role)}</Badge>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        const variant = status === 'active' ? 'default' : 'secondary';
        return (
          <Badge variant={variant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'assignedCourses',
      header: 'Assigned Courses',
      cell: ({ row }) => {
        const count = row.original.assignedCourses;
        return <div className="text-center">{count}</div>;
      },
    },
    {
      accessorKey: 'joinedDepartmentAt',
      header: 'Joined Department',
      cell: ({ row }) => {
        const date = row.original.joinedDepartmentAt;
        return (
          <span className="text-sm text-muted-foreground">
            {format(new Date(date), 'MMM dd, yyyy')}
          </span>
        );
      },
    },
    {
      accessorKey: 'lastLogin',
      header: 'Last Login',
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin;
        return lastLogin ? (
          <span className="text-sm text-muted-foreground">
            {format(new Date(lastLogin), 'MMM dd, yyyy')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Never</span>
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
              <DropdownMenuItem onClick={() => navigate(`/admin/staff/${staff.id}`)}>
                <User className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStaffToEdit(staff)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Role
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setStaffToRemove(staff)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Remove from Department
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Get current staff IDs for AddStaffDialog
  const currentStaffIds = staffData?.staff.map((s) => s.id) || [];

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Input
              placeholder="Search staff..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          <Select
            value={filters.role || 'all'}
            onValueChange={(value) => handleFilterChange('role', value === 'all' ? undefined : value as any)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="content-admin">Content Admin</SelectItem>
              <SelectItem value="instructor">Instructor</SelectItem>
              <SelectItem value="observer">Observer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {selectedStaff.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowBulkRemoveConfirm(true)}
            >
              <Trash className="mr-2 h-4 w-4" />
              Remove Selected ({selectedStaff.length})
            </Button>
          )}
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading staff...</span>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && (
        <>
          <DataTable
            columns={columns}
            data={staffData?.staff || []}
            searchable
            searchPlaceholder="Search staff..."
            onRowSelectionChange={setSelectedStaff}
          />

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
        </>
      )}

      {/* Add Staff Dialog */}
      <AddStaffDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        departmentId={departmentId}
        departmentName={departmentName}
        currentStaffIds={currentStaffIds}
      />

      {/* Edit Role Dialog */}
      <EditStaffRoleDialog
        open={!!staffToEdit}
        onOpenChange={(open) => !open && setStaffToEdit(null)}
        staff={staffToEdit}
        departmentId={departmentId}
      />

      {/* Remove Staff Confirmation */}
      <ConfirmDialog
        open={!!staffToRemove}
        onOpenChange={(open) => !open && setStaffToRemove(null)}
        onConfirm={handleRemoveStaff}
        title="Remove Staff from Department"
        description={
          staffToRemove
            ? `Are you sure you want to remove ${staffToRemove.fullName} from this department? They will lose access to department resources and courses.`
            : ''
        }
        confirmText="Remove"
        isDestructive
        isLoading={updateStaffMutation.isPending}
      />

      {/* Bulk Remove Confirmation */}
      <ConfirmDialog
        open={showBulkRemoveConfirm}
        onOpenChange={setShowBulkRemoveConfirm}
        onConfirm={handleBulkRemove}
        title="Remove Multiple Staff Members"
        description={`Are you sure you want to remove ${selectedStaff.length} staff member(s) from this department? This action cannot be undone.`}
        confirmText="Remove All"
        isDestructive
        isLoading={updateStaffMutation.isPending}
      />
    </div>
  );
};
