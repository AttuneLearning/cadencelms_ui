/**
 * Staff Form Component
 * Form for creating and editing staff members
 */

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Loader2, Save, Plus, X } from 'lucide-react';
import { useRegisterStaff, useUpdateStaff } from '../model/useStaff';
import type {
  Staff,
  RegisterStaffPayload,
  UpdateStaffPayload,
  DepartmentAssignment,
  DefaultDashboard,
} from '../model/types';

interface StaffFormProps {
  staff?: Staff; // If provided, form is in edit mode
  onSuccess?: (staff: Staff) => void;
  onCancel?: () => void;
}

export function StaffForm({ staff, onSuccess, onCancel }: StaffFormProps) {
  const isEditMode = !!staff;
  const registerStaff = useRegisterStaff();
  const updateStaff = useUpdateStaff();

  const [formData, setFormData] = useState<Partial<RegisterStaffPayload> & { id?: string }>({
    email: staff?.email || '',
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    password: '',
    departmentAssignments: staff?.departments?.map(dept => ({
      departmentId: dept.departmentId,
      role: (dept.rolesInDepartment?.[0] || 'instructor') as 'instructor' | 'content-admin' | 'dept-admin',
    })) || [],
    defaultDashboard: (staff?.defaultDashboard as DefaultDashboard) || 'content-admin',
    isActive: staff?.isActive ?? true,
    id: staff?.id,
  });

  const [newDepartment, setNewDepartment] = useState<Partial<DepartmentAssignment>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        email: staff.email,
        firstName: staff.firstName,
        lastName: staff.lastName,
        password: '',
        departmentAssignments: staff.departments?.map(dept => ({
          departmentId: dept.departmentId,
          role: (dept.rolesInDepartment?.[0] || 'instructor') as 'instructor' | 'content-admin' | 'dept-admin',
        })) || [],
        defaultDashboard: (staff.defaultDashboard as DefaultDashboard) || 'content-admin',
        isActive: staff.isActive,
        id: staff.id,
      });
    }
  }, [staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode && formData.id) {
        // Update existing staff (only allowed fields)
        const updatePayload: UpdateStaffPayload = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          defaultDashboard: formData.defaultDashboard,
          isActive: formData.isActive,
        };
        const result = await updateStaff.mutateAsync({
          id: formData.id,
          payload: updatePayload,
        });
        onSuccess?.(result);
      } else {
        // Register new staff
        const registerPayload: RegisterStaffPayload = {
          email: formData.email!,
          password: formData.password!,
          firstName: formData.firstName!,
          lastName: formData.lastName!,
          departmentAssignments: formData.departmentAssignments || [],
          defaultDashboard: formData.defaultDashboard,
          isActive: formData.isActive,
        };
        const result = await registerStaff.mutateAsync(registerPayload);
        onSuccess?.(result);
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddDepartment = () => {
    if (newDepartment.departmentId && newDepartment.role) {
      setFormData((prev) => ({
        ...prev,
        departmentAssignments: [
          ...(prev.departmentAssignments || []),
          newDepartment as DepartmentAssignment,
        ],
      }));
      setNewDepartment({});
    }
  };

  const handleRemoveDepartment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      departmentAssignments: prev.departmentAssignments?.filter((_, i) => i !== index),
    }));
  };

  const isLoading = registerStaff.isPending || updateStaff.isPending;
  const isError = registerStaff.isError || updateStaff.isError;
  const error = registerStaff.error || updateStaff.error;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? 'Edit Staff Member' : 'Register New Staff'}</CardTitle>
        <CardDescription>
          {isEditMode
            ? 'Update staff member information'
            : 'Create a new staff account with department assignments'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              placeholder="staff@example.com"
            />
          </div>

          {/* Password (only for new staff) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={8}
                placeholder="Min 8 characters, with uppercase, lowercase, number"
              />
              <p className="text-sm text-muted-foreground">
                Password must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>
          )}

          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName">
              First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              required
              minLength={1}
              maxLength={100}
              placeholder="John"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              required
              minLength={1}
              maxLength={100}
              placeholder="Doe"
            />
          </div>

          {/* Department Assignments (only for new staff) */}
          {!isEditMode && (
            <div className="space-y-3">
              <Label>
                Department Assignments <span className="text-destructive">*</span>
              </Label>

              {/* Existing Assignments */}
              {formData.departmentAssignments && formData.departmentAssignments.length > 0 && (
                <div className="space-y-2">
                  {formData.departmentAssignments.map((dept, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 rounded-md border p-2"
                    >
                      <div className="flex-1 flex items-center gap-2">
                        <Badge variant="secondary">{dept.departmentId}</Badge>
                        <Badge variant="outline">{dept.role}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDepartment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Assignment */}
              <div className="flex gap-2">
                <Input
                  placeholder="Department ID"
                  value={newDepartment.departmentId || ''}
                  onChange={(e) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      departmentId: e.target.value,
                    }))
                  }
                />
                <Select
                  value={newDepartment.role}
                  onValueChange={(value) =>
                    setNewDepartment((prev) => ({
                      ...prev,
                      role: value as 'instructor' | 'content-admin' | 'dept-admin',
                    }))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="content-admin">Content Admin</SelectItem>
                    <SelectItem value="dept-admin">Dept Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddDepartment}
                  disabled={!newDepartment.departmentId || !newDepartment.role}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                At least one department assignment is required
              </p>
            </div>
          )}

          {/* Default Dashboard */}
          <div className="space-y-2">
            <Label htmlFor="defaultDashboard">Default Dashboard</Label>
            <Select
              value={formData.defaultDashboard}
              onValueChange={(value) => handleChange('defaultDashboard', value)}
            >
              <SelectTrigger id="defaultDashboard">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content-admin">Content Admin</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Account is active (can login)
            </Label>
          </div>

          {/* Error Message */}
          {isError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error?.message || 'Failed to save staff member. Please try again.'}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditMode ? 'Update Staff' : 'Register Staff'}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
