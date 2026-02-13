import { describe, it, expect } from 'vitest';
import {
  buildCalendarDays,
  getVisibleRange,
  pointEventsForDay,
  spanEventsForDay,
  allEventsForDay,
  splitSpanIntoWeekSegments,
} from '../calendarUtils';
import type { CalendarSpanEvent, CalendarEvent } from '../../model/types';

// Use date-only ISO strings (no time/timezone) to avoid UTC offset issues.
// date-fns parseISO('2026-03-15') produces local midnight, matching new Date(2026,2,15).

// ---------------------------------------------------------------------------
// buildCalendarDays
// ---------------------------------------------------------------------------

describe('buildCalendarDays', () => {
  it('returns an array of dates that is a multiple of 7', () => {
    const days = buildCalendarDays(new Date(2026, 0, 1)); // January 2026
    expect(days.length % 7).toBe(0);
  });

  it('starts on a Sunday', () => {
    const days = buildCalendarDays(new Date(2026, 1, 1)); // February 2026
    expect(days[0].getDay()).toBe(0);
  });

  it('ends on a Saturday', () => {
    const days = buildCalendarDays(new Date(2026, 1, 1));
    expect(days[days.length - 1].getDay()).toBe(6);
  });

  it('includes the first and last day of the month', () => {
    const month = new Date(2026, 2, 1); // March 2026
    const days = buildCalendarDays(month);
    const dateStrings = days.map((d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    });
    expect(dateStrings).toContain('2026-03-01');
    expect(dateStrings).toContain('2026-03-31');
  });
});

// ---------------------------------------------------------------------------
// getVisibleRange
// ---------------------------------------------------------------------------

describe('getVisibleRange', () => {
  it('returns ISO date strings for the first and last visible day', () => {
    const range = getVisibleRange(new Date(2026, 0, 1)); // January 2026
    expect(range.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(range.startDate <= '2026-01-01').toBe(true);
    expect(range.endDate >= '2026-01-31').toBe(true);
  });
});

// ---------------------------------------------------------------------------
// pointEventsForDay
// ---------------------------------------------------------------------------

describe('pointEventsForDay', () => {
  const events: CalendarEvent[] = [
    {
      id: '1',
      feedId: 'learner',
      kind: 'point',
      title: 'Event A',
      date: '2026-03-15',
      eventType: 'deadline',
    },
    {
      id: '2',
      feedId: 'learner',
      kind: 'point',
      title: 'Event B',
      date: '2026-03-16',
      eventType: 'enrollment-start',
    },
    {
      id: '3',
      feedId: 'learner',
      kind: 'span',
      title: 'Span C',
      startDate: '2026-03-10',
      endDate: '2026-03-20',
      eventType: 'enrollment-start',
    },
  ];

  it('returns only point events matching the given day', () => {
    const result = pointEventsForDay(events, new Date(2026, 2, 15));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty for days with no point events', () => {
    const result = pointEventsForDay(events, new Date(2026, 2, 1));
    expect(result).toHaveLength(0);
  });

  it('excludes span events', () => {
    const result = pointEventsForDay(events, new Date(2026, 2, 15));
    expect(result.every((e) => e.kind === 'point')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// spanEventsForDay
// ---------------------------------------------------------------------------

describe('spanEventsForDay', () => {
  const events: CalendarEvent[] = [
    {
      id: '1',
      feedId: 'learner',
      kind: 'span',
      title: 'Span A',
      startDate: '2026-03-10',
      endDate: '2026-03-20',
      eventType: 'enrollment-start',
    },
    {
      id: '2',
      feedId: 'learner',
      kind: 'point',
      title: 'Point B',
      date: '2026-03-15',
      eventType: 'deadline',
    },
  ];

  it('returns span events that overlap the given day', () => {
    const result = spanEventsForDay(events, new Date(2026, 2, 15));
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('includes the start and end dates', () => {
    expect(spanEventsForDay(events, new Date(2026, 2, 10))).toHaveLength(1);
    expect(spanEventsForDay(events, new Date(2026, 2, 20))).toHaveLength(1);
  });

  it('excludes days outside the span range', () => {
    expect(spanEventsForDay(events, new Date(2026, 2, 9))).toHaveLength(0);
    expect(spanEventsForDay(events, new Date(2026, 2, 21))).toHaveLength(0);
  });

  it('excludes point events', () => {
    const result = spanEventsForDay(events, new Date(2026, 2, 15));
    expect(result.every((e) => e.kind === 'span')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// allEventsForDay
// ---------------------------------------------------------------------------

describe('allEventsForDay', () => {
  const events: CalendarEvent[] = [
    {
      id: '1',
      feedId: 'learner',
      kind: 'point',
      title: 'Point A',
      date: '2026-03-15',
      eventType: 'deadline',
    },
    {
      id: '2',
      feedId: 'learner',
      kind: 'span',
      title: 'Span B',
      startDate: '2026-03-10',
      endDate: '2026-03-20',
      eventType: 'enrollment-start',
    },
  ];

  it('returns both point and span events for a given day', () => {
    const result = allEventsForDay(events, new Date(2026, 2, 15));
    expect(result).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// splitSpanIntoWeekSegments
// ---------------------------------------------------------------------------

describe('splitSpanIntoWeekSegments', () => {
  // Use a fixed month: March 2026 starts on Sunday
  const days = buildCalendarDays(new Date(2026, 2, 1));

  it('returns a single segment for a span within one week', () => {
    const span: CalendarSpanEvent = {
      id: 's1',
      feedId: 'learner',
      kind: 'span',
      title: 'Short Span',
      startDate: new Date(2026, 2, 3).toISOString(), // Tuesday
      endDate: new Date(2026, 2, 5).toISOString(), // Thursday
      eventType: 'enrollment-start',
    };

    const segments = splitSpanIntoWeekSegments(span, days, 'bg-primary/70');
    expect(segments).toHaveLength(1);
    expect(segments[0].startCol).toBe(3); // Tuesday = col 3 (1-based)
    expect(segments[0].colSpan).toBe(3); // Tue, Wed, Thu
    expect(segments[0].isFirst).toBe(true);
    expect(segments[0].isLast).toBe(true);
  });

  it('returns multiple segments for a multi-week span', () => {
    const span: CalendarSpanEvent = {
      id: 's2',
      feedId: 'learner',
      kind: 'span',
      title: 'Long Span',
      startDate: new Date(2026, 2, 5).toISOString(), // Thursday
      endDate: new Date(2026, 2, 12).toISOString(), // Thursday next week
      eventType: 'enrollment-start',
    };

    const segments = splitSpanIntoWeekSegments(span, days, 'bg-primary/70');
    expect(segments.length).toBeGreaterThanOrEqual(2);
    expect(segments[0].isFirst).toBe(true);
    expect(segments[0].isLast).toBe(false);
    expect(segments[segments.length - 1].isFirst).toBe(false);
    expect(segments[segments.length - 1].isLast).toBe(true);
  });

  it('assigns the correct color', () => {
    const span: CalendarSpanEvent = {
      id: 's3',
      feedId: 'system',
      kind: 'span',
      title: 'Colored Span',
      startDate: new Date(2026, 2, 1).toISOString(),
      endDate: new Date(2026, 2, 2).toISOString(),
      eventType: 'system-event',
    };

    const segments = splitSpanIntoWeekSegments(span, days, 'bg-orange-500/70');
    expect(segments[0].color).toBe('bg-orange-500/70');
  });
});
