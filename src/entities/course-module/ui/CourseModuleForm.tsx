/**
 * CourseModuleForm Component
 * Form for creating and editing course modules (chapters/sections)
 *
 * Note: Modules are organizational containers. Content types belong to Learning Units.
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import type {
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
} from '../model/types';

interface CourseModuleFormProps {
  mode: 'create' | 'edit';
  defaultValues?: UpdateCourseModulePayload & { order?: number };
  onSubmit: (data: CreateCourseModulePayload | UpdateCourseModulePayload) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface FormData {
  title: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
  passingScore?: number;
  duration?: number;
}

export const CourseModuleForm: React.FC<CourseModuleFormProps> = ({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      order: defaultValues?.order || 1,
      isPublished: defaultValues?.isPublished || false,
      passingScore: defaultValues?.passingScore || undefined,
      duration: defaultValues?.duration || undefined,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    const payload: CreateCourseModulePayload | UpdateCourseModulePayload = {
      title: data.title,
      description: data.description || undefined,
      ...(mode === 'create' && { order: data.order || 1 }),
      // Default to 'custom' type for API compatibility - modules don't have meaningful types
      ...(mode === 'create' && { type: 'custom' as const }),
      isPublished: data.isPublished,
      passingScore: data.passingScore || undefined,
      duration: data.duration || undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Module Information</CardTitle>
          <CardDescription>
            Modules are like chapters or sections within your course. Add learning content (videos, documents, assessments) after creating the module.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', {
                required: 'Title is required',
                minLength: { value: 1, message: 'Title must be at least 1 character' },
                maxLength: { value: 200, message: 'Title must be at most 200 characters' },
              })}
              placeholder="e.g., Introduction, Chapter 1, Unit A"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description', {
                maxLength: { value: 2000, message: 'Description must be at most 2000 characters' },
              })}
              placeholder="Describe what learners will cover in this module"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {mode === 'create' && (
            <div className="space-y-2">
              <Label htmlFor="order">Order *</Label>
              <Input
                id="order"
                type="number"
                {...register('order', {
                  required: 'Order is required',
                  min: { value: 1, message: 'Order must be at least 1' },
                })}
                placeholder="1"
              />
              {errors.order && (
                <p className="text-sm text-destructive">{errors.order.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Position of this module in the course sequence
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Optional configuration for this module
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passingScore">Passing Score (%)</Label>
              <Input
                id="passingScore"
                type="number"
                {...register('passingScore', {
                  min: { value: 0, message: 'Must be at least 0' },
                  max: { value: 100, message: 'Must be at most 100' },
                })}
                placeholder="70"
              />
              {errors.passingScore && (
                <p className="text-sm text-destructive">{errors.passingScore.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum score required to pass this module
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', {
                  min: { value: 0, message: 'Must be at least 0' },
                })}
                placeholder="30"
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
          <CardDescription>
            Control when learners can see this module
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Published</Label>
              <p className="text-sm text-muted-foreground">
                Make this module visible to enrolled learners
              </p>
            </div>
            <Switch
              checked={watch('isPublished')}
              onCheckedChange={(checked: boolean) => setValue('isPublished', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Module' : 'Update Module'}
        </Button>
      </div>
    </form>
  );
};
