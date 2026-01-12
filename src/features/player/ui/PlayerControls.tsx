/**
 * PlayerControls Component
 * Navigation controls for course player
 */

import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export interface PlayerControlsProps {
  currentLessonIndex: number;
  totalLessons: number;
  hasPrevious: boolean;
  hasNext: boolean;
  isNextLocked: boolean;
  timeSpent?: number;
  onPrevious: () => void;
  onNext: () => void;
  onMarkComplete?: () => void;
}

export function PlayerControls({
  currentLessonIndex,
  totalLessons,
  hasPrevious,
  hasNext,
  isNextLocked,
  timeSpent = 0,
  onPrevious,
  onNext,
  onMarkComplete,
}: PlayerControlsProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="flex items-center justify-between border-t bg-background px-6 py-4">
      {/* Left: Previous Button */}
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!hasPrevious}
        className="min-w-[120px]"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      {/* Center: Progress Info */}
      <div className="flex flex-col items-center gap-1 text-sm">
        <div className="font-medium">
          Lesson {currentLessonIndex + 1} of {totalLessons}
        </div>
        {timeSpent > 0 && (
          <div className="text-xs text-muted-foreground">Time spent: {formatTime(timeSpent)}</div>
        )}
      </div>

      {/* Right: Next/Complete Buttons */}
      <div className="flex items-center gap-2">
        {onMarkComplete && (
          <Button variant="outline" onClick={onMarkComplete}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark Complete
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!hasNext || isNextLocked}
          className="min-w-[120px]"
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
