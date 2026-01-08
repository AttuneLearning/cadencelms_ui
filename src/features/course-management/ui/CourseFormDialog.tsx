/**
 * Course Form Dialog Component
 * Dialog wrapper for CourseForm
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { useToast } from '@/shared/ui/use-toast';
import { CourseForm } from './CourseForm';
import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';
import type { Course, CourseFormData } from '@/entities/course/model/types';
import type { CourseFormValues } from '../model/validation';

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course;
}

const createCourse = async (data: CourseFormData): Promise<Course> => {
  const response = await client.post(endpoints.admin.courses.create, data);
  return response.data;
};

const updateCourse = async (id: string, data: Partial<CourseFormData>): Promise<Course> => {
  const response = await client.put(endpoints.admin.courses.update(id), data);
  return response.data;
};

export const CourseFormDialog: React.FC<CourseFormDialogProps> = ({
  open,
  onOpenChange,
  course,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast({
        title: 'Course created',
        description: 'Course has been successfully created.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create course. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseFormData> }) =>
      updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
      toast({
        title: 'Course updated',
        description: 'Course has been successfully updated.',
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update course. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: CourseFormValues) => {
    if (course) {
      updateMutation.mutate({ id: course._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{course ? 'Edit Course' : 'Create New Course'}</DialogTitle>
          <DialogDescription>
            {course
              ? 'Update course information and content.'
              : 'Add a new course to the system.'}
          </DialogDescription>
        </DialogHeader>
        <CourseForm
          course={course}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
