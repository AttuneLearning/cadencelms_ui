/**
 * Course Form Component
 * Form for creating and editing courses
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { courseFormSchema, type CourseFormValues } from '../model/validation';
import type { Course } from '@/entities/course/model/types';

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CourseFormValues) => void;
  isLoading?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({ course, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourseFormValues>({
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

  const level = watch('level');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input id="title" {...register('title')} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input id="shortDescription" {...register('shortDescription')} />
            <p className="text-xs text-muted-foreground">
              Brief summary displayed in course listings
            </p>
            {errors.shortDescription && (
              <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Full Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="description"
              {...register('description')}
              className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input id="thumbnail" type="url" {...register('thumbnail')} />
            {errors.thumbnail && (
              <p className="text-sm text-destructive">{errors.thumbnail.message}</p>
            )}
          </div>
        </TabsContent>

        {/* Details */}
        <TabsContent value="details" className="space-y-4">
          {/* Level */}
          <div className="space-y-2">
            <Label htmlFor="level">Difficulty Level</Label>
            <Select
              value={level}
              onValueChange={(value) => setValue('level', value as 'beginner' | 'intermediate' | 'advanced')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...register('category')} />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Enter tags separated by commas"
              onChange={(e) => {
                const tags = e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean);
                setValue('tags', tags);
              }}
              defaultValue={course?.tags?.join(', ')}
            />
            <p className="text-xs text-muted-foreground">Separate tags with commas</p>
          </div>
        </TabsContent>

        {/* Content */}
        <TabsContent value="content" className="space-y-4">
          {/* Prerequisites */}
          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <textarea
              id="prerequisites"
              placeholder="Enter each prerequisite on a new line"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onChange={(e) => {
                const prerequisites = e.target.value.split('\n').map((item) => item.trim()).filter(Boolean);
                setValue('prerequisites', prerequisites);
              }}
              defaultValue={course?.prerequisites?.join('\n')}
            />
            <p className="text-xs text-muted-foreground">One prerequisite per line</p>
          </div>

          {/* Learning Objectives */}
          <div className="space-y-2">
            <Label htmlFor="learningObjectives">Learning Objectives</Label>
            <textarea
              id="learningObjectives"
              placeholder="Enter each learning objective on a new line"
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onChange={(e) => {
                const objectives = e.target.value.split('\n').map((item) => item.trim()).filter(Boolean);
                setValue('learningObjectives', objectives);
              }}
              defaultValue={course?.learningObjectives?.join('\n')}
            />
            <p className="text-xs text-muted-foreground">One objective per line</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
};
