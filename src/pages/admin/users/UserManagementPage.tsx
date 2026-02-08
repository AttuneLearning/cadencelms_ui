/**
 * Staff User Management Page
 * Admin interface for managing staff users with CRUD operations
 * 
 * API Endpoints:
 * - List (paginated): GET /api/v2/users/staff?page=&limit=&search=&department=&role=&status=&sort=
 * - Create: POST /api/v2/users/staff (requires escalation)
 * - Update: PUT /api/v2/users/staff/:id (requires escalation)
 * - Delete (soft): DELETE /api/v2/users/staff/:id (requires escalation + system-admin)
 * - Dept roles update: PATCH /api/v2/users/staff/:id/departments
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible';
import { useToast } from '@/shared/ui/use-toast';
import { PageHeader } from '@/shared/ui/page-header';
import { UserAvatar } from '@/entities/user';
import { staffApi, type UserListItem, type UserStatus, type StaffDepartment } from '@/entities/user';
import { MoreHorizontal, Plus, Trash, Edit, UserCheck, UserX, ChevronDown, ChevronRight, Building2 } from 'lucide-react';
import { UserFormDialog } from '@/features/user-management';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { ErrorPanel } from '@/shared/ui/error-panel';
import { DataShapeWarning } from '@/shared/ui/data-shape-warning';
import { cn } from '@/shared/lib/utils';

/** Expandable departments cell component */
const DepartmentsCell: React.FC<{ departments?: StaffDepartment[] }> = ({ departments }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  if (!departments || departments.length === 0) {
    return <span className="text-muted-foreground text-sm">No departments</span>;
  }

  if (departments.length === 1) {
    const dept = departments[0];
    const roles = dept.rolesInDepartment || [];
    return (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-sm">{dept.departmentName}</span>
        <div className="flex flex-wrap gap-1">
          {roles.length > 0 ? (
            roles.map((role, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {formatDeptRole(role)}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs">No roles</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto p-1 -ml-1 hover:bg-muted">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{departments.length} departments</span>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {departments.map((dept, index) => {
          const roles = dept.rolesInDepartment || [];
          return (
            <div
              key={dept.departmentId || index}
              className={cn(
                "pl-6 py-1.5 border-l-2 border-muted",
                "hover:border-primary/50 hover:bg-muted/30 rounded-r transition-colors"
              )}
            >
              <div className="font-medium text-sm">{dept.departmentName}</div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {roles.length > 0 ? (
                  roles.map((role, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {formatDeptRole(role)}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs">No roles</span>
                )}
              </div>
            </div>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};

/** Format department role for display */
function formatDeptRole(role: string): string {
  const roleMap: Record<string, string> = {
    'instructor': 'Instructor',
    'dept-admin': 'Dept Admin',
    'department-admin': 'Dept Admin',
    'content-admin': 'Content Admin',
    'billing-admin': 'Billing Admin',
    'course-taker': 'Course Taker',
    'auditor': 'Auditor',
    'learner-supervisor': 'Learner Supervisor',
    'staff': 'Staff',
  };
  return roleMap[role] || role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export const UserManagementPage: React.FC = () => {
  const [selectedUsers, setSelectedUsers] = React.useState<UserListItem[]>([]);
  const [userToEdit, setUserToEdit] = React.useState<UserListItem | null>(null);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Debug: Log when component mounts
  React.useEffect(() => {
    console.log('[UserManagementPage] Component mounted');
  }, []);

  // Fetch staff users
  const { data, isLoading, error, isError, refetch, isFetching, status, fetchStatus } = useQuery({
    queryKey: ['admin', 'staff'],
    queryFn: () => {
      console.log('[UserManagementPage] queryFn CALLED - Fetching staff users...');
      return staffApi.list();
    },
  });

  // Debug logging
  React.useEffect(() => {
    console.log('[UserManagementPage] Query state:', { 
      data, 
      isLoading, 
      isFetching,
      status,
      fetchStatus,
      isError, 
      error 
    });
  }, [data, isLoading, isFetching, status, fetchStatus, isError, error]);

  if (error) {
    return (
      <div className="space-y-6 p-8">
        <PageHeader
          title="Staff Management"
          description="Manage staff user accounts and permissions"
        />
        <ErrorPanel
          title="Unable to load staff users"
          message="Check your access rights or try again."
          error={error}
          details={{
            endpoint: '/users/staff',
            component: 'UserManagementPage',
          }}
          onRetry={() => refetch()}
          links={[{ label: 'Back to Dashboard', to: '/admin/dashboard' }]}
        />
      </div>
    );
  }

  const warningDetails = data?.shapeWarning
    ? { ...data.shapeWarning, component: 'UserManagementPage' }
    : undefined;

  // Delete staff user mutation
  const deleteMutation = useMutation({
    mutationFn: staffApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      toast({
        title: 'Staff user deleted',
        description: 'Staff user has been successfully deleted.',
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
    mutationFn: staffApi.bulkDelete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] });
      toast({
        title: 'Staff users deleted',
        description: `${selectedUsers.length} staff user(s) have been successfully deleted.`,
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
      accessorKey: 'departments',
      header: 'Departments & Roles',
      cell: ({ row }) => {
        return <DepartmentsCell departments={row.original.departments} />;
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
      <PageHeader
        title="Staff Management"
        description="Manage staff user accounts and permissions"
      >
        {selectedUsers.length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash className="mr-2 h-4 w-4" />
            Delete Selected ({selectedUsers.length})
          </Button>
        )}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff User
        </Button>
      </PageHeader>

      {warningDetails && (
        <DataShapeWarning
          title="Staff list response is unexpected"
          message="The staff user list did not match the expected format. Results may be incomplete."
          details={warningDetails}
        />
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.users || []}
        searchable
        searchPlaceholder="Search staff users..."
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
        title="Delete Staff User"
        description="Are you sure you want to delete this staff user? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Delete Multiple Staff Users"
        description={`Are you sure you want to delete ${selectedUsers.length} staff user(s)? This action cannot be undone.`}
        confirmText="Delete All"
        isDestructive
      />
    </div>
  );
};

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
