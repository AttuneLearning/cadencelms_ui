/**
 * GrantExceptionDialog
 * Dialog to grant an exception to a learner
 */

import React, { useState } from 'react';
import { useGrantException } from '@/entities/exception';
import type { ExceptionType } from '@/entities/exception';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useToast } from '@/shared/ui/use-toast';

export interface GrantExceptionDialogProps {
  learnerId: string;
  learnerName: string;
  courseId: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const GrantExceptionDialog: React.FC<GrantExceptionDialogProps> = ({
  learnerId,
  learnerName,
  courseId,
  trigger,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [exceptionType, setExceptionType] = useState<ExceptionType>('extra_attempts');
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  // Type-specific fields
  const [additionalAttempts, setAdditionalAttempts] = useState('1');
  const [contentId, setContentId] = useState('');
  const [contentType, setContentType] = useState<'exercise' | 'exam' | 'quiz'>('exercise');
  const [moduleId, setModuleId] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newExpirationDate, setNewExpirationDate] = useState('');

  const grantExceptionMutation = useGrantException();

  const resetForm = () => {
    setExceptionType('extra_attempts');
    setReason('');
    setExpiresAt('');
    setAdditionalAttempts('1');
    setContentId('');
    setContentType('exercise');
    setModuleId('');
    setModuleName('');
    setNewGrade('');
    setNewExpirationDate('');
  };

  const buildDetails = (): Record<string, unknown> => {
    switch (exceptionType) {
      case 'extra_attempts':
        return {
          contentId,
          contentType,
          additionalAttempts: parseInt(additionalAttempts, 10),
        };
      case 'extended_access':
        return {
          newExpirationDate,
        };
      case 'module_unlock':
        return {
          moduleId,
          moduleName,
        };
      case 'grade_override':
        return {
          contentId,
          contentType,
          newGrade: parseFloat(newGrade),
        };
      case 'excused_content':
        return {
          contentId,
          contentType,
          contentName: moduleName, // Reuse moduleName field for content name
        };
      default:
        return {};
    }
  };

  const validateForm = (): string | null => {
    if (!reason.trim()) {
      return 'Reason is required';
    }

    switch (exceptionType) {
      case 'extra_attempts':
        if (!contentId) return 'Content ID is required';
        if (!additionalAttempts || parseInt(additionalAttempts, 10) < 1) {
          return 'Additional attempts must be at least 1';
        }
        break;
      case 'extended_access':
        if (!newExpirationDate) return 'New expiration date is required';
        break;
      case 'module_unlock':
        if (!moduleId) return 'Module ID is required';
        if (!moduleName) return 'Module name is required';
        break;
      case 'grade_override':
        if (!contentId) return 'Content ID is required';
        if (!newGrade || isNaN(parseFloat(newGrade))) {
          return 'Valid grade is required';
        }
        break;
      case 'excused_content':
        if (!contentId) return 'Content ID is required';
        if (!moduleName) return 'Content name is required';
        break;
    }

    return null;
  };

  const handleGrant = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      await grantExceptionMutation.mutateAsync({
        learnerId,
        courseId,
        type: exceptionType,
        details: buildDetails(),
        reason,
        expiresAt: expiresAt || undefined,
      });

      toast({
        title: 'Success',
        description: `Exception granted to ${learnerName}`,
      });

      setOpen(false);
      resetForm();
      onSuccess?.();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to grant exception',
        variant: 'destructive',
      });
    }
  };

  const renderTypeSpecificFields = () => {
    switch (exceptionType) {
      case 'extra_attempts':
        return (
          <>
            <div>
              <Label htmlFor="content-id">Content ID</Label>
              <Input
                id="content-id"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="Enter content ID"
              />
            </div>
            <div>
              <Label htmlFor="content-type">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger id="content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="additional-attempts">Additional Attempts</Label>
              <Input
                id="additional-attempts"
                type="number"
                min="1"
                value={additionalAttempts}
                onChange={(e) => setAdditionalAttempts(e.target.value)}
              />
            </div>
          </>
        );

      case 'extended_access':
        return (
          <div>
            <Label htmlFor="new-expiration">New Expiration Date</Label>
            <Input
              id="new-expiration"
              type="date"
              value={newExpirationDate}
              onChange={(e) => setNewExpirationDate(e.target.value)}
            />
          </div>
        );

      case 'module_unlock':
        return (
          <>
            <div>
              <Label htmlFor="module-id">Module ID</Label>
              <Input
                id="module-id"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                placeholder="Enter module ID"
              />
            </div>
            <div>
              <Label htmlFor="module-name">Module Name</Label>
              <Input
                id="module-name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter module name"
              />
            </div>
          </>
        );

      case 'grade_override':
        return (
          <>
            <div>
              <Label htmlFor="grade-content-id">Content ID</Label>
              <Input
                id="grade-content-id"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="Enter content ID"
              />
            </div>
            <div>
              <Label htmlFor="grade-content-type">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger id="grade-content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-grade">New Grade</Label>
              <Input
                id="new-grade"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                placeholder="Enter grade (0-100)"
              />
            </div>
          </>
        );

      case 'excused_content':
        return (
          <>
            <div>
              <Label htmlFor="excused-content-id">Content ID</Label>
              <Input
                id="excused-content-id"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                placeholder="Enter content ID"
              />
            </div>
            <div>
              <Label htmlFor="excused-content-type">Content Type</Label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
                <SelectTrigger id="excused-content-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exercise">Exercise</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="content-name">Content Name</Label>
              <Input
                id="content-name"
                value={moduleName}
                onChange={(e) => setModuleName(e.target.value)}
                placeholder="Enter content name"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Grant Exception</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grant Exception</DialogTitle>
          <DialogDescription>
            Grant an exception to {learnerName} for this course
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="exception-type">Exception Type</Label>
            <Select
              value={exceptionType}
              onValueChange={(v) => setExceptionType(v as ExceptionType)}
            >
              <SelectTrigger id="exception-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extra_attempts">Extra Attempts</SelectItem>
                <SelectItem value="extended_access">Extended Access</SelectItem>
                <SelectItem value="module_unlock">Module Unlock</SelectItem>
                <SelectItem value="grade_override">Grade Override</SelectItem>
                <SelectItem value="excused_content">Excused Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderTypeSpecificFields()}

          <div>
            <Label htmlFor="reason">Reason (Required)</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for this exception..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="expires-at">Expires At (Optional)</Label>
            <Input
              id="expires-at"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGrant} disabled={grantExceptionMutation.isPending}>
            {grantExceptionMutation.isPending ? 'Granting...' : 'Grant Exception'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
