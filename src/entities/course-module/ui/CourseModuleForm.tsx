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
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
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
  const form = useForm<FormData>({
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Module Information</CardTitle>
            <CardDescription>
              Modules are like chapters or sections within your course. Add learning content (videos, documents, assessments) after creating the module.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              rules={{
                required: 'Title is required',
                minLength: { value: 1, message: 'Title must be at least 1 character' },
                maxLength: { value: 200, message: 'Title must be at most 200 characters' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Introduction, Chapter 1, Unit A"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{
                maxLength: { value: 2000, message: 'Description must be at most 2000 characters' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what learners will cover in this module"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'create' && (
              <FormField
                control={form.control}
                name="order"
                rules={{
                  required: 'Order is required',
                  min: { value: 1, message: 'Order must be at least 1' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1"
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Position of this module in the course sequence
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="passingScore"
                rules={{
                  min: { value: 0, message: 'Must be at least 0' },
                  max: { value: 100, message: 'Must be at most 100' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="70"
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Minimum score required to pass this module
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                rules={{
                  min: { value: 0, message: 'Must be at least 0' },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="30"
                        value={field.value ?? ''}
                        onChange={(event) => {
                          const value = event.target.value;
                          field.onChange(value === '' ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      Make this module visible to enrolled learners
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
    </Form>
  );
};
