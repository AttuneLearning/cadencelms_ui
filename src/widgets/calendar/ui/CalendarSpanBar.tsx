/**
 * CalendarSpanBar — Horizontal bar segment positioned via CSS grid-column
 */

import React from 'react';
import { cn } from '@/shared/lib/utils/index';
import type { WeekSegment } from '@/entities/calendar-event';

interface CalendarSpanBarProps {
  segment: WeekSegment;
  lane: number;
  textClass: string;
}

export const CalendarSpanBar: React.FC<CalendarSpanBarProps> = ({
  segment,
  lane,
  textClass,
}) => {
  const { startCol, colSpan, color, isFirst, isLast, title } = segment;

  return (
    <div
      className={cn(
        'flex h-5 items-center overflow-hidden px-1.5 text-[10px] font-medium leading-tight',
        color,
        textClass,
        isFirst ? 'rounded-l-sm' : 'border-l-2 border-l-white/30',
        isLast ? 'rounded-r-sm' : ''
      )}
      style={{
        gridColumn: `${startCol} / span ${colSpan}`,
        gridRow: lane + 1, // 1-based grid rows
      }}
      title={title}
    >
      {isFirst && (
        <span className="truncate">{title}</span>
      )}
    </div>
  );
};
