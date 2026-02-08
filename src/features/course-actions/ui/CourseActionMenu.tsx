/**
 * Course Action Menu
 * Dropdown menu for course management actions
 *
 * Actions:
 * - Publish (draft → published)
 * - Unpublish (published → draft)
 * - Archive (any → archived)
 * - Duplicate (create copy)
 * - Delete (with confirmation)
 *
 * Following FSD architecture - features/course-actions
 * Reference: ADR-UI-001-FSD-ARCHITECTURE
 */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToast } from '@/shared/ui/use-toast';
import {
  useDeleteCourse,
  usePublishCourse,
  useUnpublishCourse,
  useArchiveCourse,
  useDuplicateCourse,
  type CourseListItem,
} from '@/entities/course';
import {
  MoreHorizontal,
  Eye,
  EyeOff,
  Archive,
  Copy,
  Trash,
} from 'lucide-react';

type DialogType = 'publish' | 'unpublish' | 'archive' | 'delete' | null;

export interface CourseActionMenuProps {
  course: CourseListItem;
  /** Callback after successful action (e.g., to refetch list) */
  onActionComplete?: () => void;
  /** Whether user can perform edit-level actions */
  canEdit?: boolean;
}

export const CourseActionMenu: React.FC<CourseActionMenuProps> = ({
  course,
  onActionComplete,
  canEdit = true,
}) => {
  const { toast } = useToast();
  const [activeDialog, setActiveDialog] = React.useState<DialogType>(null);

  // Mutations
  const deleteMutation = useDeleteCourse();
  const publishMutation = usePublishCourse();
  const unpublishMutation = useUnpublishCourse();
  const archiveMutation = useArchiveCourse();
  const duplicateMutation = useDuplicateCourse();

  // Status checks
  const isPublished = course.status === 'published';
  const isArchived = course.status === 'archived';
  const isDraft = course.status === 'draft';

  // Handlers
  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync({ id: course.id });
      toast({
        title: 'Course published',
        description: `"${course.title}" is now visible to students.`,
      });
      setActiveDialog(null);
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: 'Failed to publish',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublish = async () => {
    try {
      await unpublishMutation.mutateAsync({ id: course.id });
      toast({
        title: 'Course unpublished',
        description: `"${course.title}" is now hidden from students.`,
      });
      setActiveDialog(null);
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: 'Failed to unpublish',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync({ id: course.id });
      toast({
        title: 'Course archived',
        description: `"${course.title}" has been archived.`,
      });
      setActiveDialog(null);
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: 'Failed to archive',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await duplicateMutation.mutateAsync({
        id: course.id,
        payload: {
          newCode: `${course.code}-COPY`,
          newTitle: `${course.title} (Copy)`,
          includeModules: true,
          includeSettings: true,
        },
      });
      toast({
        title: 'Course duplicated',
        description: `Created "${result.title}".`,
      });
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: 'Failed to duplicate',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(course.id);
      toast({
        title: 'Course deleted',
        description: `"${course.title}" has been permanently deleted.`,
      });
      setActiveDialog(null);
      onActionComplete?.();
    } catch (error: any) {
      toast({
        title: 'Failed to delete',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isLoading =
    deleteMutation.isPending ||
    publishMutation.isPending ||
    unpublishMutation.isPending ||
    archiveMutation.isPending ||
    duplicateMutation.isPending;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isLoading}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          {/* Publish/Unpublish */}
          {canEdit && !isArchived && (
            <>
              {isDraft && (
                <DropdownMenuItem onClick={() => setActiveDialog('publish')}>
                  <Eye className="mr-2 h-4 w-4" />
                  Publish
                </DropdownMenuItem>
              )}
              {isPublished && (
                <DropdownMenuItem onClick={() => setActiveDialog('unpublish')}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Unpublish
                </DropdownMenuItem>
              )}
            </>
          )}

          {/* Duplicate */}
          <DropdownMenuItem onClick={handleDuplicate} disabled={duplicateMutation.isPending}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          {/* Archive */}
          {canEdit && !isArchived && (
            <DropdownMenuItem onClick={() => setActiveDialog('archive')}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Delete */}
          {canEdit && (
            <DropdownMenuItem
              onClick={() => setActiveDialog('delete')}
              className="text-destructive focus:text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Publish Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'publish'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onConfirm={handlePublish}
        title="Publish Course"
        description={`Are you sure you want to publish "${course.title}"? This will make it visible to students.`}
        confirmText="Publish"
        isLoading={publishMutation.isPending}
      />

      {/* Unpublish Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'unpublish'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onConfirm={handleUnpublish}
        title="Unpublish Course"
        description={`Are you sure you want to unpublish "${course.title}"? Students will no longer be able to access it.`}
        confirmText="Unpublish"
        isLoading={unpublishMutation.isPending}
      />

      {/* Archive Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'archive'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onConfirm={handleArchive}
        title="Archive Course"
        description={`Are you sure you want to archive "${course.title}"? Archived courses are no longer accessible to students.`}
        confirmText="Archive"
        isLoading={archiveMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={activeDialog === 'delete'}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        description={`Are you sure you want to delete "${course.title}"? This action cannot be undone and will remove all associated modules and enrollments.`}
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
      />
    </>
  );
};
