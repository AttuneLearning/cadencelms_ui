/**
 * ModuleDialog Component
 * Dialog for creating and editing course modules
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { CourseModuleForm } from '@/entities/course-module/ui/CourseModuleForm';
import type {
  CourseModuleListItem,
  CreateCourseModulePayload,
  UpdateCourseModulePayload,
} from '@/entities/course-module';

interface ModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  module?: CourseModuleListItem;
  nextOrder?: number;
  onSubmit: (data: CreateCourseModulePayload | UpdateCourseModulePayload) => Promise<void>;
  isLoading?: boolean;
}

export const ModuleDialog: React.FC<ModuleDialogProps> = ({
  open,
  onOpenChange,
  mode,
  module,
  nextOrder = 1,
  onSubmit,
  isLoading = false,
}) => {
  const handleSubmit = async (data: CreateCourseModulePayload | UpdateCourseModulePayload) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Module' : 'Edit Module'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Create a new module for this course'
              : 'Update the module details below'}
          </DialogDescription>
        </DialogHeader>

        <CourseModuleForm
          mode={mode}
          defaultValues={
            module
              ? {
                  title: module.title,
                  description: module.description || undefined,
                  isPublished: module.isPublished,
                  passingScore: module.passingScore || undefined,
                  duration: module.duration || undefined,
                }
              : {
                  order: nextOrder,
                }
          }
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
