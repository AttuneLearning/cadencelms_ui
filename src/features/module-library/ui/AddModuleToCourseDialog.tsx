/**
 * AddModuleToCourseDialog Component
 * Dialog for adding a module from the library to a course version
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { BookOpen, Info, AlertCircle, Clock, Users } from 'lucide-react';
import type { ModuleLibraryItem, AddModuleToCourseVersionPayload } from '@/entities/module';

interface AddModuleToCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: ModuleLibraryItem | null;
  courseTitle: string;
  currentModuleCount: number;
  onSubmit: (payload: AddModuleToCourseVersionPayload) => Promise<void>;
  isLoading?: boolean;
}

export const AddModuleToCourseDialog: React.FC<AddModuleToCourseDialogProps> = ({
  open,
  onOpenChange,
  module,
  courseTitle,
  currentModuleCount,
  onSubmit,
  isLoading = false,
}) => {
  const [order, setOrder] = React.useState(currentModuleCount + 1);
  const [isRequired, setIsRequired] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setOrder(currentModuleCount + 1);
      setIsRequired(true);
    }
  }, [open, currentModuleCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module) return;

    await onSubmit({
      moduleId: module.id,
      order,
      isRequired,
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  if (!module) return null;

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hours`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Add Module to Course
          </DialogTitle>
          <DialogDescription>
            Add "{module.title}" to {courseTitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Module info card */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="font-medium">{module.title}</h4>
              {module.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {module.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {module.learningUnitCount} units
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(module.estimatedDuration)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {module.totalEnrollments.toLocaleString()} learners
                </div>
              </div>
              {module.usedInCourseVersionsCount > 0 && (
                <Badge variant="secondary" className="mt-2 text-xs">
                  Already used in {module.usedInCourseVersionsCount} course(s)
                </Badge>
              )}
            </div>

            {/* Order input */}
            <div className="space-y-2">
              <Label htmlFor="order">Position in Course</Label>
              <Input
                id="order"
                type="number"
                min={1}
                max={currentModuleCount + 1}
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Module will be placed at position {order} of {currentModuleCount + 1}
              </p>
            </div>

            {/* Required toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="required">Required Module</Label>
                <p className="text-xs text-muted-foreground">
                  Learners must complete this module to finish the course
                </p>
              </div>
              <Switch
                id="required"
                checked={isRequired}
                onCheckedChange={setIsRequired}
                disabled={isLoading}
              />
            </div>

            {/* Info about shared modules */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                This module is shared from the library. If you need to modify it, changes will
                affect all courses using this module. Consider creating a new module if you need
                course-specific content.
              </AlertDescription>
            </Alert>

            {/* Warning if module is already used widely */}
            {module.usedInCourseVersionsCount > 3 && (
              <Alert variant="default" className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  This is a popular module used across {module.usedInCourseVersionsCount} courses.
                  When learners complete it in any course, it will count as completed for all
                  courses containing this module.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Module'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
