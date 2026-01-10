/**
 * BulkGradingDialog Component
 * Dialog for applying the same grade to multiple submissions
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface BulkGradingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attemptIds: string[];
  onSuccess: () => void;
}

const bulkGradeSchema = z.object({
  score: z.number().min(0, 'Score must be positive').max(100, 'Score cannot exceed 100'),
  feedback: z.string().optional(),
});

type BulkGradeFormData = z.infer<typeof bulkGradeSchema>;

export function BulkGradingDialog({
  open,
  onOpenChange,
  attemptIds,
  onSuccess,
}: BulkGradingDialogProps) {
  const [isApplying, setIsApplying] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BulkGradeFormData>({
    resolver: zodResolver(bulkGradeSchema),
    defaultValues: {
      score: undefined,
      feedback: '',
    },
  });

  const handleApplyGrades = async (_data: BulkGradeFormData) => {
    setIsApplying(true);

    try {
      // In a real implementation, this would call an API
      // For now, we'll simulate the operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success
      onSuccess();
      reset();
    } catch (error) {
      console.error('Failed to apply bulk grades:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Grade Submissions</DialogTitle>
          <DialogDescription>
            Apply the same grade and feedback to multiple submissions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleApplyGrades)} className="space-y-4">
          {/* Warning Alert */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  You are about to apply grades to{' '}
                  <Badge variant="secondary">{attemptIds.length} submissions</Badge>
                </p>
                <p className="text-sm">
                  The same grade and feedback will be applied to all selected submissions.
                  This action cannot be undone.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Score Input */}
          <div className="space-y-2">
            <Label htmlFor="bulk-score">
              Score (%) <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="score"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="bulk-score"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="Enter score (0-100)"
                  className={errors.score ? 'border-destructive' : ''}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  aria-label="Bulk score"
                />
              )}
            />
            {errors.score && (
              <p className="text-sm text-destructive">{errors.score.message}</p>
            )}
            {!errors.score && (
              <p className="text-sm text-muted-foreground">
                Enter a score between 0 and 100. This will be applied to all submissions.
              </p>
            )}
          </div>

          {/* Feedback Input */}
          <div className="space-y-2">
            <Label htmlFor="bulk-feedback">Feedback (Optional)</Label>
            <Controller
              name="feedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="bulk-feedback"
                  placeholder="Enter common feedback for all submissions..."
                  rows={4}
                  aria-label="Bulk feedback"
                />
              )}
            />
            <p className="text-sm text-muted-foreground">
              This feedback will be added to all selected submissions.
            </p>
          </div>

          {/* Preview */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="text-sm">
                <strong>Preview:</strong> {attemptIds.length} submissions will receive a
                score of <strong>{control._formValues.score || 0}%</strong>
                {control._formValues.feedback &&
                  ` with feedback: "${control._formValues.feedback.substring(0, 50)}${
                    control._formValues.feedback.length > 50 ? '...' : ''
                  }"`}
              </div>
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isApplying}>
              Cancel
            </Button>
            <Button type="submit" disabled={isApplying}>
              {isApplying ? 'Applying Grades...' : 'Apply Grades'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
