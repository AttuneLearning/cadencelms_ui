/**
 * Submit Confirmation Dialog Component
 * Confirms exam submission with warnings for unanswered questions
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';

export interface SubmitConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  markedForReviewCount: number;
  isSubmitting?: boolean;
}

export function SubmitConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  totalQuestions,
  answeredCount,
  unansweredCount,
  markedForReviewCount,
  isSubmitting = false,
}: SubmitConfirmDialogProps) {
  const hasUnanswered = unansweredCount > 0;
  const hasMarkedReview = markedForReviewCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Exam?</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit your exam? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Questions:</span>
              <span className="font-semibold text-gray-900">{totalQuestions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Answered:</span>
              <span className="font-semibold text-green-600">{answeredCount}</span>
            </div>
            {hasUnanswered && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unanswered Questions:</span>
                <span className="font-semibold text-red-600">{unansweredCount}</span>
              </div>
            )}
            {hasMarkedReview && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Marked for Review:</span>
                <span className="font-semibold text-yellow-600">{markedForReviewCount}</span>
              </div>
            )}
          </div>

          {hasUnanswered && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-red-800">Warning</p>
                <p className="text-red-700">
                  You have {unansweredCount} unanswered question{unansweredCount > 1 ? 's' : ''}. These will receive zero points.
                </p>
              </div>
            </div>
          )}

          {hasMarkedReview && (
            <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" />
              </svg>
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Reminder</p>
                <p className="text-yellow-700">
                  You have {markedForReviewCount} question{markedForReviewCount > 1 ? 's' : ''} marked for review.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
