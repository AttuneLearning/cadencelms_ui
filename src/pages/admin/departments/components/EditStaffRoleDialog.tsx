/**
 * Edit Staff Role Dialog
 * Allows changing a staff member's role within a department
 */

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { useUpdateStaffDepartments, type StaffRole } from '@/entities/staff-management';
import { departmentKeys, type DepartmentStaffMember } from '@/entities/department';

interface EditStaffRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: DepartmentStaffMember | null;
  departmentId: string;
}

// Map department roles to staff-management roles
const roleMapping: Record<string, StaffRole> = {
  'content-admin': 'content-admin',
  instructor: 'instructor',
  observer: 'instructor', // Observer maps to instructor in staff-management
};

const roleDescriptions: Record<string, string> = {
  'content-admin':
    'Can create and manage courses, content, and exercises within the department',
  instructor: 'Can teach courses, grade assignments, and interact with learners',
  observer: 'Can view courses and department content but cannot make changes',
};

const formatRoleName = (role: string): string => {
  return role
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const EditStaffRoleDialog: React.FC<EditStaffRoleDialogProps> = ({
  open,
  onOpenChange,
  staff,
  departmentId,
}) => {
  const [newRole, setNewRole] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStaffMutation = useUpdateStaffDepartments();

  // Set initial role when dialog opens or staff changes
  useEffect(() => {
    if (staff) {
      setNewRole(staff.departmentRole);
    }
  }, [staff]);

  const handleUpdateRole = async () => {
    if (!staff || newRole === staff.departmentRole) return;

    try {
      await updateStaffMutation.mutateAsync({
        id: staff.id,
        payload: {
          action: 'update',
          departmentAssignments: [
            {
              departmentId,
              role: roleMapping[newRole] || (newRole as StaffRole),
            },
          ],
        },
      });

      toast({
        title: 'Role updated',
        description: `Successfully updated role for ${staff.fullName}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStaff(departmentId),
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  if (!staff) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Role for {staff.fullName}</DialogTitle>
          <DialogDescription>
            Change this staff member's role within the department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Role</Label>
            <div className="mt-2">
              <Badge variant="secondary" className="text-sm">
                {formatRoleName(staff.departmentRole)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-role">New Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger id="new-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="content-admin">Content Admin</SelectItem>
                <SelectItem value="observer">Observer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{roleDescriptions[newRole]}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={newRole === staff.departmentRole || updateStaffMutation.isPending}
          >
            {updateStaffMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Role'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
