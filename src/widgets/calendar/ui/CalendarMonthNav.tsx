/**
 * CalendarMonthNav — Month title + prev/next/today navigation buttons
 */

import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/shared/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarMonthNavProps {
  currentMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarMonthNav: React.FC<CalendarMonthNavProps> = ({
  currentMonth,
  onPrev,
  onNext,
  onToday,
}) => (
  <div className="flex items-center justify-between pb-4">
    <h2 className="text-lg font-semibold">
      {format(currentMonth, 'MMMM yyyy')}
    </h2>
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onPrev}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs"
        onClick={onToday}
      >
        Today
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={onNext}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
);
