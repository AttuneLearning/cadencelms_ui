/**
 * CreateVersionDialog Component
 * Dialog for creating a new version from an existing course version
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
import { Textarea } from '@/shared/ui/textarea';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { GitBranch, AlertCircle, Info } from 'lucide-react';
import type { CourseVersionListItem, CreateCourseVersionPayload } from '@/entities/course-version';

interface CreateVersionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceVersion: CourseVersionListItem | null;
  onSubmit: (payload: CreateCourseVersionPayload) => Promise<void>;
  isLoading?: boolean;
}

export const CreateVersionDialog: React.FC<CreateVersionDialogProps> = ({
  open,
  onOpenChange,
  sourceVersion,
  onSubmit,
  isLoading = false,
}) => {
  const [changeNotes, setChangeNotes] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceVersion) return;

    await onSubmit({
      changeNotes: changeNotes.trim() || undefined,
    });
    setChangeNotes('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setChangeNotes('');
      onOpenChange(false);
    }
  };

  if (!sourceVersion) return null;

  const newVersionNumber = sourceVersion.version + 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Create New Version
          </DialogTitle>
          <DialogDescription>
            Create a new editable version from the current published course.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Version info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Source Version</p>
                  <p className="text-sm text-muted-foreground">{sourceVersion.title}</p>
                </div>
                <Badge variant="outline" className="font-mono">
                  v{sourceVersion.version}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">New version will be:</span>
                <Badge variant="default" className="font-mono bg-green-600">
                  v{newVersionNumber}
                </Badge>
              </div>
            </div>

            {/* Change notes */}
            <div className="space-y-2">
              <Label htmlFor="changeNotes">Change Notes (Optional)</Label>
              <Textarea
                id="changeNotes"
                placeholder="Describe what changes you plan to make in this version..."
                value={changeNotes}
                onChange={(e) => setChangeNotes(e.target.value)}
                rows={3}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                These notes will help track the purpose of this version.
              </p>
            </div>

            {/* Info alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                The new version will be a draft copy of v{sourceVersion.version}. All modules
                and content will be copied. You can edit the new version freely without
                affecting the published version.
              </AlertDescription>
            </Alert>

            {/* Warning if source has active enrollments */}
            {sourceVersion.enrollmentCount > 0 && (
              <Alert variant="default" className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  The source version has {sourceVersion.enrollmentCount.toLocaleString()} active
                  enrollment(s). When you publish the new version, you may need to migrate
                  learners or notify them of the updates.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : `Create v${newVersionNumber}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
