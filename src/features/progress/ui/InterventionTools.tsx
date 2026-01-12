/**
 * InterventionTools Component
 * Provides intervention actions for staff to help struggling students
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { Mail, RotateCcw, Calendar, CheckCircle } from 'lucide-react';

export interface InterventionToolsProps {
  studentId: string;
  enrollmentId: string;
  onSendMessage?: (studentId: string, message: string) => Promise<void> | void;
  onResetQuiz?: (attemptId: string) => Promise<void> | void;
  onExtendDeadline?: (enrollmentId: string, days: number) => Promise<void> | void;
  onManualOverride?: (enrollmentId: string, reason: string) => Promise<void> | void;
}

export const InterventionTools: React.FC<InterventionToolsProps> = ({
  studentId,
  enrollmentId,
  onSendMessage,
  onResetQuiz,
  onExtendDeadline,
  onManualOverride,
}) => {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extendLoading, setExtendLoading] = useState(false);

  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideLoading, setOverrideLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !onSendMessage) return;

    setMessageLoading(true);
    try {
      await onSendMessage(studentId, messageText);
      setMessageText('');
      setMessageDialogOpen(false);
    } finally {
      setMessageLoading(false);
    }
  };

  const handleResetQuiz = async () => {
    if (!onResetQuiz) return;

    setResetLoading(true);
    try {
      await onResetQuiz(studentId);
      setResetDialogOpen(false);
    } finally {
      setResetLoading(false);
    }
  };

  const handleExtendDeadline = async () => {
    if (!onExtendDeadline) return;

    setExtendLoading(true);
    try {
      await onExtendDeadline(enrollmentId, extensionDays);
      setExtendDialogOpen(false);
      setExtensionDays(7);
    } finally {
      setExtendLoading(false);
    }
  };

  const handleManualOverride = async () => {
    if (!overrideReason.trim() || !onManualOverride) return;

    setOverrideLoading(true);
    try {
      await onManualOverride(enrollmentId, overrideReason);
      setOverrideReason('');
      setOverrideDialogOpen(false);
    } finally {
      setOverrideLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Intervention Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setMessageDialogOpen(true)}
          disabled={!onSendMessage}
        >
          <Mail className="mr-2 h-4 w-4" />
          Send Reminder
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setResetDialogOpen(true)}
          disabled={!onResetQuiz}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset Quiz
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setExtendDialogOpen(true)}
          disabled={!onExtendDeadline}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Extend Deadline
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => setOverrideDialogOpen(true)}
          disabled={!onManualOverride}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark Complete
        </Button>
      </CardContent>

      {/* Send Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Reminder Message</DialogTitle>
            <DialogDescription>
              Send a reminder or encouragement message to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={messageLoading || !messageText.trim()}>
              {messageLoading ? 'Sending...' : 'Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Quiz Confirmation */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the student's quiz attempt. They will be able to retake the quiz
              from the beginning. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetQuiz} disabled={resetLoading}>
              {resetLoading ? 'Resetting...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extend Deadline Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Deadline</DialogTitle>
            <DialogDescription>
              Extend the enrollment deadline for this student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="days">Number of Days</Label>
              <Input
                id="days"
                type="number"
                min={1}
                max={365}
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                The deadline will be extended by {extensionDays} day{extensionDays !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExtendDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExtendDeadline} disabled={extendLoading}>
              {extendLoading ? 'Extending...' : 'Extend'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Completion Override</DialogTitle>
            <DialogDescription>
              Mark this enrollment as complete. Please provide a reason for this override.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Override</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Student completed work offline, special circumstances..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualOverride}
              disabled={overrideLoading || !overrideReason.trim()}
            >
              {overrideLoading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
