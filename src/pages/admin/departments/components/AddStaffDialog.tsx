/**
 * Add Staff Dialog
 * Allows adding existing staff members to a department with role selection
 */

import React, { useState } from 'react';
import {  useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';
import { Loader2, Search, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  useStaffList,
  useUpdateStaffDepartments,
  type StaffRole,
} from '@/entities/staff-management';
import { departmentKeys } from '@/entities/department';

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId: string;
  departmentName: string;
  currentStaffIds: string[]; // Filter out already assigned staff
}

const roleDescriptions: Record<StaffRole, string> = {
  'content-admin':
    'Can create and manage courses, content, and exercises within the department',
  instructor: 'Can teach courses, grade assignments, and interact with learners',
  'dept-admin':
    'Full administrative access to department settings, staff, and programs',
};

export const AddStaffDialog: React.FC<AddStaffDialogProps> = ({
  open,
  onOpenChange,
  departmentId,
  departmentName,
  currentStaffIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<StaffRole>('instructor');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch staff list with search
  const { data: staffData, isLoading: isLoadingStaff } = useStaffList({
    search: searchQuery || undefined,
    status: 'active',
    limit: 50,
  });

  // Update staff departments mutation
  const updateStaffMutation = useUpdateStaffDepartments();

  // Filter out staff already in department
  const availableStaff =
    staffData?.staff.filter((staff) => !currentStaffIds.includes(staff.id)) || [];

  // Find selected staff details
  const selectedStaff = availableStaff.find((s) => s.id === selectedStaffId);

  const handleAddStaff = async () => {
    if (!selectedStaffId) return;

    try {
      await updateStaffMutation.mutateAsync({
        id: selectedStaffId,
        payload: {
          action: 'add',
          departmentAssignments: [
            {
              departmentId,
              role: selectedRole,
            },
          ],
        },
      });

      toast({
        title: 'Staff added',
        description: `Successfully added ${selectedStaff?.firstName} ${selectedStaff?.lastName} to ${departmentName}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStaff(departmentId),
      });
      queryClient.invalidateQueries({
        queryKey: departmentKeys.departmentStats(departmentId),
      });

      // Reset and close
      setSelectedStaffId(null);
      setSearchQuery('');
      setSelectedRole('instructor');
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add staff member',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setSelectedStaffId(null);
    setSearchQuery('');
    setSelectedRole('instructor');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Staff to {departmentName}</DialogTitle>
          <DialogDescription>
            Search for a staff member and assign them a role in this department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Staff Search */}
          <div className="space-y-2">
            <Label htmlFor="staff-search">Search Staff</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="staff-search"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Staff Selection List */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <Label className="mb-2">
              Select Staff Member ({availableStaff.length} available)
            </Label>
            <div className="border rounded-md overflow-y-auto flex-1">
              {isLoadingStaff ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading staff...</span>
                </div>
              ) : availableStaff.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <User className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No staff found matching your search' : 'No available staff'}
                  </p>
                </div>
              ) : (
                <div>
                  {availableStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className={cn(
                        'p-3 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0',
                        selectedStaffId === staff.id && 'bg-accent'
                      )}
                      onClick={() => setSelectedStaffId(staff.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{staff.email}</div>
                        </div>
                        {selectedStaffId === staff.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          {selectedStaffId && (
            <div className="space-y-2">
              <Label htmlFor="role-select">Department Role</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as StaffRole)}>
                <SelectTrigger id="role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="content-admin">Content Admin</SelectItem>
                  <SelectItem value="dept-admin">Department Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{roleDescriptions[selectedRole]}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddStaff}
            disabled={!selectedStaffId || updateStaffMutation.isPending}
          >
            {updateStaffMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Staff'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
