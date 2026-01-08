/**
 * ProgressBar Component
 * Shows lesson or course progress with optional details
 */

import React from 'react';
import { Progress } from '@/shared/ui/progress';
import { CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = true,
  showIcon = false,
  size = 'md',
  variant = 'default',
  className,
}) => {
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const isComplete = normalizedProgress >= 100;

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const getIcon = () => {
    if (!showIcon) return null;

    if (isComplete) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }

    if (normalizedProgress > 0) {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }

    return null;
  };

  const getProgressColor = () => {
    if (variant === 'success' || isComplete) {
      return 'bg-green-600';
    }
    if (variant === 'warning') {
      return 'bg-yellow-600';
    }
    return 'bg-primary';
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage || showIcon) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getIcon()}
            {label && (
              <span
                className={cn(
                  'font-medium',
                  isComplete && 'text-green-600'
                )}
              >
                {label}
              </span>
            )}
          </div>
          {showPercentage && (
            <span
              className={cn(
                'text-muted-foreground',
                isComplete && 'text-green-600 font-semibold'
              )}
            >
              {normalizedProgress.toFixed(0)}%
            </span>
          )}
        </div>
      )}

      <div className="relative">
        <Progress
          value={normalizedProgress}
          className={cn(sizeClasses[size], 'relative overflow-hidden')}
        />
        <div
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-300',
            getProgressColor()
          )}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
