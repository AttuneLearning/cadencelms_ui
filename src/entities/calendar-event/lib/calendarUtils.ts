/**
 * Calendar utility functions
 * Deduplicated helpers used by both entity hooks and widget components
 */

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isWithinInterval,
  format,
} from 'date-fns';
import type { CalendarEvent, CalendarPointEvent, CalendarSpanEvent } from '../model/types';
import { isPointEvent, isSpanEvent } from '../model/types';

// =====================
// CALENDAR GRID
// =====================

/** Weekday labels starting on Sunday */
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Build the full set of days visible in a month grid (including leading/trailing
 * days from adjacent months to fill complete weeks).
 */
export function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

/**
 * Get the visible date range for a given month (for API queries).
 * Returns ISO date strings for the first and last visible day.
 */
export function getVisibleRange(month: Date): { startDate: string; endDate: string } {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

// =====================
// EVENT FILTERING
// =====================

/** Get point events that fall on a specific day */
export function pointEventsForDay(events: CalendarEvent[], day: Date): CalendarPointEvent[] {
  return events.filter((e): e is CalendarPointEvent => {
    if (!isPointEvent(e)) return false;
    return isSameDay(parseISO(e.date), day);
  });
}

/** Get span events that overlap with a specific day */
export function spanEventsForDay(events: CalendarEvent[], day: Date): CalendarSpanEvent[] {
  return events.filter((e): e is CalendarSpanEvent => {
    if (!isSpanEvent(e)) return false;
    const start = parseISO(e.startDate);
    const end = parseISO(e.endDate);
    return isWithinInterval(day, { start, end });
  });
}

/** Get all events (point + span) that are visible on a specific day */
export function allEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return [
    ...pointEventsForDay(events, day),
    ...spanEventsForDay(events, day),
  ];
}

// =====================
// SPAN SEGMENTATION
// =====================

export interface WeekSegment {
  eventId: string;
  title: string;
  color: string;
  /** 1-based column in the 7-col grid */
  startCol: number;
  /** Number of columns the bar spans */
  colSpan: number;
  /** Whether this segment is the first piece of the span */
  isFirst: boolean;
  /** Whether this segment is the last piece of the span */
  isLast: boolean;
}

/**
 * Split a span event into per-week segments based on a set of calendar days.
 * `days` should be the full month grid from `buildCalendarDays`.
 * `barColor` is the resolved Tailwind class string for the bar.
 */
export function splitSpanIntoWeekSegments(
  event: CalendarSpanEvent,
  days: Date[],
  barColor: string
): WeekSegment[] {
  const spanStart = parseISO(event.startDate);
  const spanEnd = parseISO(event.endDate);
  const segments: WeekSegment[] = [];

  // Process each week row (7 days each)
  for (let weekIdx = 0; weekIdx < days.length; weekIdx += 7) {
    const weekDays = days.slice(weekIdx, weekIdx + 7);
    const weekStart = weekDays[0];
    const weekEnd = weekDays[weekDays.length - 1];

    // Does this span overlap this week?
    if (spanEnd < weekStart || spanStart > weekEnd) continue;

    // Calculate the start column (1-based) and span
    const effectiveStart = spanStart > weekStart ? spanStart : weekStart;
    const effectiveEnd = spanEnd < weekEnd ? spanEnd : weekEnd;

    const startCol = effectiveStart.getDay() + 1; // 1-based
    const endCol = effectiveEnd.getDay() + 1;
    const colSpan = endCol - startCol + 1;

    const isFirst = isSameDay(effectiveStart, spanStart);
    const isLast = isSameDay(effectiveEnd, spanEnd);

    segments.push({
      eventId: event.id,
      title: event.title,
      color: barColor,
      startCol,
      colSpan,
      isFirst,
      isLast,
    });
  }

  return segments;
}
