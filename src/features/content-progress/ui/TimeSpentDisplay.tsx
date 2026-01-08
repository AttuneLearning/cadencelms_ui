/**
 * TimeSpentDisplay Component
 * Displays time spent on content in a readable format
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface TimeSpentDisplayProps {
  seconds: number;
  showIcon?: boolean;
  format?: 'short' | 'long';
  className?: string;
}

export const TimeSpentDisplay: React.FC<TimeSpentDisplayProps> = ({
  seconds,
  showIcon = true,
  format = 'short',
  className,
}) => {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (format === 'long') {
      const parts: string[] = [];
      if (hours > 0) {
        parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
      }
      if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
      }
      if (secs > 0 && hours === 0) {
        parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
      }
      return parts.length > 0 ? parts.join(', ') : '0 seconds';
    }

    // Short format
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex items-center gap-1.5 text-sm text-muted-foreground', className)}>
      {showIcon && <Clock className="h-4 w-4" />}
      <span>{formatTime(seconds)}</span>
    </div>
  );
};
