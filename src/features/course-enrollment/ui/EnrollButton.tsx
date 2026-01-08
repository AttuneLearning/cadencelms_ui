/**
 * EnrollButton Component
 * Handles course enrollment with confirmation dialog
 */

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '@/entities/enrollment/api/enrollmentApi';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/shared/ui/use-toast';

interface EnrollButtonProps {
  courseId: string;
  courseTitle: string;
  isEnrolled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  onEnrollSuccess?: () => void;
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({
  courseId,
  courseTitle,
  isEnrolled = false,
  className,
  variant = 'default',
  size = 'default',
  onEnrollSuccess,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Enrollment mutation
  const enrollMutation = useMutation({
    mutationFn: () => enrollmentApi.enroll({ courseId }),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['enrollment', 'check', courseId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });

      toast({
        title: 'Successfully enrolled!',
        description: `You are now enrolled in ${courseTitle}`,
      });

      setIsDialogOpen(false);
      onEnrollSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Enrollment failed',
        description: error.response?.data?.message || 'Failed to enroll in course',
        variant: 'destructive',
      });
    },
  });

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  if (isEnrolled) {
    return (
      <Button disabled className={className} variant={variant} size={size}>
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Enrolled
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className={className}
        variant={variant}
        size={size}
        disabled={enrollMutation.isPending}
      >
        {enrollMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enrolling...
          </>
        ) : (
          'Enroll Now'
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll in "{courseTitle}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                By enrolling, you'll gain access to all course materials and lessons.
              </AlertDescription>
            </Alert>

            {enrollMutation.isError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {(enrollMutation.error as any)?.response?.data?.message ||
                    'Failed to enroll in course'}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={enrollMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEnroll} disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enrolling...
                </>
              ) : (
                'Confirm Enrollment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
