/**
 * SendAnnouncementDialog Component
 * Dialog for composing and sending announcements to class students
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Card, CardContent } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Mail, Send } from 'lucide-react';

interface SendAnnouncementDialogProps {
  open: boolean;
  classId: string;
  className: string;
  studentCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const announcementSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(100, 'Subject must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message must be less than 2000 characters'),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export function SendAnnouncementDialog({
  open,
  classId,
  className,
  studentCount,
  onClose,
  onSuccess,
}: SendAnnouncementDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    watch,
    reset,
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    mode: 'onChange',
    defaultValues: {
      subject: '',
      message: '',
    },
  });

  const subject = watch('subject');
  const message = watch('message');

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would call an API to send the announcement
      console.log('Sending announcement:', {
        classId,
        ...data,
      });

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to send announcement:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Send Announcement</DialogTitle>
          <DialogDescription>
            Compose an announcement for <span className="font-medium">{className}</span> ({studentCount} students)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Subject Field */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Enter announcement subject..."
                {...register('subject')}
                aria-invalid={errors.subject ? 'true' : 'false'}
              />
              <div className="flex items-center justify-between">
                {errors.subject && (
                  <p className="text-sm text-destructive">{errors.subject.message}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {subject?.length || 0} / 100
                </span>
              </div>
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Enter your announcement message..."
                rows={8}
                {...register('message')}
                aria-invalid={errors.message ? 'true' : 'false'}
              />
              <div className="flex items-center justify-between">
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {message?.length || 0} / 2000
                </span>
              </div>
            </div>

            {/* Preview */}
            {subject && message && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">From: Instructor</p>
                            <p className="text-xs text-muted-foreground">Just now</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{className}</p>
                        </div>
                      </div>
                      <div className="pl-13 space-y-2">
                        <h4 className="font-semibold text-base">{subject}</h4>
                        <p className="text-sm whitespace-pre-wrap">{message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Info Alert */}
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                This announcement will be sent to all {studentCount} enrolled students via email
                and will appear in their class announcements.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
