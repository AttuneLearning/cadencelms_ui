/**
 * Program Form Component
 * Form for creating or editing programs
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
import { useCreateProgram, useUpdateProgram } from '../model/useProgram';
import type {
  Program,
  CreateProgramPayload,
  UpdateProgramPayload,
  ProgramCredential,
  DurationUnit,
  ProgramStatus,
} from '../model/types';

interface ProgramFormProps {
  program?: Program;
  onSuccess?: () => void;
  onCancel?: () => void;
  availableDepartments?: { id: string; name: string; code: string }[];
}

export function ProgramForm({
  program,
  onSuccess,
  onCancel,
  availableDepartments = [],
}: ProgramFormProps) {
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();

  const [formData, setFormData] = useState<
    CreateProgramPayload | UpdateProgramPayload
  >({
    name: program?.name || '',
    code: program?.code || '',
    description: program?.description || undefined,
    department: program ? program.department.id : availableDepartments[0]?.id || '',
    credential: program?.credential || 'certificate',
    duration: program?.duration || 1,
    durationUnit: program?.durationUnit || 'months',
    isPublished: program?.isPublished || false,
    ...(program && { status: program.status }),
  });

  const isEditing = !!program;
  const isLoading = createProgram.isPending || updateProgram.isPending;
  const error = createProgram.error || updateProgram.error;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await updateProgram.mutateAsync({
          id: program.id,
          payload: formData as UpdateProgramPayload,
        });
      } else {
        await createProgram.mutateAsync(formData as CreateProgramPayload);
      }
      onSuccess?.();
    } catch (err) {
      console.error('Failed to save program:', err);
    }
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | number | boolean | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <p>{error.message || 'Failed to save program. Please try again.'}</p>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Edit Program' : 'Create New Program'}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update the program information below.'
              : 'Fill in the information to create a new program.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Program Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Certified Business Technician"
              required
              minLength={1}
              maxLength={200}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Full name of the program (1-200 characters)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">
              Program Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="code"
              type="text"
              value={formData.code}
              onChange={(e) =>
                handleChange('code', e.target.value.toUpperCase())
              }
              placeholder="CBT-101"
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
              placeholder="Comprehensive business technology certification program"
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
            <Label htmlFor="department">
              Department <span className="text-destructive">*</span>
            </Label>
            <Select
              value={(formData as CreateProgramPayload).department}
              onValueChange={(value) => handleChange('department' as any, value)}
              disabled={isLoading || isEditing}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Department cannot be changed after creation
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credential">
                Credential Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.credential as ProgramCredential}
                onValueChange={(value) =>
                  handleChange('credential', value as ProgramCredential)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="credential">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="degree">Degree</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    handleChange('duration', parseInt(e.target.value, 10))
                  }
                  placeholder="6"
                  required
                  min={1}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Select
                  value={formData.durationUnit as DurationUnit}
                  onValueChange={(value) =>
                    handleChange('durationUnit', value as DurationUnit)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="isPublished">Publication Status</Label>
            <Select
              value={formData.isPublished ? 'published' : 'draft'}
              onValueChange={(value) =>
                handleChange('isPublished', value === 'published')
              }
              disabled={isLoading}
            >
              <SelectTrigger id="isPublished">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft (Not visible to learners)</SelectItem>
                <SelectItem value="published">Published (Visible to learners)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={(formData as UpdateProgramPayload).status as ProgramStatus}
                onValueChange={(value) =>
                  handleChange('status' as any, value as ProgramStatus)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Accepting enrollments)</SelectItem>
                  <SelectItem value="inactive">Inactive (Paused)</SelectItem>
                  <SelectItem value="archived">Archived (Historical)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
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
              {isEditing ? 'Update' : 'Create'} Program
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
