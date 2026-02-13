/**
 * CalendarEventChip — Colored event chip for the sidebar event list
 */

import React from 'react';
import { cn } from '@/shared/lib/utils/index';
import type { CalendarEvent, FeedColor } from '@/entities/calendar-event';
import { isPointEvent } from '@/entities/calendar-event';
import { FEED_COLOR_MAP } from '@/entities/calendar-event';

interface CalendarEventChipProps {
  event: CalendarEvent;
  feedColor: FeedColor;
  onClick?: () => void;
}

export const CalendarEventChip: React.FC<CalendarEventChipProps> = ({
  event,
  feedColor,
  onClick,
}) => {
  const chipClass = FEED_COLOR_MAP[feedColor].chip;

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-md px-3 py-2 text-left text-xs font-medium transition-opacity hover:opacity-90',
        chipClass,
        !onClick && 'cursor-default'
      )}
      onClick={onClick}
    >
      <div>{event.title}</div>
      {isPointEvent(event) && event.time && (
        <div className="mt-1 opacity-80">{event.time}</div>
      )}
      {isPointEvent(event) && event.location && (
        <div className="mt-0.5 opacity-70">{event.location}</div>
      )}
      {event.description && (
        <div className="mt-0.5 opacity-70">{event.description}</div>
      )}
    </button>
  );
};
