/**
 * AttemptProgress Component
 * Displays progress bar for content attempts
 */

import type { AttemptStatus } from '../model/types';

interface AttemptProgressProps {
  progress: number;
  status: AttemptStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AttemptProgress({
  progress,
  status,
  showLabel = true,
  size = 'md',
}: AttemptProgressProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const getProgressColor = () => {
    if (status === 'completed' || status === 'passed') return 'bg-green-600';
    if (status === 'failed') return 'bg-red-600';
    if (status === 'suspended') return 'bg-yellow-600';
    return 'bg-blue-600';
  };

  const getHeightClass = () => {
    if (size === 'sm') return 'h-1';
    if (size === 'lg') return 'h-3';
    return 'h-2';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-medium text-gray-900">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}

      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${getHeightClass()}`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${getProgressColor()} ${getHeightClass()} rounded-full transition-all duration-300`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
