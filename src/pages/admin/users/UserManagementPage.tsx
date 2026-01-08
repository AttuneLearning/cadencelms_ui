/**
 * User Management Page
 * Admin interface for managing users with CRUD operations
 */

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/shared/ui/use-toast';
import { UserAvatar } from '@/entities/user';
import { userApi, type UserListItem, type Role, type UserStatus } from '@/entities/user';
import { MoreHorizontal, Plus, Trash, Edit, UserCheck, UserX } from 'lucide-react';
import { UserFormDialog } from '@/features/user-management';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

export const UserManagementPage: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = React.useState<UserListItem[]>([]);
  const [userToEdit, setUserToEdit] = React.useState<UserListItem | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => userApi.list(),
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: userApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User deleted',
        description: 'User has been successfully deleted.',
      });
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: userApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'Users deleted',
        description: `${selectedUsers.length} user(s) have been successfully deleted.`,
      });
      setSelectedUsers([]);
      setIsBulkDeleteConfirmOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete users. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  const confirmBulkDelete = () => {
    const ids = selectedUsers.map((user) => user._id);
    bulkDeleteMutation.mutate(ids);
  };

  // Define columns
  const columns: ColumnDef<UserListItem>[] = [
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
      accessorKey: 'user',
      header: 'User',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <UserAvatar
              firstName={user.firstName}
              lastName={user.lastName}
              className="h-8 w-8"
            />
            <div>
              <div className="font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ row }) => {
        const roles = row.original.roles;
        return (
          <div className="flex flex-wrap gap-1">
            {roles.map((role) => (
              <Badge key={role} variant="secondary">
                {formatRole(role)}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      cell: ({ row }) => {
        const lastLogin = row.original.lastLoginAt;
        if (!lastLogin) return <span className="text-muted-foreground">Never</span>;
        return format(new Date(lastLogin), 'MMM dd, yyyy');
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => {
        const created = row.original.createdAt;
        return format(new Date(created), 'MMM dd, yyyy');
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original;
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
              <DropdownMenuItem onClick={() => setUserToEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem>
                {user.status === 'active' ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Suspend User
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activate User
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(user._id)}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete User
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
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <Button variant="destructive" onClick={handleBulkDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete Selected ({selectedUsers.length})
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.users || []}
        searchable
        searchPlaceholder="Search users..."
        onRowSelectionChange={setSelectedUsers}
      />

      {/* Create/Edit Dialog */}
      <UserFormDialog
        open={isCreateDialogOpen || !!userToEdit}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setUserToEdit(null);
          }
        }}
        user={userToEdit || undefined}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Users"
        description={`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
      />
    </div>
  );
};

// Helper functions
function formatRole(role: Role): string {
  switch (role) {
    case 'global-admin':
      return 'Admin';
    case 'staff':
      return 'Staff';
    case 'learner':
      return 'Learner';
    default:
      return role;
  }
}

function getStatusVariant(status: UserStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'suspended':
      return 'destructive';
    default:
      return 'secondary';
  }
}
