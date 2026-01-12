/**
 * LessonCompleteButton Component
 * Button to mark a lesson as complete with loading and success states
 */

import React, { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/use-toast';
import { cn } from '@/shared/lib/utils';

interface LessonCompleteButtonProps {
  onComplete: () => Promise<void>;
  isCompleted?: boolean;
  disabled?: boolean;
  className?: string;
}

export const LessonCompleteButton: React.FC<LessonCompleteButtonProps> = ({
  onComplete,
  isCompleted = false,
  disabled = false,
  className,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleComplete = async () => {
    if (isCompleted || disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onComplete();
      toast({
        title: 'Lesson Completed',
        description: 'Great job! Your progress has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark lesson as complete. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Button
        variant="outline"
        className={cn('gap-2', className)}
        disabled
      >
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        Completed
      </Button>
    );
  }

  return (
    <Button
      onClick={handleComplete}
      disabled={disabled || isLoading}
      className={cn('gap-2', className)}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Marking Complete...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  );
};
