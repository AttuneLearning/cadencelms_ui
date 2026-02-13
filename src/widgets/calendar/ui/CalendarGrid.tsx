/**
 * CalendarGrid — Month grid with span bar overlay layer + day cells
 *
 * Each week row is rendered as:
 *   1. A span bar overlay (CSS grid, max 3 lanes)
 *   2. A row of 7 day cells
 */

import React, { useMemo } from 'react';
import {
  buildCalendarDays,
  isSpanEvent,
  FEED_COLOR_MAP,
} from '@/entities/calendar-event';
import type { CalendarFeed, CalendarSpanEvent } from '@/entities/calendar-event';
import type { WeekSegment } from '@/entities/calendar-event';
import { isSameDay, parseISO } from 'date-fns';
import { CalendarWeekdayHeader } from './CalendarWeekdayHeader';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarSpanBar } from './CalendarSpanBar';
import { assignLanes } from '../lib/spanLayout';

interface CalendarGridProps {
  currentMonth: Date;
  selectedDay: Date | null;
  feeds: CalendarFeed[];
  onSelectDay: (day: Date) => void;
}

/**
 * For a given week (7 days), compute the span segment for a single span event.
 * Returns null if the span doesn't overlap this week.
 */
function spanSegmentForWeek(
  event: CalendarSpanEvent,
  weekDays: Date[],
  barColor: string
): WeekSegment | null {
  const spanStart = parseISO(event.startDate);
  const spanEnd = parseISO(event.endDate);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  // No overlap?
  if (spanEnd < weekStart || spanStart > weekEnd) return null;

  const effectiveStart = spanStart > weekStart ? spanStart : weekStart;
  const effectiveEnd = spanEnd < weekEnd ? spanEnd : weekEnd;

  const startCol = effectiveStart.getDay() + 1; // 1-based
  const endCol = effectiveEnd.getDay() + 1;
  const colSpan = endCol - startCol + 1;

  const isFirst = isSameDay(effectiveStart, spanStart);
  const isLast = isSameDay(effectiveEnd, spanEnd);

  return {
    eventId: event.id,
    title: event.title,
    color: barColor,
    startCol,
    colSpan,
    isFirst,
    isLast,
  };
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  selectedDay,
  feeds,
  onSelectDay,
}) => {
  const days = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  // Split days into weeks
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  // Compute span layouts per week
  const spanLayoutsByWeek = useMemo(() => {
    // Collect all enabled span events with colors
    const allSpans: Array<{ event: CalendarSpanEvent; barColor: string; barText: string }> = [];
    for (const feed of feeds) {
      if (!feed.enabled) continue;
      const colors = FEED_COLOR_MAP[feed.color];
      for (const event of feed.events) {
        if (isSpanEvent(event)) {
          allSpans.push({ event, barColor: colors.bar, barText: colors.barText });
        }
      }
    }

    return weeks.map((weekDays) => {
      const segments: Array<{ seg: WeekSegment; barText: string }> = [];

      for (const { event, barColor, barText } of allSpans) {
        const seg = spanSegmentForWeek(event, weekDays, barColor);
        if (seg) {
          segments.push({ seg, barText });
        }
      }

      const textClassMap = new Map<string, string>();
      for (const { seg, barText } of segments) {
        textClassMap.set(seg.eventId, barText);
      }

      const layout = assignLanes(segments.map((s) => s.seg));
      return { layout, textClasses: textClassMap };
    });
  }, [weeks, feeds]);

  return (
    <div>
      <CalendarWeekdayHeader />

      {weeks.map((weekDays, weekIdx) => {
        const spanLayout = spanLayoutsByWeek[weekIdx];
        const hasSpans = spanLayout && spanLayout.layout.assigned.length > 0;

        return (
          <div key={weekDays[0].toISOString()}>
            {/* Span bar overlay */}
            {hasSpans && (
              <div className="grid grid-cols-7 gap-px px-px">
                {spanLayout.layout.assigned.map(({ segment, lane }) => (
                  <CalendarSpanBar
                    key={`${segment.eventId}-w${weekIdx}`}
                    segment={segment}
                    lane={lane}
                    textClass={spanLayout.textClasses.get(segment.eventId) ?? ''}
                  />
                ))}
              </div>
            )}

            {/* Overflow indicator */}
            {spanLayout && spanLayout.layout.overflow > 0 && (
              <div className="px-1 text-right text-[10px] text-muted-foreground">
                +{spanLayout.layout.overflow} more
              </div>
            )}

            {/* Day cells */}
            <div className="grid grid-cols-7">
              {weekDays.map((day) => (
                <CalendarDayCell
                  key={day.toISOString()}
                  day={day}
                  currentMonth={currentMonth}
                  selectedDay={selectedDay}
                  feeds={feeds}
                  onSelect={onSelectDay}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
