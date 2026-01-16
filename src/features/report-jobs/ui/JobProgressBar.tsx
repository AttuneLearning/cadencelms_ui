/**
 * Job Progress Bar Component
 * Shows the progress of a report job generation
 */

import React from 'react';
import type { ReportJobState } from '@/entities/report-job';
import { cn } from '@/shared/lib/utils';

interface JobProgressBarProps {
  state: ReportJobState;
  progress?: number;
  message?: string;
  className?: string;
}

const STATE_PROGRESS_MAP: Record<ReportJobState, number> = {
  pending: 0,
  queued: 10,
  processing: 50,
  rendering: 75,
  uploading: 90,
  ready: 100,
  downloaded: 100,
  failed: 0,
  cancelled: 0,
  expired: 100,
};

export const JobProgressBar: React.FC<JobProgressBarProps> = ({
  state,
  progress,
  message,
  className,
}) => {
  // Use explicit progress if provided, otherwise infer from state
  const displayProgress = progress ?? STATE_PROGRESS_MAP[state];

  const isActive = ['pending', 'queued', 'processing', 'rendering', 'uploading'].includes(state);
  const isFailed = state === 'failed' || state === 'cancelled';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative w-full h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn('h-full transition-all duration-300', {
            'bg-red-500': isFailed,
            'bg-primary': !isFailed,
          })}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      {message && (
        <p
          className={cn('text-xs text-muted-foreground', {
            'text-red-600': isFailed,
          })}
        >
          {message}
        </p>
      )}
      {isActive && !message && (
        <p className="text-xs text-muted-foreground">
          {displayProgress}% complete
        </p>
      )}
    </div>
  );
};
