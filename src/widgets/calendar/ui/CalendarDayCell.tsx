/**
 * CalendarDayCell — Single day cell with date number, today ring, and point-event dots
 */

import React from 'react';
import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '@/shared/lib/utils/index';
import type { CalendarEvent, CalendarFeed } from '@/entities/calendar-event';
import { pointEventsForDay } from '@/entities/calendar-event';
import { FEED_COLOR_MAP } from '@/entities/calendar-event';

interface CalendarDayCellProps {
  day: Date;
  currentMonth: Date;
  selectedDay: Date | null;
  feeds: CalendarFeed[];
  onSelect: (day: Date) => void;
}

export const CalendarDayCell: React.FC<CalendarDayCellProps> = ({
  day,
  currentMonth,
  selectedDay,
  feeds,
  onSelect,
}) => {
  const inMonth = isSameMonth(day, currentMonth);
  const today = isToday(day);
  const selected = selectedDay ? isSameDay(day, selectedDay) : false;

  // Gather point events from all enabled feeds
  const allPointEvents: Array<{ event: CalendarEvent; dotClass: string }> = [];
  for (const feed of feeds) {
    if (!feed.enabled) continue;
    const feedPointEvents = pointEventsForDay(feed.events, day);
    const dotClass = FEED_COLOR_MAP[feed.color].dot;
    for (const event of feedPointEvents) {
      allPointEvents.push({ event, dotClass });
    }
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        'relative flex min-h-[72px] flex-col items-start border border-border/40 p-1.5 text-left transition-colors hover:bg-accent/50',
        !inMonth && 'bg-muted/30 text-muted-foreground/50',
        inMonth && 'bg-background',
        selected && 'ring-2 ring-primary ring-inset'
      )}
    >
      <span
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
          today && 'bg-primary text-primary-foreground'
        )}
      >
        {format(day, 'd')}
      </span>

      {allPointEvents.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-0.5">
          {allPointEvents.slice(0, 3).map(({ event, dotClass }) => (
            <span
              key={event.id}
              className={cn('h-1.5 w-1.5 rounded-full', dotClass)}
              title={event.title}
            />
          ))}
          {allPointEvents.length > 3 && (
            <span className="text-[10px] leading-none text-muted-foreground">
              +{allPointEvents.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
