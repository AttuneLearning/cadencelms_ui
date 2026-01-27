/**
 * Activity Editor Drawer
 * Slide-out drawer shell for simple activity types (media, document, scorm, custom)
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { useToast } from '@/shared/ui/use-toast';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { EDITOR_CONFIGS } from '../model/editor-config';
import { MediaEditor } from './editors/MediaEditor';
import { DocumentEditor } from './editors/DocumentEditor';
import { SCORMEditor } from './editors/SCORMEditor';
import { CustomEmbedEditor } from './editors/CustomEmbedEditor';
import type { LearningUnitType } from '@/entities/learning-unit';
import type { ActivityFormData } from '../model/types';
import type {
  MediaFormData,
  DocumentFormData,
  SCORMFormData,
  CustomFormData,
} from '../lib/validation';

export interface ActivityEditorDrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Activity type being edited */
  type: LearningUnitType;
  /** Module ID */
  moduleId: string;
  /** Course ID */
  courseId: string;
  /** Callback on successful save */
  onSuccess?: () => void;
  /** Existing activity ID for edit mode */
  activityId?: string;
}

/**
 * Activity Editor Drawer Component
 *
 * A slide-out drawer shell for editing simple activity types.
 * Renders type-specific editor forms inside a consistent drawer UI.
 *
 * Features:
 * - Consistent header with type label
 * - Cancel/Save footer buttons
 * - Unsaved changes confirmation
 * - Toast notifications on success/error
 *
 * @example
 * ```tsx
 * <ActivityEditorDrawer
 *   open={showDrawer}
 *   onClose={() => setShowDrawer(false)}
 *   type="media"
 *   moduleId={moduleId}
 *   courseId={courseId}
 *   onSuccess={handleRefresh}
 * />
 * ```
 */
export function ActivityEditorDrawer({
  open,
  onClose,
  type,
  moduleId,
  courseId,
  onSuccess,
  activityId,
}: ActivityEditorDrawerProps) {
  const config = EDITOR_CONFIGS[type];
  const { toast } = useToast();
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!activityId;

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false);
    setIsDirty(false);
    onClose();
  };

  const handleSubmit = async (data: ActivityFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Replace with actual API call in Phase 2
      // const mutation = isEditMode
      //   ? updateLearningUnit({ id: activityId, ...data })
      //   : createLearningUnit({ moduleId, ...data });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: isEditMode ? 'Activity updated' : 'Activity created',
        description: `${config.label} "${data.title}" has been ${isEditMode ? 'updated' : 'created'} successfully.`,
      });

      setIsDirty(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast({
        title: `Failed to ${isEditMode ? 'update' : 'create'} activity`,
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renders the appropriate editor component based on activity type
   */
  const renderEditor = () => {
    const commonProps = {
      moduleId,
      courseId,
      isLoading: isSubmitting,
      formId: 'activity-editor-form',
      onDirtyChange: setIsDirty,
    };

    switch (type) {
      case 'media':
        return (
          <MediaEditor
            {...commonProps}
            onSubmit={(data: MediaFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      case 'document':
        return (
          <DocumentEditor
            {...commonProps}
            onSubmit={(data: DocumentFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      case 'scorm':
        return (
          <SCORMEditor
            {...commonProps}
            onSubmit={(data: SCORMFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      case 'custom':
        return (
          <CustomEmbedEditor
            {...commonProps}
            onSubmit={(data: CustomFormData) => handleSubmit(data as ActivityFormData)}
          />
        );
      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Editor for {type} is not available in drawer mode.
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent
          className={cn(
            'fixed right-0 top-0 h-full w-[500px] max-w-full',
            'rounded-none border-l data-[state=open]:slide-in-from-right',
            'flex flex-col'
          )}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>
              {isEditMode ? 'Edit' : 'New'} {config.label}
            </DialogTitle>
            <DialogDescription>{config.description}</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 px-1">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {renderEditor()}
          </div>

          <DialogFooter className="flex-shrink-0 border-t pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="activity-editor-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={handleConfirmClose}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard"
        isDestructive
      />
    </>
  );
}

export default ActivityEditorDrawer;
