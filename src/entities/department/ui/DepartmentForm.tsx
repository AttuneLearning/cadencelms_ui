/**
 * Department Form Component
 * Form for creating or editing departments
 */

import { useState } from 'react';
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
import { Alert } from '@/shared/ui/alert';
import { Loader2, Save } from 'lucide-react';
import { useCreateDepartment, useUpdateDepartment } from '../model/useDepartment';
import type {
  Department,
  DepartmentDetails,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
} from '../model/types';

interface DepartmentFormProps {
  department?: Department | DepartmentDetails;
  onSuccess?: () => void;
  onCancel?: () => void;
  availableParents?: { id: string; name: string; code: string }[];
}

export function DepartmentForm({
  department,
  onSuccess,
  onCancel,
  availableParents = [],
}: DepartmentFormProps) {
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();

  const [formData, setFormData] = useState<
    CreateDepartmentPayload | UpdateDepartmentPayload
  >({
    name: department?.name || '',
    code: department?.code || '',
    description: department?.description || undefined,
    parentId: department?.parentId || undefined,
    status: department?.status || 'active',
  });

  const isEditing = !!department;
  const isLoading = createDepartment.isPending || updateDepartment.isPending;
  const error = createDepartment.error || updateDepartment.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateDepartment.mutateAsync({
          id: department.id,
          payload: formData,
        });
      } else {
        await createDepartment.mutateAsync(formData as CreateDepartmentPayload);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save department:', err);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error.message || 'Failed to save department. Please try again.'}</p>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Department' : 'Create New Department'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update the department information below.'
              : 'Fill in the information to create a new department.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Department Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Computer Science"
              required
              minLength={1}
              maxLength={200}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Full name of the department (1-200 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Department Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) =>
                handleChange('code', e.target.value.toUpperCase())
              }
              placeholder="CS"
              required
              minLength={2}
              maxLength={20}
              pattern="[A-Z0-9-]+"
              disabled={isLoading}
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Unique code: uppercase letters, numbers, and hyphens only (2-20
              characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Department of Computer Science and Information Technology"
              disabled={isLoading}
              rows={3}
              maxLength={2000}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              {formData.description?.length || 0}/2000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Department</Label>
            <Select
              value={formData.parentId || 'none'}
              onValueChange={(value) =>
                handleChange('parentId', value === 'none' ? undefined : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger id="parentId">
                <SelectValue placeholder="Select parent department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Top-level department)</SelectItem>
                {availableParents.map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name} ({parent.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave as "None" to create a top-level department
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                handleChange('status', value as 'active' | 'inactive')
              }
              disabled={isLoading}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update' : 'Create'} Department
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
