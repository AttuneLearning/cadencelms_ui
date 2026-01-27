/**
 * Course Form Component
 * Form for creating and editing courses
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { courseFormSchema, type CourseFormValues } from '../model/validation';
import type { Course } from '@/entities/course/model/types';

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CourseFormValues) => void;
  isLoading?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmit, isLoading }) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course
      ? {
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription,
          thumbnail: course.thumbnail,
          level: course.level,
          category: course.category,
          tags: course.tags,
          prerequisites: course.prerequisites,
          learningObjectives: course.learningObjectives,
        }
      : {
          title: '',
          description: '',
          shortDescription: '',
          thumbnail: '',
          level: undefined,
          category: '',
          tags: [],
          prerequisites: [],
          learningObjectives: [],
        },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Short Description */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Brief summary displayed in course listings
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Full Description <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea {...field} rows={5} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thumbnail URL</FormLabel>
                <FormControl>
                  <Input type="url" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        {/* Details */}
        <TabsContent value="details" className="space-y-4">
          {/* Level */}
          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as 'beginner' | 'intermediate' | 'advanced')}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter tags separated by commas"
                    value={field.value?.join(', ') ?? ''}
                    onChange={(event) => {
                      const tags = event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean);
                      field.onChange(tags);
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Separate tags with commas
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>

        {/* Content */}
        <TabsContent value="content" className="space-y-4">
          {/* Prerequisites */}
          <FormField
            control={form.control}
            name="prerequisites"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prerequisites</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter each prerequisite on a new line"
                    rows={4}
                    value={field.value?.join('\n') ?? ''}
                    onChange={(event) => {
                      const prerequisites = event.target.value
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      field.onChange(prerequisites);
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  One prerequisite per line
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Learning Objectives */}
          <FormField
            control={form.control}
            name="learningObjectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Objectives</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter each learning objective on a new line"
                    rows={4}
                    value={field.value?.join('\n') ?? ''}
                    onChange={(event) => {
                      const objectives = event.target.value
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean);
                      field.onChange(objectives);
                    }}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  One objective per line
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </TabsContent>
        </Tabs>

        {/* Submit Button */}
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
