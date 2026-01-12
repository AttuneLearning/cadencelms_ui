/**
 * StaffForm Component
 * Form for creating or editing staff members
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert } from '@/shared/ui/alert';
import type { Staff, StaffFormData, DepartmentMembership } from '../model/types';
import { Loader2, Plus, Trash2 } from 'lucide-react';

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

export const StaffForm: React.FC<StaffFormProps> = ({
  staff,
  onSubmit,
  onCancel,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<StaffFormData>({
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    password: '',
    phoneNumber: staff?.phoneNumber || '',
    title: staff?.title || '',
    departmentMemberships: staff?.departmentMemberships || [],
    isActive: staff?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleAddDepartment = () => {
    setFormData({
      ...formData,
      departmentMemberships: [
        ...formData.departmentMemberships,
        { departmentId: '', roles: [], isPrimary: false },
      ],
    });
  };

  const handleRemoveDepartment = (index: number) => {
    setFormData({
      ...formData,
      departmentMemberships: formData.departmentMemberships.filter((_, i) => i !== index),
    });
  };

  const handleDepartmentChange = (
    index: number,
    field: keyof DepartmentMembership,
    value: any
  ) => {
    const updated = [...formData.departmentMemberships];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, departmentMemberships: updated });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error}</p>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading || !!staff}
            />
          </div>

          {!staff && (
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!staff}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked as boolean })
              }
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Active
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Department Memberships */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Department Memberships</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddDepartment}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Department
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.departmentMemberships.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No department memberships added yet.
            </p>
          ) : (
            formData.departmentMemberships.map((membership, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>Department ID</Label>
                        <Input
                          value={membership.departmentId}
                          onChange={(e) =>
                            handleDepartmentChange(index, 'departmentId', e.target.value)
                          }
                          placeholder="Enter department ID"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={membership.isPrimary}
                          onCheckedChange={(checked) =>
                            handleDepartmentChange(index, 'isPrimary', checked)
                          }
                          disabled={isLoading}
                        />
                        <Label className="cursor-pointer">Primary Department</Label>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDepartment(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {staff ? 'Update' : 'Create'} Staff
        </Button>
      </div>
    </form>
  );
};
