/**
 * Attempt Timer Component
 * Displays countdown timer for timed exams with auto-submit
 */

import { useEffect, useState, useCallback } from 'react';
import { formatTime, isTimeLow, isTimeExpired } from '../lib/timerUtils';

export interface AttemptTimerProps {
  remainingTime: number | null;
  onTimeExpired?: () => void;
  className?: string;
  showWarning?: boolean;
  warningThreshold?: number;
}

export function AttemptTimer({
  remainingTime,
  onTimeExpired,
  className = '',
  showWarning = true,
  warningThreshold = 300,
}: AttemptTimerProps) {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  const handleTimeExpired = useCallback(() => {
    if (onTimeExpired) {
      onTimeExpired();
    }
  }, [onTimeExpired]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) {
      if (timeLeft === 0) {
        handleTimeExpired();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null) return null;
        const newTime = prev - 1;

        if (newTime <= 0) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, handleTimeExpired]);

  if (remainingTime === null) {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        <span className="font-medium">Time Limit:</span> Unlimited
      </div>
    );
  }

  if (timeLeft === null) return null;

  const isLow = showWarning && isTimeLow(timeLeft, warningThreshold);
  const isExpired = isTimeExpired(timeLeft);

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
      <span
        className={`text-lg font-mono font-bold ${
          isExpired
            ? 'text-red-600'
            : isLow
              ? 'text-orange-600 animate-pulse'
              : 'text-gray-900'
        }`}
        data-testid="timer-display"
      >
        {formatTime(timeLeft)}
      </span>
      {isLow && !isExpired && (
        <span className="text-xs text-orange-600 font-medium" data-testid="timer-warning">
          (Time is running low!)
        </span>
      )}
      {isExpired && (
        <span className="text-xs text-red-600 font-medium" data-testid="timer-expired">
          (Time's up!)
        </span>
      )}
    </div>
  );
}
