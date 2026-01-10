/**
 * EnrollButton Component
 * Button for enrolling/unenrolling from courses
 */

import React from 'react';
import { Button } from '@/shared/ui/button';
import { Check, Loader2, UserPlus } from 'lucide-react';
import type { EnrollmentStatus } from '../model/types';

interface EnrollButtonProps {
  isEnrolled: boolean;
  enrollmentStatus?: EnrollmentStatus;
  onEnroll: () => void;
  onUnenroll?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export const EnrollButton: React.FC<EnrollButtonProps> = ({
  isEnrolled,
  enrollmentStatus,
  onEnroll,
  onUnenroll,
  isLoading = false,
  disabled = false,
  className,
  variant = 'default',
}) => {
  // Disable button if completed or withdrawn
  const isDisabled = disabled || enrollmentStatus === 'completed' || enrollmentStatus === 'withdrawn';

  if (isEnrolled) {
    return (
      <Button
        variant={variant === 'default' ? 'outline' : variant}
        onClick={onUnenroll}
        disabled={isDisabled || isLoading}
        className={className}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            {enrollmentStatus === 'completed' ? 'Completed' : 'Enrolled'}
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={onEnroll}
      disabled={isDisabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll Now
        </>
      )}
    </Button>
  );
};
