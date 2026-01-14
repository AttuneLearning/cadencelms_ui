/**
 * CourseModuleForm Component
 * Form for creating and editing course segments
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import type {
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
  CourseModuleType,
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
  type?: CourseModuleType;
  contentId?: string;
  isPublished?: boolean;
  passingScore?: number;
  duration?: number;
  allowMultipleAttempts?: boolean;
  maxAttempts?: number;
  timeLimit?: number;
  showFeedback?: boolean;
  shuffleQuestions?: boolean;
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
      type: defaultValues?.type || 'custom',
      contentId: defaultValues?.contentId || '',
      isPublished: defaultValues?.isPublished || false,
      passingScore: defaultValues?.passingScore || undefined,
      duration: defaultValues?.duration || undefined,
      allowMultipleAttempts: true,
      maxAttempts: undefined,
      timeLimit: undefined,
      showFeedback: true,
      shuffleQuestions: false,
    },
  });

  const allowMultipleAttempts = watch('allowMultipleAttempts');
  const selectedType = watch('type');

  const handleFormSubmit = (data: FormData) => {
    const payload: CreateCourseModulePayload | UpdateCourseModulePayload = {
      title: data.title,
      description: data.description || undefined,
      ...(mode === 'create' && { order: data.order || 1 }),
      ...(mode === 'create' && { type: data.type || 'custom' }),
      ...(mode === 'edit' && data.type && { type: data.type }),
      contentId: data.contentId || undefined,
      isPublished: data.isPublished,
      passingScore: data.passingScore || undefined,
      duration: data.duration || undefined,
      settings: {
        allowMultipleAttempts: data.allowMultipleAttempts || false,
        maxAttempts: data.maxAttempts || null,
        timeLimit: data.timeLimit || null,
        showFeedback: data.showFeedback || false,
        shuffleQuestions: data.shuffleQuestions || false,
      },
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Enter the module's title, description, and order
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
              placeholder="Enter module title"
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
              placeholder="Enter module description"
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Type {mode === 'create' && '*'}</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => setValue('type', value as CourseModuleType)}
                disabled={mode === 'edit'}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="scorm">SCORM</SelectItem>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>
            Configure content reference and scoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contentId">Content ID</Label>
            <Input
              id="contentId"
              {...register('contentId')}
              placeholder="Reference to content library (optional)"
            />
          </div>

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
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', {
                  min: { value: 0, message: 'Must be at least 0' },
                })}
                placeholder="3600"
              />
              {errors.duration && (
                <p className="text-sm text-destructive">{errors.duration.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Module Settings</CardTitle>
          <CardDescription>
            Configure attempts, time limits, and feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Multiple Attempts</Label>
              <p className="text-sm text-muted-foreground">
                Allow learners to retry this module
              </p>
            </div>
            <Switch
              checked={allowMultipleAttempts}
              onCheckedChange={(checked: boolean) => setValue('allowMultipleAttempts', checked)}
            />
          </div>

          {allowMultipleAttempts && (
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Maximum Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                {...register('maxAttempts', {
                  min: { value: 1, message: 'Must be at least 1' },
                })}
                placeholder="Unlimited (leave empty)"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
            <Input
              id="timeLimit"
              type="number"
              {...register('timeLimit', {
                min: { value: 0, message: 'Must be at least 0' },
              })}
              placeholder="No limit (leave empty)"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Feedback</Label>
              <p className="text-sm text-muted-foreground">
                Show correct answers and feedback after completion
              </p>
            </div>
            <Switch
              {...register('showFeedback')}
              onCheckedChange={(checked: boolean) => setValue('showFeedback', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Shuffle Questions</Label>
              <p className="text-sm text-muted-foreground">
                Randomize question order for each attempt
              </p>
            </div>
            <Switch
              {...register('shuffleQuestions')}
              onCheckedChange={(checked: boolean) => setValue('shuffleQuestions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Publishing */}
      <Card>
        <CardHeader>
          <CardTitle>Publishing</CardTitle>
          <CardDescription>
            Control module visibility to learners
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Published</Label>
              <p className="text-sm text-muted-foreground">
                Make this module visible to learners
              </p>
            </div>
            <Switch
              {...register('isPublished')}
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
